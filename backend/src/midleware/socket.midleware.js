import { Server } from "socket.io";
import { authenticateRequest } from "@clerk/express";
//import { AuthStatus } from "@clerk/backend";
import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";
import { isUserInConversation } from "../database/conversation_participant.db.js";

let io;

/**
 * Initialise Socket.io avec authentification Clerk et gestion des conversations
 * @param {http.Server} server - Serveur HTTP pour Socket.io
 * @param {Object} options - Options de configuration
 * @param {string} options.origin - URL d'origine CORS
 */
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
      const requestState = await authenticateRequest({ request: socket.request });

      if (requestState.status !== true){//AuthStatus.SignedIn) {
        return next(new Error("Unauthorized"));
      }

      const auth = requestState.toAuth();
      const clerkId = auth.userId;

      if (!clerkId) {
        return next(new Error("Unauthorized"));
      }

      // Charge l'utilisateur depuis la base de données
      const user = await getUtilisateurByClerkId(clerkId);
      if (!user) {
        return next(new Error("Unauthorized"));
      }

      // Attache l'utilisateur à la socket pour utilisation future
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication failed:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Gestion des événements connectés
  io.on("connection", (socket) => {
    console.log(`User ${socket.user.Id} connected via Socket.io`);

    /**
     * Événement: Utilisateur rejoint une conversation
     * Valide que l'utilisateur est membre de la conversation
     */
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
     */
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
     */
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.Id} disconnected`);
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
 */
export const getIO = () => io;
