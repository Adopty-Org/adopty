import { db } from "../config/db.js";
import { DemandeAdoption } from "../modeles/demande_adoption.model.js";

export const createDemandeAdoption = async (demande_adoption) => {
    const [result] = await db.query(
        `INSERT INTO demande_adoption (IdAnimal, IdUtilisateur, IdRefuge, Statut, TypeLogement, Jardin, Animaux, Enfants, CommentaireDepart, Disponibilite, CommentaireRetour, DateDemande, DateRetours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL)`,
        [
            demande_adoption.IdAnimal,
            demande_adoption.IdUtilisateur,
            demande_adoption.IdRefuge,
            demande_adoption.Statut,
            demande_adoption.TypeLogement,
            demande_adoption.Jardin,
            demande_adoption.Animaux,
            demande_adoption.Enfants,
            demande_adoption.CommentaireDepart,
            demande_adoption.Disponibilite,
            demande_adoption.CommentaireRetour
        ]
    );

    return result.insertId;
}

export const getAllDemandeAdoptions = async () => {
  const [rows] = await db.query("SELECT * FROM demande_adoption");
  return rows.map(row => new DemandeAdoption(row));
};

export const getDemandeAdoptionById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM demande_adoption WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new DemandeAdoption(rows[0]);
};

export const updateDemandeAdoption = async (id, demande_adoption) => {
  const [result] = await db.query(
    `UPDATE demande_adoption SET 
      IdAnimal = ?, 
      IdUtilisateur = ?,
      IdRefuge = ?,
      Statut = ?,
      TypeLogement = ?,
      Jardin = ?,
      Animaux = ?,
      Enfants = ?,
      CommentaireDepart = ?,
      Disponibilite = ?,
      CommentaireRetour = ?,
      DateDemande = ?,
      DateRetours = ?
     WHERE Id = ?`,
    [
      demande_adoption.IdAnimal,
      demande_adoption.IdUtilisateur,
      demande_adoption.IdRefuge,
      demande_adoption.Statut,
      demande_adoption.TypeLogement,
      demande_adoption.Jardin,
      demande_adoption.Animaux,
      demande_adoption.Enfants,
      demande_adoption.CommentaireDepart,
      demande_adoption.Disponibilite,
      demande_adoption.CommentaireRetour,
      demande_adoption.DateDemande,
      demande_adoption.DateRetours,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteDemandeAdoption = async (id) => {
  const [result] = await db.query(
    "DELETE FROM demande_adoption WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

