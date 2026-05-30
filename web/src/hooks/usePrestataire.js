// frontend/src/hooks/usePrestataire.js

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { profilPrestataireApi, specificationApi, utilisateurApi } from "../lib/api"
import { useMemo } from "react"
import { useTypeServices } from "./useType_service"
import { useStatut } from "./useStatut"
import { useEspeces } from "./useEspece"  // 👈 Ajout pour les espèces

export const usePrestataires = () => {

    const { typeServicesMap } = useTypeServices()
    const { statutMap } = useStatut()
    const { especeMap, isLoading: especesLoading } = useEspeces()  // 👈 Pour les noms d'espèces
    
    

    const { data: PrestatairesData, isLoading: PrestatairesLoading, isError: isPrestataireError, error: prestataireError } = useQuery({
        queryKey: ["prestataires"],
        queryFn: profilPrestataireApi.getAll,
    });

    const { data: SpecificationsData, isLoading: SpecificationsLoading, isError: isSpecificationError, error: specificationError } = useQuery({
        queryKey: ["specifications"],
        queryFn: specificationApi.getAll,
    });
    
    // CORRECTION 1 : Récupérer les utilisateurs avec useQueries mais en utilisant une Map
    const utilisateursQueries = useQueries({
        queries: (PrestatairesData ?? []).map(prestataire => ({
            queryKey: ["utilisateur", prestataire?.IdUtilisateur],
            queryFn: () => utilisateurApi.getSpecific(prestataire?.IdUtilisateur),
            enabled: !!prestataire?.IdUtilisateur,
            retry: false
        }))
    })

    // CORRECTION 2 : Créer une Map utilisateur par ID utilisateur
    const utilisateurMap = useMemo(() => {
        const map = new Map()
        utilisateursQueries.forEach((query, index) => {
            const prestataire = PrestatairesData?.[index]
            if (prestataire && query.data) {
                map.set(prestataire.IdUtilisateur, query.data)
            }
        })
        return map
    }, [utilisateursQueries, PrestatairesData])

    // 1. Map des spécifications par IdProfil (prestataire)
    const specificationsByPrestataire = useMemo(() => {
        const specsData = SpecificationsData ?? []
        const map = new Map() // key: IdProfil, value: [Specification, ...]
        
        specsData.forEach(spec => {
            const prestataireId = spec.IdProfil
            if (!map.has(prestataireId)) {
                map.set(prestataireId, [])
            }
            map.get(prestataireId).push(spec)
        })
        
        return map
    }, [SpecificationsData])

    // 2. Enrichir un prestataire avec ses espèces
    const enrichPrestataireWithSpecies = (prestataire) => {
        const specs = specificationsByPrestataire.get(prestataire.Id) ?? []
        
        // Récupère les espèces complètes à partir des specs
        const especes = specs
            .map(spec => especeMap.get(spec.IdEspece))
            .filter(Boolean) // Enlève les undefined
        
        return {
            ...prestataire,

            specifications: specs,      // Les specs brutes
            especes: especes,           // Les espèces complètes (avec noms)
            especesIds: specs.map(s => s.IdEspece)  // Juste les IDs si besoin
        }
    }

    // 3. Prestataires enrichis
    // CORRECTION 3 : Bien mapper les utilisateurs
    const prestataires = useMemo(() => {
        const prestatairesRaw = PrestatairesData ?? []

        return prestatairesRaw.map((p) => {
            const typeService = typeServicesMap.get(p.TypeService)
            const statut = statutMap.get(p.Statut)
            
            const prestataireAvecEspeces = enrichPrestataireWithSpecies(p)
            
            // Récupérer l'utilisateur correspondant via la Map
            const utilisateur = utilisateurMap.get(p.IdUtilisateur) ?? null

            return {
                ...prestataireAvecEspeces,
                typeService: typeService ? {
                    Id: typeService.Id,
                    Type: typeService.Type
                } : null,
                statut: statut ? {
                    Id: statut.Id,
                    Nom: statut.Nom,
                    Description: statut.Description
                } : null,
                utilisateur: utilisateur  // ✅ Maintenant c'est un objet ou null
            }
        })
    }, [PrestatairesData, typeServicesMap, statutMap, specificationsByPrestataire, especeMap, utilisateurMap])

    // 4. Map des prestataires par ID (pratique pour accès direct)
    const prestatairesMap = useMemo(
        () => new Map(prestataires.map(p => [p.Id, p])),
        [prestataires]
    )

    // 5. Fonction utilitaire pour récupérer un prestataire avec ses specs
    const getPrestataireWithSpecs = (id) => {
        return prestatairesMap.get(id)
    }

    // 6. Fonction pour vérifier si un prestataire s'occupe d'une espèce
    const canHandleEspece = (prestataireId, especeId) => {
        const prestataire = prestatairesMap.get(prestataireId)
        if (!prestataire) return false
        return prestataire.especesIds?.includes(especeId) ?? false
    }

    return { 
        prestataires, 
        prestatairesMap,
        getPrestataireWithSpecs,
        canHandleEspece,
        isLoading: PrestatairesLoading || SpecificationsLoading || especesLoading,
        isError: isPrestataireError || isSpecificationError,
        error: prestataireError || specificationError
    }
}

// Hook séparé pour un prestataire spécifique (optionnel)
export const usePrestataire = (id) => {
  const { prestatairesMap, isLoading, isError, error } = usePrestataires()

  const prestataire = useMemo(() => {
    if (!id) return null

    const prestataireId = Number(id)

    return prestatairesMap.get(prestataireId)
  }, [prestatairesMap, id])

  return { prestataire, isLoading, isError, error }
}

export const useCreatePrestataire = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (prestataireData) => profilPrestataireApi.create(prestataireData),
        onSuccess: (data) => {
            // Invalider et recharger la liste des prestataires
            queryClient.invalidateQueries({ queryKey: ["prestataires"] })
            
            // Optionnel : ajouter le nouveau prestataire au cache directement
            queryClient.setQueryData(["prestataires"], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Prestataire créé avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la création:", error)
        }
    })

    return mutation
}

export const useUpdatePrestataire = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ id, data }) => profilPrestataireApi.update(id, data), // 👈 Prend id et data
        onSuccess: (data, variables) => {
            // Invalider la liste pour recharger
            queryClient.invalidateQueries({ queryKey: ["prestataires"] })
            
            // Mettre à jour le cache individuel du prestataire
            queryClient.setQueryData(["prestataire", variables.id], data)
            
            // Mettre à jour le prestataire dans la liste existante
            queryClient.setQueryData(["prestataires"], (oldData) => {
                if (!oldData) return [data]
                // Remplacer l'ancien prestataire par le nouveau
                return oldData.map(prestataire => 
                    prestataire.Id === variables.id ? data : prestataire
                )
            })
            
            console.log("Prestataire mis à jour avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la mise à jour:", error)
        }
    })

    return mutation
}