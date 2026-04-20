// backend/sockets/chat.socket.js

import { isUserInConversation } from "../database/conversation_participant.db.js";
import { saveMessageFromSocket, getMessagesByConversation, markConversationMessagesAsRead } from "../database/message_read.db.js";
import { toMessageDTO, toMessageDTOArray, toMessageDTOArrayPmo, toMessageDTOPmo } from "../dto/message.dto.js";
import { socketAuth } from "../midleware/auth.midleware.js";
import { setupTypingEvents } from "./typing.socket.js";

export const setupChatSocket = (io) => {
    
    // ============================================
    // 🔐 MIDDLEWARE D'AUTHENTIFICATION
    // ============================================
    // 🔐 Appliquer le middleware d'authentification à TOUTES les connexions
    io.use(socketAuth);
    /*io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("No token"));

            const payload = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });

            if (!payload?.sub) return next(new Error("Unauthorized"));

            const user = await getUtilisateurByClerkId(payload.sub);
            if (!user) return next(new Error("User not found"));

            socket.user = user;
            next();
        } catch (err) {
            console.error("Socket auth error:", err);
            next(new Error("Auth failed"));
        }
    });*/

    // ============================================
    // 🔌 GESTIONNAIRE DE CONNEXION
    // ============================================
    io.on("connection", (socket) => {
        console.log(`✅ User ${socket.user.Id} (${socket.user.Prenom} ${socket.user.Nom}) connected`);

        /*socket.onAny((event, ...args) => {
            console.log(`[SOCKET EVENT] ${event}:`, args);
        });*/

        // ========================================
        // 🆕 Initialiser les événements de typing
        // ========================================
        setupTypingEvents(socket);

        // ========================================
        // 📥 ÉVÉNEMENT : join_conversation
        // ========================================
        socket.on("join_conversation", async (data, callback) => {
            const { conversationId } = data;
            
            try {
                // Vérifier que l'utilisateur est membre
                const isMember = await isUserInConversation(conversationId, socket.user.Id);
                if (!isMember) {
                    return callback({ success: false, error: "Not a member of this conversation" });
                }

                // Quitter l'ancienne room si elle existe
                if (socket.currentConversationId) {
                    socket.leave(`conv_${socket.currentConversationId}`);
                }

                // Rejoindre la nouvelle room
                socket.join(`conv_${conversationId}`);
                socket.currentConversationId = conversationId;
                console.log(`🟡 [BACKEND] User ${socket.user.Id} a rejoint la room: conv_${conversationId}`);
                console.log(`🟡 [BACKEND] Rooms actuelles:`, socket.rooms);

                // Récupérer l'historique
                const history = await getMessagesByConversation(conversationId, 50, 0);
                //console.log(`📬 Récupérés ${history.length} messages pour conversation ${conversationId}:     `, history);
                
                // Marquer comme lu
                await markConversationMessagesAsRead(conversationId, socket.user.Id);

                // Notifier les autres utilisateurs
                socket.to(`conv_${conversationId}`).emit("user_joined", {
                    userId: socket.user.Id,
                    userName: `${socket.user.Prenom} ${socket.user.Nom}`.trim(),
                    userAvatar: socket.user.Photo
                });

                // Répondre au client avec l'historique
                if (typeof callback === "function") {
                    callback({ 
                        success: true, 
                        history: /*toMessageDTOPmo(*/toMessageDTOArrayPmo(history)//)
                    });
                }

            } catch (err) {
                console.error("Join conversation error:", err);
                if (typeof callback === "function") {
                    callback({ success: false, error: err.message });
                }
            }
        });

        // ========================================
        // 💬 ÉVÉNEMENT : send_message
        // ========================================
        socket.on("send_message", async (data, callback) => {
            const { conversationId, content } = data;

            // Validation de base
            if (!conversationId || !content?.trim()) {
                return callback({ success: false, error: "Missing conversationId or content" });
            }

            try {
                // Vérifier que l'utilisateur est membre
                const isMember = await isUserInConversation(conversationId, socket.user.Id);
                if (!isMember) {
                    return callback({ success: false, error: "Not a member of this conversation" });
                }

                // Sauvegarder en BDD
                const savedMessage = await saveMessageFromSocket({
                    IdConversation: conversationId,
                    SenderId: socket.user.Id,
                    //SenderName: `${socket.user.Prenom} ${socket.user.Nom}`.trim(),
                    Contenu: content.trim()
                });

                // 🔥 AJOUTER des propriétés à savedMessage
                savedMessage.senderName = `${socket.user.Prenom} ${socket.user.Nom}`.trim();
                savedMessage.senderAvatar = socket.user.Photo;
                savedMessage.readBy = [];

                // Transformer en DTO
                const messagePayload = toMessageDTOPmo(savedMessage);

                // Diffuser à toute la room (y compris l'expéditeur)
                io.to(`conv_${conversationId}`).emit("new_message", messagePayload);

                // Confirmer à l'expéditeur
                if (typeof callback === "function") {
                callback({ success: true, message: messagePayload });
                }

            } catch (err) {
                console.error("Send message error:", err);
                if (typeof callback === "function") {
                    callback({ success: false, error: err.message });
                }
            }
        });

        // ========================================
        // 👁️ ÉVÉNEMENT : mark_read
        // ========================================
        socket.on("mark_read", async (data, callback) => {
            const { conversationId, messageId } = data;

            try {
                // Marquer comme lu dans la BDD
                await markConversationMessagesAsRead(conversationId, socket.user.Id);
                
                // Notifier les autres utilisateurs
                socket.to(`conv_${conversationId}`).emit("messages_read", {
                    userId: socket.user.Id,
                    upToMessageId: messageId
                });

                if (typeof callback === "function") {
                callback({ success: true });
                }

            } catch (err) {
                console.error("Mark read error:", err);
                if (typeof callback === "function") {
                callback({ success: false, error: err.message });
                }
            }
        });

        // ========================================
        // 👋 ÉVÉNEMENT : disconnect
        // ========================================
        socket.on("disconnect", (error) => {
            if (socket.currentConversationId) {
                socket.to(`conv_${socket.currentConversationId}`).emit("user_left", {
                    userId: socket.user.Id,
                    userName: `${socket.user.Prenom} ${socket.user.Nom}`.trim()
                });
            }console.log(`🔴 User ${socket.user.Id} (${socket.user.Prenom} ${socket.user.Nom}) disconnected`, error ? `with error: ${error}` : "");
            console.log(`❌ User ${socket.user.Id} disconnected`);
        });
    });
};