import { Router } from "express";
import * as vaccin from "../controlleurs/vaccin.controlleur.js"

const router = Router()

router.post("/", vaccin.createVaccinControlleur);
router.get("/:id", vaccin.getVaccinControlleur);
router.get("/", vaccin.getAllVaccinsControlleur);
router.put("/:id", vaccin.updateVaccinControlleur);
router.delete("/:id", vaccin.deleteVaccinControlleur);

export default router;