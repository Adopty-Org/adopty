import { Router } from "express";
import * as ligne_commande from "../controlleurs/ligne_commande.controlleur.js"

const router = Router()

router.post("/", ligne_commande.createLigneCommandeControlleur);
router.get("/:id", ligne_commande.getLigneCommandeControlleur);
router.get("/", ligne_commande.getAllLigneCommandesControlleur);
router.put("/:id", ligne_commande.updateLigneCommandeControlleur);
router.delete("/:id", ligne_commande.deleteLigneCommandeControlleur);

// routes speciales

router.get("/produit/:Produit", ligne_commande.getProduitOfLigneCommandeControlleur);
router.get("/sous_commande/:SousCommande", ligne_commande.getSousCommandeOfLigneCommandeControlleur);

export default router;