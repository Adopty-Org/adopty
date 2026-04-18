import { db } from "../config/db.js";
import { Race } from "../modeles/race.model.js";

export const createRace = async (race) => {
    const [result] = await db.query(
        `INSERT INTO race (Nom, Description, Origine, EsperanceVie, Maintenance, TailleMoyenne, PoidsMoyen, Couleurs, Classification, Pelage, TaillePelageMoyen, Habitat, Inteligence, Imunite, Alergies, Espece)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            race.Nom,
            race.Description,
            race.Origine,
            race.EsperanceVie,
            race.Maintenance,
            race.TailleMoyenne,
            race.PoidsMoyen,
            race.Couleurs,
            race.Classification,
            race.Pelage,
            race.TaillePelageMoyen,
            race.Habitat,
            race.Inteligence,
            race.Imunite,
            race.Alergies,
            race.Espece
        ]
    );

    return result.insertId;
}

export const getAllRaces = async () => {
  const [rows] = await db.query("SELECT * FROM race");
  return rows.map(row => new Race(row));
};

export const getRaceById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM race WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Race(rows[0]);
};

export const updateRace = async (id, race) => {
  const [result] = await db.query(
    `UPDATE race SET 
      Nom = ?, 
      Description = ?,
      Origine = ?,
      EsperanceVie = ?,
      Maintenance = ?,
      TailleMoyenne = ?,
      PoidsMoyen = ?,
      Couleurs = ?,
      Classification = ?,
      Pelage = ?,
      TaillePelageMoyen = ?,
      Habitat = ?,
      Inteligence = ?,
      Imunite = ?,
      Alergies = ?,
      Espece = ?
     WHERE Id = ?`,
    [
      race.Nom,
      race.Description,
      race.Origine,
      race.EsperanceVie,
      race.Maintenance,
      race.TailleMoyenne,
      race.PoidsMoyen,
      race.Couleurs,
      race.Classification,
      race.Pelage,
      race.TaillePelageMoyen,
      race.Habitat,
      race.Inteligence,
      race.Imunite,
      race.Alergies,
      race.Espece,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteRace = async (id) => {
  const [result] = await db.query(
    "DELETE FROM race WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

