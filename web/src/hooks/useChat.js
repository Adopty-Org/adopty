// frontend/src/hooks/useChat.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { messageReadApi, utilisateurApi } from "../lib/api";
import { useUser } from "@clerk/clerk-react";

export const useChat = (conversationId) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});

    const { socket, isConnected } = useSocket();
    const { user: clerkUser } = useUser(); // ← Récupérer l'utilisateur Clerk
    const typingTimeoutRef = useRef(null);
    const [dbUser, setDbUser] = useState(null); // ← Utilisateur BDD

    // ========================================
    // 1. Charger l'utilisateur BDD
    // ========================================
    useEffect(() => {
        const fetchDbUser = async () => {
            if (clerkUser?.id) {
                try {
                    const user = await utilisateurApi.getByClerkId(clerkUser.id);
                    setDbUser(user);
                } catch (err) {
                    console.error("Failed to fetch DB user:", err);
                }
            }
        };
        fetchDbUser();
    }, [clerkUser]);

    // ========================================
    // 2. Charger l'historique
    // ========================================
    const loadHistory = useCallback(async () => {
        if (!conversationId) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await messageReadApi.getByConversation(conversationId);
            const data = Array.isArray(response) ? response : (response.data || []);
            
            const formattedMessages = data.map(msg => ({
                id: msg.Id,
                conversationId: msg.IdConversation,
                senderId: msg.SenderId,
                content: msg.Contenu,
                createdAt: msg.CreatedAt,
                senderName: msg.senderName || `Utilisateur ${msg.SenderId}`,
                senderAvatar: msg.senderAvatar,
                readBy: msg.readBy || [],
            }));
            console.log(`📬 Historique chargé:`, formattedMessages.length, "messages");
            setMessages(formattedMessages);
        } catch (err) {
            console.error("Failed to load messages:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // ========================================
    // 3. Socket : rejoindre et écouter
    // ========================================
    useEffect(() => {
        if (!socket || !isConnected || !conversationId) return;

        socket.emit("join_conversation", { conversationId }, (response) => {
            if (response?.success) {
                console.log("✅ Joined conversation:", conversationId);
                
                if (response.history && response.history.length > 0) {
                    const formattedMessages = response.history.map(msg => ({
                        id: msg.id,
                        conversationId: msg.conversationId,
                        senderId: msg.senderId,
                        content: msg.content,
                        createdAt: msg.createdAt,
                        senderName: msg.senderName,
                        senderAvatar: msg.senderAvatar,
                        readBy: msg.readBy || [],
                    }));
                    setMessages(formattedMessages);
                }
            } else {
                console.error("Failed to join conversation:", response?.error);
                setError(response?.error);
            }
        });

        const handleNewMessage = (message) => {
            console.log("🟡 Nouveau message reçu:", message);
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
        };

        const handleMessagesRead = ({ userId, upToMessageId }) => {
            console.log(`🟡 Messages read by ${userId} up to ${upToMessageId}`);
            setMessages(prev => prev.map(msg => {
                if (msg.id <= upToMessageId && !msg.readBy.includes(userId)) {
                    return { ...msg, readBy: [...msg.readBy, userId] };
                }
                return msg;
            }));
        };

        const handleUserTyping = ({ userId, userName, isTyping, conversationId: eventConvId }) => {
            if (Number(eventConvId) !== Number(conversationId)) return;
            
            setTypingUsers(prev => {
                const newState = { ...prev };
                if (isTyping) {
                    newState[userId] = userName;
                } else {
                    delete newState[userId];
                }
                return newState;
            });
        };

        socket.on("new_message", handleNewMessage);
        socket.on("messages_read", handleMessagesRead);
        socket.on("user_typing", handleUserTyping);

        return () => {
            socket.emit("leave_conversation", { conversationId });
            socket.off("new_message", handleNewMessage);
            socket.off("messages_read", handleMessagesRead);
            socket.off("user_typing", handleUserTyping);
        };
    }, [socket, isConnected, conversationId]);

    // ========================================
    // 4. Envoyer un message
    // ========================================
    const sendMessage = useCallback((content) => {
        if (!socket || !isConnected || !content.trim()) return false;

        socket.emit("send_message", {
            conversationId,
            content: content.trim()
        }, (response) => {
            if (!response?.success) {
                setError(response?.error);
            }
        });

        return true;
    }, [socket, isConnected, conversationId]);

    // ========================================
    // 5. Marquer comme lu
    // ========================================
    const markAsRead = useCallback((messageId) => {
        if (!socket || !isConnected) return;
        socket.emit("mark_read", { conversationId, messageId });
    }, [socket, isConnected, conversationId]);

    // ========================================
    // 6. Indicateur de frappe
    // ========================================
    const sendTyping = useCallback((isTyping) => {
        if (!socket || !isConnected) return;
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        socket.emit("typing", { conversationId, isTyping });
        
        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", { conversationId, isTyping: false });
            }, 1000);
        }
    }, [socket, isConnected, conversationId]);

    return {
        dbUser,
        messages,
        isLoading,
        error,
        isConnected,
        typingUsers,
        sendMessage,
        markAsRead,
        sendTyping,
        refresh: loadHistory,
    };
};