import { Router } from "express";
import * as panier from "../controlleurs/panier.controlleur.js"

const router = Router()

router.post("/", panier.createPanierControlleur);
router.get("/:id", panier.getPanierControlleur);
router.get("/", panier.getAllPaniersControlleur);
router.put("/:id", panier.updatePanierControlleur);
router.delete("/:id", panier.deletePanierControlleur);

// routes speciales

router.get("/utilisateur/:Utilisateur", panier.getUtilisateurOfPanierControlleur);

export default router;