import { db } from "../backend/src/config/db.js";
import { Utilisateur } from "../backend/src/modeles/utilisateur.model.js";

export const createUtilisateur = async (user) => {
  const [result] = await db.query(
    `INSERT INTO utilisateur 
    (clerkId, stripeCustomerId, Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, CreeLe, CreePar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
      user.clerkId,
      user.stripeCustomerId,
      user.Nom,
      user.Prenom,
      user.Addresse,
      user.AddresseEmail,
      user.Wilaya,
      user.MotDePasse,
      user.Photo,
      user.CreePar
    ]
  );

  return result.insertId;
};

export const getAllUtilisateurs = async () => {
  const [rows] = await db.query("SELECT * FROM utilisateur");
  return rows.map(row => new Utilisateur(row));
};

export const getUtilisateurById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM utilisateur WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Utilisateur(rows[0]);
};

export const updateUtilisateur = async (id, user) => {
  const [result] = await db.query(
    `UPDATE utilisateur SET 
      Nom = ?, 
      Prenom = ?, 
      Addresse = ?, 
      AddresseEmail = ?, 
      Wilaya = ?, 
      Photo = ?, 
      ModifieeLe = NOW(),
      ModifieePar = ?
     WHERE Id = ?`,
    [
      user.Nom,
      user.Prenom,
      user.Addresse,
      user.AddresseEmail,
      user.Wilaya,
      user.Photo,
      user.ModifieePar,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteUtilisateur = async (id) => {
  const [result] = await db.query(
    "DELETE FROM utilisateur WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

export const getUtilisateurByClerkId = async (clerkId) => {
  const [rows] = await db.query(
    "SELECT * FROM utilisateur WHERE clerkId = ?",
    [clerkId]
  );

  if (!rows[0]) return null;

  return new Utilisateur(rows[0]);
};