import { Server } from "socket.io";
import { authenticateRequest } from "@clerk/express";
//mport { AuthStatus } from "@clerk/backend";
import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";
import { isUserInConversation } from "../database/conversation_participant.db.js";

let io;  //todo:(refactorer ca dans midleware/auth.js)

export const initSocket = (server, { origin }) => {
   io = new Server(server, {
     cors: {
      origin,
      credentials: true,
     },
   });

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

      const user = await getUtilisateurByClerkId(clerkId);
      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth failed:", error);
      next(new Error("Authentication failed"));
    }
  });

   io.on("connection", (socket) => {
     socket.on("join_conversation", async (conversationId) => {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      const isMember = await isUserInConversation(conversationId, socket.user.Id);
      if (!isMember) {
        return socket.emit("error", { message: "Unauthorized conversation access" });
      }

      if (socket.currentConversationId) {
        socket.leave(`conv_${socket.currentConversationId}`);
      }

      socket.join(`conv_${conversationId}`);
      socket.currentConversationId = conversationId;
     });

     socket.on("send_message", async (data) => {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      const { conversationId, message } = data;
      if (!conversationId || !message) {
        return;
      }

      const isMember = await isUserInConversation(conversationId, socket.user.Id);
      if (!isMember) {
        return socket.emit("error", { message: "Unauthorized conversation access" });
      }

      io.to(`conv_${conversationId}`).emit("new_message", {
        message,
        sender: socket.user.Nom || socket.user.Prenom || `user_${socket.user.Id}`,
        senderId: socket.user.Id,
        conversationId
      });
     });
   });
 };

export const getIO = () => io;