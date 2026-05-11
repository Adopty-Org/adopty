import { Router } from "express";
import * as demande_transfert from "../controlleurs/demande_transfert.controlleur.js"
import { protectRoute, isOwnerOrAdmin, refugeOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture (publiques)
router.get("/animal/:Animal", refugeOnly, demande_transfert.getAnimalOfDemandeTransfertControlleur);
router.get("/refuge/:Refuge", refugeOnly, demande_transfert.getRefugeOfDemandeTransfertControlleur);
router.get("/statut/:Statut", refugeOnly, demande_transfert.getStatutOfDemandeTransfertControlleur);
router.get("/demandes_refuge_depart/:Refuge", protectRoute, refugeOnly, demande_transfert.getDemandeTransfertByRefugeDepartIdControlleur);
router.get("/demandes_refuge_cible/:Refuge", protectRoute, refugeOnly, demande_transfert.getDemandeTransfertByRefugeCibleIdControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, refugeOnly, demande_transfert.createDemandeTransfertControlleur);
router.put("/:id", protectRoute, refugeOnly, demande_transfert.updateDemandeTransfertControlleur);
router.delete("/:id", protectRoute, refugeOnly, demande_transfert.deleteDemandeTransfertControlleur);

// Routes de lecture (publiques pour demande_transferts)
router.get("/:id", demande_transfert.getDemandeTransfertControlleur);
router.get("/", demande_transfert.getAllDemandeTransfertsControlleur);



export default router;