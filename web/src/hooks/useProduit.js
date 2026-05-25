// frontend/src/hooks/useProduit.js

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { produitApi } from "../lib/api"

export const useProduits = () => {
    const { data:ProduitsData, isLoading:ProduitsLoading, isError, error} = useQuery({
        queryKey:['produits'],
        queryFn: produitApi.getAll
    })

    // Requêtes pour les photos de chaque produit
    const photosQueries = useQueries({
        queries: (ProduitsData ?? []).map(produit => ({
            queryKey: ["produits", produit.Id, "photos"],
            queryFn: () => produitApi.getPhotos(produit.Id),
            enabled: !!produit.Id,
        }))
    })

    // Requêtes pour les materiaux de chaque produit
    const materiauxQueries = useQueries({
        queries: (ProduitsData ?? []).map(produit => ({
            queryKey: ["produits", produit.Id, "materiaux"],
            queryFn: () => produitApi.getAllMateriaux(produit.Id),
            enabled: !!produit.Id,
        }))
    })

    //const produits = ProduitsData ?? []

    const produits = useMemo(() => {
        const produitsRaw = ProduitsData ?? []
        
        return produitsRaw.map((p, index) => {
            const photos = photosQueries[index]?.data ?? []
            const materiaux = materiauxQueries[index]?.data ?? []

            return {
                ...p,
                photos: photos, // Ajout des photos
                materiaux: materiaux,
                 
            }
        })
    }, [ProduitsData, materiauxQueries, photosQueries])

    const produitMap = useMemo(
        () => new Map(produits.map(p => [p.Id, p])),
        [produits]
    )

    // ✅ CORRECTION : Chaque refuge pointe vers un TABLEAU de produits
    const produitMips = useMemo(() => {
        const map = new Map();
        produits.forEach(produit => {
            const refugeId = produit.IdRefuge;
            if (!map.has(refugeId)) {
                map.set(refugeId, []);
            }
            map.get(refugeId).push(produit);
        });
        return map;
    }, [produits]);

    return { produits, isLoading: ProduitsLoading, isError, error, produitMap, produitMips }

}

export const useProduit = (id) => {
    const {produitMap, ProduitsLoading} = useProduits()

    // ✅ Convertir l'ID en nombre si nécessaire
    const produitId = id ? (typeof id === 'string' ? parseInt(id, 10) : id) : null;
    
    // ✅ Attendre que le chargement soit terminé avant d'accéder à la map
    const produit = !ProduitsLoading && produitId ? produitMap.get(produitId) : undefined;

    return {produit, ProduitsLoading};
}

// Hook séparé pour les photos d'un produit spécifique
export const useProduitPhotos = (produitId) => {
    return useQuery({
        queryKey: ["photos", produitId],
        queryFn: () => produitApi.getPhotos(produitId),
        enabled: !!produitId, // Ne s'exécute que si on a un ID valide
        staleTime: 5 * 60 * 1000 // Optionnel : cache de 5 minutes
    })
}

export const useCreateProduit = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (refugeId, produitData) => produitApi.create(refugeId, produitData),
        onSuccess: (data) => {
            // Invalider la liste des produits
            queryClient.invalidateQueries({ queryKey: ["produits"] })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["produits"], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Produit créé avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la création du produit:", error)
        }
    })

    return mutation
}

export const useUpdateProduit = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (refugeId, { id, data }) => produitApi.update(refugeId, { id, data }),
        onSuccess: (data, variables) => {
            // 1. Mettre à jour le cache individuel
            queryClient.setQueryData(["produit", variables.id], data)
            
            // 2. Mettre à jour dans la liste des produits
            queryClient.setQueryData(["produits"], (oldData) => {
                if (!oldData) return [data]
                return oldData.map(produit => 
                    produit.Id === variables.id ? data : produit
                )
            })
            
            // 3. Mettre à jour dans la Map
            queryClient.setQueryData(["produitsMap"], (oldMap) => {
                if (!oldMap) return new Map([[variables.id, data]])
                const newMap = new Map(oldMap)
                newMap.set(variables.id, data)
                return newMap
            })
            
            console.log("Produit mis à jour avec succès:", data)
        },
        onError: (error, variables) => {
            console.error(`Erreur lors de la mise à jour du produit ${variables.id}:`, error)
        }
    })

    return mutation
}

export const useDeleteProduit = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (refugeId, id) => produitApi.delete(refugeId, id),
        onSuccess: (data, id) => {
            // 1. Retirer de la liste des produits
            queryClient.setQueryData(["produits"], (oldData) => {
                if (!oldData) return []
                return oldData.filter(produit => produit.Id !== id)
            })
            
            // 2. Retirer de la Map
            queryClient.setQueryData(["produitsMap"], (oldMap) => {
                if (!oldMap) return new Map()
                const newMap = new Map(oldMap)
                newMap.delete(id)
                return newMap
            })
            
            // 3. Supprimer du cache individuel
            queryClient.removeQueries({ queryKey: ["produit", id] })
            
            // 4. Supprimer les photos associées
            queryClient.removeQueries({ queryKey: ["photos", id] })
            
            // 5. Invalider la liste pour être sûr
            queryClient.invalidateQueries({ queryKey: ["produits"] })
            
            console.log("Produit supprimé avec succès:", id)
        },
        onError: (error, id) => {
            console.error(`Erreur lors de la suppression du produit ${id}:`, error)
        }
    })

    return mutation
}