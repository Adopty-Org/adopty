import { getAnimalById } from "../database/animal.db.js";
import { createDemandeTransfert, deleteDemandeTransfert, getAllDemandeTransferts, getDemandeTransfertById, getDemandeTransfertByRefugeCibleId, getDemandeTransfertByRefugeDepartId, updateDemandeTransfert } from "../database/demande_transfert.db.js";
import { getStatutById } from "../database/statut.db.js";

export async function createDemandeTransfertControlleur(req,res) {
    try {
        const { IdRefugeDepart,IdAnimal,IdRefugeCible,CommentaireDepart,CommentaireRetour,DateDepart,Statut,DateRetours } = req.body;

        console.log("Données reçues pour la création de la demande de transfert:", IdRefugeDepart,IdAnimal,IdRefugeCible,CommentaireDepart,CommentaireRetour,DateDepart,Statut,DateRetours);
        if(!IdRefugeDepart || !IdRefugeCible && !CommentaireDepart /*|| !CommentaireRetour*/){
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


export async function getDemandeTransfertByRefugeCibleIdControlleur(req,res) {
    try {
        console.log("le refuge cible", req.params)
        const { Refuge } = req.params;
        console.log("le refuge", Refuge)
        const refuge = await getDemandeTransfertByRefugeCibleId(Refuge);
        console.log("la reponce :  ", refuge)
        if (!refuge) {
            return res.status(404).json({ message: "DemandeTransfert a un refuge inexistante !(non trouvé)" });
        }
        res.status(200).json(refuge);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du refuge de l'demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getDemandeTransfertByRefugeDepartIdControlleur(req,res) {
    try {
        const { Refuge } = req.params;
        console.log("le refuge", Refuge)
        const refuge = await getDemandeTransfertByRefugeDepartId(Refuge);
        console.log("la reponce :  ", refuge)
        if (!refuge) {
            return res.status(404).json({ message: "DemandeTransfert a un refuge inexistante !(non trouvé)" });
        }
        res.status(200).json(refuge);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du refuge de l'demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// PATCH /api/demandes/:id/statut
export const updateDemandeTripleTStatutController = async (req, res) => {
    try {
        const { id } = req.params;      // Récupère l'ID de la demande
        const { Statut,CommentaireRetour } = req.body;    // Récupère le nouveau statut
        
        console.log(`Requête PATCH reçue - Demande ID: ${id}, Nouveau statut: ${Statut}`);
        
        // Validation: vérifier que l'ID est valide
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ 
                success: false, 
                message: "ID de demande invalide" 
            });
        }
        
        // Validation: vérifier que le statut est valide (1-6)
        const statutsValides = [1, 2, 3, 4, 5, 6];
        if (!Statut || !statutsValides.includes(Statut)) {
            return res.status(400).json({ 
                success: false, 
                message: "Statut invalide. Utilisez 1,2,3,4,5 ou 6" 
            });
        }
        
        // Appeler le service
        const demandeMaj = await updateDemandeTripleTStatut(id, Statut, CommentaireRetour);
        
        // Retourner la réponse
        res.status(200).json({
            success: true,
            message: `Statut de la demande ${id} mis à jour avec succès`,
            demande: demandeMaj,
            nouveauStatut: Statut
        });
        
    } catch (error) {
        console.error("Erreur dans updateDemandeTripleTStatutController:", error);
        
        if (error.message.includes('non trouvée')) {
            return res.status(404).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Erreur interne du serveur" 
        });
    }
};