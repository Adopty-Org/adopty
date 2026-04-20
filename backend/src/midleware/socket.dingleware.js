// backend/midleware/socket.midleware.js

import { Server } from "socket.io";
import { setupChatSocket } from "../socket/chat.socket.js";

export const initSocket = (server, { origin }) => {
    const io = new Server(server, {
        cors: {
            origin,
            credentials: true,
        },
    });

    // Initialiser le chat avec toutes ses fonctionnalités
    setupChatSocket(io);

    console.log("✅ Socket.IO initialized");
    return io;
};