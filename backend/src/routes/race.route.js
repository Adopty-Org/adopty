import { Router } from "express";
import * as race from "../controlleurs/race.controlleur.js"

const router = Router()

router.post("/races", race.createRaceControlleur);
router.get("/races/:id", race.getRaceControlleur);
router.get("/races", race.getAllRacesControlleur);
router.put("/races/:id", race.updateRaceControlleur);
router.delete("/races/:id", race.deleteRaceControlleur);

export default router;