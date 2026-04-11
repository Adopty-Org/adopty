import { db } from "../config/db.js";
import { Produit } from "../modeles/produit.model.js";

export const createProduit = async (produit) => {
    const [result] = await db.query(
        `INSERT INTO produit (IdRefuge, Nom, Prix, Stock, Disponibilite) 
        VALUES (?, ?, ?, ?, ?)`,
        [
            produit.IdRefuge,
            produit.Nom,
            produit.Prix,
            produit.Stock,
            produit.Disponibilite
        ]
    );

    return result.insertId;
}

export const getAllProduits = async () => {
  const [rows] = await db.query("SELECT * FROM produit");
  return rows.map(row => new Produit(row));
};

export const getProduitById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM produit WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Produit(rows[0]);
};

export const updateProduit = async (id, produit) => {
  const [result] = await db.query(
    `UPDATE produit SET 
      IdRefuge = ?, 
      Nom = ?,
      Prix = ?,
      Stock =?,
      Disponibilite = ?
     WHERE Id = ?`,
    [
      produit.IdRefuge,
      produit.Nom,
      produit.Prix,
      produit.Stock,
      produit.Disponibilite,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteProduit = async (id) => {
  const [result] = await db.query(
    "DELETE FROM produit WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

