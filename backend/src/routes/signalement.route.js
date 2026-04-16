import { Router } from "express";
import * as signalement from "../controlleurs/signalement.controlleur.js"

const router = Router()

router.post("/", signalement.createSignalementControlleur);
router.get("/:id", signalement.getSignalementControlleur);
router.get("/", signalement.getAllSignalementsControlleur);
router.put("/:id", signalement.updateSignalementControlleur);
router.delete("/:id", signalement.deleteSignalementControlleur);

// routes speciales

router.get("/utilisateur/:Utilisateur", signalement.getUtilisateurOfSignalementControlleur);
router.get("/statut/:Statut", signalement.getStatutOfSignalementControlleur);

export default router;