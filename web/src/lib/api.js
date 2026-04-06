import axiosInstance from "./axios"

export const utilisateurApi = {
    getSpecific : async () => {
        const { data } = await axiosInstance.get("/products");
        return data;
    },

    getAll : async () => {
        const { data } = await axiosInstance.get("/utilisateurs");
        return data;
    },

    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/utilisateurs", formData)
        return data;
    },

    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/utilisateurs/${id}`, formData)
        return data;
    },

    delete: async (utilisateurId) => {
        const { data } = await axiosInstance.delete(`/utilisateurs/${utilisateurId}`);
        return data;
    },
}

export const animalApi = {
    getSpecific : async () => {
        const { data } = await axiosInstance.get("/animaux");
        return data;
    },

    getAll : async () => {
        const { data } = await axiosInstance.get("/animaux");
        return data;
    },

    create : async (formData) =>  {
        const { data } = await axiosInstance.post("/animaux", formData)
        return data;
    },

    update : async ({ id,formData }) =>  {
        const { data } = await axiosInstance.put(`/animaux/${id}`, formData)
        return data;
    },

    delete: async (animalId) => {
        const { data } = await axiosInstance.delete(`/animaux/${animalId}`);
        return data;
    },
}

export const especeApi = {
    getSpecific : async () => {
        const { data } = await axiosInstance.get("/especes");
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

export const raceApi = {
    getSpecific : async () => {
        const { data } = await axiosInstance.get("/races");
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

export const refugeApi = {
    getSpecific : async () => {
        const { data } = await axiosInstance.get("/refuges");
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

export const roleApi = {
    getSpecific : async () => {
        const { data } = await axiosInstance.get("/roles");
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
