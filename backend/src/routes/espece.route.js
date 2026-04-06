import { Router } from "express";
import * as espece from "../controlleurs/espece.controlleur.js"

const router = Router()

router.post("/", espece.createEspeceControlleur);
router.get("/:id", espece.getEspeceControlleur);
router.get("/", espece.getAllEspecesControlleur);
router.put("/:id", espece.updateEspeceControlleur);
router.delete("/:id", espece.deleteEspeceControlleur);

export default router;