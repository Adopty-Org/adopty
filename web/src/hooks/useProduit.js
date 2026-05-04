// frontend/src/hooks/useProduit.js

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { produitApi } from "../lib/api"

export const useProduits = () => {
    const { data:ProduitsData, isLoading:ProduitsLoading, isError, error} = useQuery({
        queryKey:['produits'],
        queryFn: produitApi.getAll
    })

    const produits = ProduitsData ?? []

    const produitMap = useMemo(
        () => new Map(produits.map(p => [p.Id, p])),
        [produits]
    )

    return { produits, isLoading: ProduitsLoading, isError, error, produitMap }

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