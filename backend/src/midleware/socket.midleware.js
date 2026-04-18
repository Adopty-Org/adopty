/*import { Server } from "socket.io";
import { authenticateRequest } from "@clerk/express";
import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";
import { isUserInConversation } from "../database/conversation_participant.db.js";

let io;

/**
 * Initialise Socket.io avec authentification Clerk et gestion des conversations
 * @param {http.Server} server - Serveur HTTP pour Socket.io
 * @param {Object} options - Options de configuration
 * @param {string} options.origin - URL d'origine CORS
 * /
export const initSocket = (server, { origin }) => {
  io = new Server(server, {
    cors: {
      origin,
      credentials: true,
    },
  });

  // Middleware d'authentification Socket.io
  io.use(async (socket, next) => {
    try {
      console.log("(socket.js)TOKEN:", socket.handshake.auth?.token);
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("No token"));
      }

      const requestState = await authenticateRequest({
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!requestState.isAuthenticated) {
        return next(new Error("Unauthorized"));
      }

      const auth = requestState.toAuth();
      const user = await getUtilisateurByClerkId(auth.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error(err);
      next(new Error("Auth failed"));
    }
  });

  // Gestion des événements connectés
  io.on("connection", (socket) => {
    console.log(`User ${socket.user.Id} connected via Socket.io`);

    /**
     * Événement: Utilisateur rejoint une conversation
     * Valide que l'utilisateur est membre de la conversation
     * /
    if (!conversationId) {
      return socket.emit("error", { message: "Invalid conversationId" });
    }
    socket.on("join_conversation", async (conversationId) => {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      try {
        const isMember = await isUserInConversation(conversationId, socket.user.Id);
        if (!isMember) {
          return socket.emit("error", { message: "Unauthorized conversation access" });
        }

        // Quitter la conversation précédente si elle existe
        if (socket.currentConversationId) {
          socket.leave(`conv_${socket.currentConversationId}`);
        }

        // Rejoindre la nouvelle conversation
        socket.join(`conv_${conversationId}`);
        socket.currentConversationId = conversationId;

        // Notifier les autres utilisateurs
        io.to(`conv_${conversationId}`).emit("user_joined", {
          userId: socket.user.Id,
          userName: socket.user.Nom || socket.user.Prenom,
        });
      } catch (error) {
        console.error("Error joining conversation:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    /**
     * Événement: Utilisateur envoie un message
     * Valide et diffuse le message à tous les participants de la conversation
     * /
    socket.on("send_message", async (data) => {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      const { conversationId, message } = data;

      if (!conversationId || !message) {
        return socket.emit("error", { message: "Missing required fields" });
      }

      try {
        // Vérifier que l'utilisateur est membre de la conversation
        const isMember = await isUserInConversation(conversationId, socket.user.Id);
        if (!isMember) {
          return socket.emit("error", { message: "Unauthorized conversation access" });
        }

        // Diffuser le message à tous les participants de la conversation
        io.to(`conv_${conversationId}`).emit("new_message", {
          message,
          sender: socket.user.Nom || socket.user.Prenom || `user_${socket.user.Id}`,
          senderId: socket.user.Id,
          conversationId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    /**
     * Événement: Utilisateur se déconnecte
     * /
    socket.on("disconnect", () => {
      if (socket.user) {
        console.log(`User ${socket.user.Id} disconnected`);
      }
      if (socket.currentConversationId) {
        io.to(`conv_${socket.currentConversationId}`).emit("user_left", {
          userId: socket.user.Id,
          userName: socket.user.Nom || socket.user.Prenom,
        });
      }
    });
  });
};

/**
 * Récupère l'instance Socket.io initialée
 * @returns {Server} Instance Socket.io
 * /
export const getIO = () => io;*/

import { Server } from "socket.io";
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

  // 🔐 AUTH SOCKET (FIX PROPRE)
  io.use(async (socket, next) => {
    try {
      console.log("(socket.js)TOKEN:", socket.handshake.auth?.token);

      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token"));
      }

      // ✅ Clerk JWT verification (SAFE FOR SOCKET)
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

  // 🔌 CONNECTION
  io.on("connection", (socket) => {
    console.log(`User ${socket.user.Id} connected via Socket.io`);

    // 👇 JOIN CONVERSATION
    socket.on("join_conversation", async (conversationId) => {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      try {
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

        io.to(`conv_${conversationId}`).emit("user_joined", {
          userId: socket.user.Id,
          userName: socket.user.Nom || socket.user.Prenom,
        });
      } catch (error) {
        console.error("Error joining conversation:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // 💬 SEND MESSAGE
    socket.on("send_message", async (data) => {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      const { conversationId, message } = data;

      if (!conversationId || !message) {
        return socket.emit("error", {
          message: "Missing required fields",
        });
      }

      try {
        const isMember = await isUserInConversation(
          conversationId,
          socket.user.Id
        );

        if (!isMember) {
          return socket.emit("error", {
            message: "Unauthorized conversation access",
          });
        }

        io.to(`conv_${conversationId}`).emit("new_message", {
          message,
          sender:
            socket.user.Nom ||
            socket.user.Prenom ||
            `user_${socket.user.Id}`,
          senderId: socket.user.Id,
          conversationId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // 👋 DISCONNECT
    socket.on("disconnect", () => {
      if (socket.user) {
        console.log(`User ${socket.user.Id} disconnected`);
      }

      if (socket.currentConversationId) {
        io.to(`conv_${socket.currentConversationId}`).emit("user_left", {
          userId: socket.user.Id,
          userName: socket.user.Nom || socket.user.Prenom,
        });
      }
    });
  });
};

export const getIO = () => io;