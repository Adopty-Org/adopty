import { createUtilisateur, deleteUtilisateur, getAllUtilisateurs, getUtilisateurById, updateUtilisateur } from "../database/utilisateur.db.js";

export async function createAccountControlleur(req,res) {// pas utilisable je crois
    try {
        const { clerkId, stripeCustomerId, Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, CreePar } = req.body;

        if(!Nom || !Prenom || !Addresse ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createUtilisateur({
            clerkId, 
            stripeCustomerId, 
            Nom, 
            Prenom, 
            Addresse, 
            AddresseEmail, 
            Wilaya, 
            MotDePasse, 
            Photo, 
            CreePar  
        })

        res.status(201).json({ message: "Utilisateur crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateAccountControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, ModifieePar } = req.body;
        const utilisateur = await getUtilisateurById(id);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        await updateUtilisateur( id ,{
            Nom, 
            Prenom, 
            Addresse, 
            AddresseEmail, 
            Wilaya, 
            MotDePasse, 
            Photo, 
            ModifieePar
        })
        
        res.status(200).json({ message: "Utilisateur modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAccountControlleur(req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await getUtilisateurById(id);
        if(!utilisateur){
            return res.status(404).json({ message : "Utilisateur non trouvé"})
        };
        await deleteUtilisateur(id);
        res.status(200).json({message : "Utilisateur supprimé avec succès"});
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAccountControlleur(req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await getUtilisateurById(id);
        if(!utilisateur){
            return res.status(404).json({message:"Utilisateur non trouvé"})
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAccountsControlleur(req,res) {
    try {
        const utilisateurs = await getAllUtilisateurs();
        res.status(200).json(utilisateurs)
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}