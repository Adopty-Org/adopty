import { Router } from "express";
import * as produit from "../controlleurs/produit.controlleur.js"

const router = Router()

router.post("/", produit.createProduitControlleur);
router.get("/:id", produit.getProduitControlleur);
router.get("/", produit.getAllProduitsControlleur);
router.put("/:id", produit.updateProduitControlleur);
router.delete("/:id", produit.deleteProduitControlleur);

// routes speciales

router.get("/refuge/:Refuge", produit.getRefugeOfProduitControlleur);

export default router;