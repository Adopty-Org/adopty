import { db } from "../config/db.js";
import { Signalement } from "../modeles/signalement.model.js";

export const createSignalement = async (signalement) => {
    const [result] = await db.query(
        `INSERT INTO signalement (IdUtilisateur, TypeCible, IdCible, Statut, Raison, DateSignalement) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            signalement.IdUtilisateur,
            signalement.TypeCible,
            signalement.IdCible,
            signalement.Statut,
            signalement.Raison,
            signalement.DateSignalement
        ]
    );

    return result.insertId;
}

export const getAllSignalements = async () => {
  const [rows] = await db.query("SELECT * FROM signalement");
  return rows.map(row => new Signalement(row));
};

export const getSignalementById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM signalement WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Signalement(rows[0]);
};

export const updateSignalement = async (id, signalement) => {
  const [result] = await db.query(
    `UPDATE signalement SET 
      IdUtilisateur = ?, 
      TypeCible = ?,
      IdCible = ?,
      Statut = ?,
      Raison = ?,
      DateSignalement = ?
     WHERE Id = ?`,
    [
      signalement.IdUtilisateur,
      signalement.TypeCible,
      signalement.IdCible,
      signalement.Statut,
      signalement.Raison,
      signalement.DateSignalement,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteSignalement = async (id) => {
  const [result] = await db.query(
    "DELETE FROM signalement WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

