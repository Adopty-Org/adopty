import { Router } from "express";
import * as reservation from "../controlleurs/reservation.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, reservation.createReservationControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, reservation.updateReservationControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, reservation.deleteReservationControlleur);

// Routes de lecture (protégées pour certaines)
router.get("/:id", protectRoute, reservation.getReservationControlleur);
router.get("/", protectRoute, reservation.getAllReservationsControlleur);

// Routes spéciales de lecture (protégées)
router.get("/utilisateur/:Utilisateur", protectRoute, reservation.getUtilisateurOfReservationControlleur);
router.get("/type_service/:TypeService", reservation.getTypeServiceOfReservationControlleur);
router.get("/statut/:Statut", reservation.getStatutOfReservationControlleur);
router.get("/profil_prestataire/:ProfilPrestataire", reservation.getProfilPrestataireOfReservationControlleur);
router.get("/annonce/:Annonce", reservation.getAnnonceOfReservationControlleur);
router.get("/animal/:Animal", reservation.getAnimalOfReservationControlleur);

export default router;

