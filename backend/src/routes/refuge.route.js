import { Router } from "express";
import * as refuge from "../controlleurs/refuge.controlleur.js"

const router = Router()

router.post("/", refuge.createRefugeControlleur);
router.get("/:id", refuge.getRefugeControlleur);
router.get("/", refuge.getAllRefugesControlleur);
router.put("/:id", refuge.updateRefugeControlleur);
router.delete("/:id", refuge.deleteRefugeControlleur);

export default router;