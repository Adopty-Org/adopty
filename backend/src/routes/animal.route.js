import { Router } from "express";
import * as animal from "../controlleurs/animal.controlleur.js"

const router = Router()

router.post("/animaux", animal.createAnimalControlleur);
router.get("/animaux/:id", animal.getAnimalControlleur);
router.get("/animaux", animal.getAllAnimalsControlleur);
router.put("/animaux/:id", animal.updateAnimalControlleur);
router.delete("/animaux/:id", animal.deleteAnimalControlleur);

export default router;