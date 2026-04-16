import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connecté:", socket.id);

    // 🔥 AJOUT DEBUG GLOBAL (dev only)
    if (process.env.NODE_ENV === "development") {
      socket.onAny((event, ...args) => {
        console.log("📡 EVENT RECU:", event, args);
      });
    }

    // rejoindre une conversation
    socket.on("join_conversation", (conversationId) => {
      if (socket.currentConversationId) {
        socket.leave(`conv_${socket.currentConversationId}`);
      }

      socket.join(`conv_${conversationId}`);
      socket.currentConversationId = conversationId;
    });

    // envoyer message
    socket.on("send_message", (data) => {
      const { conversationId, message } = data;

      // broadcast à tous dans la room
      //io.to(`conv_${conversationId}`).emit("new_message", message);
      io.to(`conv_${conversationId}`).emit("new_message", {
        message,
        sender: data.sender,
        conversationId
        });
    });

    socket.on("disconnect", () => {
      console.log("🔴 User déconnecté");
    });
  });
};

export const getIO = () => io;