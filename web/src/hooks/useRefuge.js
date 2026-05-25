// frontend/src/hooks/useRefuge.js

import { useQueries, useQuery } from "@tanstack/react-query"
import { refugeApi } from "../lib/api"
import { useMemo } from "react"
import { useAnimals, useAnimalsOfRefuge } from "./useAnimal"
import { useProduits } from "./useProduit";
import { useDemandeAdoptions } from "./useDemandeAdoption";
import { useDemandeTransfertsByRefugeCible } from "./useDemandeTransfert";
import { useSousCommandes } from "./useSousCommande";

export const useRefuges = () => {
    const { animalMap, isLoading:AnimalLoading } = useAnimals(); // animalMap: Map<animalId, animal>
    const { produitMips, isLoading: ProduitLoading } = useProduits()
    //const { DemandeAdoptionsLoading, demandesByRefuge: DemandesAdoption } = useDemandeAdoptions(utilisateurMap)
    //const { DemandeTransfertsCibleLoading, demandeTransfertCibleByRefuge: DemandesTransfert } = useDemandeTransfertsByRefugeCible()

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


    //console.log("animalsqueries", animalsIdsByRefugeQueries.map(q => q.data))

    // 2. Construire les refuges avec leurs animaux complets
    const refuges = useMemo(() => {
        const refugeRaw = RefugesData ?? [];
        
        return refugeRaw.map((refuge, index) => {
            // Récupérer la liste des IDs d'animaux pour ce refuge
            const animalIds = animalsIdsByRefugeQueries[index]?.data ?? [];
            //console.log("animalsId : ", animalIds)
            const produits = produitMips.get(refuge?.Id) ?? []
            //const demandesAdoption = DemandesAdoption.get(refuge?.Id) ?? []
            //const demandesTransfert = DemandesTransfert.get(refuge?.Id) ?? []
            
            // Utiliser animalMap pour obtenir les détails de chaque animal
            //const animals = animalIds
                //.map(animalId => animalMap.get(animalId.Id))  // Récupérer l'animal par son ID
                //.filter(animal => animal !== undefined);   // Enlever les undefined
            const animals = animalsIdsByRefugeQueries[index]?.data ?? [];
            
            return {
                ...refuge,
                animals: animals,
                produits: produits,
                //demandesAdoption: demandesAdoption,
                //demandesTransfert: demandesTransfert

            };
        });
    }, [RefugesData, animalsIdsByRefugeQueries/*, animalMap*/, produitMips, /*DemandesAdoption, DemandesTransfert*/]);

    const refugeMap = useMemo(
        () => new Map(refuges?.map(r => [r.Id, r])) ?? new Map(),
        [refuges]
    );

    const isLoadingPhotos = animalsIdsByRefugeQueries.some(query => query.isLoading)

    return { RefugesData, RefugesLoading:RefugesLoading || isLoadingPhotos || ProduitLoading /*|| AnimalLoading || DemandeAdoptionsLoading || DemandeTransfertsCibleLoading*/, isError, error, refugeMap, refuges };
};

export const useRefuge = (id,utilisateurMap = null) => {
    console.log("utilisateurMap dans useRefuge", utilisateurMap)
    const { refugeMap, RefugesLoading } = useRefuges(utilisateurMap);
    const { DemandeAdoptionsLoading, demandesByRefuge: DemandesAdoption } = useDemandeAdoptions(utilisateurMap)
    const { DemandeTransfertsCibleLoading, demandeTransfertCibleByRefuge: DemandesTransfert } = useDemandeTransfertsByRefugeCible(id, utilisateurMap)
    const { SousCommandesLoading, sousCommandeMips } = useSousCommandes()

    // ✅ Convertir l'ID en nombre si nécessaire
    const refugeId = id ? (typeof id === 'string' ? parseInt(id, 10) : id) : null;
    
    // ✅ Attendre que le chargement soit terminé avant d'accéder à la map
    const refugenull = !RefugesLoading && refugeId ? refugeMap.get(refugeId) : undefined;

    //console.log("le ref :  ", refugenull)

    // 🆕 Ajouter des objets supplémentaires au refuge
    const refuge = useMemo(() => {
        if (!refugenull) return null;
            let demandesAdoption = DemandesAdoption.get(refugenull?.Id) ?? []
            let demandesTransfert = DemandesTransfert.get(refugenull?.Id) ?? []
            let sousCommandes = sousCommandeMips.get(refugenull?.Id) ?? []

            if (!Array.isArray(demandesAdoption)) demandesAdoption = [demandesAdoption].filter(Boolean)
            if (!Array.isArray(demandesTransfert)) demandesTransfert = [demandesTransfert].filter(Boolean)
            if (!Array.isArray(sousCommandes)) sousCommandes = [sousCommandes].filter(Boolean)

        return {
            ...refugenull,
            demandesAdoption: demandesAdoption,
            demandesTransfert: demandesTransfert,
            sousCommandes: sousCommandes,
        
        };
    }, [refugenull]);

    return {refuge , RefugesLoading: RefugesLoading || DemandeAdoptionsLoading || DemandeTransfertsCibleLoading || SousCommandesLoading};
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