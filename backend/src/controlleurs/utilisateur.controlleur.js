import { addAnimalToUtilisateurByIds, addRefugeToUtilisateurByIds, addRoleToUtilisateurByIds, createUtilisateur, deleteUtilisateur, getAllUtilisateurs, getUtilisateurAnimalsById, getUtilisateurByClerkId, getUtilisateurById, getUtilisateurRefugesById, getUtilisateurRolesById, removeAnimalFromUtilisateurByIds, removeRefugeToUtilisateurByIds, removeRoleToUtilisateurByIds, setAnimalToUtilisateurByIds, unsetAnimalToUtilisateurByIds, updateUtilisateur } from "../database/utilisateur.db.js";

export async function createAccountControlleur(req,res) {// pas utilisable je crois
    try {
        const { clerkId, stripeCustomerId, stripeAccountId, Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, CreePar, stripeAccountStatus } = req.body;

        if(!Nom || !Prenom || !Addresse ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createUtilisateur({
            clerkId, 
            stripeCustomerId, 
            stripeAccountId,
            Nom, 
            Prenom, 
            Addresse, 
            AddresseEmail, 
            Wilaya, 
            MotDePasse, 
            Photo, 
            CreePar,  
            stripeAccountStatus
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
        const { Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, ModifieePar, stripeAccountStatus, stripeAccountId } = req.body;
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
            ModifieePar,
            stripeAccountStatus,
            stripeAccountId
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

// controlleurs speciales

export async function getUtilisateurByClerkIdControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await getUtilisateurByClerkId(id);
        if (!utilisateur){
            res.status(404).json({ message: "Pas d'utilisateurs avec ce clerkId!"});
        }
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurRolesByIdControlleur (req,res) {
    try {
        const { id } = req.params;
        const roles = await getUtilisateurRolesById(id);
        if (!roles){
            res.status(404).json({ message: "Pas d'roles pour cet utilisateur!"});
        }
        
        res.status(200).json(roles)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addRoleToUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await addRoleToUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeRoleToUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await removeRoleToUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurRefugesByIdControlleur (req,res) {
    try {
        const { id } = req.params;
        const refuge = await getUtilisateurRefugesById(id);
        if (!refuge){
            res.status(404).json({ message: "Pas d'refuges avec ce clerkId!"});
        }
        
        res.status(200).json(refuge)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addRefugeToUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await addRefugeToUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeRefugeToUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await removeRefugeToUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurAnimalsByIdControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await getUtilisateurAnimalsById(id);
        if (!utilisateur){
            res.status(404).json({ message: "Pas d'utilisateurs avec ce clerkId!"});
        }
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addAnimalToUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await addAnimalToUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeAnimalFromUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await removeAnimalFromUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function setAnimalToUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await setAnimalToUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function unsetAnimalToUtilisateurByIdsControlleur (req,res) {
    try {
        const { id } = req.params;
        const utilisateur = await unsetAnimalToUtilisateurByIds(id);
        
        
        res.status(200).json(utilisateur)

    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}