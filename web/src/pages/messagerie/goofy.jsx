/*import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

export default function TestChat() {
    const [conversation, setRoom] = useState("conversation1");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const { getToken } = useAuth();
    const socketRef = useRef(null); // 🔥 IMPORTANT

    /*useEffect(() => {
        const init = async () => {
            const token = await getToken({template: "default"});

            // 🔥 créer socket UNE fois
            /*socketRef.current = io("http://localhost:3000", {
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });* /
            socketRef.current = io("http://localhost:3000", {
                auth: {
                    token
                }
            });

            const socket = socketRef.current;

            setMessages([]);
            socket.emit("join_conversation", conversation);

            const handler = (data) => {
                console.log("📩 FRONT RECOIT:", data);

                setMessages((prev) => {
                    const exists = prev.some((m) => {
                        if (m.conversationId !== data.conversationId) return false;

                        if (data.id != null || m.id != null) {
                            return m.id === data.id;
                        }

                        if (data.timestamp != null || m.timestamp != null) {
                            return m.timestamp === data.timestamp;
                        }

                        return m.message === data.message && m.sender === data.sender;
                    });

                    if (exists) return prev;
                    return [...prev, data];
                });
            };

            socket.on("new_message", handler);

            return () => {
                socket.off("new_message", handler);
                socket.disconnect();
            };
        };

        init();
    }, [conversation]);* /

    useEffect(() => {
        let socket;
        let cancelled = false;
        const handler = (data) => {
            console.log("📩 FRONT RECOIT:", data);
            setMessages((prev) => {
                const exists = prev.some((m) => {
                    if (m.conversationId !== data.conversationId) return false;
                    if (data.id != null || m.id != null) {
                        return m.id === data.id;
                    }
                    if (data.timestamp != null || m.timestamp != null) {
                        return m.timestamp === data.timestamp;
                    }
                    return m.message === data.message && m.sender === data.sender;
                });
                if (exists) return prev;
                return [...prev, data];
            });
        };
        const init = async () => {
            const token = await getToken();
            if (cancelled) return;
            socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
                auth: {
                    token
                }
            });
            socketRef.current = socket;
            setMessages([]);
            socket.emit("join_conversation", conversation);
            socket.on("new_message", handler);
        };
        init();
        return () => {
            cancelled = true;
            socket?.off("new_message", handler);
            socket?.disconnect();
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [conversation, getToken]);

    const sendMessage = () => {
        if (!message || !socketRef.current) return;

        if (!socketRef.current.connected) {
            console.log("❌ Socket not connected");
            return;
        }

        socketRef.current.emit("send_message", {
            conversationId: conversation,
            message
        }, (response) => {
            console.log("📡 Server ACK:", response);
        });

        console.log("📤 sending message");

        setMessage("");

        console.log("SOCKET STATE:", socketRef.current?.connected);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>💬 Chat test</h2>

            <input
                value={conversation}
                onChange={(e) => {
                    setRoom(e.target.value);
                    setMessages([]);
                }}
            />
            <br /><br />

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>

            <ul>
                {messages.map((msg, i) => (
                    <li key={i}>
                        {msg.sender}: {msg.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}*/

import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth, useUser } from "@clerk/clerk-react";
import { messageReadApi } from "../../lib/api";

export default function TestChat({ conversationId: propConversationId , conversationmeta}) {
  const [conversationId, setConversationId] = useState(propConversationId || "1");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const user = useUser().user;
  //console.log("user :   ", user)

  const [readMap, setReadMap] = useState({});

  const { getToken } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
  const fetchReads = async () => {
    const map = {};

    for (const msg of messages) {
      try {
        const res = await messageReadApi.getByMessage(msg.Id);
        console.log("res  :   ", res)

        map[msg.Id] = Array.isArray(res) && res.length > 0;
      } catch (e) {
        map[msg.Id] = false;
      }
    }

    setReadMap(map);
  };

  if (messages.length > 0) fetchReads();
}, [messages]);

  // Ajoutez un useEffect pour mettre à jour conversationId quand la prop change
  useEffect(() => {
    if (propConversationId) {
      setConversationId(propConversationId);
    }
  }, [propConversationId]);

  

  // Obtenir les autres participants de la conversation
  const getOtherParticipants = (conversation) => {
    if (!user || !conversation.participants) return [];
    return conversation.participants.filter(p => p.clerkId !== user.id);
  };

  // Obtenir le nom d'affichage de la conversation
  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    //console.log("Getting name for conversation:", conversation);
    
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

  // Initialisation de la socket
  useEffect(() => {
    let mounted = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const initSocket = async () => {
      try {
        const token = await getToken();
        
        if (!token) {
          throw new Error("No authentication token");
        }

        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
          auth: { token },
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        // Événements de connexion
        socket.on("connect", () => {
          console.log("✅ Socket connected");
          setIsConnected(true);
          setError(null);
          reconnectAttempts = 0;
          
          // Rejoindre la conversation automatiquement
          socket.emit("join_conversation", conversationId, (response) => {
            if (response?.success) {
              console.log("✅ Joined conversation:", conversationId);
            } else {
              setError(response?.error || "Failed to join conversation");
            }
          });
        });

        socket.on("connect_error", (error) => {
          console.error("Connection error:", error);
          setIsConnected(false);
          reconnectAttempts++;
          
          if (reconnectAttempts >= maxReconnectAttempts) {
            setError("Unable to connect to chat server");
          }
        });

        socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          setIsConnected(false);
          
          if (reason === "io server disconnect") {
            // Le serveur a déconnecté le client, reconnexion manuelle
            socket.connect();
          }
        });

        socket.on("message_history", (history) => {
            console.log("histoire :  ", history);
        console.log("📜 Historique reçu:", history.length, "messages");
            setMessages(history);
        });

        socket.on("message_sent", (data) => {
            console.log("✅ Message confirmé par le serveur, ID:", data.id);
        });

        socket.on("unread_count", (data) => {
            console.log(`📊 Messages non lus dans ${data.conversationId}: ${data.count}`);
        });

        // Événements de chat
        socket.on("new_message", (data) => {
          console.log("📩 New message:", data);
          setMessages((prev) => {
            // Éviter les doublons
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, data];
          });
        });

        socket.on("user_joined", (data) => {
          console.log("👤 User joined:", data);
          setUsers((prev) => {
            if (prev.some(u => u.userId === data.userId)) return prev;
            return [...prev, data];
          });
        });

        socket.on("user_left", (data) => {
          console.log("👋 User left:", data);
          setUsers((prev) => prev.filter(u => u.userId !== data.userId));
        });

        socket.on("error", (error) => {
          console.error("Socket error:", error);
          setError(error.message);
          setTimeout(() => setError(null), 5000);
        });

      } catch (error) {
        console.error("Failed to initialize socket:", error);
        setError(error.message);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [getToken]); // Ne dépend que de getToken

  // Changer de conversation
  useEffect(() => {
    if (!socketRef.current || !isConnected) return;

    const changeConversation = async () => {
      socketRef.current.emit("join_conversation", conversationId, (response) => {
        if (response?.success) {
          setMessages([]); // Vider les messages
          setUsers([]); // Vider la liste des utilisateurs
          console.log("✅ Switched to conversation:", conversationId);
        } else {
          setError(response?.error || "Failed to switch conversation");
        }
      });
    };

    changeConversation();
  }, [conversationId, isConnected]);

  // Envoyer un message
  const sendMessage = useCallback(() => {
    if (!message.trim()) return;
    if (!socketRef.current?.connected) {
      setError("Not connected to chat server");
      return;
    }

    const messageData = {
      conversationId,
      message: message.trim()
    };

    socketRef.current.emit("send_message", messageData, (response) => {
      if (response?.success) {
        console.log("✅ Message sent successfully");
        // Optionnel: Ajouter le message en local immédiatement
        // setMessages(prev => [...prev, response.message]);
      } else {
        setError(response?.error || "Failed to send message");
      }
    });

    console.log("socketRef :   ", socketRef)

    setMessage("");
  }, [message, conversationId]);

  // Gestion des touches
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>💬 Chat Test</h2>
      
      {/* Status Bar */}
      <div style={{ 
        marginBottom: 20, 
        padding: 10, 
        backgroundColor: isConnected ? "#e8f5e9" : "#ffebee",
        borderRadius: 5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span>
          Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
        <span>
          Users online: {users.length}
        </span>
      </div>{console.log("socketRef :   ", socketRef)}
      {console.log("socketRef.current.user :   ", socketRef.current?.user)}

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: 20,
          padding: 10,
          backgroundColor: "#ffebee",
          color: "#c62828",
          borderRadius: 5,
          border: "1px solid #ef9a9a"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Conversation Selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Conversation en {conversationmeta?.Type } avec {getConversationName(conversationmeta)}</label>
        {/*<input
          value={conversationId}
          onChange={(e) => setConversationId(e.target.value)}
          placeholder="Enter conversation ID"
          style={{ padding: 8, width: 200 }}
          disabled={!isConnected}
        />*/}
      </div>

      {/* Messages */}
      <div style={{
        border: "1px solid #ddd",
        borderRadius: 5,
        height: 400,
        overflowY: "auto",
        padding: 10,
        marginBottom: 20,
        backgroundColor: "#fafafa"
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: 10,
                padding: 8,
                backgroundColor: "white",
                borderRadius: 5,
                borderLeft: `3px solid ${msg.senderClerkId === user?.id ? "#4caf50" : "#2196f3"}`,
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 5 }}>
                {msg.senderFirstName}
                <span style={{ fontSize: 11, color: "#999", marginLeft: 10 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()   }{console.log( "readMap",readMap) }{readMap[msg.Id] ? " ✓✓" : " ✓"}{/*IsMessageRead(msg) ? " ✓✓" : " ✓"*/}
                </span>
              </div>
              <div>{msg.message}</div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 5,
            fontSize: 14
          }}
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !message.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: !isConnected || !message.trim() ? "not-allowed" : "pointer",
            opacity: !isConnected || !message.trim() ? 0.6 : 1
          }}
        >
          Send
        </button>
      </div>
      
      <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
        💡 Tip: Press Enter to send message
      </div>
    </div>
  );
}