import { Router } from "express";
import * as role from "../controlleurs/role.controlleur.js"

const router = Router()

router.post("/roles", role.createRoleControlleur);
router.get("/roles/:id", role.getRoleControlleur);
router.get("/roles", role.getAllRolesControlleur);
router.put("/roles/:id", role.updateRoleControlleur);
router.delete("/roles/:id", role.deleteRoleControlleur);

export default router;