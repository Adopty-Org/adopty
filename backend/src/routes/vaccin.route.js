import { Router } from "express";
import * as vaccin from "../controlleurs/vaccin.controlleur.js"

const router = Router()

router.post("/vaccins", vaccin.createVaccinControlleur);
router.get("/vaccins/:id", vaccin.getVaccinControlleur);
router.get("/vaccins", vaccin.getAllVaccinsControlleur);
router.put("/vaccins/:id", vaccin.updateVaccinControlleur);
router.delete("/vaccins/:id", vaccin.deleteVaccinControlleur);

export default router;