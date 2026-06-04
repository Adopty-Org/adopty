import { db } from "../config/db.js";
import { Reservation } from "../modeles/reservation.model.js";

export const createReservation = async (reservation) => {
    const [result] = await db.query(
        `INSERT INTO reservation (IdUtilisateur, IdProfil, IdAnimal, IdAnnonce, TypeService, DateDebut, DateFin, Statut, PrixFinal, Notes, TypeReservation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            reservation.IdUtilisateur,
            reservation.IdProfil,
            reservation.IdAnimal,
            reservation.IdAnnonce,
            reservation.TypeService,
            reservation.DateDebut,
            reservation.DateFin,
            reservation.Statut,
            reservation.PrixFinal,
            reservation.Notes,
            reservation.TypeReservation

        ]
    );

    return result.insertId;
}

export const getAllReservations = async () => {
  const [rows] = await db.query("SELECT * FROM reservation");
  return rows.map(row => new Reservation(row));
};

export const getReservationById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM reservation WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Reservation(rows[0]);
};

export const updateReservation = async (id, reservation) => {
  const [result] = await db.query(
    `UPDATE reservation SET 
      IdUtilisateur = ?, 
      IdProfil = ?,
      IdAnimal = ?,
      IdAnnonce = ?,
      TypeService = ?,
      DateDebut = ?,
      DateFin = ?,
      Statut = ?,
      PrixFinal = ?,
      Notes = ?
     WHERE Id = ?`,
    [
      reservation.IdUtilisateur,
      reservation.IdProfil,
      reservation.IdAnimal,
      reservation.IdAnnonce,
      reservation.TypeService,
      reservation.DateDebut,
      reservation.DateFin,
      reservation.Statut,
      reservation.PrixFinal,
      reservation.Notes,
      id
    ]
  );

  return result.affectedRows;
};

export const updateReservationStatut = async (id, reservation) => {
  const [result] = await db.query(
    `UPDATE reservation SET 
      Statut = ?
     WHERE Id = ?`,
    [
      reservation.Statut,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteReservation = async (id) => {
  const [result] = await db.query(
    "DELETE FROM reservation WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

export const getAllReservationsByPrestataire = async (PrestataireId) => {
  const [rows] = await db.query("SELECT * FROM reservation WHERE IdProfil = ?",[
    PrestataireId
  ]);
  return rows.map(row => new Reservation(row));
};

export const getAllReservationsByUtilisateur = async (UtilisateurId) => {
  const [rows] = await db.query("SELECT * FROM reservation WHERE IdUtilisateur = ?",[
    UtilisateurId
  ]);
  return rows.map(row => new Reservation(row));
};