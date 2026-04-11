import { Router } from "express";
import * as wishlist from "../controlleurs/wishlist.controlleur.js"

const router = Router()

router.post("/", wishlist.createWishlistControlleur);
router.get("/:id", wishlist.getWishlistControlleur);
router.get("/", wishlist.getAllWishlistsControlleur);
router.put("/:id", wishlist.updateWishlistControlleur);
router.delete("/:id", wishlist.deleteWishlistControlleur);

// routes speciales

router.get("/utilisateur/:Utilisateur", wishlist.getUtilisateurOfWishlistControlleur);

export default router;