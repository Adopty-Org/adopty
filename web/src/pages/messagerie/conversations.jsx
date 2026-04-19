/*import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import TestChat from "./goofy.jsx";

export default function ConversationsList() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Charger toutes les conversations de l'utilisateur
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user, getToken]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // Obtenir les autres participants de la conversation
  const getOtherParticipants = (conversation) => {
    if (!user) return [];
    return conversation.participants.filter(p => p.userId !== user.id);
  };

  // Obtenir le nom d'affichage de la conversation
  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    
    const otherParticipants = getOtherParticipants(conversation);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].firstName || otherParticipants[0].email || "Unknown User";
    } else if (otherParticipants.length > 1) {
      const names = otherParticipants.slice(0, 3).map(p => p.firstName || p.email?.split('@')[0]);
      if (otherParticipants.length > 3) {
        return `${names.join(", ")} +${otherParticipants.length - 3}`;
      }
      return names.join(", ");
    }
    return "Conversation";
  };

  // Obtenir l'avatar ou l'initiale
  const getAvatar = (conversation) => {
    const name = getConversationName(conversation);
    return name.charAt(0).toUpperCase();
  };

  // Retourner à la liste des conversations
  const handleBack = () => {
    setSelectedConversationId(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorMessage}>⚠️ {error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  // Si une conversation est sélectionnée, afficher TestChat
  if (selectedConversationId) {
    return (
      <div style={styles.chatContainer}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back to conversations
        </button>
        <TestChat conversationId={selectedConversationId} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💬 Messages</h1>
        <p style={styles.subtitle}>{conversations.length} conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>💬</div>
          <p style={styles.emptyStateText}>No conversations yet</p>
          <p style={styles.emptyStateSubtext}>Start a conversation with someone to see it here</p>
        </div>
      ) : (
        <div style={styles.conversationsList}>
          {conversations.map((conversation) => {
            const otherParticipants = getOtherParticipants(conversation);
            const unreadCount = conversation.unreadCount || 0;
            
            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                style={{
                  ...styles.conversationItem,
                  ...(unreadCount > 0 ? styles.conversationItemUnread : {})
                }}
              >
                <div style={styles.avatar}>
                  {conversation.avatar ? (
                    <img src={conversation.avatar} alt={getConversationName(conversation)} style={styles.avatarImage} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {getAvatar(conversation)}
                    </div>
                  )}
                </div>

                <div style={styles.conversationInfo}>
                  <div style={styles.conversationHeader}>
                    <div style={styles.conversationName}>
                      {getConversationName(conversation)}
                      {conversation.isGroup && (
                        <span style={styles.groupBadge}>👥 Group</span>
                      )}
                    </div>
                    {conversation.lastMessageTime && (
                      <div style={styles.timestamp}>
                        {formatDate(conversation.lastMessageTime)}
                      </div>
                    )}
                  </div>

                  <div style={styles.conversationPreview}>
                    <div style={styles.lastMessage}>
                      {conversation.lastMessage || "No messages yet"}
                    </div>
                    {unreadCount > 0 && (
                      <div style={styles.unreadBadge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </div>
                    )}
                  </div>

                  {otherParticipants.length > 0 && otherParticipants.some(p => p.isOnline) && (
                    <div style={styles.onlineStatus}>
                      <span style={styles.onlineDot}></span>
                      Online
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    backgroundColor: "white",
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#333",
  },
  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#666",
  },
  conversationsList: {
    padding: "10px",
  },
  conversationItem: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "white",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #e0e0e0",
    position: "relative",
  },
  conversationItemUnread: {
    backgroundColor: "#f0f7ff",
    borderLeft: "3px solid #2196f3",
  },
  avatar: {
    marginRight: "15px",
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#4caf50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
  },
  avatarImage: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "5px",
  },
  conversationName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  groupBadge: {
    fontSize: "11px",
    fontWeight: "normal",
    backgroundColor: "#e0e0e0",
    padding: "2px 6px",
    borderRadius: "10px",
    color: "#666",
  },
  timestamp: {
    fontSize: "11px",
    color: "#999",
    flexShrink: 0,
  },
  conversationPreview: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  lastMessage: {
    fontSize: "14px",
    color: "#666",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: "#2196f3",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    padding: "2px 6px",
    borderRadius: "10px",
    minWidth: "20px",
    textAlign: "center",
    flexShrink: 0,
  },
  onlineStatus: {
    fontSize: "11px",
    color: "#4caf50",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px",
  },
  onlineDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#4caf50",
    display: "inline-block",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    color: "#666",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #4caf50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "20px",
  },
  errorMessage: {
    color: "#c62828",
    fontSize: "16px",
  },
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyStateIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyStateText: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "10px",
  },
  emptyStateSubtext: {
    fontSize: "14px",
    color: "#999",
  },
  chatContainer: {
    maxWidth: 800,
    margin: "0 auto",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  backButton: {
    backgroundColor: "white",
    border: "none",
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#333",
    fontWeight: "500",
    borderBottom: "1px solid #e0e0e0",
    width: "100%",
  },
};

// Ajouter l'animation du spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);*/




import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { conversationApi, conversationParticipantApi, utilisateurApi } from "../../lib/api.js"; // Ajustez le chemin
import TestChat from "./goofy.jsx";

export default function ConversationsList() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Charger toutes les conversations de l'utilisateur
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer toutes les conversations
        const allConversations = await conversationApi.getAll();
        console.log("All conversations :   ", allConversations);
        
        // Filtrer les conversations où l'utilisateur est participant
        // et enrichir avec les données des participants
        const userConversations = await Promise.all(
          allConversations.map(async (conversation) => {
            // Récupérer les participants de cette conversation
            const response = await conversationParticipantApi.getParticipantsOfConversation(conversation.Id);

            const participants = Array.isArray(response?.data)
            ? response.data
            : [];
            //console.log(`Participants for conversation ${conversation.Id} :   `, participants);
            
            // Vérifier si l'utilisateur actuel est participant userId
            const isUserParticipant = participants.some(p => p.clerkId === user.id);
            
            if (!isUserParticipant) return null;
            
            // Récupérer le dernier message (vous devrez adapter selon votre structure)
            const lastMessage = conversation.lastMessage || "No messages yet";
            const lastMessageTime = conversation.updatedAt || conversation.createdAt;
            
            // Compter les messages non lus (à adapter selon votre logique)
            const unreadCount = participants.find(p => p.clerkId === user.id)?.unreadCount || 0;
            
            return {
              id: conversation.Id,
              name: conversation.name,
              isGroup: conversation.isGroup || participants.length > 2,
              participants: participants.map(p => ({
                userId: p.Id,
                clerkId: p.clerkId || null,
                firstName: p.user?.firstName || p.firstName || p.Nom || "User",
                email: p.user?.email || p.AddresseEmail || p.email,
                isOnline: p.isOnline || false,
                lastReadAt: p.lastReadAt
              })),
              lastMessage: lastMessage,
              lastMessageTime: lastMessageTime,
              unreadCount: unreadCount,
              createdAt: conversation.createdAt,
              updatedAt: conversation.updatedAt
            };
          })
        );
        
        // Filtrer les null et trier par date du dernier message
        const validConversations = userConversations
          .filter(conv => conv !== null)
          .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        
        setConversations(validConversations);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Alternative plus simple si votre API a déjà un endpoint pour les conversations d'un utilisateur
  useEffect(() => {
    const fetchUserConversations = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser l'API getByUtilisateur si disponible
        const utilisateur = await utilisateurApi.getByClerkId(user.id);
        const conversations = await conversationApi.getConversationsByUtilisateurId(utilisateur.Id);
        console.log("conversations raw:", conversations);
        
        // Enrichir avec les participants pour chaque conversation
        const enrichedConversations = await Promise.all(
          conversations.map(async (conv) => {
            try {
              //const participants = await conversationParticipantApi.getByConversation(conv.Id).data;     // NUH HUH  car '.'data a la prio sur await
              const response = await conversationParticipantApi.getParticipantsOfConversation(conv.Id);
              const participants = response.data;
                console.log(`Participants fr conversation ${conv.Id} :   `, participants);
              return {
                ...conv,
                participants: participants.map(p => ({
                  userId: p.Id,
                  clerkId: p.clerkId || null,
                  firstName: p.Nom || p.firstName,
                  email: p.AddresseEmail || p.email,
                  photo: p.Photo || null,
                  isOnline: p.isOnline || false
                })),
                isGroup: conv.isGroup || participants.length > 2,
                lastMessage: conv.lastMessage || "No messages yet",
                unreadCount: participants.find(p => p.clerkId === user.id)?.unreadCount || 0
              };
            } catch (err) {
              console.error(`Error fetching participants for conversation ${conv.Id}:`, err);
              return conv;
            }
          })
        );
        
        setConversations(enrichedConversations);
      } catch (err) {
        console.error("Error fetching user conversations:", err);
        setError(err.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchUserConversations();
  }, [user]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // Obtenir les autres participants de la conversation
  const getOtherParticipants = (conversation) => {
    if (!user || !conversation.participants) return [];
    return conversation.participants.filter(p => p.clerkId !== user.id);
  };

  // Obtenir le nom d'affichage de la conversation
  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    console.log("Getting names for conversation:", conversation);
    
    const otherParticipants = getOtherParticipants(conversation);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].firstName || otherParticipants[0].email || "Unknown User";
    } else if (otherParticipants.length > 1) {
      const names = otherParticipants.slice(0, 3).map(p => p.firstName || p.email?.split('@')[0]);
      if (otherParticipants.length > 3) {
        return `${names.join(", ")} +${otherParticipants.length - 3}`;
      }
      return names.join(", ");
    }
    return "Conversation";
  };

  // Obtenir l'avatar ou l'initiale
  const getAvatar = (conversation) => {
    const name = getConversationName(conversation);
    return name.charAt(0).toUpperCase();
  };

  // Retourner à la liste des conversations
  const handleBack = () => {
    setSelectedConversationId(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorMessage}>⚠️ {error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  // Si une conversation est sélectionnée, afficher TestChat
  if (selectedConversationId) {
    return (
      <div style={styles.chatContainer}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back to conversations
        </button>
        <TestChat conversationId={selectedConversationId} conversationmeta={conversation} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💬 Messages</h1>
        <p style={styles.subtitle}>{conversations.length} conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>💬</div>
          <p style={styles.emptyStateText}>No conversations yet</p>
          <p style={styles.emptyStateSubtext}>Start a conversation with someone to see it here</p>
        </div>
      ) : (
        <div style={styles.conversationsList}>
          {conversations.map((conversation) => {
            const otherParticipants = getOtherParticipants(conversation);
            const unreadCount = conversation.unreadCount || 0;
            
            return (
              <div
                key={conversation.id}
                onClick={() => {
                    console.log("CLICK", conversation);

                    setSelectedConversationId(conversation.Id ?? conversation.id);
                    setConversation(conversation);}}
                style={{
                  ...styles.conversationItem,
                  ...(unreadCount > 0 ? styles.conversationItemUnread : {})
                }}
              >
                <div style={styles.avatar}>
                  {conversation.avatar ? (
                    <img src={conversation.avatar} alt={getConversationName(conversation)} style={styles.avatarImage} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {/*getAvatar(conversation)*/}
                      {/*otherParticipants.length === 1 ? otherParticipants[0].photo || "C" : "C"*/}
                    </div>
                  )}
                </div>

                <div style={styles.conversationInfo}>
                  <div style={styles.conversationHeader}>
                    <div style={styles.conversationName}>
                      {getConversationName(conversation)}
                      {conversation.isGroup && (
                        <span style={styles.groupBadge}>👥 Group</span>
                      )}
                    </div>
                    {conversation.lastMessageTime && (
                      <div style={styles.timestamp}>
                        {formatDate(conversation.lastMessageTime)}
                      </div>
                    )}
                  </div>

                  <div style={styles.conversationPreview}>
                    <div style={styles.lastMessage}>
                      {conversation.lastMessage || "No messages yet"}
                    </div>
                    {unreadCount > 0 && (
                      <div style={styles.unreadBadge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </div>
                    )}
                  </div>

                  {otherParticipants.length > 0 && otherParticipants.some(p => p.isOnline) && (
                    <div style={styles.onlineStatus}>
                      <span style={styles.onlineDot}></span>
                      Online
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    backgroundColor: "white",
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#333",
  },
  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#666",
  },
  conversationsList: {
    padding: "10px",
  },
  conversationItem: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "white",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #e0e0e0",
    position: "relative",
  },
  conversationItemUnread: {
    backgroundColor: "#f0f7ff",
    borderLeft: "3px solid #2196f3",
  },
  avatar: {
    marginRight: "15px",
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#4caf50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
  },
  avatarImage: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "5px",
  },
  conversationName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  groupBadge: {
    fontSize: "11px",
    fontWeight: "normal",
    backgroundColor: "#e0e0e0",
    padding: "2px 6px",
    borderRadius: "10px",
    color: "#666",
  },
  timestamp: {
    fontSize: "11px",
    color: "#999",
    flexShrink: 0,
  },
  conversationPreview: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  lastMessage: {
    fontSize: "14px",
    color: "#666",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: "#2196f3",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    padding: "2px 6px",
    borderRadius: "10px",
    minWidth: "20px",
    textAlign: "center",
    flexShrink: 0,
  },
  onlineStatus: {
    fontSize: "11px",
    color: "#4caf50",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px",
  },
  onlineDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#4caf50",
    display: "inline-block",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    color: "#666",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #4caf50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "20px",
  },
  errorMessage: {
    color: "#c62828",
    fontSize: "16px",
  },
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyStateIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyStateText: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "10px",
  },
  emptyStateSubtext: {
    fontSize: "14px",
    color: "#999",
  },
  chatContainer: {
    maxWidth: 800,
    margin: "0 auto",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  backButton: {
    backgroundColor: "white",
    border: "none",
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#333",
    fontWeight: "500",
    borderBottom: "1px solid #e0e0e0",
    width: "100%",
  },
};

// Ajouter l'animation du spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);