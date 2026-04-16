import { createSignalement, deleteSignalement, getAllSignalements, getSignalementById, updateSignalement } from "../database/signalement.db.js";
import { getReservationById } from "../database/reservation.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createSignalementControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdUtilisateur, TypeCible,IdCible,Statut,connectedAccountId,applicationFeeAmount } = req.body;

        if(!IdUtilisateur || !TypeCible || !IdCible || !Statut ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createSignalement({
            IdUtilisateur, 
            TypeCible,
            IdCible,
            Statut,
            connectedAccountId,
            applicationFeeAmount
        })

        res.status(201).json({ message: "Signalement crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateSignalementControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdUtilisateur, TypeCible, IdCible ,Statut ,connectedAccountId,applicationFeeAmount } = req.body;
        const paiement_commande = await getSignalementById(id);
        if (!paiement_commande) {
            return res.status(404).json({ message: "Signalement non trouvé" });
        }
        await updateSignalement( id ,{
            IdUtilisateur, 
            TypeCible,
            IdCible,
            Statut,
            connectedAccountId,
            applicationFeeAmount
        })
        
        res.status(200).json({ message: "Signalement modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteSignalementControlleur(req,res) {
    try {
        const { id } = req.params;
        const paiement_commande = await getSignalementById(id);
        if (!paiement_commande) {
            return res.status(404).json({ message: "Signalement non trouvé" });
        }
        await deleteSignalement(id);
        res.status(200).json({ message: "Signalement supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getSignalementControlleur(req,res) {
    try {
        const { id } = req.params;
        const paiement_commande = await getSignalementById(id);
        if(!paiement_commande){
            return res.status(404).json({message:"Signalement non trouvé"})
        }
        res.status(200).json(paiement_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllSignalementsControlleur(req,res) {
    try {
        const paiement_commandes = await getAllSignalements();
        res.status(200).json(paiement_commandes);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des paiement_commandes:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getStatutOfSignalementControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "Signalement a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurOfSignalementControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Signalement a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// todo: ajouter les controlleurs , requetes et... pour le Statut  (ne foirez pas ca)