// frontend/src/components/chat/ConversationList.jsx
/*
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
};*/

// frontend/src/components/chat/ConversationList.jsx

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { conversationApi, conversationParticipantApi, utilisateurApi, messageApi, messageReadApi } from "../../lib/api";

export const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const { user } = useUser();
    const [isRefreshing, setIsRefreshing] = useState(false);

    

    // Récupérer les messages non lus pour une conversation
    const fetchUnreadCount = async (conversationId, userId) => {
        try {
            const messages = await messageReadApi.getByConversation(conversationId);
            //console.log(`Messages for conv ${conversationId}:`, messages);
            const unreadMessages = messages.filter(msg => {
                // Ne compter que les messages qui ne sont PAS de l'utilisateur courant
                if (msg.senderId === userId || msg.SenderId === userId) return false;
                
                // Vérifier si l'utilisateur a lu ce message
                const hasRead = msg.readBy && msg.readBy.includes(userId);
                
                // Si l'utilisateur n'a pas lu, c'est un message non lu
                return !hasRead;
                }
            );
            //console.log(`Unread messages for conv ${conversationId}:`, unreadMessages);
            return unreadMessages.length;
        } catch (err) {
            console.error(`Error fetching unread count for conv ${conversationId}:`, err);
            return 0;
        }
    };

    // Récupérer les conversations avec les compteurs de messages non lus
    const fetchConversations = useCallback(async (isBackground = false) => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {

            // Ne montrer le loading que pour le premier chargement
            if (!isBackground) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }

            setError(null);


            //setLoading(true);
            //setError(null);

            // 1. Récupérer l'utilisateur dans ta BDD
            const utilisateur = await utilisateurApi.getByClerkId(user.id);
            
            if (!utilisateur?.Id) {
                throw new Error("User not found in database");
            }

            // 2. Récupérer toutes les conversations
            const allConversations = await conversationApi.getAll();
            
            // 3. Filtrer et enrichir les conversations
            const userConversations = [];
            const newUnreadCounts = {};

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
                            const other = otherParticipants[0];
                            displayName = `${other.Prenom || ''} ${other.Nom || ''}`.trim() || "Utilisateur";
                        } else if (conv.Type === "group") {
                            const names = otherParticipants.slice(0, 3).map(p => 
                                `${p.Prenom || ''} ${p.Nom || ''}`.trim() || "?"
                            );
                            displayName = names.join(", ");
                            if (otherParticipants.length > 3) {
                                displayName += ` +${otherParticipants.length - 3}`;
                            }
                        }

                        // Récupérer le dernier message et le compteur de non lus
                        const messages = await messageApi.getMessagesByConversation(conv.Id);
                        //console.log(`Messagess for conv ${conv.Id}:`, messages);
                        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                        
                        // Compter les messages non lus pour cette conversation
                        const unreadCount = await fetchUnreadCount(conv.Id, utilisateur.Id);
                        if (unreadCount > 0) {
                            newUnreadCounts[conv.Id] = unreadCount;
                        }

                        userConversations.push({
                            id: conv.Id,
                            type: conv.Type,
                            createdAt: conv.CreatedAt,
                            createdBy: conv.CreatedBy,
                            displayName: displayName,
                            participants: participants,
                            otherParticipants: otherParticipants,
                            lastMessage: lastMessage,
                            lastMessageTime: lastMessage ? lastMessage.CreatedAt : conv.CreatedAt,
                            lastMessageContent: lastMessage ? lastMessage.Contenu : "Aucun message",
                        });
                        //console.log(`Conv ${conv.Id} - Unread count:`, userConversations);
                    }
                } catch (err) {
                    console.error(`Error fetching conv ${conv.Id}:`, err);
                }
            }

            // Trier par date du dernier message (plus récent en premier)
            userConversations.sort((a, b) => 
                new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
            );
            
            setConversations(userConversations);
            setUnreadCounts(newUnreadCounts);

        } catch (err) {
            console.error("Error fetching conversations:", err);
            if (!isBackground) setError(err.message);
        } finally {
            if (!isBackground) {
            setLoading(false);
        } else {
            setIsRefreshing(false);
        }
            
        }
    }, [user]);

    // Rafraîchir les conversations périodiquement
    useEffect(() => {
        fetchConversations(false);
        
        // Rafraîchir toutes les 5 secondes pour détecter les nouveaux messages
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchConversations(true);
            }
        }, 5000);
        
        // Rafraîchir quand l'onglet devient visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchConversations(true);
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchConversations]);

    // Marquer une conversation comme lue quand on la sélectionne
    const handleSelectConversation = async (conversationId) => {
        // Mettre à jour localement pour enlever le badge
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[conversationId];
            return newCounts;
        });
        
        // Appeler le callback parent
        onSelectConversation(conversationId);
    };

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
    //console.log("Conversations with unread counts:", conversations);

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Mes conversations</h3>
            <div style={styles.list}>
                {conversations.map((conv) => {
                    const hasUnread = unreadCounts[conv.id] > 0;
                    const unreadCount = unreadCounts[conv.id] || 0;

                    
                    return (
                        <div
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            style={{
                                ...styles.conversationItem,
                                ...(selectedConversationId === conv.id ? styles.selectedItem : {}),
                                ...(hasUnread && !selectedConversationId === conv.id ? styles.unreadItem : {}),
                            }}
                        >
                            <div style={styles.avatar}>
                                {conv.type === "group" ? "👥" : "👤"}
                                {hasUnread && <div style={styles.unreadDot} />}
                            </div>
                            <div style={styles.convInfo}>
                                <div style={styles.convNameRow}>
                                    <div style={{
                                        ...styles.convName,
                                        ...(hasUnread ? styles.unreadName : {})
                                    }}>
                                        {conv.displayName}
                                    </div>
                                    {hasUnread && (
                                        <div style={styles.unreadBadge}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div style={styles.lastMessage}>
                                    <span style={styles.lastMessageText}>
                                        {conv.lastMessageContent?.length > 50 
                                            ? conv.lastMessageContent.substring(0, 50) + '...' 
                                            : conv.lastMessageContent}
                                    </span>
                                    <span style={styles.lastMessageTime}>
                                        {formatRelativeTime(conv.lastMessageTime)}
                                    </span>
                                </div>
                                <div style={styles.convMeta}>
                                    {conv.type === "group" 
                                        ? `${conv.participants.length} participants`
                                        : "Direct message"}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Fonction utilitaire pour formater le temps relatif
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

// Styles améliorés avec indicateurs visuels
const styles = {
    container: {
        width: "320px",
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
        fontWeight: "600",
    },
    list: {
        flex: 1,
        overflowY: "auto",
    },
    conversationItem: {
        display: "flex",
        alignItems: "flex-start",
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: "1px solid #f0f0f0",
        transition: "all 0.2s",
        position: "relative",
        ':hover': {
            backgroundColor: "#f0f0f0",
        }
    },
    selectedItem: {
        backgroundColor: "#e3f2fd",
    },
    unreadItem: {
        backgroundColor: "#fff9e6",
        position: "relative",
    },
    avatar: {
        position: "relative",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        backgroundColor: "#4caf50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "12px",
        fontSize: "24px",
        flexShrink: 0,
    },
    unreadDot: {
        position: "absolute",
        bottom: "2px",
        right: "2px",
        width: "12px",
        height: "12px",
        backgroundColor: "#ff4444",
        borderRadius: "50%",
        border: "2px solid #fff",
    },
    convInfo: {
        flex: 1,
        minWidth: 0,
    },
    convNameRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px",
    },
    convName: {
        fontWeight: "500",
        fontSize: "14px",
        color: "#333",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    unreadName: {
        fontWeight: "700",
        color: "#000",
    },
    unreadBadge: {
        backgroundColor: "#ff4444",
        color: "white",
        borderRadius: "12px",
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: "bold",
        minWidth: "20px",
        textAlign: "center",
    },
    lastMessage: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "12px",
        color: "#666",
        marginBottom: "4px",
    },
    lastMessageText: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: 1,
    },
    lastMessageTime: {
        fontSize: "10px",
        color: "#999",
        marginLeft: "8px",
        flexShrink: 0,
    },
    convMeta: {
        fontSize: "11px",
        color: "#999",
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

// Ajouter les styles de hover avec JavaScript (ou utilisez CSS pur)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .conversation-item:hover {
        background-color: #f0f0f0;
    }
    
    @keyframes subtlePulse {
        0% { background-color: transparent; }
        50% { background-color: rgba(76, 175, 80, 0.05); }
        100% { background-color: transparent; }
    }
    
    .refreshing {
        animation: subtlePulse 0.5s ease-in-out;
    }
    
    /* Loading plus discret pour les refresh */
    .refresh-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        z-index: 1000;
    }
    
    .refresh-indicator.visible {
        opacity: 0.6;
    }
`;
document.head.appendChild(styleSheet);