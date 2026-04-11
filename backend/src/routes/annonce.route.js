import { Router } from "express";
import * as annonce from "../controlleurs/annonce.controlleur.js"

const router = Router()

router.post("/", annonce.createAnnonceControlleur);
router.get("/:id", annonce.getAnnonceControlleur);
router.get("/", annonce.getAllAnnoncesControlleur);
router.put("/:id", annonce.updateAnnonceControlleur);
router.delete("/:id", annonce.deleteAnnonceControlleur);

// requetes speciales
router.get("/type_service/:TypeService", annonce.getTypeServiceOfAnnonceControlleur);
router.get("/animal/:Animal", annonce.getAnimalOfAnnonceControlleur);
router.get("/utilisateur/:Utilisateur", annonce.getUtilisateurOfAnnonceControlleur);
router.get("/statut/:Statut", annonce.getStatutOfAnnonceControlleur);

export default router;