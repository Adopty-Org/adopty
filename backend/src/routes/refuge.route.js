import { Router } from "express";
import * as refuge from "../controlleurs/refuge.controlleur.js"

const router = Router()

router.post("/refuges", refuge.createRefugeControlleur);
router.get("/refuges/:id", refuge.getRefugeControlleur);
router.get("/refuges", refuge.getAllRefugesControlleur);
router.put("/refuges/:id", refuge.updateRefugeControlleur);
router.delete("/refuges/:id", refuge.deleteRefugeControlleur);

export default router;