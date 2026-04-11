import { Router } from "express";
import * as livraison from "../controlleurs/livraison.controlleur.js"

const router = Router()

router.post("/", livraison.createLivraisonControlleur);
router.get("/:id", livraison.getLivraisonControlleur);
router.get("/", livraison.getAllLivraisonsControlleur);
router.put("/:id", livraison.updateLivraisonControlleur);
router.delete("/:id", livraison.deleteLivraisonControlleur);

// routes speciales

router.get("/statut/:Statut", livraison.getStatutOfLivraisonControlleur);
router.get("/sous_commande/:SousCommande", livraison.getSousCommandeOfLivraisonControlleur);

export default router;