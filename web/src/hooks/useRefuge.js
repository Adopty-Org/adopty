// frontend/src/hooks/useRefuge.js

import { useQueries, useQuery } from "@tanstack/react-query"
import { refugeApi } from "../lib/api"
import { useMemo } from "react"
import { useAnimals, useAnimalsOfRefuge } from "./useAnimal"

export const useRefuges = () => {
    const { animalMap } = useAnimals(); // animalMap: Map<animalId, animal>

    const { data: RefugesData, isLoading: RefugesLoading, isError, error } = useQuery({
        queryKey: ["refuges"],
        queryFn: refugeApi.getAll,
    });

    // 1. Charger les LISTES d'IDs d'animaux pour chaque refuge
    const animalsIdsByRefugeQueries = useQueries({
        queries: (RefugesData ?? []).map(refuge => ({
            queryKey: ["animaux", refuge?.Id, "animalIds"],
            queryFn: () => refugeApi.getAnimalsByRefuge(refuge?.Id), // Retourne [1, 2, 3...]
            enabled: !!refuge?.Id,
        }))
    });


    console.log("animalsqueries", animalsIdsByRefugeQueries.map(q => q.data))

    // 2. Construire les refuges avec leurs animaux complets
    const refuges = useMemo(() => {
        const refugeRaw = RefugesData ?? [];
        
        return refugeRaw.map((refuge, index) => {
            // Récupérer la liste des IDs d'animaux pour ce refuge
            const animalIds = animalsIdsByRefugeQueries[index]?.data ?? [];
            console.log("animalsId : ", animalIds)
            
            // Utiliser animalMap pour obtenir les détails de chaque animal
            const animals = animalIds
                .map(animalId => animalMap.get(animalId.Id))  // Récupérer l'animal par son ID
                .filter(animal => animal !== undefined);   // Enlever les undefined
            //const animals = animalsIdsByRefugeQueries[index]?.data ?? [];
            
            return {
                ...refuge,
                animals: animals
            };
        });
    }, [RefugesData, animalsIdsByRefugeQueries, animalMap]);

    const refugeMap = useMemo(
        () => new Map(refuges?.map(r => [r.Id, r])) ?? new Map(),
        [refuges]
    );

    return { RefugesData, RefugesLoading, isError, error, refugeMap, refuges };
};

export const useRefuge = (id) => {
    const {refugeMap, RefugesLoading} = useRefuges();

    // ✅ Convertir l'ID en nombre si nécessaire
    const refugeId = id ? (typeof id === 'string' ? parseInt(id, 10) : id) : null;
    
    // ✅ Attendre que le chargement soit terminé avant d'accéder à la map
    const refuge = !RefugesLoading && refugeId ? refugeMap.get(refugeId) : undefined;

    console.log("le ref :  ", refuge)

    return {refuge , RefugesLoading}
}

export const useRefugeByAnimal = (id) => {
    const { refuges, RefugesLoading, isError, error } = useRefuges();

    // ✅ Convertir l'ID en nombre si nécessaire
    const animalId = id ? (typeof id === 'string' ? parseInt(id, 10) : id) : null;
    
    const refuge = useMemo(() => {
        if (!refuges || !animalId) return null;
        
        // Chercher le refuge qui contient l'animal avec l'ID spécifié
        return refuges.find(refuge => 
            refuge.animals?.some(animal => animal?.Id === animalId)
        ) || null;
    }, [refuges, animalId]);

    console.log("voila le refuge : ", refuge?.Id)
    
    return { 
        refuge, 
        RefugesLoading,
        isError,
        error 
    };
}