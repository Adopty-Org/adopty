// frontend/src/hooks/usePanier.js

import { useQueries, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { lignePanierApi, panierApi } from "../lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const usePaniers = () => {

    const { data: PaniersData, isLoading: PaniersLoading, isError, error, refetch } = useQuery({
        queryKey: ["paniers"],
        queryFn: panierApi.getAll,
        enabled: !!localStorage.getItem('clerk-user') || !!sessionStorage.getItem('clerk-user'),
    })

    const safePaniersData = Array.isArray(PaniersData) ? PaniersData : []

    // Requêtes pour les ligne_paniers de chaque panier
    const ligne_paniersQueries = useQueries({
        queries: (PaniersData ?? []).map(panier => ({
            queryKey: ["Lignes_paniers", panier.Id, "ligne_paniers"],
            queryFn: () => lignePanierApi.getByPanier(panier.Id),
            enabled: !!panier.Id && Array.isArray(safePaniersData), // ← Vérification supplémentair,
        }))
    })
    
    const paniers = PaniersData ?? []

    

    // ✅ CORRECTION ICI
    const paniersWithLignePaniers = useMemo(() => {
        return paniers.map((r,index) => {
            const ligne_paniers = ligne_paniersQueries[index]?.data ?? []
            return {
                ...r, 
                Ligne_paniers: ligne_paniers
            }
        })
    }, [paniers, ligne_paniersQueries])  // ← Dépendances ici
    const panierMap = useMemo(
        () => new Map(paniersWithLignePaniers.map(r => [r.Id, r])),
        [paniersWithLignePaniers]
    )

    const panierMips = useMemo(
        () => new Map(paniersWithLignePaniers.map(r => [r.IdUtilisateur, r])),
        [paniersWithLignePaniers]
    )

    //console.log("prob :", panierMips)
        
    return {
        paniers,
        panierMap,
        panierMips,
        paniersWithLignePaniers,
        isLoading: PaniersLoading,
        isError,
        error,
        refetch

    }
}

export const usePanier = (id) => {
    const {panierMap, PaniersLoading, refetch} = usePaniers()

    // ✅ Convertir l'ID en nombre si nécessaire
    const panierId = id ? (typeof id === 'string' ? parseInt(id, 10) : id) : null;
    
    // ✅ Attendre que le chargement soit terminé avant d'accéder à la map
    const panier = !PaniersLoading && panierId ? panierMap.get(panierId) : undefined;

    return {panier, PaniersLoading, refetch};
}



export const useCreatePanier = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (utilisateurId) => panierApi.create({ IdUtilisateur: utilisateurId }),
        onSuccess: (data) => {
            // Invalider la liste des paniers
            queryClient.invalidateQueries({ queryKey: ["paniers"] })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["paniers"], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Panier créé avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la création du panier:", error)
        }
    })

    return mutation
}

export const useAddLignePanier = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ IdPanier, IdProduit, Quantite }) => 
            lignePanierApi.create({ IdPanier, IdProduit, Quantite }),
        onSuccess: (data, variables) => {
            const { IdPanier } = variables
            
            // Invalider les lignes du panier
            queryClient.invalidateQueries({ queryKey: ["Lignes_paniers", IdPanier, "ligne_paniers"] })
            queryClient.invalidateQueries({ queryKey: ["paniers"] })

            // ✅ FORCER l'invalidation complète (pas juste setQueryData)
    queryClient.invalidateQueries({ queryKey: ["paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["Lignes_paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["utilisateur"], exact: false, refetchType: 'active' })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["Lignes_paniers", IdPanier, "ligne_paniers"], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Ligne ajoutée avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de l'ajout de la ligne:", error)
        }
    })

    return mutation
}

export const useUpdateLignePanier = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ Id, Quantite }) => lignePanierApi.update({ id: Id, formData: { Quantite } }),
        onSuccess: (data, variables) => {
            const { Id } = variables
            
            // Récupérer l'IdPanier depuis le cache pour invalider proprement
            const ancienneLigne = queryClient.getQueryData(["ligne_panier", Id])
            const IdPanier = ancienneLigne?.IdPanier
            
            if (IdPanier) {
                // Mettre à jour dans la liste des lignes
                queryClient.setQueryData(["Lignes_paniers", IdPanier, "ligne_paniers"], (oldData) => {
                    if (!oldData) return [data]
                    return oldData.map(ligne => 
                        ligne.Id === Id ? data : ligne
                    )
                })
            }
            
            // Invalider pour être sûr
            queryClient.invalidateQueries({ queryKey: ["Lignes_paniers", IdPanier, "ligne_paniers"] })
            queryClient.invalidateQueries({ queryKey: ["paniers"] })

            // ✅ FORCER l'invalidation complète (pas juste setQueryData)
    queryClient.invalidateQueries({ queryKey: ["paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["Lignes_paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["utilisateur"], exact: false, refetchType: 'active' })
            
            console.log("Ligne mise à jour avec succès:", data)
        },
        onError: (error, variables) => {
            console.error(`Erreur lors de la mise à jour de la ligne ${variables.Id}:`, error)
        }
    })

    return mutation
}

export const useDeleteLignePanier = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (Id) => lignePanierApi.delete(Id),
        onSuccess: (data, Id) => {
            // Récupérer l'IdPanier depuis le cache
            const ligneSupprimee = queryClient.getQueryData(["ligne_panier", Id])
            const IdPanier = ligneSupprimee?.IdPanier
            
            if (IdPanier) {
                // Retirer de la liste des lignes
                queryClient.setQueryData(["Lignes_paniers", IdPanier, "ligne_paniers"], (oldData) => {
                    if (!oldData) return []
                    return oldData.filter(ligne => ligne.Id !== Id)
                })
            }
            
            // Supprimer du cache individuel
            queryClient.removeQueries({ queryKey: ["ligne_panier", Id] })
            
            // Invalider les queries dépendantes
            queryClient.invalidateQueries({ queryKey: ["Lignes_paniers", IdPanier, "ligne_paniers"] })
            queryClient.invalidateQueries({ queryKey: ["paniers"] })

            // ✅ FORCER l'invalidation complète (pas juste setQueryData)
    queryClient.invalidateQueries({ queryKey: ["paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["Lignes_paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["utilisateur"], exact: false, refetchType: 'active' })
            
            console.log("Ligne supprimée avec succès:", Id)
        },
        onError: (error, Id) => {
            console.error(`Erreur lors de la suppression de la ligne ${Id}:`, error)
        }
    })

    return mutation
}

export const useClearPanier = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (IdPanier) => {
            // Récupérer toutes les lignes du panier
            const lignes = await lignePanierApi.getByPanier(IdPanier)
            // Supprimer chaque ligne
            const suppressions = lignes.map(ligne => lignePanierApi.delete(ligne.Id))
            await Promise.all(suppressions)
            return { IdPanier, lignesSupprimees: lignes.length }
        },
        onSuccess: (result, IdPanier) => {
            // Vider le cache des lignes
            queryClient.setQueryData(["Lignes_paniers", IdPanier, "ligne_paniers"], [])
            
            // Supprimer toutes les lignes individuelles du cache
            const lignes = queryClient.getQueryData(["Lignes_paniers", IdPanier, "ligne_paniers"])
            if (lignes) {
                lignes.forEach(ligne => {
                    queryClient.removeQueries({ queryKey: ["ligne_panier", ligne.Id] })
                })
            }
            
            // Invalider pour être sûr
            queryClient.invalidateQueries({ queryKey: ["Lignes_paniers", IdPanier, "ligne_paniers"] })
            queryClient.invalidateQueries({ queryKey: ["paniers"] })

            // ✅ FORCER l'invalidation complète (pas juste setQueryData)
    queryClient.invalidateQueries({ queryKey: ["paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["Lignes_paniers"], exact: false, refetchType: 'active' })
    queryClient.invalidateQueries({ queryKey: ["utilisateur"], exact: false, refetchType: 'active' })
            
            console.log(`Panier ${IdPanier} vidé avec succès (${result.lignesSupprimees} lignes supprimées)`)
        },
        onError: (error, IdPanier) => {
            console.error(`Erreur lors du vidage du panier ${IdPanier}:`, error)
        }
    })

    return mutation
}