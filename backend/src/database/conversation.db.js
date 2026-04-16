import { db } from "../config/db.js";
import { Conservation } from "../modeles/conversation.model.js";

export const createConservation = async (conversation) => {
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

export const getAllConservations = async () => {
  const [rows] = await db.query("SELECT * FROM conversation");
  return rows.map(row => new Conservation(row));
};

export const getConservationById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM conversation WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Conservation(rows[0]);
};

export const updateConservation = async (id, conversation) => {
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

export const deleteConservation = async (id) => {
  const [result] = await db.query(
    "DELETE FROM conversation WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

