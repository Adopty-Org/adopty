import { Router } from "express";
import * as refuge from "../controlleurs/refuge.controlleur.js"

const router = Router()

router.post("/", refuge.createRefugeControlleur);
router.get("/:id", refuge.getRefugeControlleur);
router.get("/", refuge.getAllRefugesControlleur);
router.put("/:id", refuge.updateRefugeControlleur);
router.delete("/:id", refuge.deleteRefugeControlleur);

// routes speciales

router.put("/unset_animal/:id", refuge.unsetAnimalToRefugeByIdsControlleur);
router.put("/set_animal/:id", refuge.setAnimalToRefugeByIdsControlleur);
router.delete("/supprime_animal/:id", refuge.removeAnimalFromRefugeByIdsControlleur);
router.post("/ajout_animal/:id", refuge.addAnimalToRefugeByIdsControlleur);
router.get("/animaaux/:id", refuge.getRefugeAnimalsByIdControlleur);

export default router;