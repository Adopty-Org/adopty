import { Router } from "express";
import * as profil_prestataire from "../controlleurs/profil_prestataire.controlleur.js"
import { protectRoute, prestataireOnly, isOwnerOrAdmin, isPrestataireOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/statut/:Statut", profil_prestataire.getStatutOfProfilPrestataireControlleur);
router.get("/type_service/:TypeService", profil_prestataire.getTypeServiceOfProfilPrestataireControlleur);
router.get("/utilisateur/:Utilisateur", profil_prestataire.getUtilisateurOfProfilPrestataireControlleur);

// Routes protégées - réservées aux prestataires (création)
router.post("/", protectRoute, profil_prestataire.createProfilPrestataireControlleur);

// Routes protégées - modification/suppression (propriétaire ou admin)
router.put("/:id/:Prestataire", protectRoute, isPrestataireOwnerOrAdmin, profil_prestataire.updateProfilPrestataireControlleur);
router.delete("/:id/:Prestataire", protectRoute, isPrestataireOwnerOrAdmin, profil_prestataire.deleteProfilPrestataireControlleur);

// Routes de lecture publiques
router.get("/:id", profil_prestataire.getProfilPrestataireControlleur);
router.get("/", profil_prestataire.getAllProfilPrestatairesControlleur);



export default router;