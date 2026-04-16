import { Router } from "express";
import * as produit from "../controlleurs/produit.controlleur.js"
import { protectRoute, hasAnyRole, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/refuge/:Refuge", produit.getRefugeOfProduitControlleur);

// Routes protégées - création, modification, suppression (refuge ou admin et propriétaire)
router.post("/", protectRoute, hasAnyRole(["Refuge", "Admin"]), produit.createProduitControlleur);
router.put("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin, produit.updateProduitControlleur);
router.delete("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin, produit.deleteProduitControlleur);

// Routes de lecture publiques
router.get("/:id", produit.getProduitControlleur);
router.get("/", produit.getAllProduitsControlleur);



export default router;