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

    // 🔥 AJOUT DEBUG GLOBAL
  socket.onAny((event, ...args) => {
    console.log("📡 EVENT RECU:", event, args);
  });

    // rejoindre une conversation
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conv_${conversationId}`);
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