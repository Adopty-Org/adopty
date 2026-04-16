import { Router } from "express";
import * as message_read from "../controlleurs/message_read.controlleur.js"

const router = Router()

router.post("/", message_read.createMessageReadControlleur);
router.get("/:id", message_read.getMessageReadControlleur);
router.get("/", message_read.getAllMessageReadsControlleur);
router.put("/:id", message_read.updateMessageReadControlleur);
router.delete("/:id", message_read.deleteMessageReadControlleur);

// routes speciales

router.get("/message/:Message", message_read.getMessageOfMessageReadControlleur);
router.get("/utilisateur/:Utilisateur", message_read.getUtilisateurOfMessageReadControlleur);

export default router;