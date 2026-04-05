import { Router } from "express";
import * as utilisateur from "../controlleurs/utilisateur.controlleur.js"

const router = Router()

router.post("/utilisateurs", utilisateur.createAccountControlleur);
router.get("/utilisateurs/:id", utilisateur.getAccountControlleur);
router.get("/utilisateurs", utilisateur.getAllAccountsControlleur);
router.put("/utilisateurs/:id", utilisateur.updateAccountControlleur);
router.delete("/utilisateurs/:id", utilisateur.deleteAccountControlleur);

export default router;