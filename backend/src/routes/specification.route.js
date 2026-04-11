import { Router } from "express";
import * as specification from "../controlleurs/specification.controlleur.js"

const router = Router()

router.post("/", specification.createSpecificationControlleur);
router.get("/:id", specification.getSpecificationControlleur);
router.get("/", specification.getAllSpecificationsControlleur);
router.put("/:id", specification.updateSpecificationControlleur);
router.delete("/:id", specification.deleteSpecificationControlleur);

// routes speciales

router.get("/profil_prestataire/:ProfilPrestataire", specification.getProfilPrestataireOfSpecificationControlleur);
router.get("/espece/:Espece", specification.getEspeceOfSpecificationControlleur);

export default router;