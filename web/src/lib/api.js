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

    // 🔹 récupérer un utilisateur par son Id (pas clerkId)
    getSpecific : async (id) => {
        const { data } = await axiosInstance.get(`/utilisateurs/${id}`);
        return data;
    },

    // 🔹 récupérer tous les utilisateurs
    getAll : async () => {
        const { data } = await axiosInstance.get("/utilisateurs");
        return data;
    },

    // 🔹 créer un utilisateur
    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/utilisateurs", formData)
        return data;
    },

    // 🔹 modifier un utilisateur
    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/utilisateurs/${id}`, formData)
        return data;
    },

    // 🔹 supprimer un utilisateur
    delete: async (utilisateurId) => {
        const { data } = await axiosInstance.delete(`/utilisateurs/${utilisateurId}`);
        return data;
    },
}

/*
========================================================
🐾 ANIMAUX
========================================================
*/
export const animalApi = {

    // ⚠️ normalement devrait prendre un id
    getSpecific : async (id) => {
        const { data } = await axiosInstance.get(`/animaux/${id}`);
        return data;
    },

    // 🔹 récupérer tous les animaux
    getAll : async () => {
        const { data } = await axiosInstance.get("/animaux");
        return data;
    },

    // 🔹 créer un animal
    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/animaux", formData)
        return data;
    },

    // 🔹 modifier un animal
    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/animaux/${id}`, formData)
        return data;
    },

    // 🔹 supprimer un animal
    delete: async (animalId) => {
        const { data } = await axiosInstance.delete(`/animaux/${animalId}`);
        return data;
    },
}

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

    getSpecific : async () => {
        const { data } = await axiosInstance.get(`/races/${id}`);
        return data;
    },

    getAll : async () => {
        const { data } = await axiosInstance.get("/races");
        return data;
    },

    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/races", formData)
        return data;
    },

    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/races/${id}`, formData)
        return data;
    },

    delete: async (raceId) => {
        const { data } = await axiosInstance.delete(`/races/${raceId}`);
        return data;
    },
}

/*
========================================================
🏠 REFUGES
========================================================
*/
export const refugeApi = {

    getSpecific : async () => {
        const { data } = await axiosInstance.get(`/refuges/${id}`);
        return data;
    },

    getAll : async () => {
        const { data } = await axiosInstance.get("/refuges");
        return data;
    },

    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/refuges", formData)
        return data;
    },

    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/refuges/${id}`, formData)
        return data;
    },

    delete: async (refugeId) => {
        const { data } = await axiosInstance.delete(`/refuges/${refugeId}`);
        return data;
    },
}

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
💀 MESSAGE POUR LE FUTUR
========================================================

Si tu lis ça :

- ne casse pas les routes sans vérifier le backend
- respecte la structure (copier/coller propre)
- teste toujours après modif

Sinon bonne chance 🫡
*/