import { Router } from "express";
import * as produit from "../controlleurs/produit.controlleur.js"
import { protectRoute, hasAnyRole, isOwnerOrAdmin, refugeOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/materiaux/:id", produit.getMateriauxOfProduitControlleur);
router.get("/materiaux/ids/:id/:materiauxId", produit.getMateriauxOfProduitByIdsControlleur);
router.get("/refuge/:Refuge", produit.getRefugeOfProduitControlleur);
router.get("/:id/photos", produit.getPhotosOfProduitControlleur)

// Routes protégées - création, modification, suppression (refuge ou admin et propriétaire)
router.post("/materiaux/ajout/:id/:materiauxId/:refugeId", protectRoute, /*hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin*/refugeOnly, produit.addMateriauxToProduitControlleur);
router.delete("/materiaux/supprimer/:id/:materiauxId/:refugeId", protectRoute, /*hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin*/refugeOnly, produit.RemoveMateriauxFromProduitControlleur);
router.post("/:refugeId", protectRoute, /*hasAnyRole(["Refuge", "Admin"])*/refugeOnly, produit.createProduitControlleur);
router.put("/:id/:refugeId", /*hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin*/protectRoute, refugeOnly, produit.updateProduitControlleur);
router.delete("/:id/:refugeId", /*hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin*/protectRoute, refugeOnly, produit.deleteProduitControlleur);

// Routes de lecture publiques
router.get("/:id", produit.getProduitControlleur);
router.get("/", produit.getAllProduitsControlleur);



export default router;