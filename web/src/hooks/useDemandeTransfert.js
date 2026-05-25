// frontend/src/hooks/useDemandeTransfert.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { demandeTransfertApi } from "../lib/api"
import { useMemo } from "react"
import { useUtilisateur, useUtilisateurs } from "./useUtilisateur"
import { useAnimals } from "./useAnimal"
import { useRefuges } from "./useRefuge"

export const useDemandeTransfertsByRefugeDepart = (id) => {
    const { data: DemandeTransfertsDepartData, isLoading: DemandeTransfertsDepartLoading, isError, error } = useQuery({
        queryKey: ["demandeTransfertsRefugeDepart", id],
        queryFn: () => demandeTransfertApi.getEmByRefugeDepart(id),
        enabled: !!id,
    })
    
    const { utilisateurMap } = useUtilisateurs()
    const { animalMap } = useAnimals()

    // Debug: Afficher la structure des maps
    /*console.log("=== Débogage useDemandeTransfertsDepartByRefuge ===");
    console.log("Refuge ID:", id);
    console.log("Données brutes:", DemandeTransfertsDepartData);
    console.log("Type de données:", typeof DemandeTransfertsDepartData);
    console.log("Est un tableau?", Array.isArray(DemandeTransfertsDepartData));
    console.log("Taille du utilisateurMap:", utilisateurMap?.size);
    console.log("Taille du animalMap:", animalMap?.size);*/

    const demandeTransfertsRefugeDepart = useMemo(() => {
        // Étape 1: Vérifier les données
        if (!DemandeTransfertsDepartData) {
            //console.log("Aucune donnée reçue");
            return []
        }
        
        // Étape 2: Convertir en tableau si nécessaire
        let demandesArray = []
        if (Array.isArray(DemandeTransfertsDepartData)) {
            demandesArray = DemandeTransfertsDepartData
            //console.log(`${demandesArray.length} demandes reçues`);
        } else if (DemandeTransfertsDepartData.IdUtilisateur) {
            // Objet unique
            demandesArray = [DemandeTransfertsDepartData]
            //console.log("Une demande unique reçue");
        } else {
            console.error("Format de données non reconnu:", DemandeTransfertsDepartData);
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
        
    }, [DemandeTransfertsDepartData, utilisateurMap, animalMap])

    const demandeTransfertDepartMap = useMemo(() => {
        const map = new Map()
        if (demandeTransfertsRefugeDepart && demandeTransfertsRefugeDepart.length > 0) {
            demandeTransfertsRefugeDepart.forEach(demande => {
                if (demande && demande.Id) {
                    map.set(demande.Id, demande)
                }
            })
        }
        //console.log(`Map créé avec ${map.size} entrées`);
        return map
    }, [demandeTransfertsRefugeDepart])

    return {
        demandeTransfertsRefugeDepart,
        demandeTransfertDepartMap,
        DemandeTransfertsDepartLoading,
        isError,
        error
    }
}

export const useDemandeTransfertsByRefugeCible = (id) => {
    const { data: DemandeTransfertsCibleData, isLoading: DemandeTransfertsCibleLoading, isError, error } = useQuery({
        queryKey: ["demandeTransfertsRefugeCible", id],
        queryFn: () => demandeTransfertApi.getEmByRefugeCible(id),
        enabled: !!id ,
    })
    
    
    const { utilisateurMap, isLoading: UtilisateurLoading } = useUtilisateurs()
    const { animalMips, isLoading: AnimalLoading } = useAnimals()
    //const { refugeMap, RefugesLoading } = useRefuges()

    // Debug: Afficher la structure des maps
    /*console.log("=== Débogage useDemandeTransfertsCibleByRefuge ===");
    console.log("Refuge ID:", id);
    console.log("Données brutes:", DemandeTransfertsCibleData);
    console.log("Type de données:", typeof DemandeTransfertsCibleData);
    console.log("Est un tableau?", Array.isArray(DemandeTransfertsCibleData));
    console.log("Taille du utilisateurMap:", utilisateurMap?.size);
    console.log("Taille du animalMap:", animalMap?.size);*/

    const demandeTransfertsRefugeCible = useMemo(() => {
        // Étape 1: Vérifier les données
        if (!DemandeTransfertsCibleData) {
            console.log("Aucune donnée reçue");
            return []
        }
        if (AnimalLoading) {
            console.log("Chargement des animaux en cours...");
            return [] // Retourner vide pendant le chargement
        }
        
        // Étape 2: Convertir en tableau si nécessaire
        let demandesArray = []
        if (Array.isArray(DemandeTransfertsCibleData)) {
            demandesArray = DemandeTransfertsCibleData
            //console.log(`${demandesArray.length} demandes reçues`);
        } else if (DemandeTransfertsCibleData.IdUtilisateur) {
            // Objet unique
            demandesArray = [DemandeTransfertsCibleData]
            //console.log("Une demande unique reçue");
        } else {
            console.error("Format de données non reconnu:", DemandeTransfertsCibleData);
            return []
        }
        
        // Étape 3: Enrichir chaque demande
        const result = demandesArray.map(demande => {
            const utilisateur = utilisateurMap?.get(demande.IdUtilisateur) || null
            const animal = animalMips?.get(demande.IdAnimal) || null
            //const refuge = refugeMap?.get(id)
            
            //console.log(`Demande ${demande.Id}: Utilisateur ${demande.IdUtilisateur} -> ${utilisateur ? 'trouvé' : 'non trouvé'}, Animal ${demande.IdAnimal} -> ${animal ? 'trouvé' : 'non trouvé'}`);
            
            return {
                ...demande,
                utilisateur: utilisateur || null,
                animal: animal || null,
                //refuge: refuge || null
            }
        })
        
        //console.log(`${result.length} demandes enrichies`);
        return result
        
    }, [DemandeTransfertsCibleData, utilisateurMap, animalMips, UtilisateurLoading, AnimalLoading])

    const demandeTransfertCibleMap = useMemo(() => {
        const map = new Map()
        if (demandeTransfertsRefugeCible && demandeTransfertsRefugeCible.length > 0) {
            demandeTransfertsRefugeCible.forEach(demande => {
                if (demande && demande.Id) {
                    map.set(demande.Id, demande)
                }
            })
        }
        //console.log(`Map créé avec ${map.size} entrées`);
        return map
    }, [demandeTransfertsRefugeCible])

    const demandeTransfertCibleByRefuge = useMemo(() => {
        const map = new Map()
        if (demandeTransfertsRefugeCible && demandeTransfertsRefugeCible.length > 0) {
            demandeTransfertsRefugeCible.forEach(demande => {
                if (demande && demande.IdRefugeCible) {
                    map.set(demande.IdRefugeCible, demande)
                }
            })
        }
        //console.log(`Map créé avec ${map.size} entrées`);
        return map
    }, [demandeTransfertsRefugeCible])

    return {
        demandeTransfertsRefugeCible,
        demandeTransfertCibleMap,
        DemandeTransfertsCibleLoading: DemandeTransfertsCibleLoading || UtilisateurLoading || AnimalLoading ,//RefugesLoading,
        demandeTransfertCibleByRefuge,
        isError,
        error
    }
}

export const useDemandeTransfertsByAnimal = (refugeId, animalId) => {

    const {data:DemandeTransfertsData, isLoading:DemandeTransfertsLoading, isError, error } = useQuery({
        queryKey: ["demandeTransfertsAnimal", refugeId, animalId],
        queryFn: () => demandeTransfertApi.getByAnimal(refugeId, animalId),
        enabled: !!animalId,
    }) 

    const demandeTransfertsAnimal = DemandeTransfertsData ?? []

    const demandeTransfertMap = useMemo(
    () => new Map(demandeTransfertsAnimal.map(e => [e.Id, e])),
    [demandeTransfertsAnimal]
  )

    return ({
        demandeTransfertsAnimal,
        demandeTransfertMap,
        DemandeTransfertsLoading,
        isError,
        error
    })
}

// 🆕 Hook pour les demandes d'un utilisateur (adoptant)
/*export const useDemandeTransfertsByUser = (userId) => {
    const { data: DemandesUtilisateurData, isLoading: DemandesUtilisateurLoading, isError, error } = useQuery({
        queryKey: ["demandeTransferts", "user", userId],
        queryFn: () => demandeTransfertApi.getEmByUtilisateur(userId),
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

export const useDemandeTransfertsByUtilisateur = (id) => {

    const {data:DemandeTransfertsData, isLoading:DemandeTransfertsLoading, isError, error } = useQuery({
        queryKey: ["demandeTransfertsUtilisateur", id],
        queryFn: demandeTransfertApi.getByUtilisateur(id),
        enabled: !!id,
    }) 

    const demandeTransfertsUtilisateur = DemandeTransfertsData ?? []

    const demandeTransfertMap = useMemo(
    () => new Map(demandeTransfertsUtilisateur.map(e => [e.Id, e])),
    [demandeTransfertsUtilisateur]
  )

    return ({
        demandeTransfertsUtilisateur,
        demandeTransfertMap,
        DemandeTransfertsLoading,
        isError,
        error
    })
}

export const useCreateDemandeTransfert = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (demandeTransfertData) => demandeTransfertApi.create(demandeTransfertData),
        onSuccess: (data, variables) => {
            // Invalider et recharger toutes les demandes d'adoption
            queryClient.invalidateQueries({ 
                queryKey: ["demandeTransferts"] 
            })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["demandeTransferts"], (oldData) => {
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
}*/

export const useCreateDemandeTransfertWithNotification = () => {
    const queryClient = useQueryClient()
    const { addNotification } = useNotifications()

    const mutation = useMutation({
        mutationFn: (demandeData) => demandeTransfertApi.create(demandeData),
        onSuccess: async (data, variables) => {
            // Invalider les requêtes
            queryClient.invalidateQueries({ queryKey: ["demandeTransferts"] })
            queryClient.invalidateQueries({ queryKey: ["demandeTransferts", "refuge", data.IdRefugeDepart] })
            
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
                    refugeId: demande.IdRefugeDepart,
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

export const useUpdateDemandeTransfert = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ id, data }) => demandeTransfertApi.update(id, data),
        onSuccess: (data, variables) => {
            // Invalider et recharger toutes les demandes d'adoption
            queryClient.invalidateQueries({ 
                queryKey: ["demandeTransferts"] 
            })
            
            // Optionnel : mettre à jour directement dans le cache
            queryClient.setQueryData(["demandeTransferts"], (oldData) => {
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

export const useDeleteDemandeTransfert = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (id) => demandeTransfertApi.delete(id),
        onSuccess: (data, variables, context) => {
            const deletedId = variables // l'ID passé à mutationFn
            
            // Invalider et recharger toutes les demandes d'adoption
            queryClient.invalidateQueries({ 
                queryKey: ["demandeTransferts"] 
            })
            
            // Optionnel : supprimer directement du cache
            queryClient.setQueryData(["demandeTransferts"], (oldData) => {
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