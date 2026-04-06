import { createRace, deleteRace, getAllRaces, getRaceById, updateRace } from "../database/race.db.js";

export async function createRaceControlleur(req,res) {// pas utilisable je crois
    try {
        const { Nom, Description,Espece } = req.body;

        if(!Nom || !Description || !Espece ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createRace({
            Nom, 
            Description,
            Espece
        })

        res.status(201).json({ message: "Race crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateRaceControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Nom, Description, Espece } = req.body;
        const race = await getRaceById(id);
        if (!race) {
            return res.status(404).json({ message: "Race non trouvé" });
        }
        await updateRace( id ,{
            Nom, 
            Description,
            Espece
        })
        
        res.status(200).json({ message: "Race modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteRaceControlleur(req,res) {
    try {
        const { id } = req.params;
        const race = await getRaceById(id);
        if (!race) {
            return res.status(404).json({ message: "Race non trouvé" });
        }
        await deleteRace(id);
        res.status(200).json({ message: "Race supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRaceControlleur(req,res) {
    try {
        const { id } = req.params;
        const race = await getRaceById(id);
        if(!race){
            return res.status(404).json({message:"Race non trouvé"})
        }
        res.status(200).json(race);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllRacesControlleur(req,res) {
    try {
        const races = await getAllRaces();
        res.status(200).json(races);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des races:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
