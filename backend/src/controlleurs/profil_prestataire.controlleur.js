import { createProfilPrestataire, deleteProfilPrestataire, getAllProfilPrestataires, getProfilPrestataireById, updateProfilPrestataire } from "../database/profil_prestataire.db.js";
import { getTypeServiceById } from "../database/type_service.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createProfilPrestataireControlleur(req,res) {
    try {
        const { IdUtilisateur,Experience,TarifHoraire,ZoneIntervention,TypeService,Statut,Bio,NoteMoyenne } = req.body;

        if(!IdUtilisateur || !TarifHoraire && !ZoneIntervention || !TypeService){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createProfilPrestataire({
            IdUtilisateur,
            Experience,
            TarifHoraire,
            ZoneIntervention,
            TypeService, 
            Statut, 
            Bio, 
            NoteMoyenne 
        })

        res.status(201).json({ message: "ProfilPrestataire crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateProfilPrestataireControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdUtilisateur,Experience,TarifHoraire,ZoneIntervention,TypeService, Statut, Bio, NoteMoyenne } = req.body;
        const profil_prestataire = await getProfilPrestataireById(id);
        if (!profil_prestataire) {
            return res.status(404).json({ message: "ProfilPrestataire non trouvée" });
        }
        await updateProfilPrestataire( id ,{
            IdUtilisateur,
            Experience,
            TarifHoraire,
            ZoneIntervention,
            TypeService,
            Statut, 
            Bio, 
            NoteMoyenne 
        })
        
        res.status(200).json({ message: "ProfilPrestataire modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteProfilPrestataireControlleur(req,res) {
    try {
        const { id } = req.params;
        const profil_prestataire = await getProfilPrestataireById(id);
        if (!profil_prestataire) {
            return res.status(404).json({ message: "ProfilPrestataire non trouvée" });
        }
        await deleteProfilPrestataire(id);
        res.status(200).json({ message: "ProfilPrestataire supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProfilPrestataireControlleur(req,res) {
    try {
        const { id } = req.params;
        const profil_prestataire = await getProfilPrestataireById(id);
        if(!profil_prestataire){
            return res.status(404).json({message:"ProfilPrestataire non trouvée"})
        }
        res.status(200).json(profil_prestataire);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllProfilPrestatairesControlleur(req,res) {
    try {
        const profil_prestataires = await getAllProfilPrestataires();
        res.status(200).json(profil_prestataires);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des profil_prestataires:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getUtilisateurOfProfilPrestataireControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "ProfilPrestataire a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getTypeServiceOfProfilPrestataireControlleur(req,res) {
    try {
        const { TypeService } = req.params;
        const type_service = await getTypeServiceById(TypeService);
        if (!type_service) {
            return res.status(404).json({ message: "ProfilPrestataire a un type_service inexistant !(non trouvé)" });
        }
        res.status(200).json(type_service);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfProfilPrestataireControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "ProfilPrestataire a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}