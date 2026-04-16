import { db } from "../config/db.js";
import { Conversation } from "../modeles/conversation.model.js";

export const createConversation = async (conversation) => {
    const [result] = await db.query(
        `INSERT INTO conversation (Type, CreatedAt, CreatedBy) 
        VALUES (?, NOW(), ?)`,
        [
            conversation.Type,
            
            conversation.CreatedBy
        ]
    );

    return result.insertId;
}

export const getAllConversations = async () => {
  const [rows] = await db.query("SELECT * FROM conversation");
  return rows.map(row => new Conversation(row));
};

export const getConversationById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM conversation WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Conversation(rows[0]);
};

export const updateConversation = async (id, conversation) => {
  const [result] = await db.query(
    `UPDATE conversation SET 
      Type = ?, 
      CreatedAt = ?,
      CreatedBy = ?
     WHERE Id = ?`,
    [
      conversation.Type,
      conversation.CreatedAt,
      conversation.CreatedBy,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteConversation = async (id) => {
  const [result] = await db.query(
    "DELETE FROM conversation WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

