import { Router } from "express";
import * as ligne_panier from "../controlleurs/ligne_panier.controlleur.js"

const router = Router()

router.post("/", ligne_panier.createLignePanierControlleur);
router.get("/:id", ligne_panier.getLignePanierControlleur);
router.get("/", ligne_panier.getAllLignePaniersControlleur);
router.put("/:id", ligne_panier.updateLignePanierControlleur);
router.delete("/:id", ligne_panier.deleteLignePanierControlleur);

// routes speciales

router.get("/produit/:Produit", ligne_panier.getProduitOfLignePanierControlleur);
router.get("/panier/:Panier", ligne_panier.getPanierOfLignePanierControlleur);

export default router;