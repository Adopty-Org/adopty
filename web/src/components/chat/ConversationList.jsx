// frontend/src/components/chat/ConversationList.jsx

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { conversationApi, conversationParticipantApi, utilisateurApi } from "../../lib/api";

export const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchConversations = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // 1. Récupérer l'utilisateur dans ta BDD à partir de son clerkId
                const utilisateur = await utilisateurApi.getByClerkId(user.id);
                
                if (!utilisateur?.Id) {
                    throw new Error("User not found in database");
                }

                // 2. Récupérer toutes les conversations
                const allConversations = await conversationApi.getAll();
                
                // 3. Filtrer les conversations où l'utilisateur est participant
                const userConversations = [];

                for (const conv of allConversations) {
                    try {
                        // Récupérer les participants de cette conversation
                        const response = await conversationParticipantApi.getParticipantsOfConversation(conv.Id);
                        const participants = response.data || response;
                        
                        // Vérifier si l'utilisateur actuel est participant
                        const isUserParticipant = participants.some(p => p.Id === utilisateur.Id);
                        
                        if (isUserParticipant) {
                            // Enrichir la conversation avec les infos nécessaires pour l'affichage
                            const otherParticipants = participants.filter(p => p.Id !== utilisateur.Id);
                            
                            // Déterminer le nom d'affichage
                            let displayName = `Conversation ${conv.Id}`;
                            if (conv.Type === "direct" && otherParticipants.length === 1) {
                                // Conversation 1-1 : afficher le nom de l'autre personne
                                const other = otherParticipants[0];
                                displayName = `${other.Prenom || ''} ${other.Nom || ''}`.trim() || "Utilisateur";
                            } else if (conv.Type === "group") {
                                // Groupe : afficher les noms des participants
                                const names = otherParticipants.slice(0, 3).map(p => 
                                    `${p.Prenom || ''} ${p.Nom || ''}`.trim() || "?"
                                );
                                displayName = names.join(", ");
                                if (otherParticipants.length > 3) {
                                    displayName += ` +${otherParticipants.length - 3}`;
                                }
                            }

                            userConversations.push({
                                id: conv.Id,
                                type: conv.Type,
                                createdAt: conv.CreatedAt,
                                createdBy: conv.CreatedBy,
                                displayName: displayName,
                                participants: participants,
                                otherParticipants: otherParticipants,
                            });
                        }
                    } catch (err) {
                        console.error(`Error fetching participants for conv ${conv.Id}:`, err);
                    }
                }

                // Trier par date de création (plus récente en premier)
                userConversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setConversations(userConversations);

            } catch (err) {
                console.error("Error fetching conversations:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div>Loading conversations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div>⚠️ {error}</div>
                <button onClick={() => window.location.reload()} style={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div style={styles.emptyContainer}>
                <div>💬 No conversations yet</div>
                <small>Start a conversation to see it here</small>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Mes conversations</h3>
            <div style={styles.list}>
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        style={{
                            ...styles.conversationItem,
                            ...(selectedConversationId === conv.id ? styles.selectedItem : {}),
                        }}
                    >
                        <div style={styles.avatar}>
                            {conv.type === "group" ? "👥" : "👤"}
                        </div>
                        <div style={styles.convInfo}>
                            <div style={styles.convName}>{conv.displayName}</div>
                            <div style={styles.convMeta}>
                                {conv.type === "group" 
                                    ? `${conv.participants.length} participants`
                                    : "Direct message"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles simples (tu peux les remplacer par du CSS ou Tailwind)
const styles = {
    container: {
        width: "300px",
        borderRight: "1px solid #e0e0e0",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    title: {
        padding: "16px",
        margin: 0,
        borderBottom: "1px solid #e0e0e0",
        fontSize: "18px",
    },
    list: {
        flex: 1,
        overflowY: "auto",
    },
    conversationItem: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: "1px solid #f0f0f0",
        transition: "background-color 0.2s",
    },
    selectedItem: {
        backgroundColor: "#e3f2fd",
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "#4caf50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "12px",
        fontSize: "20px",
    },
    convInfo: {
        flex: 1,
    },
    convName: {
        fontWeight: "bold",
        fontSize: "14px",
        marginBottom: "4px",
    },
    convMeta: {
        fontSize: "12px",
        color: "#666",
    },
    loadingContainer: {
        padding: "20px",
        textAlign: "center",
    },
    errorContainer: {
        padding: "20px",
        textAlign: "center",
    },
    retryButton: {
        marginTop: "10px",
        padding: "8px 16px",
        backgroundColor: "#4caf50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    emptyContainer: {
        padding: "40px 20px",
        textAlign: "center",
        color: "#666",
    },
};