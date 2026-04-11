import { Router } from "express";
import * as animal from "../controlleurs/animal.controlleur.js"

const router = Router()

router.post("/", animal.createAnimalControlleur);
router.get("/:id", animal.getAnimalControlleur);
router.get("/", animal.getAllAnimalsControlleur);
router.put("/:id", animal.updateAnimalControlleur);
router.delete("/:id", animal.deleteAnimalControlleur);

// fonctions speciales
router.get("/statut/:Statut", animal.getStatutOfAnimalControlleur);
router.get("/race/:Race", animal.getRaceOfAnimalControlleur);

export default router;