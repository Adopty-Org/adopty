import { addAnimalToRefugeByIds, CreateRefuge, deleteRefuge, getAllRefuges, getRefugeAnimalsById, getRefugeById, removeAnimalFromRefugeByIds, setAnimalToRefugeByIds, transferBetweenRefuges, transferRefugeToUser, unsetAnimalToRefugeByIds, updateRefuge } from "../database/refuge.db.js";

export async function createRefugeControlleur(req,res) {
    try {
        const { Nom,Description,Addresse,AddresseGPS,Telephone,stripeAccountId,stripeAccountStatus } = req.body;

        if(!Nom || !Addresse && !AddresseGPS || !Telephone){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await CreateRefuge({
            Nom,
            Description,
            Addresse,
            AddresseGPS,
            Telephone, 
            stripeAccountId,
            stripeAccountStatus
        })

        res.status(201).json({ message: "Refuge crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateRefugeControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Nom,Description,Addresse,AddresseGPS,Telephone,stripeAccountId,stripeAccountStatus } = req.body;
        const refuge = await getRefugeById(id);
        if (!refuge) {
            return res.status(404).json({ message: "Refuge non trouvé" });
        }
        await updateRefuge( id ,{
            Nom,
            Description,
            Addresse,
            AddresseGPS,
            Telephone,
            stripeAccountId,
            stripeAccountStatus
        })
        
        res.status(200).json({ message: "Refuge modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteRefugeControlleur(req,res) {
    try {
        const { id } = req.params;
        const refuge = await getRefugeById(id);
        if (!refuge) {
            return res.status(404).json({ message: "Refuge non trouvé" });
        }
        await deleteRefuge(id);
        res.status(200).json({ message: "Refuge supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRefugeControlleur(req,res) {
    try {
        const { id } = req.params;
        const refuge = await getRefugeById(id);
        if(!refuge){
            return res.status(404).json({message:"Refuge non trouvé"})
        }
        res.status(200).json(refuge);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllRefugesControlleur(req,res) {
    try {
        const refuges = await getAllRefuges();
        res.status(200).json(refuges);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des refuges:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// controlleurs speciales

export async function getRefugeAnimalsByIdControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await getRefugeAnimalsById(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addAnimalToRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await addAnimalToRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeAnimalFromRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await removeAnimalFromRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function setAnimalToRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await setAnimalToRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function unsetAnimalToRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await unsetAnimalToRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Contrôleur: Transfert d'un refuge vers un utilisateur
export async function transferAnimalFromRefugeToUserControlleur(req,res) {
    try {
        const { animalId, refugeId, userId } = req.params;
        // Utilisation directe de la fonction transactionnelle
        const result = await transferRefugeToUser(animalId, refugeId, userId);
        
        return {
            success: true,
            message: result.message,
            data: {
                animalId: result.animalId,
                from: result.from,
                to: result.to
            }
        };
        
    } catch (error) {
        throw new Error(`Échec du transfert refuge → utilisateur: ${error.message}`);
    }
};

// Contrôleur: Transfert entre deux refuges
export async function transferAnimalBetweenRefugesControlleur(req,res) {
    try {
        const { animalId, fromRefugeId, toRefugeId } = req.params;
        // Utilisation directe de la fonction transactionnelle
        const result = await transferBetweenRefuges(animalId, fromRefugeId, toRefugeId);
        
        return {
            success: true,
            message: result.message,
            data: {
                animalId: result.animalId,
                fromRefuge: result.fromRefuge,
                toRefuge: result.toRefuge,
                dateTransfert: result.dateTransfert
            }
        };
        
    } catch (error) {
        throw new Error(`Échec du transfert entre refuges: ${error.message}`);
    }
};