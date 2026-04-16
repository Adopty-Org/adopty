import { createMessage, deleteMessage, getAllMessages, getMessageById, updateMessage } from "../database/message.db.js";
import { getConversationById } from "../database/conversation.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createMessageControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdConversation, SenderId,Contenu } = req.body;

        if (
            IdConversation == null ||
            SenderId == null ||
            typeof Contenu !== 'string' ||
            Contenu.trim().length === 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createMessage({
            IdConversation, 
            SenderId,
            Contenu
        })

        res.status(201).json({ message: "Message crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateMessageControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdConversation, SenderId, Contenu } = req.body;
        const message = await getMessageById(id);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvée" });
        }

        if (
            IdConversation == null ||
            SenderId == null ||
            typeof Contenu !== 'string' ||
            Contenu.trim().length === 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        await updateMessage( id ,{
            IdConversation, 
            SenderId,
            Contenu
        })
        
        res.status(200).json({ message: "Message modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteMessageControlleur(req,res) {
    try {
        const { id } = req.params;
        const message = await getMessageById(id);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvée" });
        }
        await deleteMessage(id);
        res.status(200).json({ message: "Message supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getMessageControlleur(req,res) {
    try {
        const { id } = req.params;
        const message = await getMessageById(id);
        if(!message){
            return res.status(404).json({message:"Message non trouvée"})
        }
        res.status(200).json(message);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllMessagesControlleur(req,res) {
    try {
        const messages = await getAllMessages();
        res.status(200).json(messages);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des messages:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getConversationOfMessageControlleur(req,res) {
    try {
        const { Conversation } = req.params;
        const conversation = await getConversationById(Conversation);
        if (!conversation) {
            return res.status(404).json({ message: "Message a un conversation inexistant !(non trouvé)" });
        }
        res.status(200).json(conversation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getSenderIdOfMessageControlleur(req,res) {
    try {
        const { SenderId } = req.params;
        const senderId = await getUtilisateurById(SenderId);
        if (!senderId) {
            return res.status(404).json({ message: "Message a un senderId inexistant !(non trouvé)" });
        }
        res.status(200).json(senderId);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}