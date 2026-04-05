import { CreateRefuge, deleteRefuge, getAllRefuges, getRefugeById, updateRefuge } from "../database/refuge.db.js";

export async function createRefugeControlleur(req,res) {
    try {
        const { Nom,Description,Addresse,AddresseGPS,Telephone } = req.body;

        if(!Nom || !Addresse && !AddresseGPS || !Telephone){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await CreateRefuge({
            Nom,
            Description,
            Addresse,
            AddresseGPS,
            Telephone 
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
        const { Nom,Description,Addresse,AddresseGPS,Telephone } = req.body;
        const refuge = await getRefugeById(id);
        if (!refuge) {
            return res.status(404).json({ message: "Refuge non trouvé" });
        }
        await updateRefuge( id ,{
            Nom,
            Description,
            Addresse,
            AddresseGPS,
            Telephone
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
        const refuge = getRefugeById(id);
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
        const refuges = getAllRefuges();
        res.status(200).json(refuges);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des refuges:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}