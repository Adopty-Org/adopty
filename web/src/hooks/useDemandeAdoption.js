// frontend/src/hooks/useDemandeAdoption.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { demandeAdoptionApi } from "../lib/api"
import { useMemo } from "react"
import { useUtilisateur, useUtilisateurs } from "./useUtilisateur"
import { useAnimals } from "./useAnimal"
import { useNotifications } from "../context/NotificationContext"

export const useDemandeAdoptionsByRefuge = (id) => {
    const { data: DemandeAdoptionsData, isLoading: DemandeAdoptionsLoading, isError, error } = useQuery({
        queryKey: ["demandeAdoptionsRefuge", id],
        queryFn: () => demandeAdoptionApi.getEmByRefuge(id),
        enabled: !!id,
    })
    
    const { utilisateurMap } = useUtilisateurs()
    const { animalMap } = useAnimals()

    // Debug: Afficher la structure des maps
    /*console.log("=== Débogage useDemandeAdoptionsByRefuge ===");
    console.log("Refuge ID:", id);
    console.log("Données brutes:", DemandeAdoptionsData);
    console.log("Type de données:", typeof DemandeAdoptionsData);
    console.log("Est un tableau?", Array.isArray(DemandeAdoptionsData));
    console.log("Taille du utilisateurMap:", utilisateurMap?.size);
    console.log("Taille du animalMap:", animalMap?.size);*/

    const demandeAdoptionsRefuge = useMemo(() => {
        // Étape 1: Vérifier les données
        if (!DemandeAdoptionsData) {
            console.log("Aucune donnée reçue");
            return []
        }
        
        // Étape 2: Convertir en tableau si nécessaire
        let demandesArray = []
        if (Array.isArray(DemandeAdoptionsData)) {
            demandesArray = DemandeAdoptionsData
            //console.log(`${demandesArray.length} demandes reçues`);
        } else if (DemandeAdoptionsData.IdUtilisateur) {
            // Objet unique
            demandesArray = [DemandeAdoptionsData]
            //console.log("Une demande unique reçue");
        } else {
            console.error("Format de données non reconnu:", DemandeAdoptionsData);
            return []
        }
        
        // Étape 3: Enrichir chaque demande
        const result = demandesArray.map(demande => {
            const utilisateur = utilisateurMap?.get(demande.IdUtilisateur)
            const animal = animalMap?.get(demande.IdAnimal)
            
            //console.log(`Demande ${demande.Id}: Utilisateur ${demande.IdUtilisateur} -> ${utilisateur ? 'trouvé' : 'non trouvé'}, Animal ${demande.IdAnimal} -> ${animal ? 'trouvé' : 'non trouvé'}`);
            
            return {
                ...demande,
                utilisateur: utilisateur || null,
                animal: animal || null
            }
        })
        
        //console.log(`${result.length} demandes enrichies`);
        return result
        
    }, [DemandeAdoptionsData, utilisateurMap, animalMap])

    const demandeAdoptionMap = useMemo(() => {
        const map = new Map()
        if (demandeAdoptionsRefuge && demandeAdoptionsRefuge.length > 0) {
            demandeAdoptionsRefuge.forEach(demande => {
                if (demande && demande.Id) {
                    map.set(demande.Id, demande)
                }
            })
        }
        console.log(`Map créé avec ${map.size} entrées`);
        return map
    }, [demandeAdoptionsRefuge])

    return {
        demandeAdoptionsRefuge,
        demandeAdoptionMap,
        DemandeAdoptionsLoading,
        isError,
        error
    }
}

export const useDemandeAdoptionsByAnimal = (id) => {

    const {data:DemandeAdoptionsData, isLoading:DemandeAdoptionsLoading, isError, error } = useQuery({
        queryKey: ["demandeAdoptionsAnimal", id],
        queryFn: () => demandeAdoptionApi.getByAnimal(id),
        enabled: !!id,
    }) 

    const demandeAdoptionsAnimal = DemandeAdoptionsData ?? []

    const demandeAdoptionMap = useMemo(
    () => new Map(demandeAdoptionsAnimal.map(e => [e.Id, e])),
    [demandeAdoptionsAnimal]
  )

    return ({
        demandeAdoptionsAnimal,
        demandeAdoptionMap,
        DemandeAdoptionsLoading,
        isError,
        error
    })
}

// 🆕 Hook pour les demandes d'un utilisateur (adoptant)
export const useDemandeAdoptionsByUser = (userId) => {
    const { data: DemandesUtilisateurData, isLoading: DemandesUtilisateurLoading, isError, error } = useQuery({
        queryKey: ["demandeAdoptions", "user", userId],
        queryFn: () => demandeAdoptionApi.getEmByUtilisateur(userId),
        enabled: !!userId,
    })
    
    const { animalMap } = useAnimals() // Seulement besoin des animaux pour l'adoptant

    const demandesUtilisateur = useMemo(() => {

        if (!DemandesUtilisateurData) {
            console.log("Aucune donnée reçue");
            return []
        }
        console.log("les donnes de useDemandeUser", DemandesUtilisateurData)
        
        // Convertir en tableau si nécessaire
        let demandesArray = []
        if (Array.isArray(DemandesUtilisateurData)) {
            demandesArray = DemandesUtilisateurData
        } else if (DemandesUtilisateurData.Id) {
            demandesArray = [DemandesUtilisateurData]
        } else {
            return []
        }
        
        // Enrichir chaque demande avec les infos de l'animal
        const result = demandesArray.map(demande => ({
            ...demande,
            animal: animalMap?.get(demande.IdAnimal) || null
        }))
        
        return result
        
    }, [DemandesUtilisateurData, animalMap])

    return {
        demandesUtilisateur,
        DemandesUtilisateurLoading,
        isError,
        error
    }
}

export const useDemandeAdoptionsByUtilisateur = (id) => {

    const {data:DemandeAdoptionsData, isLoading:DemandeAdoptionsLoading, isError, error } = useQuery({
        queryKey: ["demandeAdoptionsUtilisateur", id],
        queryFn: () => demandeAdoptionApi.getByUtilisateur(id),
        enabled: !!id,
    }) 

    const demandeAdoptionsUtilisateur = DemandeAdoptionsData ?? []

    const demandeAdoptionMap = useMemo(
    () => new Map(demandeAdoptionsUtilisateur.map(e => [e.Id, e])),
    [demandeAdoptionsUtilisateur]
  )

    return ({
        demandeAdoptionsUtilisateur,
        demandeAdoptionMap,
        DemandeAdoptionsLoading,
        isError,
        error
    })
}

export const useCreateDemandeAdoption = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (demandeAdoptionData) => demandeAdoptionApi.create(demandeAdoptionData),
        onSuccess: (data, variables) => {
            // Invalider et recharger toutes les demandes d'adoption
            queryClient.invalidateQueries({ 
                queryKey: ["demandeAdoptions"] 
            })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["demandeAdoptions"], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Demande d'adoption créée avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la création de la demande d'adoption:", error)
        }
    })

    return mutation
}

export const useCreateDemandeAdoptionWithNotification = () => {
    const queryClient = useQueryClient()
    const { addNotification } = useNotifications()

    const mutation = useMutation({
        mutationFn: (demandeData) => demandeAdoptionApi.create(demandeData),
        onSuccess: async (data, variables) => {
            // Invalider les requêtes
            queryClient.invalidateQueries({ queryKey: ["demandeAdoptions"] })
            queryClient.invalidateQueries({ queryKey: ["demandeAdoptions", "refuge", data.RefugeId] })
            
            // Ajouter la notification pour l'utilisateur
            addNotification({
                title: '✅ Demande envoyée',
                message: `Votre demande d'adoption a bien été envoyée au refuge`,
                type: 'success',
                read: false,
                demandeId: data.Id,
                date: new Date().toISOString()
            })

            // Optionnel: Envoyer une notification au refuge via WebSocket ou autre
            await notifyRefugeOfNewDemande(data)
        },
        onError: (error) => {
            addNotification({
                title: '❌ Erreur',
                message: `Impossible d'envoyer votre demande: ${error.message}`,
                type: 'error',
                read: false,
                date: new Date().toISOString()
            })
        }
    })

    const notifyRefugeOfNewDemande = async (demande) => {
        try {
            // Si vous avez un système de WebSocket
            // socket.emit('new-adoption-request', demande)
            
            // Ou via API pour notifier le refuge
            await fetch('/api/notify-refuge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    refugeId: demande.RefugeId,
                    demandeId: demande.Id,
                    message: `${demande.prenom} ${demande.nom} souhaite adopter un animal`
                })
            })
        } catch (error) {
            console.error('Erreur lors de la notification du refuge:', error)
        }
    }

    return mutation
}

export const useUpdateDemandeAdoption = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ id, data }) => demandeAdoptionApi.update(id, data),
        onSuccess: (data, variables) => {
            // Invalider et recharger toutes les demandes d'adoption
            queryClient.invalidateQueries({ 
                queryKey: ["demandeAdoptions"] 
            })
            
            // Optionnel : mettre à jour directement dans le cache
            queryClient.setQueryData(["demandeAdoptions"], (oldData) => {
                if (!oldData) return [data]
                return oldData.map(item => 
                    item.Id === data.Id ? data : item
                )
            })
            
            console.log("Demande d'adoption mise à jour avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la mise à jour de la demande d'adoption:", error)
        }
    })

    return mutation
}

export const useDeleteDemandeAdoption = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (id) => demandeAdoptionApi.delete(id),
        onSuccess: (data, variables, context) => {
            const deletedId = variables // l'ID passé à mutationFn
            
            // Invalider et recharger toutes les demandes d'adoption
            queryClient.invalidateQueries({ 
                queryKey: ["demandeAdoptions"] 
            })
            
            // Optionnel : supprimer directement du cache
            queryClient.setQueryData(["demandeAdoptions"], (oldData) => {
                if (!oldData) return []
                return oldData.filter(item => item.Id !== deletedId)
            })
            
            console.log("Demande d'adoption supprimée avec succès, ID:", deletedId)
        },
        onError: (error) => {
            console.error("Erreur lors de la suppression de la demande d'adoption:", error)
        }
    })

    return mutation
}