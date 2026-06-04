import cloudinary from "../config/cloudinary.js"
import { Animal } from "../modeles/animal.model.js";
import { createAnimal, deleteAnimal, getAllAnimals, getAnimalById, getAnimalsPossession, updateAnimal } from "../database/animal.db.js";
import { createPhotoAnimal, getAnimalPhotosById } from "../database/photo.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getRaceById } from "../database/race.db.js";
import { getCaracteristiquesByAnimalId } from "../database/caracteristique.db.js";

export async function createAnimalControlleur(req,res) {
    try {
        //sort les infos de la requete
        let { Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race} = req.body;

        Age = Number(Age)
        Poids = Poids === "" || Poids == null ? null : Number(Poids)
        Statut = Number(Statut)
        Race = Number(Race)
        if(Genre === "Male"){
            Genre = 1
        } else if (Genre === "Femelle"){
            Genre = 0
        }

        if(Sterilise === "true"){
            Sterilise = "oui"
        } else if (Sterilise === "false"){
            Sterilise = "non"
        }

        if(SociableEnfant === "true"){
            SociableEnfant = "oui"
        } else if (SociableEnfant === "false"){
            SociableEnfant = "non"
        }

        if(SociableAnimaux === "true"){
            SociableAnimaux = "oui"
        } else if (SociableAnimaux === "false"){
            SociableAnimaux = "non"
        }

        
        // verif les infos
        if (Nom == null || Age == null || Genre == null || Race == null){
            console.log("Informations manquantes"); // 👈 AJOUTE ÇA
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        if(Age<=0 || !Number.isInteger(Age)){
            console.log("Age reçu:", Age); // 👈 AJOUTE ÇA
            return res.status(400).json({ message: "L'age dois etre un entier positif! "});
        }

        if(Genre !== 1 && Genre !== 0){
            console.log("Genre reçu:", Genre); // 👈 AJOUTE ÇA
            return res.status(400).json({ message: "Le genre dois etre soit \"Male\" soit\"Femelle\" ! "});
        }

        if(Poids != null && (Poids <= 0 || Poids > 1000000)){ // 1.000.000 kg
            console.log("Poids reçu:", Poids); // 👈 AJOUTE ÇA
            return res.status(400).json({ message: "Le poids doit etre un positif non demesures ! "});
        }

        // verif si pas de photo
        if(!req.files || req.files.length === 0){
            console.log("Aucune photo reçue"); // 👈 AJOUTE ÇA
            return res.status(400).json({ message: "une photo au minimun est requise" });
        }

        // si on veux limiteur le nombre de photos 
        
        if(req.files.length> 5){
            console.log("Nombre de photos reçues:", req.files.length); // 👈 AJOUTE ÇA
            return res.status(400).json({ message: "Un maximum de 5 photos sont permises"});
        }
        

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

        console.log("ID de l'animal créé:", requete); // 👈 AJOUTE ÇA
        

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

export async function getPhotosOfAnimalControlleur(req, res) {
    try {
        const { id } = req.params;

        console.log("ID reçu:", id); // 👈 AJOUTE ÇA

        const photos = await getAnimalPhotosById(id);

        //console.log("Photos trouvées:", photos); // 👈 ET ÇA

        /*if (!photos || photos.length === 0) {
            return res.status(404).json({ message: "Aucune photo trouvée pour cet animal" });
        }*/

        res.status(200).json(photos ?? []);

    } catch (error) {
        console.error("Erreur lors de la récupération des photos:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getCaracteristiquesOfAnimalIdControlleur(req, res) {
    try {
        const { id } = req.params;
        const animal = await getAnimalById(id);
        if (!animal) {
            return res.status(404).json({ message: "Animal non trouvé" });
        }
        const caracteristiques = await getCaracteristiquesByAnimalId(id);
        /*if (!caracteristiques || caracteristiques.length === 0) {
            return res.status(404).json({ message: "Aucune caractéristique trouvée pour cet animal" });
        }*/
        res.status(200).json(caracteristiques ?? []);
    } catch (error) {
        console.error("Erreur lors de la récupération des caractéristiques:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

 export async function getAnimalsPossessionControlleur(req, res) {
    try {
        const { id } = req.params;
        const animal = await getAnimalById(id);
        if (!animal) {
            return res.status(404).json({ message: "Animal non trouvé" });
        }
        const possessions = await getAnimalsPossession(id);
        /*if (!possessions || possessions.length === 0) {
            return res.status(404).json({ message: "Aucune possession trouvée pour cet animal" });
        }*/
        res.status(200).json(possessions ?? []);
    } catch (error) {
        console.error("Erreur lors de la récupération des possessions:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}