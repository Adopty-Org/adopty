import { Router } from "express";
import * as animal from "../controlleurs/animal.controlleur.js"
import { protectRoute, hasAnyRole } from "../midleware/auth.midleware.js";
import { upload } from "../midleware/multer.midleware.js";

const router = Router()

router.use((req, res, next) => {
  console.log(`🔵 ${req.method} ${req.originalUrl}`);
  next();
})

// Routes publiques - recherche par statut et race
router.get("/statut/:Statut", animal.getStatutOfAnimalControlleur);
router.get("/race/:Race", animal.getRaceOfAnimalControlleur);
router.get("/photos/:id", animal.getPhotosOfAnimalControlleur);
router.get("/caracteristiques/:id", animal.getCaracteristiquesOfAnimalIdControlleur);
router.get("/possessions/:id", animal.getAnimalsPossessionControlleur);

// Routes protégées - création, modification, suppression d'animaux (refuge ou admin)
router.post("/", protectRoute, hasAnyRole(["Refuge", "Admin"]),upload.array("photos", 5), animal.createAnimalControlleur);
router.put("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), animal.updateAnimalControlleur);
router.delete("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), animal.deleteAnimalControlleur);

// Routes publiques - lecture des animaux
router.get("/:id", animal.getAnimalControlleur);
router.get("/", animal.getAllAnimalsControlleur);



export default router;