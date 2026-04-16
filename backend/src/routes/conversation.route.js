import { Router } from "express";
import * as conversation from "../controlleurs/conversation.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, conversation.createConversationControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, conversation.updateConversationControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, conversation.deleteConversationControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, isOwnerOrAdmin, conversation.getConversationControlleur);
router.get("/", protectRoute, conversation.getAllConversationsControlleur);

// Routes spéciales de lecture protégées
router.get("/utilisateur/:Utilisateur", protectRoute, conversation.getUtilisateurOfConversationControlleur);

export default router;