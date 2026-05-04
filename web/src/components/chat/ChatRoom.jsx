// frontend/src/components/chat/ChatRoom.jsx

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "../../hooks/useChat";
import { useUser } from "@clerk/clerk-react";

export const ChatRoom = ({ conversationId }) => {
    const { user } = useUser();
    const {
        dbUser,
        messages,
        isLoading,
        error,
        isConnected,
        typingUsers,
        sendMessage,
        sendTyping,
        markAsRead,
    } = useChat(conversationId);

    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // ========================================
    // 1. Fonction pour formater la date
    // ========================================
    const formatDate = (date) => {
        const now = new Date();
        const messageDate = new Date(date);
        
        // Si c'est aujourd'hui
        if (messageDate.toDateString() === now.toDateString()) {
            return "Aujourd'hui";
        }
        
        // Si c'est hier
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return "Hier";
        }
        
        // Sinon, afficher la date complète
        return messageDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // ========================================
    // 2. Fonction pour formater l'heure
    // ========================================
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ========================================
    // 3. Grouper les messages par date
    // ========================================
    const groupMessagesByDate = (messages) => {
        const groups = [];
        
        messages.forEach((msg, index) => {
            const msgDate = new Date(msg.createdAt).toDateString();
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
            
            // Ajouter un séparateur de date si nécessaire
            if (index === 0 || msgDate !== prevDate) {
                groups.push({
                    type: 'date_separator',
                    date: msg.createdAt,
                    formattedDate: formatDate(msg.createdAt)
                });
            }
            
            // Ajouter le message
            groups.push({
                type: 'message',
                ...msg
            });
        });
        
        return groups;
    };

    // ========================================
    // 4. Vérifier si deux messages sont proches (moins de X minutes)
    // ========================================
    const shouldShowTimeSeparator = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;
        
        const currentTime = new Date(currentMsg.createdAt).getTime();
        const prevTime = new Date(prevMsg.createdAt).getTime();
        const diffMinutes = (currentTime - prevTime) / (1000 * 60);
        
        // Afficher un séparateur temporel si plus de 30 minutes d'écart
        return diffMinutes > 30;
    };

    // ========================================
    // 5. Grouper les messages avec séparateurs
    // ========================================
    const groupedMessages = useMemo(() => {
        if (!messages.length) return [];
        
        const groups = [];
        
        messages.forEach((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : null;
            
            // Ajouter séparateur de date
            const msgDate = new Date(msg.createdAt).toDateString();
            const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
            
            if (index === 0 || msgDate !== prevDate) {
                groups.push({
                    type: 'date_separator',
                    date: msg.createdAt,
                    formattedDate: formatDate(msg.createdAt)
                });
            }
            
            // Ajouter séparateur de temps (si écart > 30 min et même jour)
            if (prevMsg && msgDate === prevDate && shouldShowTimeSeparator(msg, prevMsg)) {
                groups.push({
                    type: 'time_separator',
                    time: formatTime(prevMsg.createdAt),
                    nextTime: formatTime(msg.createdAt)
                });
            }
            
            // Ajouter le message
            groups.push({
                type: 'message',
                ...msg,
                showTime: !prevMsg || shouldShowTimeSeparator(msg, prevMsg)
            });
        });
        
        return groups;
    }, [messages]);

    const otherTypingUsers = Object.entries(typingUsers)
        .filter(([userId]) => parseInt(userId) !== dbUser?.Id)
        .map(([userId, userName]) => ({ userId, userName }));

    const getTypingText = () => {
        if (otherTypingUsers.length === 0) return null;
        if (otherTypingUsers.length === 1) {
            return `${otherTypingUsers[0].userName} est en train d'écrire...`;
        }
        if (otherTypingUsers.length === 2) {
            return `${otherTypingUsers[0].userName} et ${otherTypingUsers[1].userName} écrivent...`;
        }
        return `Plusieurs personnes écrivent...`;
    };

    // Fonction pour afficher l'accusé de lecture
    const getReadReceipt = (msg) => {
        if (msg.senderId !== dbUser?.Id) return null;
        
        const readCount = msg.readBy?.length || 0;
        
        if (readCount === 0) {
            return <span style={styles.readReceipt}>✓</span>;
        }
        if (readCount === 1) {
            return <span style={styles.readReceipt}>✓✓</span>;
        }
        return <span style={styles.readReceipt}>✓✓ ({readCount})</span>;
    };

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
        sendTyping(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);
        sendTyping(value.trim().length > 0);
    };

    const handleBlur = () => {
        sendTyping(false);
    };

    // Auto-scroll et marquer comme lu
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        
        if (messages.length > 0 && dbUser) {
            const unreadMessages = messages.filter(
                msg => msg.senderId !== dbUser.Id && !msg.readBy?.includes(dbUser.Id)
            );
            
            if (unreadMessages.length > 0) {
                const lastUnreadMessage = unreadMessages[unreadMessages.length - 1];
                markAsRead(lastUnreadMessage.id);
            }
        }
    }, [messages, dbUser, markAsRead]);

    if (isLoading) return <div>Loading messages...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <div ref={messagesContainerRef} style={styles.messagesContainer}>
                {groupedMessages.map((item, idx) => {
                    // Rendu du séparateur de date
                    if (item.type === 'date_separator') {
                        return (
                            <div key={`date-${idx}`} style={styles.dateSeparator}>
                                <div style={styles.dateSeparatorLine} />
                                <span style={styles.dateSeparatorText}>
                                    {item.formattedDate}
                                </span>
                                <div style={styles.dateSeparatorLine} />
                            </div>
                        );
                    }
                    
                    // Rendu du séparateur de temps
                    if (item.type === 'time_separator') {
                        return (
                            <div key={`time-${idx}`} style={styles.timeSeparator}>
                                <span style={styles.timeSeparatorText}>
                                    {item.time} → {item.nextTime}
                                </span>
                            </div>
                        );
                    }
                    
                    // Rendu du message
                    const isMyMessage = item.senderId === dbUser?.Id;
                    
                    return (
                        <div 
                            key={item.id || idx} 
                            style={{
                                ...styles.message,
                                justifyContent: isMyMessage ? "flex-end" : "flex-start"
                            }}
                        >
                            <div style={{
                                ...styles.messageBubble,
                                backgroundColor: isMyMessage ? "#dcf8c5" : "#fff",
                                borderTopRightRadius: isMyMessage ? "4px" : "12px",
                                borderTopLeftRadius: isMyMessage ? "12px" : "4px",
                            }}>
                                {!isMyMessage && (
                                    <strong style={styles.senderName}>{item.senderName}</strong>
                                )}
                                <div style={styles.messageContent}>{item.content}</div>
                                <div style={styles.messageFooter}>
                                    <small style={styles.messageTime}>
                                        {formatTime(item.createdAt)}
                                    </small>
                                    {getReadReceipt(item)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {getTypingText() && (
                <div style={styles.typingIndicator}>
                    <span style={styles.typingDot}>●</span>
                    {getTypingText()}
                </div>
            )}

            <div style={styles.inputContainer}>
                <input
                    value={input}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    style={styles.input}
                    disabled={!isConnected}
                />
                <button onClick={handleSend} disabled={!isConnected || !input.trim()}>
                    Send
                </button>
            </div>

            <div style={styles.status}>
                {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
    },
    message: {
        display: "flex",
        marginBottom: "8px",
        width: "100%",
    },
    messageBubble: {
        maxWidth: "70%",
        padding: "8px 12px",
        borderRadius: "12px",
        boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
        wordWrap: "break-word",
    },
    senderName: {
        fontSize: "12px",
        color: "#666",
        display: "block",
        marginBottom: "4px",
    },
    messageContent: {
        fontSize: "14px",
        lineHeight: "1.4",
    },
    messageFooter: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "8px",
        marginTop: "4px",
    },
    messageTime: {
        fontSize: "10px",
        color: "#999",
    },
    readReceipt: {
        fontSize: "10px",
        color: "#4caf50",
        marginLeft: "4px",
    },
    // Styles pour les séparateurs
    dateSeparator: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "16px 0",
        gap: "12px",
    },
    dateSeparatorLine: {
        flex: 1,
        height: "1px",
        backgroundColor: "#e0e0e0",
    },
    dateSeparatorText: {
        fontSize: "12px",
        color: "#999",
        backgroundColor: "#f5f5f5",
        padding: "4px 12px",
        borderRadius: "12px",
        fontWeight: "500",
    },
    timeSeparator: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "8px 0",
    },
    timeSeparatorText: {
        fontSize: "10px",
        color: "#aaa",
        backgroundColor: "#f0f0f0",
        padding: "2px 8px",
        borderRadius: "10px",
    },
    typingIndicator: {
        padding: "8px 16px",
        fontSize: "12px",
        color: "#666",
        fontStyle: "italic",
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    typingDot: {
        display: "inline-block",
        animation: "pulse 1.5s ease-in-out infinite",
    },
    inputContainer: {
        display: "flex",
        padding: "16px",
        borderTop: "1px solid #e0e0e0",
        gap: "8px",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "20px",
        fontSize: "14px",
        outline: "none",
    },
    status: {
        padding: "4px",
        textAlign: "center",
        fontSize: "11px",
        color: "#999",
        borderTop: "1px solid #eee",
        backgroundColor: "#fff",
    },
};

// Ajout des styles d'animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(styleSheet);