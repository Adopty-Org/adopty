// frontend/src/hooks/useDisponibilite.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { disponibiliteApi } from "../lib/api"
import { useMemo } from "react"

export const useDisponibilites = (id) => {

    const {data:DisponibilitesData, isLoading:DisponibilitesLoading, isError, error, refetch } = useQuery({
        queryKey: ["disponibilites", id],
        queryFn: () => disponibiliteApi.getByProfilPrestataire(id),
        enabled: !!id,
    }) 

    const disponibilites = DisponibilitesData ?? []
    //console.log("les disponibilites dans useDisponibilites : ", disponibilites,"avec comme id :  ", id)

    const disponibiliteMap = useMemo(
    () => new Map(disponibilites.map(e => [e.Id, e])),
    [disponibilites]
  )

    return ({
        disponibilites,
        disponibiliteMap,
        DisponibilitesLoading,
        isError,
        error,
        refetch
    })
}

export const useCreateDisponibilite = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (disponibiliteData) => disponibiliteApi.create(disponibiliteData),
        onSuccess: (data, variables) => {
            const profilId = data.IdProfilPrestataire || variables.IdProfilPrestataire
            
            // Invalider et recharger les disponibilités du prestataire
            queryClient.invalidateQueries({ 
                queryKey: ["disponibilites", profilId] 
            })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["disponibilites", profilId], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Disponibilité créée avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la création de la disponibilité:", error)
        }
    })

    return mutation
}

export const useUpdateDisponibilite = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ id, data }) => disponibiliteApi.update(id, data),
        onSuccess: (data, variables) => {
            const profilId = data.IdProfilPrestataire
            
            // 1. Mettre à jour le cache individuel
            queryClient.setQueryData(["disponibilite", variables.id], data)
            
            // 2. Mettre à jour dans la liste des disponibilités du prestataire
            queryClient.setQueryData(["disponibilites", profilId], (oldData) => {
                if (!oldData) return [data]
                return oldData.map(dispo => 
                    dispo.Id === variables.id ? data : dispo
                )
            })
            
            // 3. Mettre à jour dans la Map si elle existe
            queryClient.setQueryData(["disponibilitesMap", profilId], (oldMap) => {
                if (!oldMap) return new Map([[variables.id, data]])
                const newMap = new Map(oldMap)
                newMap.set(variables.id, data)
                return newMap
            })
            
            console.log("Disponibilité mise à jour avec succès:", data)
        },
        onError: (error, variables) => {
            console.error(`Erreur lors de la mise à jour de la disponibilité ${variables.id}:`, error)
        }
    })

    return mutation
}