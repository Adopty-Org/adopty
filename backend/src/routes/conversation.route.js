import { Router } from "express";
import * as conversation from "../controlleurs/conversation.controlleur.js"

const router = Router()

router.post("/", conversation.createConversationControlleur);
router.get("/:id", conversation.getConversationControlleur);
router.get("/", conversation.getAllConversationsControlleur);
router.put("/:id", conversation.updateConversationControlleur);
router.delete("/:id", conversation.deleteConversationControlleur);

// routes speciales

router.get("/utilisateur/:Utilisateur", conversation.getUtilisateurOfConversationControlleur);

export default router;