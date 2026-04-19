import { db } from "../config/db.js";
import { MessageRead } from "../modeles/message_read.model.js";

export const createMessageRead = async (message_read) => {
    const [result] = await db.query(
        `INSERT INTO message_read (IdMessage, IdUtilisateur, ReadAt) 
        VALUES (?, ?, NOW())`,
        [
            message_read.IdMessage,
            message_read.IdUtilisateur
        ]
    );

    return result.insertId;
}

export const getAllMessageReads = async () => {
  const [rows] = await db.query("SELECT * FROM message_read");
  return rows.map(row => new MessageRead(row));
};

export const getMessageReadById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM message_read WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new MessageRead(rows[0]);
};

export const updateMessageRead = async (id, message_read) => {
  const [result] = await db.query(
    `UPDATE message_read SET 
      IdMessage = ?, 
      IdUtilisateur = ?
     WHERE Id = ?`,
    [
      message_read.IdMessage,
      message_read.IdUtilisateur,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteMessageRead = async (id) => {
  const [result] = await db.query(
    "DELETE FROM message_read WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

export const getMessageReadsByMessageId = async (messageId) => {
    const [rows] = await db.query(
        "SELECT * FROM message_read WHERE IdMessage = ?",
        [messageId]
    );
    return rows;
};


// 🆕 Nouvelle fonction pour sauvegarder un message avec l'ID auto-incrémenté
export const saveMessageFromSocket = async (messageData) => {
    try {
        const { IdConversation, SenderId, Contenu } = messageData;
        
        const [result] = await db.query(
            `INSERT INTO message (IdConversation, SenderId, Contenu, CreatedAt) 
             VALUES (?, ?, ?, NOW())`,
            [IdConversation, SenderId, Contenu]
        );
        
        const messageId = result.insertId;
        
        // Récupérer le message complet avec le nom de l'utilisateur
        const [rows] = await db.query(
            `SELECT m.*, u.Prenom, u.Nom 
             FROM message m
             JOIN utilisateur u ON m.SenderId = u.Id
             WHERE m.Id = ?`,
            [messageId]
        );
        
        console.log(`💾 Message sauvegardé en DB avec ID: ${messageId}`);
        return rows[0];
        
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
};

// 🆕 Récupérer l'historique des messages d'une conversation
export const getMessagesByConversation = async (conversationId, limit = 50, offset = 0) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                m.Id,
                m.IdConversation as conversationId,
                m.SenderId as senderId,
                m.Contenu as message,
                m.CreatedAt as timestamp,
                mr.ReadAt as readAt,
                u.clerkId as senderClerkId,
                CONCAT(COALESCE(u.Prenom, ''), ' ', COALESCE(u.Nom, '')) as sender,
                u.Prenom as senderFirstName,
                u.Nom as senderLastName
            FROM message m
            JOIN utilisateur u ON m.SenderId = u.Id
            LEFT JOIN message_read mr ON m.Id = mr.IdMessage AND mr.IdUtilisateur = u.Id
            WHERE m.IdConversation = ?
            ORDER BY m.CreatedAt DESC
            LIMIT ? OFFSET ?`,
            [conversationId, limit, offset]
        );
        
        // Retourner dans l'ordre chronologique
        return rows.reverse();
        
    } catch (error) {
        console.error("Error getting messages:", error);
        throw error;
    }
};

// 🆕 Marquer un message comme lu
export const markMessageAsRead = async (messageId, userId, senderId = null) => {
    try {
        // 🚨 protection critique
        if (senderId && userId === senderId) {
            return { success: true, skipped: true };
        }
        // Vérifier si l'entrée existe déjà
        const [existing] = await db.query(
            "SELECT Id FROM message_read WHERE IdMessage = ? AND IdUtilisateur = ?",
            [messageId, userId]
        );
        
        if (existing.length === 0) {
            await db.query(
                `INSERT INTO message_read (IdMessage, IdUtilisateur, ReadAt) 
                 VALUES (?, ?, NOW())`,
                [messageId, userId]
            );
        }
        
        return { success: true };
        
    } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
    }
};

// 🆕 Marquer tous les messages d'une conversation comme lus
export const markConversationMessagesAsRead = async (conversationId, userId) => {
    try {
        // Récupérer tous les messages non lus de la conversation
        const [messages] = await db.query(
            `SELECT Id FROM message 
             WHERE IdConversation = ? AND SenderId != ?`,
            [conversationId, userId]
        );
        
        // Marquer chaque message comme lu
        for (const message of messages) {
            await markMessageAsRead(message.Id, userId, message.SenderId);
        }
        
        console.log(`✅ ${messages.length} messages marqués comme lus dans conv ${conversationId}`);
        return { success: true, count: messages.length };
        
    } catch (error) {
        console.error("Error marking conversation messages as read:", error);
        throw error;
    }
};

// 🆕 Compter les messages non lus par conversation
export const getUnreadCount = async (userId, conversationId = null) => {
    try {
        let query = `
            SELECT COUNT(*) as count 
            FROM message m
            LEFT JOIN message_read mr ON m.Id = mr.IdMessage AND mr.IdUtilisateur = ?
            WHERE m.SenderId != ? AND mr.Id IS NULL
        `;
        let params = [userId, userId];
        
        if (conversationId) {
            query += ` AND m.IdConversation = ?`;
            params.push(conversationId);
        }
        
        const [rows] = await db.query(query, params);
        return rows[0].count;
        
    } catch (error) {
        console.error("Error getting unread count:", error);
        throw error;
    }
};