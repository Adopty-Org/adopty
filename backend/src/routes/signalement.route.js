import { Router } from "express";
import * as signalement from "../controlleurs/signalement.controlleur.js"

const router = Router()

// routes speciales

router.get("/utilisateur/:Utilisateur", signalement.getUtilisateurOfSignalementControlleur);
router.get("/statut/:Statut", signalement.getStatutOfSignalementControlleur);

router.post("/", signalement.createSignalementControlleur);
router.get("/:id", signalement.getSignalementControlleur);
router.get("/", signalement.getAllSignalementsControlleur);
router.put("/:id", signalement.updateSignalementControlleur);
router.delete("/:id", signalement.deleteSignalementControlleur);



export default router;