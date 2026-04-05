import { db } from "../config/db";
import { Animal } from "../modeles/animal.model.js";
import { Vaccin } from "../modeles/vaccin.model.js";

// pour tout les fichiers requetes
// TODO: add pagination
// TODO: validate input
// TODO: handle transactions

export const createAnimal = async (animal) => {
    const [result] = await db.query(
        `INSERT INTO animal (Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race, Date_ajout) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, Now())`,
        [
            animal.Nom,
            animal.Prenom,
            animal.Age,
            animal.Genre,
            animal.Poids,
            animal.Taille,
            animal.Couleur,
            animal.EtatSantee,
            animal.Sterilise,
            animal.Temperament,
            animal.NiveauEnergetique,
            animal.SociableEnfant,
            animal.SociableAnimaux,
            animal.Statut,    //      <= bizzare
            animal.Race,
            //animal.Date_ajout
        ]
    );

    return result.insertId;
}

export const getAllAnimals = async () => {
  const [rows] = await db.query("SELECT * FROM animal");
  return rows.map(row => new Animal(row));
};

export const getAnimalById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM animal WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Animal(rows[0]);
};

export const updateAnimal = async (id, animal) => {
  const [result] = await db.query(
    `UPDATE animal SET 
      Nom = ?, 
      Prenom = ?, 
      Age = ?, 
      Genre = ?, 
      Poids = ?, 
      Taille = ?, 
      Couleur = ?, 
      EtatSantee = ?, 
      Sterilise = ?, 
      Temperament = ?, 
      NiveauEnergetique = ?, 
      SociableEnfant = ?, 
      SociableAnimaux = ?, 
      Statut = ?, 
      Race = ? 
      
     WHERE Id = ?`,
    [
      animal.Nom,
      animal.Prenom,
      animal.Age,
      animal.Genre,
      animal.Poids,
      animal.Taille,
      animal.Couleur,
      animal.EtatSantee,
      animal.Sterilise,
      animal.Temperament,
      animal.NiveauEnergetique,
      animal.SociableEnfant,
      animal.SociableAnimaux,
      animal.Statut,    //      <= bizzare
      animal.Race,
      //animal.Date_ajout,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteAnimal = async (id) => {
  const [result] = await db.query(
    "DELETE FROM animal WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

//
//  special requests
//

export const getAnimalVaccinsById = async (id) => {
    const [rows] = await db.query(
        `SELECT v.*
         FROM vaccin_animal va
         JOIN vaccins v ON va.IdVaccin = v.Id
         WHERE va.IdAnimal = ?;`,
         [
            id
         ]
    );

    return rows.map(row => new Vaccin(row));
}

export const addVaccinToAnimalByIds = async (vaccinId, animalId) => {
    const [result] = await db.query(
        `INSERT INTO vaccin_animal (IdVaccin,IdAnimal)
        VALUES(?, ?)`,
        [
            vaccinId,
            animalId
        ]
    );

    return result.insertId;
}

export const removeVaccinToAnimalByIds = async (vaccinId, animalId) => {
    const [result] = await db.query(
        `DELETE FROM vaccin_animal 
        WHERE IdVaccin =? AND IdAnimal = ?`,
        [
            vaccinId,
            animalId
        ]
    );

    return result.affectedRows;
}