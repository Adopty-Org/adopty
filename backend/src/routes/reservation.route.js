import { Router } from "express";
import * as reservation from "../controlleurs/reservation.controlleur.js"
import { protectRoute, isOwnerOrAdmin, isPrestataireOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture (protégées)
router.get("/utilisateur/:Utilisateur", protectRoute, reservation.getUtilisateurOfReservationControlleur);
router.get("/type_service/:TypeService", reservation.getTypeServiceOfReservationControlleur);
router.get("/statut/:Statut", reservation.getStatutOfReservationControlleur);
router.get("/profil_prestataire/:ProfilPrestataire", reservation.getProfilPrestataireOfReservationControlleur);
router.get("/annonce/:Annonce", reservation.getAnnonceOfReservationControlleur);
router.get("/animal/:Animal", reservation.getAnimalOfReservationControlleur);
router.put("/statut/:id/:Prestataire", protectRoute, isPrestataireOwnerOrAdmin, reservation.updateStatutOfReservationControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, reservation.createReservationControlleur);
router.put("/:id/:Prestataire", protectRoute, isPrestataireOwnerOrAdmin, reservation.updateReservationControlleur);
router.delete("/:id/:Prestataire", protectRoute, isPrestataireOwnerOrAdmin, reservation.deleteReservationControlleur);

// Routes de lecture (protégées pour certaines)
router.get("/:id", protectRoute, reservation.getReservationControlleur);
router.get("/", protectRoute, reservation.getAllReservationsControlleur);



export default router;

