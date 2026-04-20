import { requireAuth } from "@clerk/express";
import { Utilisateur } from "../modeles/utilisateur.model.js";
import { ENV } from "../config/env.js";
import { getUtilisateurByClerkId ,getUtilisateurRolesById } from "../database/utilisateur.db.js";

// ==================== PROTECTION DE BASE ====================
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

// ==================== VÉRIFICATION DES RÔLES ====================
/**
 * Fonction helper pour vérifier si un utilisateur a un rôle spécifique
 * @param {number} utilisateurId - ID de l'utilisateur
 * @param {string} roleName - Nom du rôle à vérifier (ex: "Refuge", "Prestataire", "Admin")
 * @returns {boolean} True si l'utilisateur a le rôle
 */
export const hasRole = async (utilisateurId, roleName) => {
    try {
        const roles = await getUtilisateurRolesById(utilisateurId);
        return roles.some(role => role.Nom.toLowerCase() === roleName.toLowerCase());
    } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
        return false;
    }
}

// ==================== MIDDLEWARES POUR RÔLES ====================

/**
 * Middleware pour vérifier si l'utilisateur est un Refuge
 */
export const refugeOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Pas autorisé - le token est erroné" });
        }

        const isRefuge = await hasRole(req.user.Id, "Refuge");
        
        if (!isRefuge) {
            return res.status(403).json({ message: "Accès refusé - seuls les refuges peuvent accéder à cette ressource" });
        }

        next();
    } catch (error) {
        console.error("Erreur dans le middleware refugeOnly:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

/**
 * Middleware pour vérifier si l'utilisateur est un Prestataire
 */
export const prestataireOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Pas autorisé - le token est erroné" });
        }

        const isPrestataire = await hasRole(req.user.Id, "Prestataire");
        
        if (!isPrestataire) {
            return res.status(403).json({ message: "Accès refusé - seuls les prestataires peuvent accéder à cette ressource" });
        }

        next();
    } catch (error) {
        console.error("Erreur dans le middleware prestaireOnly:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

/**
 * Middleware pour vérifier si l'utilisateur est un utilisateur régulier
 */
export const utilisateurOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Pas autorisé - le token est erroné" });
        }

        const isUtilisateur = await hasRole(req.user.Id, "Utilisateur");
        
        if (!isUtilisateur) {
            return res.status(403).json({ message: "Accès refusé - seuls les utilisateurs réguliers peuvent accéder à cette ressource" });
        }

        next();
    } catch (error) {
        console.error("Erreur dans le middleware utilisateurOnly:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

/**
 * Middleware amélioré pour vérifier si l'utilisateur est Admin
 * Supporte plusieurs administrateurs
 */
export const adminOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Pas autorisé - le token est erroné" });
        }

        // Vérifier d'abord par email si configuré
        const adminEmailList = ENV.ADMIN_EMAIL ? ENV.ADMIN_EMAIL.split(',').map(e => e.trim()) : [];
        if (adminEmailList.includes(req.user.AdresseEmail)) {
            return next();
        }

        // Sinon, vérifier par rôle
        const isAdmin = await hasRole(req.user.Id, "Admin");
        
        if (!isAdmin) {
            return res.status(403).json({ message: "Accès refusé - seuls les administrateurs peuvent accéder à cette ressource" });
        }

        next();
    } catch (error) {
        console.error("Erreur dans le middleware adminOnly:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

/**
 * Middleware pour vérifier si l'utilisateur a l'un de plusieurs rôles
 * @param {string[]} requiredRoles - Tableau des rôles autorisés
 */
export const hasAnyRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Pas autorisé - le token est erroné" });
            }

            const userRoles = await getUtilisateurRolesById(req.user.Id);
            const hasRequiredRole = userRoles.some(role => 
                requiredRoles.some(required => 
                    role.Nom.toLowerCase() === required.toLowerCase()
                )
            );

            if (!hasRequiredRole) {
                return res.status(403).json({ 
                    message: `Accès refusé - vous devez avoir l'un de ces rôles: ${requiredRoles.join(', ')}` 
                });
            }

            next();
        } catch (error) {
            console.error("Erreur dans le middleware hasAnyRole:", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    };
}

export const isOwnerOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.id;

    if (!req.user) {
        return res.status(401).json({ message: "Non autorisé" });
    }

    const isOwner = req.user.Id.toString() === resourceUserId;

    const isAdmin = ENV.ADMIN_EMAIL
        ?.split(',')
        .map(e => e.trim())
        .includes(req.user.AdresseEmail);

    if (isOwner || isAdmin) {
        return next();
    }

    return res.status(403).json({
        message: "Vous ne pouvez modifier que vos propres données"
    });
};


import { verifyToken } from "@clerk/backend";
//import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";

export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error("No token provided"));
        }

        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!payload?.sub) {
            return next(new Error("Invalid token"));
        }

        const user = await getUtilisateurByClerkId(payload.sub);
        
        if (!user) {
            return next(new Error("User not found"));
        }

        // Attacher l'utilisateur à la socket
        socket.user = user;
        next();
        
    } catch (err) {
        console.error("Socket auth error:", err);
        next(new Error("Authentication failed"));
    }
};