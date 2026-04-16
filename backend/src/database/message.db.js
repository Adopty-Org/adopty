import { db } from "../config/db.js";
import { Message } from "../modeles/message.model.js";

export const createMessage = async (message) => {
    const [result] = await db.query(
        `INSERT INTO message (IdConversation, SenderId, Contenu, CreatedAt) 
        VALUES (?, ?, ?, NOW())`,
        [
            message.IdConversation,
            message.SenderId,
            message.Contenu
        ]
    );

    return result.insertId;
}

export const getAllMessages = async () => {
  const [rows] = await db.query("SELECT * FROM message");
  return rows.map(row => new Message(row));
};

export const getMessageById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM message WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Message(rows[0]);
};

export const updateMessage = async (id, message) => {
  const [result] = await db.query(
    `UPDATE message SET 
      IdConversation = ?, 
      SenderId = ?,
      Contenu = ?
     WHERE Id = ?`,
    [
      message.IdConversation,
      message.SenderId,
      message.Contenu,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteMessage = async (id) => {
  const [result] = await db.query(
    "DELETE FROM message WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

