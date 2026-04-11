import cloudinary from "../config/cloudinary.js"
import { Animal } from "../modeles/animal.model.js";
import { createAnimal, deleteAnimal, getAllAnimals, getAnimalById, updateAnimal } from "../database/animal.db.js";
import { createPhotoAnimal } from "../database/photo.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getRaceById } from "../database/race.db.js";

export async function createAnimalControlleur(req,res) {
    try {
        //sort les infos de la requete
        const { Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race} = req.body;

        // verif les infos
        if (Nom == null || Age == null || Genre == null || Race == null){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        if(Age<=0 || !Number.isInteger(Age)){
            return res.status(400).json({ message: "L'age dois etre un entier positif! "});
        }

        if(Genre !== "Male" && Genre !== "Femelle"){
            return res.status(400).json({ message: "Le genre dois etre soit \"Male\" soit\"Femelle\" ! "});
        }

        if(Poids<=0 || Poids>1000000){ // 1.000.000 kg
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
                folder: "adopty-animals",
            });
        });

        // les reponces des promesses
        let uploadResults;
        try {
            uploadResults = await Promise.all(uploadPromises);
        } catch (error) {
            return res.status(500).json({ message: "Erreur upload images" });
        }
        

        // les urls ou sont les photos
        const imageUrls = uploadResults.map((result) => result.secure_url);

        // creation de l'animal dans la bdd mysql
        //const animal = new Animal(req.body);

        const requete = await createAnimal({
                        Nom,
                        Prenom,
                        Age,
                        Genre,
                        Poids,
                        Taille,
                        Couleur,
                        EtatSantee,
                        Sterilise,
                        Temperament,
                        NiveauEnergetique,
                        SociableEnfant,
                        SociableAnimaux,
                        Statut,
                        Race
        });
        

        // Création photos
        await Promise.all(
        imageUrls.map(url => createPhotoAnimal({
            IdAnimal: requete,
            Url: url
        }))
        );

        res.status(201).json({ message: "Animal crée avec succès", id: requete });

    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAnimalControlleur(req,res) {
    try {
        const { id } = req.params;
        const animalData = await getAnimalById(id);
        if (!animalData) {
            return res.status(404).json({ message: "Animal non trouvé" });
        }
        await deleteAnimal(id);
        res.status(200).json({ message: "Animal supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateAnimalControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race} = req.body;
        const animal = await getAnimalById(id);
        if (!animal) {
            return res.status(404).json({ message: "Animal non trouvé" });
        }
        await updateAnimal( id ,{
            Nom,
            Prenom,
            Age,
            Genre,
            Poids,
            Taille,
            Couleur,
            EtatSantee,
            Sterilise,
            Temperament,
            NiveauEnergetique,
            SociableEnfant,
            SociableAnimaux,
            Statut,
            Race
        })
        
        res.status(200).json({ message: "Animal modifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la modification de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnimalControlleur(req,res) {
    try {
        const { id } = req.params;
        const animal = await getAnimalById(id);
        if (!animal) {
            return res.status(404).json({ message: "Animal non trouvé" });
        }
        res.status(200).json(animal);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAnimalsControlleur(req,res) {
    try {
        const animals = await getAllAnimals();
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des animaaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// fonctions speciales

export async function getStatutOfAnimalControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "Animal a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du statut de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRaceOfAnimalControlleur(req,res) {
    try {
        const { Race } = req.params;
        const race = await getRaceById(Race);
        if (!race) {
            return res.status(404).json({ message: "Animal a une race inexistante !(non trouvé)" });
        }
        res.status(200).json(race);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du race de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}