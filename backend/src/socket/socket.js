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
    socket.on("send_message", async (data) => {
      try {
        console.log("📩 send_message reçu:", data);

        if (!socket.user) return;

        const { conversationId, message } = data;

        if (!conversationId || !message) {
          return console.log("❌ missing fields");
        }

        const isMember = await isUserInConversation(
          conversationId,
          socket.user.Id
        );

        if (!isMember) {
          return socket.emit("error", {
            message: "Unauthorized conversation access",
          });
        }

        const payload = {
          message,
          sender:
            socket.user.Nom ||
            socket.user.Prenom ||
            `user_${socket.user.Id}`,
          senderId: socket.user.Id,
          conversationId,
          timestamp: new Date().toISOString(),
        };

        console.log("📤 EMIT:", payload);

        io.to(`conv_${conversationId}`).emit("new_message", payload);

      } catch (err) {
        console.error("send_message error:", err);
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

export const getIO = () => io;