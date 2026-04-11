import { Router } from "express";
import * as profil_prestataire from "../controlleurs/profil_prestataire.controlleur.js"

const router = Router()

router.post("/", profil_prestataire.createProfilPrestataireControlleur);
router.get("/:id", profil_prestataire.getProfilPrestataireControlleur);
router.get("/", profil_prestataire.getAllProfilPrestatairesControlleur);
router.put("/:id", profil_prestataire.updateProfilPrestataireControlleur);
router.delete("/:id", profil_prestataire.deleteProfilPrestataireControlleur);

// routes speciales

router.get("/statut/:Statut", profil_prestataire.getStatutOfProfilPrestataireControlleur);
router.get("/type_service/:TypeService", profil_prestataire.getTypeServiceOfProfilPrestataireControlleur);
router.get("/utilisateur/:Utilisateur", profil_prestataire.getUtilisateurOfProfilPrestataireControlleur);

export default router;