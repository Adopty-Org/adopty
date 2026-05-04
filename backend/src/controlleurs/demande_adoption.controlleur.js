import cloudinary from "../config/cloudinary.js"
import { createDemandeAdoption, deleteDemandeAdoption, getAllDemandeAdoptions, getDemandeAdoptionById, updateDemandeAdoption } from "../database/demande_adoption.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getAnimalById } from "../database/animal.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";
import { getRefugeById } from "../database/refuge.db.js";

export async function createDemandeAdoptionControlleur(req,res) {
    try {
        //sort les infos de la requete
        const { IdAnimal, IdUtilisateur, IdRefuge, TypeLogement, Jardin, Animaux, Enfants, CommentaireDepart, Disponibilite, CommentaireRetour, DateDemande, DateRetours, Statut} = req.body;

        // verif les infos
        if (IdAnimal == null || IdRefuge == null){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        if(IdRefuge<=0 || !Number.isInteger(IdRefuge)){
            return res.status(400).json({ message: "L'age dois etre un entier positif! "});
        }

        if(TypeLogement<=0 || TypeLogement>1000000){ // 1.000.000 kg
            return res.status(400).json({ message: "Le poids doit etre un positif non demesures ! "});
        }

        // verif si pas de photo
        if(!req.files || req.files.length === 0){
            return res.status(400).json({ message: "une photo au minimun est requise" });
        }

        // si on veux limiteur le nombre de photos 
        /*
        if(req.files.length> 3){
            return res.status(400).json({ message: "Un maximum de 3 photos sont permises"});
        }
        */

        // les upload vers cloudinary
        const uploadPromises = req.files.map((file) => {
            return cloudinary.uploader.upload(file.path, {
                folder: "adopty-demande_adoptions",
            });
        });

        // les reponces des promesses
        let uploadResults;
        try {
            uploadResults = await Promise.all(uploadPromises);
        } catch (error) {
            return res.status(500).json({ message: "Erreur upload images" });
        }
        

        

        // creation de l'demande_adoption dans la bdd mysql
        //const demande_adoption = new DemandeAdoption(req.body);

        const requete = await createDemandeAdoption({
                        IdAnimal,
                        IdUtilisateur,
                        IdRefuge,
                        TypeLogement,
                        Jardin,
                        Animaux,
                        Enfants,
                        CommentaireDepart,
                        Disponibilite,
                        CommentaireRetour,
                        DateDemande,
                        DateRetours,
                        Statut,
                        
        });

        res.status(201).json({ message: "DemandeAdoption crée avec succès", id: requete });

    } catch (error) {
        console.error("Erreur lors de la création de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteDemandeAdoptionControlleur(req,res) {
    try {
        const { id } = req.params;
        const demande_adoptionData = await getDemandeAdoptionById(id);
        if (!demande_adoptionData) {
            return res.status(404).json({ message: "DemandeAdoption non trouvé" });
        }
        await deleteDemandeAdoption(id);
        res.status(200).json({ message: "DemandeAdoption supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateDemandeAdoptionControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdAnimal, IdUtilisateur, IdRefuge, TypeLogement, Jardin, Animaux, Enfants, CommentaireDepart, Disponibilite, CommentaireRetour, DateDemande, DateRetours, Statut, } = req.body;
        const demande_adoption = await getDemandeAdoptionById(id);
        if (!demande_adoption) {
            return res.status(404).json({ message: "DemandeAdoption non trouvé" });
        }
        await updateDemandeAdoption( id ,{
            IdAnimal,
            IdUtilisateur,
            IdRefuge,
            TypeLogement,
            Jardin,
            Animaux,
            Enfants,
            CommentaireDepart,
            Disponibilite,
            CommentaireRetour,
            DateDemande,
            DateRetours,
            Statut,
        })
        
        res.status(200).json({ message: "DemandeAdoption modifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la modification de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getDemandeAdoptionControlleur(req,res) {
    try {
        const { id } = req.params;
        const demande_adoption = await getDemandeAdoptionById(id);
        if (!demande_adoption) {
            return res.status(404).json({ message: "DemandeAdoption non trouvé" });
        }
        res.status(200).json(demande_adoption);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllDemandeAdoptionsControlleur(req,res) {
    try {
        const demande_adoptions = await getAllDemandeAdoptions();
        res.status(200).json(demande_adoptions);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des animaaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// fonctions speciales

export async function getStatutOfDemandeAdoptionControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "DemandeAdoption a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du statut de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnimalOfDemandeAdoptionControlleur(req,res) {
    try {
        const { Animal } = req.params;
        const animal = await getAnimalById(Animal);
        if (!animal) {
            return res.status(404).json({ message: "DemandeAdoption a un animal inexistante !(non trouvé)" });
        }
        res.status(200).json(animal);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du animal de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurOfDemandeAdoptionControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "DemandeAdoption a un utilisateur inexistante !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du utilisateur de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRefugeOfDemandeAdoptionControlleur(req,res) {
    try {
        const { Refuge } = req.params;
        const refuge = await getRefugeById(Refuge);
        if (!refuge) {
            return res.status(404).json({ message: "DemandeAdoption a un refuge inexistante !(non trouvé)" });
        }
        res.status(200).json(refuge);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du refuge de l'demande_adoption:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}