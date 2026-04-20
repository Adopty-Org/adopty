// backend/dto/message.dto.js

/**
 * Transforme un Message (modèle) en MessageDTO (frontend)
 * @param {Object} message - Instance de la classe Message ou objet brut
 * @param {Object} options - Options optionnelles (ex: inclure le nom de l'expéditeur)
 * @returns {Object} MessageDTO
 */
export const toMessageDTO = (message, options = {}) => {
  return {
    id: message.Id,                         // PascalCase → camelCase
    conversationId: message.IdConversation || message.conversationId,  // selon la source
    senderId: message.SenderId || message.senderId,
    content: message.Contenu || message.content || message.message,
    createdAt: message.CreatedAt || message.createdAt || message.timestamp,
    
    // Champs optionnels (enrichis par jointure SQL)
    senderName: options.senderName || null,
    senderAvatar: options.senderAvatar || null,
    readBy: options.readBy || [],           // IDs des utilisateurs qui ont lu
    readCount: options.readBy?.length || 0
  };
};

/**
 * Transforme un tableau de Messages
 */
export const toMessageDTOArray = (messages, options = {}) => {
  return messages.map(msg => toMessageDTO(msg, options));
};

export const toMessageDTOPmo = (message) => {
  console.log("Transforming message to DTO:", message);
  return {
    id: message.Id,
    conversationId: message.IdConversation || message.conversationId,
    senderId: message.SenderId || message.senderId,
    content: message.Contenu || message.content || message.message,
    createdAt: message.CreatedAt || message.createdAt || message.timestamp,
    
    // Champs enrichis (déjà dans l'objet message)
    senderName: message.senderName || message.SenderName || null,
    //senderAvatar: message.senderAvatar || null,
    readBy: message.readBy || [],
    readCount: (message.readBy || []).length
  };
};

export const toMessageDTOArrayPmo = (messages) => {
  if (!Array.isArray(messages)) return [];  // ← PROTECTION
    return messages.map(msg => toMessageDTOPmo(msg));
}