import { createConversation, deleteConversation, getAllConversations, getConversationById, updateConversation } from "../database/ligne_commande.db.js";
import { getProduitById } from "../database/produit.db.js";
import { getSousCommandeById } from "../database/sous_commande.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createConversationControlleur(req,res) {// pas utilisable je crois
    try {
        const { Type, CreatedAt,CreatedBy } = req.body;

        if (
            Type == null ||
            CreatedAt == null ||
            !Number.isInteger(CreatedBy) ||
            CreatedBy <= 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createConversation({
            Type, 
            CreatedAt,
            CreatedBy
        })

        res.status(201).json({ message: "Conversation crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateConversationControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Type, CreatedAt, CreatedBy } = req.body;
        const ligne_commande = await getConversationById(id);
        if (!ligne_commande) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        if (
            Type == null ||
            CreatedAt == null ||
            !Number.isInteger(CreatedBy) ||
            CreatedBy <= 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        await updateConversation( id ,{
            Type, 
            CreatedAt,
            CreatedBy
        })
        
        res.status(200).json({ message: "Conversation modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteConversationControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_commande = await getConversationById(id);
        if (!ligne_commande) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }
        await deleteConversation(id);
        res.status(200).json({ message: "Conversation supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getConversationControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_commande = await getConversationById(id);
        if(!ligne_commande){
            return res.status(404).json({message:"Conversation non trouvée"})
        }
        res.status(200).json(ligne_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllConversationsControlleur(req,res) {
    try {
        const ligne_commandes = await getAllConversations();
        res.status(200).json(ligne_commandes);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des ligne_commandes:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getUtilisateurOfConversationControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Conversation a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
