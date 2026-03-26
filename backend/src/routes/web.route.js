import { Router } from "express";
import * as web from "../controlleurs/web.controlleur.js"
import { adminOnly, protectRoute } from "../midleware/auth.midleware.js";

//todo : corriger le tout (le midleware et tout le reste)
const router = Router();

//router.use(protectRoute)
//router.use(adminOnly)

//
//  les routes d'animaux - pour le service web seulement
//

router.post("/animaux", protectRoute, web.createAnimal);
router.get("/animaux/:id", web.getAnimal);
router.get("/animaux", web.getAllAnimals);
router.put("/animaux/:id", protectRoute, web.updateAnimal);
router.delete("/animaux/:id", protectRoute, web.deleteAnimal);

//
//  les routes de comptes - pour le service web seulement
//

router.post("/accounts", web.createAccount);
router.get("/accounts/:id", web.getAccount);
router.get("/accounts", protectRoute, adminOnly, web.getAllAccounts);
router.put("/accounts/:id", protectRoute, web.updateAccount);
router.delete("/accounts/:id", protectRoute, web.deleteAccount);

//
//  les routes de produits - pour le service web seulement
//

router.post("/products", protectRoute, web.createProduct);
router.get("/products/:id", web.getProduct);
router.get("/products", web.getAllProducts);
router.put("/products/:id", protectRoute, web.updateProduct);
router.delete("/products/:id", protectRoute, web.deleteProduct);

//
//  les routes de refuges - pour le service web seulement
//

router.post("/refuges", protectRoute, adminOnly, web.createRefuge);
router.get("/refuges/:id", web.getRefuge);
router.get("/refuges", web.getAllRefuges);
router.put("/refuges/:id", protectRoute, web.updateRefuge);
router.delete("/refuges/:id",protectRoute, adminOnly, web.deleteRefuge);

export default router