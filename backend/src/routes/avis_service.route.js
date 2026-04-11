import { Router } from "express";
import * as avis_service from "../controlleurs/avis_service.controlleur.js"

const router = Router()

router.post("/", avis_service.createAvisServiceControlleur);
router.get("/:id", avis_service.getAvisServiceControlleur);
router.get("/", avis_service.getAllAvisServicesControlleur);
router.put("/:id", avis_service.updateAvisServiceControlleur);
router.delete("/:id", avis_service.deleteAvisServiceControlleur);

// routes speciales

router.get("/type_avis/:TypeService", avis_service.getTypeAvisOfAvisServiceControlleur);
router.get("/utilisateur/:Utilisateur", avis_service.getUtilisateurOfAvisServiceControlleur);
router.get("/reservation/:Reservation", avis_service.getReservationOfAvisServiceControlleur);

export default router;