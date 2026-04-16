import { Router } from "express";
import * as conversation from "../controlleurs/conversation.controlleur.js"

const router = Router()

// routes speciales

router.get("/utilisateur/:Utilisateur", conversation.getUtilisateurOfConversationControlleur);

router.post("/", conversation.createConversationControlleur);
router.get("/:id", conversation.getConversationControlleur);
router.get("/", conversation.getAllConversationsControlleur);
router.put("/:id", conversation.updateConversationControlleur);
router.delete("/:id", conversation.deleteConversationControlleur);



export default router;