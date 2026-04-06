import { Router } from "express";
import * as role from "../controlleurs/role.controlleur.js"

const router = Router()

router.post("/", role.createRoleControlleur);
router.get("/:id", role.getRoleControlleur);
router.get("/", role.getAllRolesControlleur);
router.put("/:id", role.updateRoleControlleur);
router.delete("/:id", role.deleteRoleControlleur);

export default router;