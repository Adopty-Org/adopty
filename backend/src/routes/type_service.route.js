import { Router } from "express";
import * as type_service from "../controlleurs/type_service.controlleur.js"

const router = Router()

router.post("/", type_service.createTypeServiceControlleur);
router.get("/:id", type_service.getTypeServiceControlleur);
router.get("/", type_service.getAllTypeServicesControlleur);
router.put("/:id", type_service.updateTypeServiceControlleur);
router.delete("/:id", type_service.deleteTypeServiceControlleur);

export default router;