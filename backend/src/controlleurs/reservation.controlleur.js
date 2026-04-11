import { getAnimalById } from "../database/animal.db.js";
import { getAnnonceById } from "../database/annonce.db.js";
import { getProfilPrestataireById } from "../database/profil_prestataire.db.js";
import { createReservation, deleteReservation, getAllReservations, getReservationById, updateReservation } from "../database/reservation.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getTypeServiceById } from "../database/type_service.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createReservationControlleur(req,res) {
    try {
        const { IdUtilisateur,IdProfil,IdAnimal,IdAnnonce,TypeService,DateDebut,DateFin,Statut,PrixFinal,Notes } = req.body;

        if(!IdUtilisateur || !IdAnimal && !IdAnnonce || !TypeService){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createReservation({
            IdUtilisateur,
            IdProfil,
            IdAnimal,
            IdAnnonce,
            TypeService, 
            DateDebut, 
            DateFin, 
            Statut, 
            PrixFinal,
            Notes
        })

        res.status(201).json({ message: "Reservation crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la reservation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateReservationControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdUtilisateur,IdProfil,IdAnimal,IdAnnonce,TypeService, DateDebut, DateFin, Statut,PrixFinal,Notes } = req.body;
        const reservation = await getReservationById(id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation non trouvée" });
        }
        await updateReservation( id ,{
            IdUtilisateur,
            IdProfil,
            IdAnimal,
            IdAnnonce,
            TypeService,
            DateDebut, 
            DateFin, 
            Statut, 
            PrixFinal,
            Notes
        })
        
        res.status(200).json({ message: "Reservation modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la reservation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteReservationControlleur(req,res) {
    try {
        const { id } = req.params;
        const reservation = await getReservationById(id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation non trouvée" });
        }
        await deleteReservation(id);
        res.status(200).json({ message: "Reservation supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la reservation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getReservationControlleur(req,res) {
    try {
        const { id } = req.params;
        const reservation = await getReservationById(id);
        if(!reservation){
            return res.status(404).json({message:"Reservation non trouvée"})
        }
        res.status(200).json(reservation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la reservation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllReservationsControlleur(req,res) {
    try {
        const reservations = await getAllReservations();
        res.status(200).json(reservations);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des reservations:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getAnimalOfReservationControlleur(req,res) {
    try {
        const { Animal } = req.params;
        const animal = await getAnimalById(Animal);
        if (!animal) {
            return res.status(404).json({ message: "Reservation a un animal inexistant !(non trouvé)" });
        }
        res.status(200).json(animal);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnnonceOfReservationControlleur(req,res) {
    try {
        const { Annonce } = req.params;
        const annonce = await getAnnonceById(Annonce);
        if (!annonce) {
            return res.status(404).json({ message: "Reservation a un annonce inexistant !(non trouvé)" });
        }
        res.status(200).json(annonce);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProfilPrestataireOfReservationControlleur(req,res) {
    try {
        const { ProfilPrestataire } = req.params;
        const profil_prestataire = await getProfilPrestataireById(ProfilPrestataire);
        if (!profil_prestataire) {
            return res.status(404).json({ message: "Reservation a un profil_prestataire inexistant !(non trouvé)" });
        }
        res.status(200).json(profil_prestataire);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfReservationControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "Reservation a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getTypeServiceOfReservationControlleur(req,res) {
    try {
        const { TypeService } = req.params;
        const type_service = await getTypeServiceById(TypeService);
        if (!type_service) {
            return res.status(404).json({ message: "Reservation a un type_service inexistant !(non trouvé)" });
        }
        res.status(200).json(type_service);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurOfReservationControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Reservation a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}