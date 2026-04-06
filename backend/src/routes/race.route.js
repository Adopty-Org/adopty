import { Router } from "express";
import * as race from "../controlleurs/race.controlleur.js"

const router = Router()

router.post("/", race.createRaceControlleur);
router.get("/:id", race.getRaceControlleur);
router.get("/", race.getAllRacesControlleur);
router.put("/:id", race.updateRaceControlleur);
router.delete("/:id", race.deleteRaceControlleur);

export default router;