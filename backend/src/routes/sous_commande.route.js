import { Router } from "express";
import * as sous_commande from "../controlleurs/sous_commande.controlleur.js"

const router = Router()

router.post("/", sous_commande.createSousCommandeControlleur);
router.get("/:id", sous_commande.getSousCommandeControlleur);
router.get("/", sous_commande.getAllSousCommandesControlleur);
router.put("/:id", sous_commande.updateSousCommandeControlleur);
router.delete("/:id", sous_commande.deleteSousCommandeControlleur);

// routes speciales

router.get("/statut/:Statut", sous_commande.getStatutOfSousCommandeControlleur);
router.get("/refuge/:Refuge", sous_commande.getRefugeOfSousCommandeControlleur);
router.get("/commande/:Commande", sous_commande.getCommandeOfSousCommandeControlleur);

export default router;