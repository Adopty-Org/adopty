import { Router } from "express";
import * as avis from "../controlleurs/avis.controlleur.js"

const router = Router()

router.post("/", avis.createAvisControlleur);
router.get("/:id", avis.getAvisControlleur);
router.get("/", avis.getAllAvissControlleur);
router.put("/:id", avis.updateAvisControlleur);
router.delete("/:id", avis.deleteAvisControlleur);

// routes speciales
router.get("/sous_commande/:SousCommande", avis.getSousCommandeOfAvisControlleur);
router.get("/produit/:Produit", avis.getProduitOfAvisControlleur);
router.get("/utilisateur/:Utilisateur", avis.getUtilisateurOfAvisControlleur);

export default router;