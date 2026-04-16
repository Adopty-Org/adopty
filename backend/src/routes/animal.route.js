import { Router } from "express";
import * as animal from "../controlleurs/animal.controlleur.js"
import { protectRoute, hasAnyRole } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - création, modification, suppression d'animaux (refuge ou admin)
router.post("/", protectRoute, hasAnyRole(["Refuge", "Admin"]), animal.createAnimalControlleur);
router.put("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), animal.updateAnimalControlleur);
router.delete("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), animal.deleteAnimalControlleur);

// Routes publiques - lecture des animaux
router.get("/:id", animal.getAnimalControlleur);
router.get("/", animal.getAllAnimalsControlleur);

// Routes publiques - recherche par statut et race
router.get("/statut/:Statut", animal.getStatutOfAnimalControlleur);
router.get("/race/:Race", animal.getRaceOfAnimalControlleur);

export default router;