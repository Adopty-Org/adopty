import { Router } from "express";
import * as disponibilite from "../controlleurs/disponibilite.controlleur.js"

const router = Router()

router.post("/", disponibilite.createDisponibiliteControlleur);
router.get("/:id", disponibilite.getDisponibiliteControlleur);
router.get("/", disponibilite.getAllDisponibilitesControlleur);
router.put("/:id", disponibilite.updateDisponibiliteControlleur);
router.delete("/:id", disponibilite.deleteDisponibiliteControlleur);

// routes speciales

router.get("/profil_prestataire/:Profil", disponibilite.getProfilOfDisponibiliteControlleur);

export default router;