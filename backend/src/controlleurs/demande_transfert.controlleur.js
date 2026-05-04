import { getAnimalById } from "../database/animal.db.js";
import { createDemandeTransfert, deleteDemandeTransfert, getAllDemandeTransferts, getDemandeTransfertById, updateDemandeTransfert } from "../database/demande_transfert.db.js";
import { getStatutById } from "../database/statut.db.js";

export async function createDemandeTransfertControlleur(req,res) {
    try {
        const { IdRefugeDepart,IdAnimal,IdRefugeCible,CommentaireDepart,CommentaireRetour,DateDepart,Statut,DateRetours } = req.body;

        if(!IdRefugeDepart || !IdRefugeCible && !CommentaireDepart || !CommentaireRetour){
            return res.status(400).json({ message: "Le strict minimum en information est requis! "})
        }

        const requete = await createDemandeTransfert({
            IdRefugeDepart,
            IdAnimal,
            IdRefugeCible,
            CommentaireDepart,
            CommentaireRetour, 
            DateDepart, 
            Statut, 
            DateRetours 
        })

        res.status(201).json({ message: "DemandeTransfert crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateDemandeTransfertControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdRefugeDepart,IdAnimal,IdRefugeCible,CommentaireDepart,CommentaireRetour, DateDepart, Statut, DateRetours } = req.body;
        const demande_transfert = await getDemandeTransfertById(id);
        if (!demande_transfert) {
            return res.status(404).json({ message: "DemandeTransfert non trouvée" });
        }
        await updateDemandeTransfert( id ,{
            IdRefugeDepart,
            IdAnimal,
            IdRefugeCible,
            CommentaireDepart,
            CommentaireRetour,
            DateDepart, 
            Statut, 
            DateRetours 
        })
        
        res.status(200).json({ message: "DemandeTransfert modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteDemandeTransfertControlleur(req,res) {
    try {
        const { id } = req.params;
        const demande_transfert = await getDemandeTransfertById(id);
        if (!demande_transfert) {
            return res.status(404).json({ message: "DemandeTransfert non trouvée" });
        }
        await deleteDemandeTransfert(id);
        res.status(200).json({ message: "DemandeTransfert supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getDemandeTransfertControlleur(req,res) {
    try {
        const { id } = req.params;
        const demande_transfert = await getDemandeTransfertById(id);
        if(!demande_transfert){
            return res.status(404).json({message:"DemandeTransfert non trouvée"})
        }
        res.status(200).json(demande_transfert);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllDemandeTransfertsControlleur(req,res) {
    try {
        const demande_transferts = await getAllDemandeTransferts();
        res.status(200).json(demande_transferts);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des demande_transferts:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getStatutOfDemandeTransfertControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "DemandeTransfert a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du statut de l'demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRefugeOfDemandeTransfertControlleur(req,res) {
    try {
        const { Refuge } = req.params;
        const utilisateur = await getRefugeById(Refuge);
        if (!utilisateur) {
            return res.status(404).json({ message: "DemandeTransfert a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'utilisateur de l'demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnimalOfDemandeTransfertControlleur(req,res) {
    try {
        const { Animal } = req.params;
        const animal = await getAnimalById(Animal);
        if (!animal) {
            return res.status(404).json({ message: "DemandeTransfert a un animal inexistant !(non trouvé)" });
        }
        res.status(200).json(animal);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'aniaml de l'demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
