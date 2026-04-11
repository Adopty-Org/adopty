import { Router } from "express";
import * as reservation from "../controlleurs/reservation.controlleur.js"

const router = Router()

router.post("/", reservation.createReservationControlleur);
router.get("/:id", reservation.getReservationControlleur);
router.get("/", reservation.getAllReservationsControlleur);
router.put("/:id", reservation.updateReservationControlleur);
router.delete("/:id", reservation.deleteReservationControlleur);

// routes speciales

router.get("/utilisateur/:Utilisateur", reservation.getUtilisateurOfReservationControlleur);
router.get("/type_service/:TypeService", reservation.getTypeServiceOfReservationControlleur);
router.get("/statut/:Statut", reservation.getStatutOfReservationControlleur);
router.get("/profil_prestataire/:ProfilPrestataire", reservation.getProfilPrestataireOfReservationControlleur);
router.get("/annonce/:Annonce", reservation.getAnnonceOfReservationControlleur);
router.get("/animal/:Animal", reservation.getAnimalOfReservationControlleur);

export default router;