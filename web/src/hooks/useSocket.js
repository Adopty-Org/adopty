// frontend/src/hooks/useSocket.js

/*import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const socketRef = useRef(null);
    const { getToken } = useAuth();

    // Fonction pour fermer la connexion (utile au cleanup)
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    // Fonction pour (re)connecter
    const connect = useCallback(async () => {
        try {
            // Fermer l'ancienne connexion si elle existe
            disconnect();

            const token = await getToken();
            if (!token) {
                throw new Error("No authentication token");
            }

            const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
                auth: { token },
                transports: ["websocket"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current = socket;

            // Événements de base
            socket.on("connect", () => {
                console.log("🔌 Socket connected");
                setIsConnected(true);
                setConnectionError(null);
            });

            socket.on("disconnect", (reason) => {
                console.log("🔌 Socket disconnected:", reason);
                setIsConnected(false);
                
                // Si le serveur a déconnecté le client, on tente une reconnexion manuelle
                if (reason === "io server disconnect") {
                    socket.connect();
                }
            });

            socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err);
                setIsConnected(false);
                setConnectionError(err.message);
            });

        } catch (err) {
            console.error("Failed to initialize socket:", err);
            setConnectionError(err.message);
            setIsConnected(false);
        }
    }, [getToken, disconnect]);

    // Se connecter automatiquement au montage
    useEffect(() => {
        connect();

        // Nettoyage au démontage
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        socket: socketRef.current,
        isConnected,
        connectionError,
        connect,
        disconnect,
    };
};*/

// frontend/src/hooks/useSocket.js

import { useSocketContext } from "../context/SocketContext.jsx";

export const useSocket = () => {
    return useSocketContext();
};


{/*// Exemple d'utilisation
import { useSocket } from "../hooks/useSocket";

function MonComposant() {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Écouter un événement
        socket.on("new_message", (data) => {
            console.log("Nouveau message:", data);
        });

        // Nettoyer le listener
        return () => {
            socket.off("new_message");
        };
    }, [socket, isConnected]);

    const sendMessage = () => {
        if (socket && isConnected) {
            socket.emit("send_message", { conversationId: 1, content: "Hello" }, (response) => {
                if (response.success) {
                    console.log("Message envoyé");
                }
            });
        }
    };

    return (
        <div>
            Status: {isConnected ? "🟢" : "🔴"}
            <button onClick={sendMessage}>Envoyer</button>
        </div>
    );
} */}