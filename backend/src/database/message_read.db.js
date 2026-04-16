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

