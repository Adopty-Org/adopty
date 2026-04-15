import { Router } from "express";
import * as race from "../controlleurs/race.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression de races
router.post("/", protectRoute, adminOnly, race.createRaceControlleur);
router.put("/:id", protectRoute, adminOnly, race.updateRaceControlleur);
router.delete("/:id", protectRoute, adminOnly, race.deleteRaceControlleur);

// Routes spéciales publiques
router.get("/espece/:Espece", race.getEspeceOfRaceControlleur);

// Routes publiques - lecture des races
router.get("/:id", race.getRaceControlleur);
router.get("/", race.getAllRacesControlleur);

export default router;