// frontend/src/components/chat/ChatRoom.jsx

import { useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useUser } from "@clerk/clerk-react";
import { utilisateurApi } from "../../lib/api";

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
    } = useChat(conversationId);
    const blud = dbUser

    const [input, setInput] = useState("");

    const otherTypingUsers = Object.entries(typingUsers)
        .filter(([userId]) => parseInt(userId) !== user?.id)
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

    // 🆕 Fonction pour afficher l'accusé de lecture
    const getReadReceipt = (msg) => {
        // Seulement pour mes messages
        console.log("Calculating 1 read receipt for message:", msg);
        console.log("Current user ID:", user?.id);
        const utilisateur = blud;
        console.log("Real Current user ID:", utilisateur);
        if (msg.senderId !== utilisateur?.Id) return null;

        console.log("Calculating 2 read receipt for message:", msg);
        
        const readCount = msg.readBy?.length || 0;
        
        if (readCount === 0) {
            return <span style={styles.readReceipt}>✓</span>; // Envoyé, non lu
        }
        if (readCount === 1) {
            return <span style={styles.readReceipt}>✓✓</span>; // Lu par 1 personne
        }
        return <span style={styles.readReceipt}>✓✓ ({readCount})</span>; // Lu par plusieurs
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

    if (isLoading) return <div>Loading messages...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.messagesContainer}>
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        style={{
                            ...styles.message,
                            justifyContent: msg.senderId === user?.id ? "flex-end" : "flex-start"
                        }}
                    >
                        <div style={{
                            ...styles.messageBubble,
                            backgroundColor: msg.senderId === user?.id ? "#dcf8c5" : "#fff",
                        }}>
                            <strong>{msg.senderName}</strong>
                            <div>{msg.content}</div>
                            <div style={styles.messageFooter}>
                                <small style={styles.messageTime}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                                {/* 🆕 Accusé de lecture */}
                                {getReadReceipt(msg)}
                            </div>
                        </div>
                    </div>
                ))}
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
    },
    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "16px",
    },
    message: {
        display: "flex",
        marginBottom: "12px",
    },
    messageBubble: {
        maxWidth: "70%",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        position: "relative",
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
    },
    input: {
        flex: 1,
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    status: {
        padding: "4px",
        textAlign: "center",
        fontSize: "11px",
        color: "#999",
        borderTop: "1px solid #eee",
    },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(styleSheet);