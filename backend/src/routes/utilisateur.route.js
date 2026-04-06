import { Router } from "express";
import * as utilisateur from "../controlleurs/utilisateur.controlleur.js"

const router = Router()

router.post("/", utilisateur.createAccountControlleur);
router.get("/:id", utilisateur.getAccountControlleur);
router.get("/", utilisateur.getAllAccountsControlleur);
router.put("/:id", utilisateur.updateAccountControlleur);
router.delete("/:id", utilisateur.deleteAccountControlleur);

export default router;