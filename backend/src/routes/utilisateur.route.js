import { Router } from "express";
import * as utilisateur from "../controlleurs/utilisateur.controlleur.js"

const router = Router()

router.post("/", utilisateur.createAccountControlleur);
router.get("/:id", utilisateur.getAccountControlleur);
router.get("/", utilisateur.getAllAccountsControlleur);
router.put("/:id", utilisateur.updateAccountControlleur);
router.delete("/:id", utilisateur.deleteAccountControlleur);

// routes speciales
router.put("/animal/:id", utilisateur.unsetAnimalToUtilisateurByIdsControlleur);
router.put("/animal/:id", utilisateur.setAnimalToUtilisateurByIdsControlleur);
router.delete("/animal/:id", utilisateur.removeAnimalFromUtilisateurByIdsControlleur);
router.post("/animal/:id", utilisateur.addAnimalToUtilisateurByIdsControlleur);
router.get("/animaaux/:id", utilisateur.getUtilisateurAnimalsByIdControlleur);
router.delete("/refuge/:id", utilisateur.removeRefugeToUtilisateurByIdsControlleur);
router.post("/refuge/:id", utilisateur.addRefugeToUtilisateurByIdsControlleur);
router.get("/refuges/:id", utilisateur.getUtilisateurRefugesByIdControlleur);
router.delete("/role/:id", utilisateur.removeRoleToUtilisateurByIdsControlleur);
router.post("/role/:id", utilisateur.addRoleToUtilisateurByIdsControlleur);
router.get("/roles/:id", utilisateur.getUtilisateurRolesByIdControlleur);
router.get("/clerk/:id", utilisateur.getUtilisateurByClerkIdControlleur);


export default router;