/*import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";
import { isUserInConversation } from "../database/conversation_participant.db.js";

let io;

export const initSocket = (server, { origin }) => {
  io = new Server(server, {
    cors: {
      origin,
      credentials: true,
    },
  });

  // 🔐 AUTH FIX (Clerk safe for socket)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      console.log("🔐 TOKEN:", token);

      if (!token) {
        return next(new Error("No token"));
      }

      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (!payload?.sub) {
        return next(new Error("Unauthorized"));
      }

      const user = await getUtilisateurByClerkId(payload.sub);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth failed:", err);
      next(new Error("Auth failed"));
    }
  });

  io.use((socket, next) => {
    // Logger TOUS les événements entrants
    const originalOnevent = socket.onevent;
    socket.onevent = function(packet) {
      const event = packet.data[0];
      const args = packet.data[1];
      console.log(`📨 [SOCKET EVENT] ${event}`, args);
      originalOnevent.call(this, packet);
    };
    next();
  });

  // 🔌 CONNECTION
  io.on("connection", (socket) => {
    console.log("🟢 User connecté:", socket.user.Id);

    // 🔥 DEBUG GLOBAL (IMPORTANT)
    socket.onAny((event, ...args) => {
      console.log("📡 EVENT RECU:", event, args);
    });

    // 💬 JOIN CONVERSATION (clean + simple)
    socket.on("join_conversation", async (conversationId) => {
      try {
        if (!socket.user) return;

        console.log("JOIN:", conversationId);

        const isMember = await isUserInConversation(
          conversationId,
          socket.user.Id
        );

        if (!isMember) {
          return socket.emit("error", {
            message: "Unauthorized conversation access",
          });
        }

        if (socket.currentConversationId) {
          socket.leave(`conv_${socket.currentConversationId}`);
        }

        socket.join(`conv_${conversationId}`);
        socket.currentConversationId = conversationId;

        // 🆕 Récupérer et envoyer l'historique des 50 derniers messages
        try {
          const historique = await getMessagesByConversation(conversationId, 50);
          console.log(`📜 Envoi de l'historique (${historique.length} messages) à l'utilisateur ${socket.user.Id}`);
          socket.emit("message_history", historique);
        } catch (err) {
          console.error("Erreur lors de la récupération de l'historique:", err);
        }

        console.log("🟢 joined room:", conversationId);

        io.to(`conv_${conversationId}`).emit("user_joined", {
          userId: socket.user.Id,
          userName: socket.user.Nom || socket.user.Prenom,
        });

      } catch (err) {
        console.error(err);
      }
    });

    // 💬 SEND MESSAGE (FIX PRINCIPAL)
    // Dans la partie send_message
    socket.on("send_message", async (data) => {
        console.log("🔥 send_message EVENT RECEIVED on BACKEND:", data);
        
        if (!socket.user) {
            console.log("❌ No user in socket");
            return socket.emit("error", { message: "Unauthorized" });
        }
        
        console.log("👤 User:", socket.user.Id);
        
        const { conversationId, message } = data ?? {};
        
        if (!conversationId || !message) {
            console.log("❌ Missing fields:", { conversationId, message });
            return socket.emit("error", {
                message: "Missing required fields",
            });
        }
        
        try {
            const isMember = await isUserInConversation(
                conversationId,
                socket.user.Id
            );
            
            console.log("✅ Is member:", isMember);
            
            if (!isMember) {
                return socket.emit("error", {
                    message: "Unauthorized conversation access",
                });
            }
            
            const payload = {
                message,
                sender: socket.user.Nom || socket.user.Prenom || `user_${socket.user.Id}`,
                senderId: socket.user.Id,
                conversationId,
                timestamp: new Date().toISOString(),
            };
            
            console.log("📤 Emitting to room:", `conv_${conversationId}`, payload);
            
            io.to(`conv_${conversationId}`).emit("new_message", payload);
            
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // 👋 DISCONNECT
    socket.on("disconnect", () => {
      console.log("🔴 disconnected:", socket.user?.Id);

      if (socket.currentConversationId) {
        io.to(`conv_${socket.currentConversationId}`).emit("user_left", {
          userId: socket.user.Id,
          userName: socket.user.Nom || socket.user.Prenom,
        });
      }
    });
  });
};

export const getIO = () => io;*/

import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";
import { isUserInConversation } from "../database/conversation_participant.db.js";
// IMPORTEZ VOS FONCTIONS
import { 
    saveMessageFromSocket, 
    getMessagesByConversation, 
    markConversationMessagesAsRead,
    getUnreadCount 
} from "../database/message_read.db.js";

let io;

export const initSocket = (server, { origin }) => {
  io = new Server(server, {
    cors: {
      origin,
      credentials: true,
    },
  });

  // 🔐 AUTH
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token"));
      }

      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (!payload?.sub) {
        return next(new Error("Unauthorized"));
      }

      const user = await getUtilisateurByClerkId(payload.sub);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth failed:", err);
      next(new Error("Auth failed"));
    }
  });

  // Logger middleware
  /*io.use((socket, next) => {
    const originalOnevent = socket.onevent;
    socket.onevent = function(packet) {
      const event = packet.data[0];
      const args = packet.data[1];
      console.log(`📨 [SOCKET EVENT] ${event}`, args);
      originalOnevent.call(this, packet);
    };
    next();
  });*/

  // CONNECTION
  io.on("connection", (socket) => {
    console.log("🟢 User connecté:", socket.user.Id, socket.user.Prenom, socket.user.Nom);

    // 👇 AJOUTEZ LE LOGGER ICI À LA PLACE
    socket.onAny((event, ...args) => {
      console.log(`📡 [GLOBAL EVENT] ${event}:`, args);
    });

    // JOIN CONVERSATION avec historique
    socket.on("join_conversation", async (conversationId) => {
      try {
        if (!socket.user) return;

        console.log("JOIN:", conversationId);

        const isMember = await isUserInConversation(
          conversationId,
          socket.user.Id
        );

        if (!isMember) {
          return socket.emit("error", {
            message: "Unauthorized conversation access",
          });
        }

        if (socket.currentConversationId) {
          socket.leave(`conv_${socket.currentConversationId}`);
        }

        socket.join(`conv_${conversationId}`);
        socket.currentConversationId = conversationId;
        console.log("🔍 3 - Avant try");

        // 📜 Récupérer et envoyer l'historique des 50 derniers messages
        try {
          const historique = await getMessagesByConversation(conversationId, 50);
          console.log(`📜 Envoi de l'historique (${historique.length} messages) à ${socket.user.Prenom}`);
          socket.emit("message_history", historique);
          
          // Compter les messages non lus
          const unreadCount = await getUnreadCount(socket.user.Id, conversationId);
          socket.emit("unread_count", { conversationId, count: unreadCount });
          
        } catch (err) {
          console.error("Erreur historique:", err);
        }

        // Marquer les messages comme lus
        await markConversationMessagesAsRead(conversationId, socket.user.Id);

        console.log("🟢 joined room:", conversationId);

        socket.to(`conv_${conversationId}`).emit("user_joined", {
          userId: socket.user.Id,
          userName: `${socket.user.Prenom} ${socket.user.Nom}`.trim(),
        });

      } catch (err) {
        console.error(err);
      }
    });

    // SEND MESSAGE AVEC SAUVEGARDE
    socket.on("send_message", async (data) => {
      console.log("🔥 send_message reçu:", data);
      
      if (!socket.user) {
        console.log("❌ No user in socket");
        return socket.emit("error", { message: "Unauthorized" });
      }
      
      const { conversationId, message } = data ?? {};
      
      if (!conversationId || !message) {
        console.log("❌ Missing fields:", { conversationId, message });
        return socket.emit("error", {
          message: "Missing required fields",
        });
      }
      
      try {
        console.log("🔍 1 - Avant isUserInConversation");
        const isMember = await isUserInConversation(
          conversationId,
          socket.user.Id
        );
        console.log("🔍 2 - isMember =", isMember);
        
        if (!isMember) {
          return socket.emit("error", {
            message: "Unauthorized conversation access",
          });
        }

        // Dans socket.js, avant l'appel à saveMessageFromSocket
        console.log("🔍 AVANT SAUVEGARDE - Données:", {
            IdConversation: conversationId,
            SenderId: socket.user.Id,
            Contenu: message
        });
        
        console.log("🔍 3 - Avant saveMessageFromSocket");
        // 💾 Sauvegarder en base avec VOS fonctions
        const savedMessage = await saveMessageFromSocket({
          IdConversation: conversationId,
          SenderId: socket.user.Id,
          Contenu: message
        });
        
        console.log("💾 Message sauvegardé, ID:", savedMessage.Id);
        
        // Construire le payload pour le frontend
        const payload = {
          id: savedMessage.Id,
          message: savedMessage.Contenu,
          sender: `${socket.user.Prenom} ${socket.user.Nom}`.trim() || socket.user.Prenom || socket.user.Nom,
          senderId: socket.user.Id,
          senderClerkId: socket.user.ClerkId,
          conversationId: conversationId,
          timestamp: savedMessage.CreatedAt || new Date().toISOString(),
          type: 'text',
          isRead: false
        };
        
        console.log("📤 Diffusion à la room:", `conv_${conversationId}`);
        
        // Diffuser à tous les participants
        io.to(`conv_${conversationId}`).emit("new_message", payload);
        
        // Confirmation à l'envoyeur
        socket.emit("message_sent", { id: savedMessage.Id, success: true });
        
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message: " + error.message });
      }
    });

    // DEMANDER L'HISTORIQUE MANUELLEMENT
    socket.on("get_message_history", async (data) => {
      try {
        const { conversationId, limit = 50, offset = 0 } = data;
        
        const isMember = await isUserInConversation(conversationId, socket.user.Id);
        
        if (!isMember) {
          return socket.emit("error", { message: "Unauthorized" });
        }
        
        const messages = await getMessagesByConversation(conversationId, limit, offset);
        socket.emit("message_history", messages);
        
      } catch (error) {
        console.error("Error getting history:", error);
        socket.emit("error", { message: "Failed to get messages" });
      }
    });

    // MARQUER COMME LU
    socket.on("mark_messages_read", async (conversationId) => {
      try {
        await markConversationMessagesAsRead(conversationId, socket.user.Id);
        console.log(`✅ Messages lus par ${socket.user.Id} dans conv ${conversationId}`);
        
        // Notifier les autres que les messages sont lus
        socket.to(`conv_${conversationId}`).emit("messages_read", {
          userId: socket.user.Id,
          conversationId,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error("Error marking read:", error);
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("🔴 disconnected:", socket.user?.Id);

      if (socket.currentConversationId) {
        io.to(`conv_${socket.currentConversationId}`).emit("user_left", {
          userId: socket.user.Id,
          userName: `${socket.user.Prenom} ${socket.user.Nom}`.trim(),
        });
      }
    });
  });
};

export const getIO = () => io;