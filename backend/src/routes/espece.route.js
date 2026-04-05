import { Router } from "express";
import * as espece from "../controlleurs/espece.controlleur.js"

const router = Router()

router.post("/especes", espece.createEspeceControlleur);
router.get("/especes/:id", espece.getEspeceControlleur);
router.get("/especes", espece.getAllEspecesControlleur);
router.put("/especes/:id", espece.updateEspeceControlleur);
router.delete("/especes/:id", espece.deleteEspeceControlleur);

export default router;