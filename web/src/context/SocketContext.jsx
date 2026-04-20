// frontend/src/contexts/SocketContext.jsx

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

const SocketContext = createContext(null);

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const socketRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const refreshIntervalRef = useRef(null);
    const { getToken } = useAuth();

    // ========================================
    // 1. DÉCONNEXION PROPRE
    // ========================================
    const disconnect = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
        
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    // ========================================
    // 2. RECONNEXION AVEC DÉLAI EXPONENTIEL (SOLUTION 1)
    // ========================================
    const connect = useCallback(async () => {
        try {
            // 🔥 Forcer un token frais à chaque connexion
            const token = await getToken();
            
            if (!token) {
                throw new Error("No authentication token");
            }

            // Éviter les reconnexions trop rapides (délai exponentiel)
            if (reconnectAttemptsRef.current > 0) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                console.log(`⏳ Tentative de reconnexion #${reconnectAttemptsRef.current} dans ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
                auth: { token },
                transports: ["polling", "websocket"],
                reconnection: false, // On gère la reconnexion manuellement
            });

            socketRef.current = socket;

            // Événements de connexion
            socket.on("connect", () => {
                console.log("✅ Socket connected");
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttemptsRef.current = 0; // Réinitialiser les tentatives
                
                // Démarrer le rafraîchissement périodique du token
                startTokenRefresh();
            });

            socket.on("disconnect", (reason) => {
                console.log("❌ Socket disconnected, reason:", reason);
                setIsConnected(false);
                
                // Reconnexion automatique si ce n'est pas volontaire
                if (reason !== "io client disconnect") {
                    reconnectAttemptsRef.current++;
                    connect();
                }
            });

            socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err.message);
                setIsConnected(false);
                setConnectionError(err.message);
                
                // Si erreur d'auth (token expiré), on force un refresh du token
                if (err.message.includes("Auth") || err.message.includes("token") || err.message.includes("expired")) {
                    console.log("🔄 Token expired, refreshing...");
                    // Forcer un rafraîchissement du token Clerk
                    getToken({ template: 'supabase' }).then(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }).catch(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    });
                } else {
                    reconnectAttemptsRef.current++;
                    connect();
                }
            });

        } catch (err) {
            console.error("Failed to initialize socket:", err);
            setConnectionError(err.message);
            setIsConnected(false);
            
            // Réessayer après un délai
            setTimeout(() => {
                reconnectAttemptsRef.current++;
                connect();
            }, 5000);
        }
    }, [getToken]);

    // ========================================
    // 3. RAFRAÎCHISSEMENT PÉRIODIQUE DU TOKEN (SOLUTION 2)
    // ========================================
    const startTokenRefresh = useCallback(() => {
        // Nettoyer l'ancien intervalle s'il existe
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }
        
        // Rafraîchir le token toutes les 4 minutes
        // (les tokens Clerk expirent après 5-10 minutes)
        refreshIntervalRef.current = setInterval(async () => {
            if (socketRef.current && isConnected) {
                try {
                    console.log("🔄 Rafraîchissement périodique du token...");
                    
                    // Rafraîchir le token Clerk
                    const newToken = await getToken({ template: 'supabase' });
                    
                    if (newToken && socketRef.current) {
                        // Mettre à jour le token sur la socket existante
                        socketRef.current.auth = { token: newToken };
                        
                        // Optionnel : envoyer un événement au serveur pour mettre à jour le token
                        socketRef.current.emit("refresh_token", { token: newToken });
                        
                        console.log("✅ Token rafraîchi avec succès");
                    }
                } catch (err) {
                    console.error("❌ Token refresh failed:", err.message);
                    
                    // Si le rafraîchissement échoue, on force une reconnexion
                    if (socketRef.current) {
                        console.log("🔄 Reconnexion forcée après échec de rafraîchissement");
                        reconnectAttemptsRef.current++;
                        disconnect();
                        connect();
                    }
                }
            }
        }, 4 * 60 * 1000); // 4 minutes
    }, [getToken, isConnected, disconnect, connect]);

    // ========================================
    // 4. INITIALISATION AU MONTAGE
    // ========================================
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return (
        <SocketContext.Provider value={{ 
            socket: socketRef.current, 
            isConnected, 
            connectionError,
            reconnect: connect,  // Exposer la fonction de reconnexion manuelle
            disconnect: disconnect  // Exposer la déconnexion manuelle
        }}>
            {children}
        </SocketContext.Provider>
    );
};