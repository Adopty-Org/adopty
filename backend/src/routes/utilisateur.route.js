import { Router } from "express";
import * as utilisateur from "../controlleurs/utilisateur.controlleur.js"
import { protectRoute, adminOnly, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - modification du propre compte (propriétaire ou admin)
router.post("/", protectRoute, utilisateur.createAccountControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, utilisateur.updateAccountControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, utilisateur.deleteAccountControlleur);

// Routes de lecture protégées (propriétaire ou admin)
router.get("/:id", protectRoute, isOwnerOrAdmin, utilisateur.getAccountControlleur);
router.get("/animaux/:id", protectRoute, isOwnerOrAdmin, utilisateur.getUtilisateurAnimalsByIdControlleur);
router.get("/refuges/:id", protectRoute, isOwnerOrAdmin, utilisateur.getUtilisateurRefugesByIdControlleur);
router.get("/roles/:id", protectRoute, isOwnerOrAdmin, utilisateur.getUtilisateurRolesByIdControlleur);
router.get("/clerk/:id", protectRoute, utilisateur.getUtilisateurByClerkIdControlleur);

// Routes protégées - gestion des animaux de l'utilisateur
router.put("/animal/unset/:id", protectRoute, utilisateur.unsetAnimalToUtilisateurByIdsControlleur);
router.put("/animal/set/:id", protectRoute, utilisateur.setAnimalToUtilisateurByIdsControlleur);
router.delete("/animal/:id", protectRoute, utilisateur.removeAnimalFromUtilisateurByIdsControlleur);
router.post("/animal/:id", protectRoute, utilisateur.addAnimalToUtilisateurByIdsControlleur);

// Routes protégées - gestion des refuges de l'utilisateur
router.delete("/refuge/:id", protectRoute, utilisateur.removeRefugeToUtilisateurByIdsControlleur);
router.post("/refuge/:id", protectRoute, utilisateur.addRefugeToUtilisateurByIdsControlleur);

// Routes admin only - gestion des rôles (admin uniquement)
router.delete("/role/:id", protectRoute, adminOnly, utilisateur.removeRoleToUtilisateurByIdsControlleur);
router.post("/role/:id", protectRoute, adminOnly, utilisateur.addRoleToUtilisateurByIdsControlleur);

// Route admin only - liste tous les utilisateurs
router.get("/", protectRoute, adminOnly, utilisateur.getAllAccountsControlleur);

export default router;

