import { Router } from "express";
import * as demande_transfert from "../controlleurs/demande_transfert.controlleur.js"
import { protectRoute, isOwnerOrAdmin, refugeOnly } from "../midleware/auth.midleware.js";

const router = Router()

router.use((req, res, next) => {
  console.log(`🔵 ${req.method} ${req.originalUrl}`);
  next();
})

router.patch('/demandes/statut/:id/:refugeId', protectRoute, refugeOnly, demande_transfert.updateDemandeTripleTStatutController);

// Routes spéciales de lecture (publiques)
router.get("/animal/:Animal/:refugeId", refugeOnly, demande_transfert.getAnimalOfDemandeTransfertControlleur);
router.get("/refuge/:Refuge/:refugeId", refugeOnly, demande_transfert.getRefugeOfDemandeTransfertControlleur);
router.get("/statut/:Statut/:refugeId", refugeOnly, demande_transfert.getStatutOfDemandeTransfertControlleur);
router.get("/demandes_refuge_depart/:Refuge/:refugeId", protectRoute, refugeOnly, demande_transfert.getDemandeTransfertByRefugeDepartIdControlleur);
router.get("/demandes_refuge_cible/:Refuge/:refugeId", protectRoute, refugeOnly, demande_transfert.getDemandeTransfertByRefugeCibleIdControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, /*refugeOnly,*/ demande_transfert.createDemandeTransfertControlleur);
router.put("/:id/:refugeId", protectRoute, refugeOnly, demande_transfert.updateDemandeTransfertControlleur);
router.delete("/:id/:refugeId", protectRoute, refugeOnly, demande_transfert.deleteDemandeTransfertControlleur);

// Routes de lecture (publiques pour demande_transferts)
router.get("/:id", demande_transfert.getDemandeTransfertControlleur);
router.get("/", demande_transfert.getAllDemandeTransfertsControlleur);



export default router;