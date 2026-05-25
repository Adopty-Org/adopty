import { Router } from "express";
import * as refuge from "../controlleurs/refuge.controlleur.js"
import { protectRoute, refugeOnly, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - réservées aux refuges (création)
router.post("/", protectRoute/*, refugeOnly*/, refuge.createRefugeControlleur);

// Routes protégées - gestion des animaux (refuge only)
router.put("/unset_animal/:id/:refugeId", protectRoute, refugeOnly, refuge.unsetAnimalToRefugeByIdsControlleur);
router.put("/set_animal/:id/:refugeId", protectRoute, refugeOnly, refuge.setAnimalToRefugeByIdsControlleur);
router.delete("/supprime_animal/:id/:refugeId", protectRoute, refugeOnly, refuge.removeAnimalFromRefugeByIdsControlleur);
router.post("/ajout_animal/:id/:refugeId", protectRoute, refugeOnly, refuge.addAnimalToRefugeByIdsControlleur);
router.post("/transfer_animal_refuge_to_user/:animalId/:refugeId/:userId", protectRoute, refugeOnly, refuge.transferAnimalFromRefugeToUserControlleur);
router.post("/transfer_animal_between_refuges/:animalId/:fromRefugeId/:toRefugeId", protectRoute, refugeOnly, refuge.transferAnimalBetweenRefugesControlleur);  

// Routes protégées - modification/suppression (propriétaire ou admin)
router.put("/:id", protectRoute, refugeOnly, isOwnerOrAdmin, refuge.updateRefugeControlleur);
router.delete("/:id", protectRoute, refugeOnly, isOwnerOrAdmin, refuge.deleteRefugeControlleur);

// Routes de lecture publiques
router.get("/animaaux/:id", refuge.getRefugeAnimalsByIdControlleur);
router.get("/:id", refuge.getRefugeControlleur);
router.get("/", refuge.getAllRefugesControlleur);


export default router;