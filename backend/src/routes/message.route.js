import { Router } from "express";
import * as message from "../controlleurs/message.controlleur.js"

const router = Router()

// routes speciales

router.get("/conversation/:Conversation", message.getConversationOfMessageControlleur);
router.get("/sender_id/:SenderId", message.getSenderIdOfMessageControlleur);

router.post("/", message.createMessageControlleur);
router.get("/:id", message.getMessageControlleur);
router.get("/", message.getAllMessagesControlleur);
router.put("/:id", message.updateMessageControlleur);
router.delete("/:id", message.deleteMessageControlleur);



export default router;