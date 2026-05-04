// frontend/src/hooks/usePrestataire.js

import { useQuery } from "@tanstack/react-query"
import { profilPrestataireApi, specificationApi } from "../lib/api"
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
    const prestataires = useMemo(() => {
        const prestatairesRaw = PrestatairesData ?? []

        return prestatairesRaw.map(p => {
            const typeService = typeServicesMap.get(p.TypeService)
            const statut = statutMap.get(p.Statut)  // 👈 Correction: p.Statut (pas p.statut)
            
            // Enrichit avec les espèces
            const prestataireAvecEspeces = enrichPrestataireWithSpecies(p)
            console.log("Prestataire enrichi:", prestataireAvecEspeces)  // Debug

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
                } : null
            }
        })
    }, [PrestatairesData, typeServicesMap, statutMap, specificationsByPrestataire, especeMap])

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
        return prestatairesMap.get(id)
    }, [prestatairesMap, id])

    return { prestataire, isLoading, isError, error }
}