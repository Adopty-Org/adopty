import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import * as utiliDB from "../database/utilisateur.db.js"

export const ingest = new Inngest({ id : "AnyBuy"})

/*const syncUser = ingest.createFunction(
    { id : "sync-user"},
    {event : "clerk/user.created"},
    async ({ event }) => {
        await connectDB();
        //const { id, email_adresses, first_name, last_name, image_url } = event.data;
        const { id, email_addresses, first_name, last_name, image_url } = event.data;


        const newUser = {
            clerkId : id,
            stripeCustomerId : null,
            Nom : first_name || "",
            Prenom : last_name || "",
            Addresse : null,
            AddresseEmail : email_addresses?.[0]?.email_address,
            Wilaya : null,
            MotDePasse : null,
            CreePar : null,
            ModifieePar : null,
            
            Photo : image_url || "",
            
        }
        await utiliDB.createUtilisateur(newUser)
        //await User.create(newUser);
    }
)*/

//import { Inngest } from "inngest";
//import { connectDB } from "./db.js";
//import { db } from "../config/db.js";
//import * as utiliDB from "../database/utilisateur.db.js";
import * as refugeDB from "../database/refuge.db.js";
import * as prestataireDB from "../database/profil_prestataire.db.js";
import * as roleDB from "../database/role.db.js";

//export const ingest = new Inngest({ id: "AnyBuy" });

const syncUser = ingest.createFunction(
    { 
        id: "sync-user",
        name: "sync-user", 
        triggers: { event: "clerk/user.created" },
        
    },
    async ({ event }) => {
        await connectDB();
        
        // 1️⃣ Récupérer les données de base Clerk
        const { 
            id,                           // clerkId
            email_addresses, 
            first_name, 
            last_name, 
            image_url,
            unsafe_metadata               // 🔥 LES MÉTADONNÉES du frontend
        } = event.data;
        
        console.log("📥 Métadonnées reçues :", JSON.stringify(unsafe_metadata, null, 2));
        
        // 2️⃣ Extraire les infos des métadonnées
        const {
            prenom,
            nom,
            wilaya,
            adresse,
            email,
            role,                         // 'refuge', 'prestataire', ou 'utilisateur'
            refugeData,                   // { nomRefuge, siret, capacite, telephone }
            prestataireData               // { nomEntreprise, service, zone, tarifHoraire, experience }
        } = unsafe_metadata || {};
        
        // 3️⃣ Créer l'utilisateur dans la table Utilisateur
        const newUser = {
            clerkId: id,
            stripeCustomerId: null,
            stripeAccountId: null,
            Nom: prenom || first_name || "",
            Prenom: nom || last_name || "",
            Addresse: adresse || null,
            AddresseEmail: email || email_addresses?.[0]?.email_address,
            Wilaya: wilaya || null,
            MotDePasse: null,
            Photo: image_url || "",
            CreePar: null,
            stripeAccountStatus: null
        };
        
        const userId = await utiliDB.createUtilisateur(newUser);
        console.log("✅ Utilisateur créé, ID:", userId);
        
        // 4️⃣ Récupérer les IDs des rôles depuis la base
        const allRoles = await roleDB.getAllRoles();
        const roleMap = {};
        allRoles.forEach(r => {
            roleMap[r.Nom.toLowerCase()] = r.Id;
        });
        
        // Déterminer le rôle à attribuer
        let roleName = 'Utilisateur';
        if (role === 'Refuge') roleName = 'Refuge';
        if (role === 'Prestataire') roleName = 'Prestataire';
        
        const roleId = roleMap[roleName];
        
        if (roleId) {
            await utiliDB.addRoleToUtilisateurByIds(roleId, userId);
            console.log(`✅ Rôle "${roleName}" (ID: ${roleId}) attribué`);
        } else {
            console.warn(`⚠️ Rôle "${roleName}" non trouvé`);
        }
        
        // 5️⃣ Créer l'entrée spécifique selon le rôle
        if (role === 'Refuge' && refugeData) {
            // Créer le refuge
            const refuge = {
                Nom: refugeData.nomRefuge,
                Description: refugeData.descriptionRefuge,
                Addresse: adresse,
                AddresseGPS: null,
                Telephone: refugeData.telephone,
                stripeAccountId: null,
                stripeAccountStatus: null
            };
            
            const refugeId = await refugeDB.CreateRefuge(refuge);
            console.log("✅ Refuge créé, ID:", refugeId);
            
            // Lier l'utilisateur au refuge
            await utiliDB.addRefugeToUtilisateurByIds(refugeId, userId);
            console.log("✅ Utilisateur lié au refuge");
            
        } else if (role === 'Prestataire' && prestataireData) {
            // Mapping des services vers les IDs de ta table TypeService
            const serviceMapping = {
                'toilettage': 1,
                'education': 2,
                'pet-sitting': 3,
                'promenade': 4,
                'veterinaire': 5,
                // Aussi les valeurs possibles depuis le frontend
                'promenade': 4,
                'baby-sitting': 3,     // baby-sitting = pet-sitting
                'les-deux': null       // À gérer spécialement
            };
            
            let typeServiceId = null;
            
            // Gérer le cas "les-deux" (promenade + baby-sitting)
            if (prestataireData.service === 'les-deux') {
                // Option 1: Créer une entrée avec un service générique
                // Option 2: Créer deux entrées dans profil_prestataire ?
                // Pour l'instant, on met promenade (4) par défaut
                typeServiceId = 4;
                console.log("⚠️ Service 'les-deux' → mapping vers promenade (ID:4)");
            } else {
                // Mapping direct
                typeServiceId = serviceMapping[prestataireData.service?.toLowerCase()];
            }
            
            if (!typeServiceId) {
                console.warn(`⚠️ Service non reconnu: ${prestataireData.service}, utilisation de promenade (4) par défaut`);
                typeServiceId = 4;
            }
            
            const prestataire = {
                IdUtilisateur: userId,
                Experience: parseInt(prestataireData.experience) || 0,
                TarifHoraire: parseFloat(prestataireData.tarifHoraire) || 0,
                ZoneIntervention: prestataireData.zone,
                TypeService: typeServiceId,
                Statut: 'actif',
                Bio: null,
                NoteMoyenne: null
            };
            
            await prestataireDB.createProfilPrestataire(prestataire);
            console.log(`✅ Profil prestataire créé avec service ID: ${typeServiceId}`);
            
        } else {
            console.log(`👤 Utilisateur simple créé (rôle: ${role || 'Utilisateur'})`);
        }
        
        console.log("🎉 Synchronisation terminée !");
    }
);

/*const deleteUserFromDB = ingest.createFunction(
    { id: "delete-user-from-db" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        await connectDB();
        
        const { id } = event.data;
        let utilisateur = await utiliDB.getUtilisateurByClerkId(id);
        if (!utilisateur) {
            console.log(`Utilisateur ${id} non trouvé dans la base`);
            return;
        }
        
        console.log(`🗑️ Suppression de l'utilisateur ${utilisateur.Id}...`);
        await utiliDB.deleteUtilisateur(utilisateur.Id);
        console.log(`✅ Utilisateur ${id} supprimé`);
    }
);

export const functions = [syncUser, deleteUserFromDB];*/

const deleteUserFromDB = ingest.createFunction(
    {
        id : "delete-user-from-db",
        name: "delete-user-from-db", 
        triggers: { event: "clerk/user.deleted" },
    },
    async ({ event }) => {
        await connectDB();
        
        const { id } = event.data;
        let utilisateur = await utiliDB.getUtilisateurByClerkId(id);
        if (!utilisateur) return;
        await utiliDB.deleteUtilisateur(utilisateur.Id);
        
    }
)


export const functions = [syncUser, deleteUserFromDB]

/*import { Inngest } from "inngest";

export const ingest = new Inngest({ id: "test" });

const testFunction = ingest.createFunction(
  { id: "test-function" },
  { event: "test/event" },
  async () => {
    console.log("✅ Test function executed");
  }
);

export const functions = [testFunction];*/