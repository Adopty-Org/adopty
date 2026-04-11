import { Router } from "express";
import * as ligne_wishlist from "../controlleurs/ligne_wishlist.controlleur.js"

const router = Router()

router.post("/", ligne_wishlist.createLigneWishlistControlleur);
router.get("/:id", ligne_wishlist.getLigneWishlistControlleur);
router.get("/", ligne_wishlist.getAllLigneWishlistsControlleur);
router.put("/:id", ligne_wishlist.updateLigneWishlistControlleur);
router.delete("/:id", ligne_wishlist.deleteLigneWishlistControlleur);

//routes speciales

router.get("/produit/:Produit", ligne_wishlist.getProduitOfLigneWishlistControlleur);
router.get("/wishlist/:Wishlist", ligne_wishlist.getWishlistOfLigneWishlistControlleur);

export default router;