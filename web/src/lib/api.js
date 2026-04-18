//import { get } from "http";
import axiosInstance from "./axios"

/*
========================================================
📡 FICHIER API FRONTEND
========================================================

👉 Ce fichier centralise toutes les requêtes vers le backend.

💡 Pourquoi ?
- éviter de répéter axios partout
- garder un code propre et organisé
- faciliter les modifications (changer URL, headers, etc.)

⚠️ IMPORTANT :
- Toujours passer par ces fonctions (NE PAS utiliser axios directement ailleurs)
- Si vous modifiez une route backend → modifiez ici aussi

📦 Structure :
1 bloc = 1 entité backend (utilisateur, animal, etc.)
Chaque bloc contient (fonctions ordinaires) :
- getAll     → récupérer tout
- getSpecific→ récupérer 1 élément
- create     → créer
- update     → modifier
- delete     → supprimer

========================================================
*/

export const utilisateurApi = {

    // =========================
    // 🔹 CRUD utilisateur
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/utilisateurs/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/utilisateurs");
        return data;
    },

    create: async (formData) => {
        const { data } = await axiosInstance.post("/utilisateurs", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/utilisateurs/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/utilisateurs/${id}`);
        return data;
    },

    // =========================
    // 🔹 Infos liées à l'utilisateur
    // =========================

    getAnimals: async (id) => {
        const { data } = await axiosInstance.get(`/utilisateurs/animaux/${id}`);
        return data;
    },

    getRefuges: async (id) => {
        const { data } = await axiosInstance.get(`/utilisateurs/refuges/${id}`);
        return data;
    },

    getRoles: async (id) => {
        const { data } = await axiosInstance.get(`/utilisateurs/roles/${id}`);
        return data;
    },

    getByClerkId: async (id) => {
        const { data } = await axiosInstance.get(`/utilisateurs/clerk/${id}`);
        return data;
    },

    // =========================
    // 🔹 Gestion des animaux
    // =========================

    addAnimal: async (id, payload) => {
        const { data } = await axiosInstance.post(`/utilisateurs/animal/${id}`, payload);
        return data;
    },

    removeAnimal: async (id) => {
        const { data } = await axiosInstance.delete(`/utilisateurs/animal/${id}`);
        return data;
    },

    setAnimal: async (id) => {
        const { data } = await axiosInstance.put(`/utilisateurs/animal/set/${id}`);
        return data;
    },

    unsetAnimal: async (id) => {
        const { data } = await axiosInstance.put(`/utilisateurs/animal/unset/${id}`);
        return data;
    },

    // =========================
    // 🔹 Gestion des refuges
    // =========================

    addRefuge: async (id, payload) => {
        const { data } = await axiosInstance.post(`/utilisateurs/refuge/${id}`, payload);
        return data;
    },

    removeRefuge: async (id) => {
        const { data } = await axiosInstance.delete(`/utilisateurs/refuge/${id}`);
        return data;
    },

    // =========================
    // 🔹 Gestion des rôles (ADMIN)
    // =========================

    addRole: async (id, payload) => {
        const { data } = await axiosInstance.post(`/utilisateurs/role/${id}`, payload);
        return data;
    },

    removeRole: async (id) => {
        const { data } = await axiosInstance.delete(`/utilisateurs/role/${id}`);
        return data;
    },
};

/*
========================================================
🐾 ANIMAUX
========================================================
*/
export const animalApi = {

    // =========================
    // 🔹 CRUD animal (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/animaux", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/animaux/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/animaux/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/animaux/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/animaux");
        return data;
    },

    // =========================
    // 🔹 Recherche
    // =========================

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(`/animaux/statut/${statut}`);
        return data;
    },

    getByRace: async (race) => {
        const { data } = await axiosInstance.get(`/animaux/race/${race}`);
        return data;
    },

    getPhotos: async (photo) => {
        const { data } = await axiosInstance.get(`/animaux/${photo}/photos`);
        return data;
    },

    getCaracteristiques: async (id) => {
        const { data } = await axiosInstance.get(`/animaux/caracteristiques/${id}`);
        return data;
    },
};

/*
========================================================
🧬 ESPECES
========================================================
*/
export const especeApi = {

    getSpecific : async (id) => {
        const { data } = await axiosInstance.get(`/especes/${id}`);
        return data;
    },

    getAll : async () => {
        const { data } = await axiosInstance.get("/especes");
        return data;
    },

    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/especes", formData)
        return data;
    },

    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/especes/${id}`, formData)
        return data;
    },

    delete: async (especeId) => {
        const { data } = await axiosInstance.delete(`/especes/${especeId}`);
        return data;
    },
}

/*
========================================================
🐕 RACES
========================================================
*/
export const raceApi = {

    // =========================
    // 🔹 CRUD (ADMIN ONLY)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/races", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/races/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/races/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/races/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/races");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByEspece: async (espece) => {
        const { data } = await axiosInstance.get(
            `/races/espece/${espece}`
        );
        return data;
    },

    getCaracteristiques: async (id) => {
        const { data } = await axiosInstance.get(`/races/caracteristiques/${id}`);
        return data;
    },

};

/*
========================================================
🏠 REFUGES
========================================================
*/
export const refugeApi = {

    // =========================
    // 🔹 CRUD (refuge only)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/refuges", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/refuges/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/refuges/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/refuges/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/refuges");
        return data;
    },

    getAnimalsByRefuge: async (id) => {
        const { data } = await axiosInstance.get(
            `/refuges/animaaux/${id}`
        );
        return data;
    },

    // =========================
    // 🔹 Gestion animaux (refuge only)
    // =========================

    addAnimal: async (id, payload) => {
        const { data } = await axiosInstance.post(
            `/refuges/ajout_animal/${id}`,
            payload
        );
        return data;
    },

    removeAnimal: async (id) => {
        const { data } = await axiosInstance.delete(
            `/refuges/supprime_animal/${id}`
        );
        return data;
    },

    setAnimal: async (id, payload) => {
        const { data } = await axiosInstance.put(
            `/refuges/set_animal/${id}`,
            payload
        );
        return data;
    },

    unsetAnimal: async (id, payload) => {
        const { data } = await axiosInstance.put(
            `/refuges/unset_animal/${id}`,
            payload
        );
        return data;
    },
};

/*
========================================================
🛡️ ROLES
========================================================
*/
export const roleApi = {

    getSpecific : async () => {
        const { data } = await axiosInstance.get(`/roles/${id}`);
        return data;
    },

    getAll : async () => {
        const { data } = await axiosInstance.get("/roles");
        return data;
    },

    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/roles", formData)
        return data;
    },

    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/roles/${id}`, formData)
        return data;
    },

    delete: async (roleId) => {
        const { data } = await axiosInstance.delete(`/roles/${roleId}`);
        return data;
    },
}

/*
========================================================
🛡️ ANNONCES
========================================================
*/
export const annonceApi = {

    // =========================
    // 🔹 CRUD annonce (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/annonces", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/annonces/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/annonces/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/annonces/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/annonces");
        return data;
    },

    // =========================
    // 🔹 Filtres / recherches
    // =========================

    getByTypeService: async (typeService) => {
        const { data } = await axiosInstance.get(`/annonces/type_service/${typeService}`);
        return data;
    },

    getByAnimal: async (animal) => {
        const { data } = await axiosInstance.get(`/annonces/animal/${animal}`);
        return data;
    },

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(`/annonces/utilisateur/${utilisateur}`);
        return data;
    },

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(`/annonces/statut/${statut}`);
        return data;
    },
};

/*
========================================================
🛡️ AVISSERVICES
========================================================
*/
export const avisServiceApi = {

    // =========================
    // 🔹 CRUD avis service (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/avis-services", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/avis-services/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/avis-services/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/avis-services/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/avis-services");
        return data;
    },

    // =========================
    // 🔹 Filtres / recherches
    // =========================

    getByTypeAvis: async (typeService) => {
        const { data } = await axiosInstance.get(`/avis-services/type_avis/${typeService}`);
        return data;
    },

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(`/avis-services/utilisateur/${utilisateur}`);
        return data;
    },

    getByReservation: async (reservation) => {
        const { data } = await axiosInstance.get(`/avis-services/reservation/${reservation}`);
        return data;
    },
};

/*
========================================================
🛡️ AVIS
========================================================
*/
export const avisApi = {

    // =========================
    // 🔹 CRUD avis (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/avis", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/avis/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/avis/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/avis/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/avis");
        return data;
    },

    // =========================
    // 🔹 Filtres / recherches
    // =========================

    getBySousCommande: async (sousCommande) => {
        const { data } = await axiosInstance.get(`/avis/sous_commande/${sousCommande}`);
        return data;
    },

    getByProduit: async (produit) => {
        const { data } = await axiosInstance.get(`/avis/produit/${produit}`);
        return data;
    },

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(`/avis/utilisateur/${utilisateur}`);
        return data;
    },
};

/*
========================================================
🛡️ COMMANDES
========================================================
*/
export const commandeApi = {

    // =========================
    // 🔹 CRUD commande (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/commandes", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/commandes/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/commandes/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/commandes/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/commandes");
        return data;
    },

    // =========================
    // 🔹 Filtres (protégé)
    // =========================

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(`/commandes/statut/${statut}`);
        return data;
    },

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(`/commandes/utilisateur/${utilisateur}`);
        return data;
    },
};

/*
========================================================
🛡️ CONVERSATIONPARTICIPANT
========================================================
*/
export const conversationParticipantApi = {

    // =========================
    // 🔹 CRUD (non protégé explicitement ici)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/conversation-participants", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/conversation-participants/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/conversation-participants/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/conversation-participants/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/conversation-participants");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByConversation: async (conversation) => {
        const { data } = await axiosInstance.get(
            `/conversation-participants/conversation/${conversation}`
        );
        return data;
    },

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(
            `/conversation-participants/statut/${statut}`
        );
        return data;
    },
};

/*
========================================================
🛡️ CONVERSATION
========================================================
*/
export const conversationApi = {

    // =========================
    // 🔹 CRUD conversation
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/conversations", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/conversations/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/conversations/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/conversations/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/conversations");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(
            `/conversations/utilisateur/${utilisateur}`
        );
        return data;
    },
};

/*
========================================================
🛡️ DISPONIBILITE
========================================================
*/
export const disponibiliteApi = {

    // =========================
    // 🔹 CRUD (prestataire only)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/disponibilites", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/disponibilites/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/disponibilites/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/disponibilites/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/disponibilites");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByProfilPrestataire: async (profilId) => {
        const { data } = await axiosInstance.get(
            `/disponibilites/profil_prestataire/${profilId}`
        );
        return data;
    },
};


/*
========================================================
🛡️ LIGNECOMMANDES
========================================================
*/
export const ligneCommandeApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/ligne-commandes", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/ligne-commandes/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/ligne-commandes/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/ligne-commandes/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/ligne-commandes");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByProduit: async (produit) => {
        const { data } = await axiosInstance.get(
            `/ligne-commandes/produit/${produit}`
        );
        return data;
    },

    getBySousCommande: async (sousCommande) => {
        const { data } = await axiosInstance.get(
            `/ligne-commandes/sous_commande/${sousCommande}`
        );
        return data;
    },
};

/*
========================================================
🛡️ LIGNEPANIER
========================================================
*/
export const lignePanierApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/ligne-paniers", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/ligne-paniers/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/ligne-paniers/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/ligne-paniers/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/ligne-paniers");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByProduit: async (produit) => {
        const { data } = await axiosInstance.get(
            `/ligne-paniers/produit/${produit}`
        );
        return data;
    },

    getByPanier: async (panier) => {
        const { data } = await axiosInstance.get(
            `/ligne-paniers/panier/${panier}`
        );
        return data;
    },
};

/*
========================================================
🛡️ LIGNEWISHLIST
========================================================
*/
export const ligneWishlistApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/ligne-wishlists", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/ligne-wishlists/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/ligne-wishlists/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/ligne-wishlists/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/ligne-wishlists");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByProduit: async (produit) => {
        const { data } = await axiosInstance.get(
            `/ligne-wishlists/produit/${produit}`
        );
        return data;
    },

    getByWishlist: async (wishlist) => {
        const { data } = await axiosInstance.get(
            `/ligne-wishlists/wishlist/${wishlist}`
        );
        return data;
    },
};

/*
========================================================
🛡️ LIVRAISONS
========================================================
*/
export const livraisonApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/livraisons", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/livraisons/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/livraisons/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/livraisons/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/livraisons");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(`/livraisons/statut/${statut}`);
        return data;
    },

    getBySousCommande: async (sousCommande) => {
        const { data } = await axiosInstance.get(
            `/livraisons/sous_commande/${sousCommande}`
        );
        return data;
    },
};

/*
========================================================
🛡️ MESSAGESREAD
========================================================
*/
export const messageReadApi = {

    // =========================
    // 🔹 CRUD
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/message-reads", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/message-reads/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/message-reads/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/message-reads/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/message-reads");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByMessage: async (messageId) => {
        const { data } = await axiosInstance.get(
            `/message-reads/message/${messageId}`
        );
        return data;
    },

    getByUtilisateur: async (utilisateurId) => {
        const { data } = await axiosInstance.get(
            `/message-reads/utilisateur/${utilisateurId}`
        );
        return data;
    },
};

/*
========================================================
🛡️ MESSAGES
========================================================
*/
export const messageApi = {

    // =========================
    // 🔹 CRUD message
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/messages", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/messages/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/messages/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/messages/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/messages");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByConversation: async (conversationId) => {
        const { data } = await axiosInstance.get(
            `/messages/conversation/${conversationId}`
        );
        return data;
    },

    getBySenderId: async (senderId) => {
        const { data } = await axiosInstance.get(
            `/messages/sender_id/${senderId}`
        );
        return data;
    },
};

/*
========================================================
🛡️ PAIEMENTCOMMANDES
========================================================
*/
export const paiementCommandeApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/paiement-commandes", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/paiement-commandes/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/paiement-commandes/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/paiement-commandes/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/paiement-commandes");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(
            `/paiement-commandes/statut/${statut}`
        );
        return data;
    },

    getByCommande: async (commande) => {
        const { data } = await axiosInstance.get(
            `/paiement-commandes/commande/${commande}`
        );
        return data;
    },
};

/*
========================================================
🛡️ PAIEMENTSERVICES
========================================================
*/
export const paiementServiceApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/paiement-services", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/paiement-services/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/paiement-services/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/paiement-services/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/paiement-services");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByReservation: async (reservation) => {
        const { data } = await axiosInstance.get(
            `/paiement-services/reservation/${reservation}`
        );
        return data;
    },

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(
            `/paiement-services/statut/${statut}`
        );
        return data;
    },
};

/*
========================================================
🛡️ PAIEMENTSERVICES
========================================================
*/
export const panierApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/paniers", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/paniers/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/paniers/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/paniers/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/paniers");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(
            `/paniers/utilisateur/${utilisateur}`
        );
        return data;
    },
};

/*
========================================================
🛡️ PAIEMENTS
========================================================
*/
export const produitApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/produits", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/produits/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/produits/${id}`);
        return data;
    },

    addMateriaux: async (id, materiauxId) => {
        const { data } = await axiosInstance.post(`/produits/materiaux/ajout/${id}/${materiauxId}`);
        return data;
    },

    removeMateriaux: async (id, materiauxId) => {
        const { data } = await axiosInstance.delete(`/produits/materiaux/supprime/${id}/${materiauxId}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/produits/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/produits");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByRefuge: async (refuge) => {
        const { data } = await axiosInstance.get(
            `/produits/refuge/${refuge}`
        );
        return data;
    },

    getPhotos: async (photo) => {
        const { data } = await axiosInstance.get(`/produits/${photo}/photos`);
        return data;
    },

    getAllMateriaux: async (id) => {
        const { data } = await axiosInstance.get(`/produits/materiaux/${id}`);
        return data;
    },

    getSpecificMateriaux: async (id) => {
        const { data } = await axiosInstance.get(`/produits/materiaux/Ids/${id}`);
        return data;
    },
};

/*
========================================================
🛡️ PROFILPRESTATAIRES
========================================================
*/
export const profilPrestataireApi = {

    // =========================
    // 🔹 CRUD (prestataire only)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/profil-prestataires", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/profil-prestataires/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/profil-prestataires/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/profil-prestataires/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/profil-prestataires");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(
            `/profil-prestataires/statut/${statut}`
        );
        return data;
    },

    getByTypeService: async (typeService) => {
        const { data } = await axiosInstance.get(
            `/profil-prestataires/type_service/${typeService}`
        );
        return data;
    },

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(
            `/profil-prestataires/utilisateur/${utilisateur}`
        );
        return data;
    },
};

/*
========================================================
🛡️ RESERVATIONS
========================================================
*/
export const reservationApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/reservations", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/reservations/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/reservations/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture (protégé)
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/reservations/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/reservations");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(
            `/reservations/utilisateur/${utilisateur}`
        );
        return data;
    },

    getByTypeService: async (typeService) => {
        const { data } = await axiosInstance.get(
            `/reservations/type_service/${typeService}`
        );
        return data;
    },

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(
            `/reservations/statut/${statut}`
        );
        return data;
    },

    getByProfilPrestataire: async (profilPrestataire) => {
        const { data } = await axiosInstance.get(
            `/reservations/profil_prestataire/${profilPrestataire}`
        );
        return data;
    },

    getByAnnonce: async (annonce) => {
        const { data } = await axiosInstance.get(
            `/reservations/annonce/${annonce}`
        );
        return data;
    },

    getByAnimal: async (animal) => {
        const { data } = await axiosInstance.get(
            `/reservations/animal/${animal}`
        );
        return data;
    },
};

/*
========================================================
🛡️ SIGNALEMENTS
========================================================
*/
export const signalementApi = {

    // =========================
    // 🔹 CRUD
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/signalements", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/signalements/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/signalements/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/signalements/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/signalements");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(
            `/signalements/utilisateur/${utilisateur}`
        );
        return data;
    },

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(
            `/signalements/statut/${statut}`
        );
        return data;
    },
};

/*
========================================================
🛡️ SOUSCOMMANDES
========================================================
*/
export const sousCommandeApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/sous-commandes", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/sous-commandes/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/sous-commandes/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/sous-commandes/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/sous-commandes");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByStatut: async (statut) => {
        const { data } = await axiosInstance.get(
            `/sous-commandes/statut/${statut}`
        );
        return data;
    },

    getByRefuge: async (refuge) => {
        const { data } = await axiosInstance.get(
            `/sous-commandes/refuge/${refuge}`
        );
        return data;
    },

    getByCommande: async (commande) => {
        const { data } = await axiosInstance.get(
            `/sous-commandes/commande/${commande}`
        );
        return data;
    },
};

/*
========================================================
🛡️ SPECIFICATIONS
========================================================
*/
export const specificationApi = {

    // =========================
    // 🔹 CRUD (ADMIN ONLY)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/specifications", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/specifications/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/specifications/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/specifications/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/specifications");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByProfilPrestataire: async (profilPrestataire) => {
        const { data } = await axiosInstance.get(
            `/specifications/profil_prestataire/${profilPrestataire}`
        );
        return data;
    },

    getByEspece: async (espece) => {
        const { data } = await axiosInstance.get(
            `/specifications/espece/${espece}`
        );
        return data;
    },
};

/*
========================================================
🛡️ STATUTS
========================================================
*/
export const statutApi = {

    // =========================
    // 🔹 CRUD (ADMIN ONLY)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/statuts", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/statuts/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/statuts/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/statuts/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/statuts");
        return data;
    },
};

/*
========================================================
🛡️ STRIPES
========================================================
*/
export const stripeApi = {

    // =========================
    // 🔹 Webhook (backend only normalement)
    // =========================
    webhook: async (payload) => {
        const { data } = await axiosInstance.post("/stripe/webhook", payload);
        return data;
    },

    // =========================
    // 🔹 Customer
    // =========================

    createCustomer: async (payload) => {
        const { data } = await axiosInstance.post("/stripe/customer", payload);
        return data;
    },

    // =========================
    // 🔹 Stripe Connect
    // =========================

    createRefugeAccount: async (refugeId) => {
        const { data } = await axiosInstance.post(
            `/stripe/connect/refuge/${refugeId}`
        );
        return data;
    },

    createPrestataireAccount: async (userId) => {
        const { data } = await axiosInstance.post(
            `/stripe/connect/prestataire/${userId}`
        );
        return data;
    },

    getAccountStatus: async (accountId) => {
        const { data } = await axiosInstance.get(
            `/stripe/connect/status/${accountId}`
        );
        return data;
    },

    // =========================
    // 🔹 Payments
    // =========================

    payProduct: async (payload) => {
        const { data } = await axiosInstance.post(
            "/stripe/payment/product",
            payload
        );
        return data;
    },

    payService: async (payload) => {
        const { data } = await axiosInstance.post(
            "/stripe/payment/service",
            payload
        );
        return data;
    },
};

/*
========================================================
🛡️ TYPESERVICES
========================================================
*/
export const typeServiceApi = {

    // =========================
    // 🔹 CRUD (ADMIN ONLY)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/type-services", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/type-services/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/type-services/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/type-services/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/type-services");
        return data;
    },
};

/*
========================================================
🛡️ VACCINS
========================================================
*/
export const vaccinApi = {

    // =========================
    // 🔹 CRUD (ADMIN ONLY)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/vaccins", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/vaccins/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/vaccins/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/vaccins/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/vaccins");
        return data;
    },
};

/*
========================================================
🛡️ WISHLISTS
========================================================
*/
export const wishlistApi = {

    // =========================
    // 🔹 CRUD (protégé)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/wishlists", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/wishlists/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/wishlists/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/wishlists/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/wishlists");
        return data;
    },

    // =========================
    // 🔹 Filtres
    // =========================

    getByUtilisateur: async (utilisateur) => {
        const { data } = await axiosInstance.get(
            `/wishlists/utilisateur/${utilisateur}`
        );
        return data;
    },
};


// le reste

export const caracteristiqueApi = {

    // =========================
    // 🔹 CRUD (ADMIN ONLY)
    // =========================

    create: async (formData) => {
        const { data } = await axiosInstance.post("/caracteristiques", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/caracteristiques/${id}`, formData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axiosInstance.delete(`/caracteristiques/${id}`);
        return data;
    },

    // =========================
    // 🔹 Lecture publique
    // =========================

    getSpecific: async (id) => {
        const { data } = await axiosInstance.get(`/caracteristiques/${id}`);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/caracteristiques");
        return data;
    },
};

/*
========================================================
💀 MESSAGE POUR LE FUTUR
========================================================

Si tu lis ça :

- ne casse pas les routes sans vérifier le backend
- respecte la structure (copier/coller propre)
- teste toujours après modif

Sinon bonne chance 🫡
*/