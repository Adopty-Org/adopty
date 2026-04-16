import { Router } from "express";
import * as conversation_participant from "../controlleurs/conversation_participant.controlleur.js"

const router = Router()

// routes speciales

router.get("/conversation/:Conversation", conversation_participant.getConversationOfConversationParticipantControlleur);
router.get("/statut/:Statut", conversation_participant.getStatutOfConversationParticipantControlleur);


router.post("/", conversation_participant.createConversationParticipantControlleur);
router.get("/:id", conversation_participant.getConversationParticipantControlleur);
router.get("/", conversation_participant.getAllConversationParticipantsControlleur);
router.put("/:id", conversation_participant.updateConversationParticipantControlleur);
router.delete("/:id", conversation_participant.deleteConversationParticipantControlleur);


export default router;