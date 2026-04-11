import { createProduit, deleteProduit, getAllProduits, getProduitById, updateProduit } from "../database/produit.db.js";
import { getRefugeById} from "../database/refuge.db.js"
import { getSousCommandeById } from "../database/sous_commande.db.js";

export async function createProduitControlleur(req,res) {
    try {
        const { IdRefuge,Nom,Prix,Stock,Disponibilite } = req.body;

        const prix = Number(Prix);
        const stock = Number(Stock);

        if (
            IdRefuge == null ||
            !Nom ||
            !Number.isFinite(prix) || prix < 0 ||
            !Number.isInteger(stock) || stock < 0 ||
            Disponibilite == null
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createProduit({
            IdRefuge,
            Nom,
            Prix: prix,
            Stock: stock,
            Disponibilite 
        })

        res.status(201).json({ message: "Produit crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la produit:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateProduitControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdRefuge,Nom,Prix,Stock,Disponibilite } = req.body;
        const produit = await getProduitById(id);
        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvée" });
        }
        await updateProduit( id ,{
            IdRefuge,
            Nom,
            Prix,
            Stock,
            Disponibilite
        })
        
        res.status(200).json({ message: "Produit modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la produit:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteProduitControlleur(req,res) {
    try {
        const { id } = req.params;
        const produit = await getProduitById(id);
        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvée" });
        }
        await deleteProduit(id);
        res.status(200).json({ message: "Produit supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la produit:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProduitControlleur(req,res) {
    try {
        const { id } = req.params;
        const produit = await getProduitById(id);
        if(!produit){
            return res.status(404).json({message:"Produit non trouvée"})
        }
        res.status(200).json(produit);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la produit:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllProduitsControlleur(req,res) {
    try {
        const produits = await getAllProduits();
        res.status(200).json(produits);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des produits:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getRefugeOfProduitControlleur(req,res) {
    try {
        const { Refuge } = req.params;
        const refuge = await getRefugeById(Refuge);
        if (!refuge) {
            return res.status(404).json({ message: "Produit a un refuge inexistant !(non trouvé)" });
        }
        res.status(200).json(refuge);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}