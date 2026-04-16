import { createConversationParticipant, deleteConversationParticipant, getAllConversationParticipants, getConversationParticipantById, updateConversationParticipant } from "../database/conversation_participant.db.js";
import { getStatutById } from "../database/produit.db.js";
import { getConversationById } from "../database/sous_commande.db.js";

export async function createConversationParticipantControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdConversation, Statut,Role } = req.body;

        if (
            IdConversation == null ||
            Statut == null ||
            !Number.isInteger(Role) ||
            Role <= 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createConversationParticipant({
            IdConversation, 
            Statut,
            Role
        })

        res.status(201).json({ message: "ConversationParticipant crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la conversation_participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateConversationParticipantControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdConversation, Statut, Role } = req.body;
        const conversation_participant = await getConversationParticipantById(id);
        if (!conversation_participant) {
            return res.status(404).json({ message: "ConversationParticipant non trouvée" });
        }

        if (
            IdConversation == null ||
            Statut == null ||
            !Number.isInteger(Role) ||
            Role <= 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        await updateConversationParticipant( id ,{
            IdConversation, 
            Statut,
            Role
        })
        
        res.status(200).json({ message: "ConversationParticipant modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la conversation_participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteConversationParticipantControlleur(req,res) {
    try {
        const { id } = req.params;
        const conversation_participant = await getConversationParticipantById(id);
        if (!conversation_participant) {
            return res.status(404).json({ message: "ConversationParticipant non trouvée" });
        }
        await deleteConversationParticipant(id);
        res.status(200).json({ message: "ConversationParticipant supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la conversation_participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getConversationParticipantControlleur(req,res) {
    try {
        const { id } = req.params;
        const conversation_participant = await getConversationParticipantById(id);
        if(!conversation_participant){
            return res.status(404).json({message:"ConversationParticipant non trouvée"})
        }
        res.status(200).json(conversation_participant);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la conversation_participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllConversationParticipantsControlleur(req,res) {
    try {
        const conversation_participants = await getAllConversationParticipants();
        res.status(200).json(conversation_participants);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des conversation_participants:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getConversationOfConversationParticipantControlleur(req,res) {
    try {
        const { Conversation } = req.params;
        const conversation = await getConversationById(Conversation);
        if (!conversation) {
            return res.status(404).json({ message: "ConversationParticipant a un conversation inexistant !(non trouvé)" });
        }
        res.status(200).json(conversation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfConversationParticipantControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "ConversationParticipant a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}