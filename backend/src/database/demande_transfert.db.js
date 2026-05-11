import { db } from "../config/db.js";
import { DemandeTransfert } from "../modeles/demande_transfert.model.js";

export const createDemandeTransfert = async (demande_transfert) => {
    const [result] = await db.query(
        `INSERT INTO demande_transfert (IdRefugeDepart, IdAnimal, IdRefugeCible, CommantaireDepart, CommentaireRetour, DateDepart, Statut, DateRetours) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            demande_transfert.IdRefugeDepart,
            demande_transfert.IdAnimal,
            demande_transfert.IdRefugeCible,
            demande_transfert.CommantaireDepart,
            demande_transfert.CommentaireRetour,
            demande_transfert.DateDepart,
            demande_transfert.Statut,
            demande_transfert.DateRetours
        ]
    );

    return result.insertId;
}

export const getAllDemandeTransferts = async () => {
  const [rows] = await db.query("SELECT * FROM demande_transfert");
  return rows.map(row => new DemandeTransfert(row));
};

export const getDemandeTransfertById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM demande_transfert WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new DemandeTransfert(rows[0]);
};

export const updateDemandeTransfert = async (id, demande_transfert) => {
  const [result] = await db.query(
    `UPDATE demande_transfert SET 
      IdRefugeDepart = ?, 
      IdAnimal = ?,
      IdRefugeCible = ?,
      CommantaireDepart = ?,
      CommentaireRetour = ?,
      DateDepart = ?,
      Statut = ?,
      DateRetours = ?
     WHERE Id = ?`,
    [
      demande_transfert.IdRefugeDepart,
      demande_transfert.IdAnimal,
      demande_transfert.IdRefugeCible,
      demande_transfert.CommantaireDepart,
      demande_transfert.CommentaireRetour,
      demande_transfert.DateDepart,
      demande_transfert.Statut,
      demande_transfert.DateRetours,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteDemandeTransfert = async (id) => {
  const [result] = await db.query(
    "DELETE FROM demande_transfert WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};


export const getDemandeTransfertByRefugeDepartId = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM demande_transfert WHERE IdRefugeDepart = ?",
    [
      id
    ]
  )
  return rows.map(row => new DemandeTransfert(row));
}

export const getDemandeTransfertByRefugeCibleId = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM demande_transfert WHERE IdRefugeCible = ?",
    [
      id
    ]
  )
  return rows.map(row => new DemandeTransfert(row));
}