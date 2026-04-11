import { Router } from "express";
import * as statut from "../controlleurs/statut.contolleur.js"

const router = Router()

router.post("/", statut.createStatutControlleur);
router.get("/:id", statut.getStatutControlleur);
router.get("/", statut.getAllStatutsControlleur);
router.put("/:id", statut.updateStatutControlleur);
router.delete("/:id", statut.deleteStatutControlleur);

export default router;