import { Router } from "express";
import * as demande_adoption from "../controlleurs/demande_adoption.controlleur.js"
import { protectRoute, isOwnerOrAdmin, refugeOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture (publiques)
router.get("/animal/:Animal", refugeOnly, demande_adoption.getAnimalOfDemandeAdoptionControlleur);
router.get("/refuge/:Refuge", refugeOnly, demande_adoption.getRefugeOfDemandeAdoptionControlleur);
router.get("/utilisateur/:Utilisateur", refugeOnly, demande_adoption.getUtilisateurOfDemandeAdoptionControlleur);
router.get("/statut/:Statut", refugeOnly, demande_adoption.getStatutOfDemandeAdoptionControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, refugeOnly, demande_adoption.createDemandeAdoptionControlleur);
router.put("/:id", protectRoute, refugeOnly, demande_adoption.updateDemandeAdoptionControlleur);
router.delete("/:id", protectRoute, refugeOnly, demande_adoption.deleteDemandeAdoptionControlleur);

// Routes de lecture (publiques pour demande_adoptions)
router.get("/:id", demande_adoption.getDemandeAdoptionControlleur);
router.get("/", demande_adoption.getAllDemandeAdoptionsControlleur);



export default router;