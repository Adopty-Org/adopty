import { Router } from "express";
import * as commande from "../controlleurs/commande.controlleur.js"

const router = Router()

router.post("/", commande.createCommandeControlleur);
router.get("/:id", commande.getCommandeControlleur);
router.get("/", commande.getAllCommandesControlleur);
router.put("/:id", commande.updateCommandeControlleur);
router.delete("/:id", commande.deleteCommandeControlleur);

// routes speciales

router.get("/statut/:Statut", commande.getStatutOfCommandeControlleur);
router.get("/utilisateur/:Utilisateur", commande.getUtilisateurOfCommandeControlleur);

export default router;