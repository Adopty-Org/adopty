import { Router } from "express";
import * as paiement_service from "../controlleurs/paiement_service.controlleur.js"

const router = Router()

router.post("/", paiement_service.createPaiementServiceControlleur);
router.get("/:id", paiement_service.getPaiementServiceControlleur);
router.get("/", paiement_service.getAllPaiementServicesControlleur);
router.put("/:id", paiement_service.updatePaiementServiceControlleur);
router.delete("/:id", paiement_service.deletePaiementServiceControlleur);

// routes speciales

router.get("/reservation/:Reservation", paiement_service.getReservationOfPaiementServiceControlleur);
router.get("/statut/:Statut", paiement_service.getStatutOfPaiementServiceControlleur);

export default router;