import { requireAuth } from "@clerk/express";
import { Utilisateur } from "../modeles/utilisateur.model.js";
import { ENV } from "../config/env.js";
import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";

export const protectRoute = [
    requireAuth(),
    async (req,res,next) => {
        try {
            const clerkId = req.auth().userId;
            if(!clerkId){
                return res.status(401).json({ message: "Pas autorises - le token est errones" })
            }

            const user = await getUtilisateurByClerkId(clerkId)
            if(!user){
                return res.status(401).json({ message: "Pas autorises - le token est errones" })
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Error dans protectRoute midleware :   ",error)
            res.status(500).json({ message: "Erreur interne du serveur"})
        }
    }
]

//todo: changer ca pour que ca reconnait les admins et pas qu'un seul

export const adminOnly = (req,res,next) => {
    if(!req.user){
        return res.status(401).json({ message: "Pas autorises - le token est errones" })
    }
    if(req.user.AdresseEmail !== ENV.ADMIN_EMAIL){  //  <=  attention , bisar
        return res.status(403).json({ message: "Interdit - access administrateur seulement." })
    }
    next();
}