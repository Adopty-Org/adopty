// backend/sockets/typing.socket.js

import { isUserInConversation } from "../database/conversation_participant.db.js";

// Map pour stocker les timeouts
// Clé: `${userId}_${conversationId}` → Timeout
const typingTimeouts = new Map();

/**
 * Nettoie le timeout pour un utilisateur dans une conversation
 */
const clearTypingTimeout = (userId, conversationId) => {
    const key = `${userId}_${conversationId}`;
    const existingTimeout = typingTimeouts.get(key);
    if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeouts.delete(key);
    }
};

/**
 * Configure un timeout pour arrêter automatiquement le typing après 3 secondes
 */
const setTypingTimeout = (socket, userId, conversationId, userName) => {
    const key = `${userId}_${conversationId}`;
    
    const timeout = setTimeout(() => {
        socket.to(`conv_${conversationId}`).emit("user_typing", {
            userId,
            userName,
            isTyping: false,
            conversationId
        });
        typingTimeouts.delete(key);
    }, 13000);
    
    /*console.log(" les infos du user_typing:  ", {
        userId,
        userName,
        isTyping: true,
        conversationId
    });*/
    typingTimeouts.set(key, timeout);
};

/**
 * Nettoie tous les timeouts d'un utilisateur (à la déconnexion)
 */
export const clearAllUserTypingTimeouts = (userId) => {
    for (const [key, timeout] of typingTimeouts.entries()) {
        if (key.startsWith(`${userId}_`)) {
            clearTimeout(timeout);
            typingTimeouts.delete(key);
        }
    }
};

/**
 * Enregistre les événements de typing pour une socket
 */
export const setupTypingEvents = (socket) => {
    
    socket.on("typing", async (data) => {
        const { conversationId, isTyping } = data;
        
        // Validation
        if (!conversationId || typeof isTyping !== "boolean") {
            return;
        }
        
        try {
            // Vérifier que l'utilisateur est membre de la conversation
            const isMember = await isUserInConversation(conversationId, socket.user.Id);
            if (!isMember) {
                return;
            }
            
            const userId = socket.user.Id;
            const userName = `${socket.user.Prenom} ${socket.user.Nom}`.trim();
            const key = `${userId}_${conversationId}`;
            
            if (isTyping) {
                // Supprimer l'ancien timeout s'il existe
                clearTypingTimeout(userId, conversationId);

                console.log(`User ${userName} is typing in conversation ${conversationId}`);
                
                // Diffuser "en train d'écrire"
                socket.to(`conv_${conversationId}`).emit("user_typing", {
                    userId,
                    userName,
                    isTyping: true,
                    conversationId
                });
                
                // Programmer l'arrêt automatique
                setTypingTimeout(socket, userId, conversationId, userName);
                
            } else {
                // Arrêt immédiat
                clearTypingTimeout(userId, conversationId);
                
                socket.to(`conv_${conversationId}`).emit("user_typing", {
                    userId,
                    userName,
                    isTyping: false,
                    conversationId
                });
            }
            
        } catch (err) {
            console.error("Typing event error:", err);
        }
    });
};