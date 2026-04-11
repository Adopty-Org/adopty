import { Router } from "express";
import * as paiement_commande from "../controlleurs/paiement_commande.controlleur.js"

const router = Router()

router.post("/", paiement_commande.createPaiementCommandeControlleur);
router.get("/:id", paiement_commande.getPaiementCommandeControlleur);
router.get("/", paiement_commande.getAllPaiementCommandesControlleur);
router.put("/:id", paiement_commande.updatePaiementCommandeControlleur);
router.delete("/:id", paiement_commande.deletePaiementCommandeControlleur);

// routes speciales

router.get("/statut/:Statut", paiement_commande.getStatutOfPaiementCommandeControlleur);
router.get("/commande/:Commande", paiement_commande.getCommandeOfPaiementCommandeControlleur);

// todo: meme chose que son controlleur (vas voir)

export default router;