// components/DemandeAdoptionWatcher.js
/*import { useEffect, useRef } from 'react'
import { useDemandeAdoptionsByRefuge } from '../hooks/useDemandeAdoption'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '@clerk/clerk-react'  // Supposons que vous ayez un contexte d'auth

export const DemandeAdoptionWatcher = ({ refugeId }) => {
    const { demandeAdoptionsRefuge, DemandeAdoptionsLoading } = useDemandeAdoptionsByRefuge(refugeId)
    const { addNotification } = useNotifications()
    const previousDemandesRef = useRef([])

    useEffect(() => {
        console.log("=== DemandeAdoptionWatcher ===");
        console.log("refugeId:", refugeId);
        console.log("DemandeAdoptionsLoading:", DemandeAdoptionsLoading);
        console.log("demandeAdoptionsRefuge:", demandeAdoptionsRefuge);
        
        // Attendre que le chargement soit terminé
        if (DemandeAdoptionsLoading) {
            console.log("Chargement en cours...");
            return;
        }
        
        // Vérifier que demandes existe et est un tableau
        const demandes = demandeAdoptionsRefuge || [];
        
        if (!Array.isArray(demandes)) {
            console.log("demandes n'est pas un tableau:", demandes);
            return;
        }
        
        if (demandes.length === 0) {
            console.log("Aucune demande trouvée");
            return;
        }

        console.log(`Traitement de ${demandes.length} demande(s)`);
        
        const previousDemandes = previousDemandesRef.current;
        
        // Filtrer les nouvelles demandes
        const newDemandes = demandes.filter(demande => {
            const isNew = !previousDemandes.some(prev => prev.Id === demande.Id);
            const isPending = demande.Statut === 2; // 'en_attente'
            
            if (isNew && isPending) {
                console.log(`Nouvelle demande trouvée: ${demande.Id}`);
            }
            
            return isNew && isPending;
        });
        
        console.log(`${newDemandes.length} nouvelle(s) demande(s) à notifier`);
        
        // Notifier pour chaque nouvelle demande
        newDemandes.forEach(demande => {
            console.log(`🔔 Notification: ${demande?.utilisateur?.Prenom} ${demande?.utilisateur?.Nom}`);
            addNotification({
                title: '📋 Nouvelle demande d\'adoption',
                message: `${demande?.utilisateur?.Prenom || 'Quelqu\'un'} ${demande?.utilisateur?.Nom || ''} souhaite adopter ${demande?.animal?.Nom || 'un animal'} de votre refuge`,
                type: 'adoption_request',
                read: false,
                demandeId: demande.Id,
                animalId: demande.IdAnimal,
                date: new Date().toISOString()
            });
        });
        
        // Mettre à jour la référence des demandes précédentes
        previousDemandesRef.current = demandes;
        
    }, [demandeAdoptionsRefuge, DemandeAdoptionsLoading, addNotification, refugeId]);

    return null;
};*/

// components/DemandeAdoptionWatcher.js
/*import { useEffect, useRef } from 'react'
import { useDemandeAdoptionsByRefuge, useDemandeAdoptionsByUser } from '../hooks/useDemandeAdoption'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '@clerk/clerk-react'
//import { setDragLock } from 'framer-motion'
import { useDemandeTransfertsByRefugeCible, useDemandeTransfertsByRefugeDepart } from '../hooks/useDemandeTransfert'

export const DemandeAdoptionWatcher = ({ refugeId, utilisateur }) => {
    const { user, isSignedIn } = useAuth()
    const { addNotification } = useNotifications()
    const previousDemandesRef = useRef([])
    const previousUserDemandesRef = useRef([])
    const previousTransfertsDepartRef = useRef([])  // ← NOUVEAU
    const previousTransfertsCibleRef = useRef([])   // ← NOUVEAU
    
    // Récupérer les demandes selon le rôle
    //const isRefuge = utilisateur?.Refuge?.Id
    /*const isRefuge = utilisateur?.Roles?.some(role => role.Nom === 'refuge') || 
                 utilisateur?.Refuge[0]?.Id || 
                 utilisateur?.refugeId* /
    //const refugeId = isRefuge ? (user?.refugeId || user?.Refuge?.Id) : null

    const roles = utilisateur?.Roles?.map(role => role.Nom) ?? []

    const isRefuge = roles.includes("Refuge")
    const isPrestataire = roles.includes("Prestataire")
    const isUtilisateur = roles.includes("Utilisateur")

    const refugeId = utilisateur?.Refuge?.[0]?.Id ?? null
    const prestataireId = utilisateur?.Prestataire?.[0]?.Id ?? null
    const utilisateurId = utilisateur?.Id ?? null
    
    const { demandeAdoptionsRefuge, DemandeAdoptionsLoading: refugeLoading } = 
        useDemandeAdoptionsByRefuge(refugeId, { enabled: !!isRefuge })
    
    const { demandesUtilisateur, DemandesUtilisateurLoading: userLoading } = 
        useDemandeAdoptionsByUser(utilisateur?.Id, { enabled: !!user?.id && !isRefuge })

    const { demandeTransfertsRefugeDepart, DemandeTransfertsDepartLoading: refugeDepartLoading }=
        useDemandeTransfertsByRefugeDepart(refugeId, {enabled: !!isRefuge})

    const { demandeTransfertsRefugeCible, DemandeTransfertsCibleLoading: refugeCibleLoading }=
        useDemandeTransfertsByRefugeCible(refugeId, {enabled: !!isRefuge})

    console.log("=== DemandeAdoptionWatcher ===")
    console.log("utilisateur:", utilisateur)
    console.log("isSignedIn:", isSignedIn)
    console.log("isRefuge:", isRefuge)
    console.log("refugeId:", refugeId)
    console.log("refugeLoading:", refugeLoading)
    console.log("demandeAdoptionsRefuge:", demandeAdoptionsRefuge)
    console.log("demandesUtilisateur:", demandesUtilisateur)
    console.log("userLoading:", userLoading)
    console.log("refugeDepartLoading:", refugeDepartLoading)
    console.log("demandeTransfertsRefugeDepart:", demandeTransfertsRefugeDepart)
    console.log("refugeCibleLoading:", refugeCibleLoading)
    console.log("demandeTransfertsRefugeCible:", demandeTransfertsRefugeCible)
        

    // Watcher pour le refuge (nouvelles demandes entrants)
    useEffect(() => {
        if (/*!isRefuge ||* / refugeLoading) return
        
        const demandes = demandeAdoptionsRefuge || []
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousDemandesRef.current
       // console.log("c'est passes donc ca a charges", demandes[0].Statut)
        // Nouvelles demandes (statut = en_attente)
        const newDemandes = demandes.filter(demande => {
            const isNew = !previousDemandes.some(prev => prev.Id === demande.Id)
            const isPending = demande.Statut === 2 // en_attente
            
            return isNew && isPending
        })
        
        // Notifier le refuge
        newDemandes.forEach(demande => {
            addNotification({
                id: `new_${demande.Id}_${Date.now()}`,
                title: '📋 Nouvelle demande d\'adoption',
                message: `${demande?.utilisateur?.Prenom || 'Quelqu\'un'} ${demande?.utilisateur?.Nom || ''} souhaite adopter ${demande?.animal?.Nom || 'un animal'}`,
                type: 'adoption_request',
                read: false,
                demandeId: demande.Id,
                role: 'refuge',
                date: new Date().toISOString()
            })
        })
        
        previousDemandesRef.current = demandes
        
    }, [demandeAdoptionsRefuge, refugeLoading, addNotification, isRefuge])

    useEffect(() => {
        //console.log("ca load toujours ? : " , userLoading, isRefuge, isSignedIn)
        if (!isSignedIn || isRefuge || userLoading) return
        
        const demandes = demandesUtilisateur || []
        //console.log("les demandes : ", demandes)
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousUserDemandesRef.current
        const isFirstLoad = previousDemandes.length === 0
        
        //console.log("isFirstLoad:", isFirstLoad)
        //console.log("previousDemandes (ancien):", previousDemandes)
        
        // 🔥 Si c'est la première charge, on ne vérifie pas les changements de statut
        // mais on va notifier pour toutes les demandes existantes (optionnel)
        if (!isFirstLoad) {
            //console.log("Vérification des changements de statut...")
            
            // Vérifier les changements de statut
            demandes.forEach(demande => {
                const previousDemande = previousDemandes.find(prev => prev.Id === demande.Id)
                /*console.log("Comparaison:", {
                    id: demande.Id,
                    ancienStatut: previousDemande?.Statut,
                    nouveauStatut: demande.Statut,
                    aChange: previousDemande && previousDemande.Statut !== demande.Statut
                })* /
                
                if (previousDemande && previousDemande.Statut !== demande.Statut) {
                    // Le statut a changé !
                    let title = ''
                    let message = ''
                    let type = ''
                    
                    switch (demande.Statut) {
                        case 1:
                            title = '📝 Demande envoyée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a bien été envoyée.`
                            type = 'info'
                            break
                        case 2:
                            title = '🔍 Demande en cours d\'étude'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} est étudiée par le refuge.`
                            type = 'info'
                            break
                        case 3:
                            title = '❌ Demande refusée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été refusée.`
                            type = 'error'
                            break
                        case 4:
                            title = '🔄 Demande annulée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été annulée.`
                            type = 'warning'
                            break
                        case 5:
                            title = '✅ Demande acceptée !'
                            message = `Félicitations ! Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été acceptée.`
                            type = 'success'
                            break
                        case 6:
                            title = '👀 Demande consultée'
                            message = `Le refuge a consulté votre demande pour ${demande?.animal?.Nom || 'l\'animal'}.`
                            type = 'info'
                            break
                        default:
                            title = '📬 Mise à jour'
                            message = `Votre demande a été mise à jour (statut: ${getStatutLabel(demande.Statut)})`
                            type = 'info'
                    }
                    
                    addNotification({
                        id: `statut_${demande.Id}_${Date.now()}`,
                        title,
                        message,
                        type,
                        read: false,
                        demandeId: demande.Id,
                        role: 'adoptant',
                        ancienStatut: previousDemande.Statut,
                        nouveauStatut: demande.Statut,
                        date: new Date().toISOString()
                    })
                }
            })
        }
        
        // 🔥 NOTIFIER POUR LES NOUVELLES DEMANDES
        // Au premier chargement, on notifie pour TOUTES les demandes
        // Sinon, on notifie seulement pour celles qui n'existaient pas avant
        const demandesANotifier = isFirstLoad ? demandes : demandes.filter(demande => 
            !previousDemandes.some(prev => prev.Id === demande.Id)
        )
        
        //console.log("Demandes à notifier:", demandesANotifier.length)
        
        demandesANotifier.forEach(demande => {
            //console.log("Nouvelle demande détectée:", demande.Id, "statut:", demande.Statut)
            
            let title = ''
            let message = ''
            let type = ''
            
            // Choisir le message selon le statut initial
            switch (demande.Statut) {
                case 1:
                    title = '📝 Demande envoyée'
                    message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été envoyée au refuge.`
                    type = 'info'
                    break
                case 6:
                    title = '👀 Demande consultée'
                    message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été consultée par le refuge.`
                    type = 'info'
                    break
                default:
                    title = '📋 Nouvelle demande'
                    message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été enregistrée (statut: ${getStatutLabel(demande.Statut)})`
                    type = 'info'
            }
            
            addNotification({
                id: `user_new_${demande.Id}_${Date.now()}_${Math.random()}`,
                title,
                message,
                type,
                read: false,
                demandeId: demande.Id,
                role: 'adoptant',
                date: new Date().toISOString()
            })
        })
        
        // Mettre à jour la référence avec les nouvelles demandes
        previousUserDemandesRef.current = demandes
        
    }, [demandesUtilisateur, userLoading, addNotification, isSignedIn, isRefuge])

    useEffect(() => {
        //console.log("ca load toujours ? : " , refugeDepartLoading, isRefuge, isSignedIn)
        if (!isSignedIn || !isRefuge || refugeDepartLoading) return
        
        const demandes = demandeTransfertsRefugeDepart || []
        //console.log("les demandes : ", demandes)
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousTransfertsDepartRef.current
        const isFirstLoad = previousDemandes.length === 0
        
        //console.log("isFirstLoad:", isFirstLoad)
        //console.log("previousDemandes (ancien):", previousDemandes)
        
        // 🔥 Si c'est la première charge, on ne vérifie pas les changements de statut
        // mais on va notifier pour toutes les demandes existantes (optionnel)
        if (!isFirstLoad) {
            console.log("Vérification des changements de statut...")
            
            // Vérifier les changements de statut
            demandes.forEach(demande => {
                const previousDemande = previousDemandes.find(prev => prev.Id === demande.Id)
                /*console.log("Comparaison:", {
                    id: demande.Id,
                    ancienStatut: previousDemande?.Statut,
                    nouveauStatut: demande.Statut,
                    aChange: previousDemande && previousDemande.Statut !== demande.Statut
                })* /
                
                if (previousDemande && previousDemande.Statut !== demande.Statut) {
                    // Le statut a changé !
                    let title = ''
                    let message = ''
                    let type = ''
                    
                    switch (demande.Statut) {
                        case 1:
                            title = '📝 Demande envoyée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a bien été envoyée.`
                            type = 'info'
                            break
                        case 2:
                            title = '🔍 Demande en cours d\'étude'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} est étudiée par le refuge.`
                            type = 'info'
                            break
                        case 3:
                            title = '❌ Demande refusée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été refusée.`
                            type = 'error'
                            break
                        case 4:
                            title = '🔄 Demande annulée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été annulée.`
                            type = 'warning'
                            break
                        case 5:
                            title = '✅ Demande acceptée !'
                            message = `Félicitations ! Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été acceptée.`
                            type = 'success'
                            break
                        case 6:
                            title = '👀 Demande consultée'
                            message = `Le refuge a consulté votre demande pour ${demande?.animal?.Nom || 'l\'animal'}.`
                            type = 'info'
                            break
                        default:
                            title = '📬 Mise à jour'
                            message = `Votre demande a été mise à jour (statut: ${getStatutLabel(demande.Statut)})`
                            type = 'info'
                    }
                    
                    addNotification({
                        id: `statut_${demande.Id}_${Date.now()}`,
                        title,
                        message,
                        type,
                        read: false,
                        demandeId: demande.Id,
                        role: 'adoptant',
                        ancienStatut: previousDemande.Statut,
                        nouveauStatut: demande.Statut,
                        date: new Date().toISOString()
                    })
                }
            })
        }
        
        // 🔥 NOTIFIER POUR LES NOUVELLES DEMANDES
        // Au premier chargement, on notifie pour TOUTES les demandes
        // Sinon, on notifie seulement pour celles qui n'existaient pas avant
        const demandesANotifier = isFirstLoad ? demandes : demandes.filter(demande => 
            !previousDemandes.some(prev => prev.Id === demande.Id)
        )
        
        //console.log("Demandes à notifier:", demandesANotifier.length)
        
        demandesANotifier.forEach(demande => {
            console.log("Nouvelle demande détectée:", demande.Id, "statut:", demande.Statut)
            
            let title = ''
            let message = ''
            let type = ''
            
            // Choisir le message selon le statut initial
            switch (demande.Statut) {
                case 1:
                    title = '📝 Demande envoyée'
                    message = `Votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} a été envoyée au refuge.`
                    type = 'info'
                    break
                case 6:
                    title = '👀 Demande consultée'
                    message = `Votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} a été consultée par le refuge.`
                    type = 'info'
                    break
                default:
                    title = '📋 Nouvelle demande'
                    message = `Votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} a été enregistrée (statut: ${getStatutLabel(demande.Statut)})`
                    type = 'info'
            }
            
            addNotification({
                id: `user_new_${demande.Id}_${Date.now()}_${Math.random()}`,
                title,
                message,
                type,
                read: false,
                demandeId: demande.Id,
                role: 'adoptant',
                date: new Date().toISOString()
            })
        })
        
        // Mettre à jour la référence avec les nouvelles demandes
        previousTransfertsDepartRef.current = demandes
        
    }, [demandeTransfertsRefugeDepart, refugeDepartLoading, addNotification, isSignedIn, isRefuge])

    useEffect(() => {
        //console.log("ca load toujours ? : " , refugeCibleLoading, isRefuge, isSignedIn)
        console.log("=== DEBUG TRANSFERTS CIBLE ===")
        console.log("l'utilisateur:", utilisateur)
    console.log("isSignedIn:", isSignedIn)
    console.log("isRefuge:", isRefuge)
    console.log("refugeCibleLoading:", refugeCibleLoading)
    console.log("demandeTransfertsRefugeCible:", demandeTransfertsRefugeCible)
    console.log("demandeTransfertsRefugeCible length:", demandeTransfertsRefugeCible?.length)
        if (!isSignedIn || !isRefuge || refugeCibleLoading) return
        
        const demandes = demandeTransfertsRefugeCible || []
        //console.log("les demandes : ", demandes)
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousTransfertsCibleRef.current
        const isFirstLoad = previousDemandes.length === 0
        
        //console.log("isFirstLoad:", isFirstLoad)
        //console.log("previousDemandes (ancien):", previousDemandes)
        
        // 🔥 Si c'est la première charge, on ne vérifie pas les changements de statut
        // mais on va notifier pour toutes les demandes existantes (optionnel)
        if (!isFirstLoad) {
            console.log("Vérification des changements de statut...")
            
            // Vérifier les changements de statut
            demandes.forEach(demande => {
                const previousDemande = previousDemandes.find(prev => prev.Id === demande.Id)
                console.log("Comparaison:", {
                    id: demande.Id,
                    ancienStatut: previousDemande?.Statut,
                    nouveauStatut: demande.Statut,
                    aChange: previousDemande && previousDemande.Statut !== demande.Statut
                })
                
                if (previousDemande && previousDemande.Statut !== demande.Statut) {
                    // Le statut a changé !
                    let title = ''
                    let message = ''
                    let type = ''
                    
                    switch (demande.Statut) {
                        case 1:
                            title = '📝 Demande envoyée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a bien été envoyée.`
                            type = 'info'
                            break
                        case 2:
                            title = '🔍 Demande en cours d\'étude'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} est étudiée par le refuge.`
                            type = 'info'
                            break
                        case 3:
                            title = '❌ Demande refusée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été refusée.`
                            type = 'error'
                            break
                        case 4:
                            title = '🔄 Demande annulée'
                            message = `Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été annulée.`
                            type = 'warning'
                            break
                        case 5:
                            title = '✅ Demande acceptée !'
                            message = `Félicitations ! Votre demande pour ${demande?.animal?.Nom || 'l\'animal'} a été acceptée.`
                            type = 'success'
                            break
                        case 6:
                            title = '👀 Demande consultée'
                            message = `Le refuge a consulté votre demande pour ${demande?.animal?.Nom || 'l\'animal'}.`
                            type = 'info'
                            break
                        default:
                            title = '📬 Mise à jour'
                            message = `Votre demande a été mise à jour (statut: ${getStatutLabel(demande.Statut)})`
                            type = 'info'
                    }
                    
                    addNotification({
                        id: `statut_${demande.Id}_${Date.now()}`,
                        title,
                        message,
                        type,
                        read: false,
                        demandeId: demande.Id,
                        role: 'adoptant',
                        ancienStatut: previousDemande.Statut,
                        nouveauStatut: demande.Statut,
                        date: new Date().toISOString()
                    })
                }
            })
        }
        
        // 🔥 NOTIFIER POUR LES NOUVELLES DEMANDES
        // Au premier chargement, on notifie pour TOUTES les demandes
        // Sinon, on notifie seulement pour celles qui n'existaient pas avant
        const demandesANotifier = isFirstLoad ? demandes : demandes.filter(demande => 
            !previousDemandes.some(prev => prev.Id === demande.Id)
        )
        
        console.log("Demandes à notifier:", demandesANotifier.length)
        
        demandesANotifier.forEach(demande => {
            console.log("Nouvelle demande détectée:", demande.Id, "statut:", demande.Statut)
            
            let title = ''
            let message = ''
            let type = ''
            
            // Choisir le message selon le statut initial
            switch (demande.Statut) {
                case 1:
                    title = '📝 Demande de transfert envoyée'
                    message = `Votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} a bien été envoyée au refuge cible.`
                    type = 'info'
                    break
                case 2:
                    title = '🔍 Demande de transfert en cours'
                    message = `Votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} est en cours d'étude par le refuge cible.`
                    type = 'info'
                    break
                case 3:
                    title = '❌ Demande de transfert refusée'
                    message = `Votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} a été refusée.`
                    type = 'error'
                    break
                case 4:
                    title = '🔄 Demande de transfert annulée'
                    message = `Votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} a été annulée.`
                    type = 'warning'
                    break
                case 5:
                    title = '✅ Demande de transfert acceptée !'
                    message = `Félicitations ! La demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'} a été acceptée. Le transfert va être organisé.`
                    type = 'success'
                    break
                case 6:
                    title = '👀 Demande de transfert consultée'
                    message = `Le refuge cible a consulté votre demande de transfert pour ${demande?.animal?.Nom || 'l\'animal'}.`
                    type = 'info'
                    break
                default:
                    title = '📬 Mise à jour du transfert'
                    message = `Votre demande de transfert a été mise à jour (statut: ${getStatutLabel(demande.Statut)})`
                    type = 'info'
            }
            
            addNotification({
                id: `user_new_${demande.Id}_${Date.now()}_${Math.random()}`,
                title,
                message,
                type,
                read: false,
                demandeId: demande.Id,
                role: 'adoptant',
                date: new Date().toISOString()
            })
        })
        
        // Mettre à jour la référence avec les nouvelles demandes
        previousTransfertsCibleRef.current = demandes
        
    }, [demandeTransfertsRefugeCible, refugeCibleLoading, addNotification, isSignedIn, isRefuge])

    return null
}



// Helper
const getStatutLabel = (statut) => {
    const statuts = {
        1: 'En attente',
        2: 'En cours d\'étude',
        3: 'Refusée',
        4: 'Annulée',
        5: 'Acceptée',
        6: 'Consultée'
    }
    return statuts[statut] || 'Inconnu'
}*/

// components/DemandeAdoptionWatcher.js
import { useEffect, useMemo, useRef } from "react"
import { useAuth } from "@clerk/clerk-react"

import {
  useDemandeAdoptionsByRefuge,
  useDemandeAdoptionsByUser,
} from "../hooks/useDemandeAdoption"

import {
  useDemandeTransfertsByRefugeCible,
  useDemandeTransfertsByRefugeDepart,
} from "../hooks/useDemandeTransfert"

import {
  useSignalements,
  useSignalementsByUser,
} from "../hooks/useSignalement"

import { useNotifications } from "../context/NotificationContext"
import { useReservationsByPrestataire, useReservationsByUtilisateur } from "../hooks/useReservation"

export const DemandeAdoptionWatcher = ({ utilisateur }) => {
  const { isSignedIn } = useAuth()
  const { addNotification } = useNotifications()

  const previousAdoptionsRefugeRef = useRef([])
  const previousAdoptionsUserRef = useRef([])
  const previousTransfertsDepartRef = useRef([])
  const previousTransfertsCibleRef = useRef([])
  const previousSignalementsAdminRef = useRef([])
  const previousSignalementsUserRef = useRef([])
  const previousReservationsPrestataireRef = useRef([])
  const previousReservationsUtilisateurRef = useRef([])
  const previousReservationsUserSuiviRef = useRef([])
  const previousReservationsPrestataireSuiviRef = useRef([])

  const roles = useMemo(() => {
    return utilisateur?.Roles?.map(role => role.Nom) ?? []
  }, [utilisateur])

  const isRefuge = roles.includes("Refuge")

  const refugeId = utilisateur?.Refuge?.[0]?.Id ?? null
  const utilisateurId = utilisateur?.Id ?? null
  const isAdmin = roles.includes("Admin")
  const isUtilisateur = roles.includes("Utilisateur")

  const prestataireId = utilisateur?.Prestataire?.[0]?.Id ?? null
  const isPrestataire = roles.includes("Prestataire")

  const {
    demandeAdoptionsRefuge,
    DemandeAdoptionsLoading: adoptionsRefugeLoading,
  } = useDemandeAdoptionsByRefuge(refugeId, {
    enabled: isSignedIn && isRefuge && !!refugeId,
  })

  const {
    demandesUtilisateur,
    DemandesUtilisateurLoading: adoptionsUserLoading,
  } = useDemandeAdoptionsByUser(utilisateurId, {
    enabled: isSignedIn && !isRefuge && !!utilisateurId,
  })

  const {
    demandeTransfertsRefugeDepart,
    DemandeTransfertsDepartLoading: transfertsDepartLoading,
  } = useDemandeTransfertsByRefugeDepart(refugeId, {
    enabled: isSignedIn && isRefuge && !!refugeId,
  })

  const {
    demandeTransfertsRefugeCible,
    DemandeTransfertsCibleLoading: transfertsCibleLoading,
  } = useDemandeTransfertsByRefugeCible(refugeId, {
    enabled: isSignedIn && isRefuge && !!refugeId,
  })

  const {
    signalements,
    SignalementsLoading,
  } = useSignalements({
    enabled: isSignedIn && isAdmin,
  })

  const {
    signalements:signalementsUtilisateur,
    SignalementsLoading:SignalementsUtilisateurLoading,
  } = useSignalementsByUser(utilisateurId, {
    enabled: isSignedIn && !!utilisateurId ,//&& !isAdmin,
  })

  const {
    reservations:reservationsPrestataire,
    ReservationsLoading:ReservationsPrestataireLoading,
  } = useReservationsByPrestataire(prestataireId, {
    enabled: isSignedIn && !!prestataireId,
  })

  const {
    reservations:reservationsUtilisateur,
    ReservationsLoading:ReservationsUtilisateurLoading,
  } = useReservationsByUtilisateur(utilisateurId, {
    enabled: isSignedIn && !!utilisateurId,
  })

  console.log("reservationsUtilisateur:", reservationsUtilisateur)
console.log("reservationsPrestataire:", reservationsPrestataire)
console.log("utilisateurId:", utilisateurId)
console.log("prestataireId:", prestataireId)

  // 1. Refuge reçoit une nouvelle demande d’adoption
  useDemandesWatcher({
    enabled: isSignedIn && isRefuge,
    loading: adoptionsRefugeLoading,
    demandes: demandeAdoptionsRefuge,
    previousRef: previousAdoptionsRefugeRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: true,
    filter: demande => demande.Statut === 2,
    getNotification: getNewAdoptionForRefugeNotification,
  })

  // 2. Utilisateur reçoit les updates de ses demandes d’adoption
  useDemandesWatcher({
    enabled: isSignedIn && !isRefuge,
    loading: adoptionsUserLoading,
    demandes: demandesUtilisateur,
    previousRef: previousAdoptionsUserRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: false,
    getNotification: getAdoptionUserNotification,
  })

  // 3. Refuge départ suit ses demandes de transfert envoyées
  useDemandesWatcher({
    enabled: isSignedIn && isRefuge,
    loading: transfertsDepartLoading,
    demandes: demandeTransfertsRefugeDepart,
    previousRef: previousTransfertsDepartRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: false,
    getNotification: getTransfertDepartNotification,
  })

  // 4. Refuge cible reçoit / suit les demandes de transfert
  useDemandesWatcher({
    enabled: isSignedIn && isRefuge,
    loading: transfertsCibleLoading,
    demandes: demandeTransfertsRefugeCible,
    previousRef: previousTransfertsCibleRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: false,
    getNotification: getTransfertCibleNotification,
  })

  // Admin reçoit les nouveaux signalements
  useDemandesWatcher({
    enabled: isSignedIn && isAdmin,
    loading: SignalementsLoading,
    demandes: signalements,
    previousRef: previousSignalementsAdminRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: true,
    filter: signalement => Number(signalement.Statut) === 2,
    getNotification: getNewSignalementForAdminNotification,
  })

  // Utilisateur suit ses signalements
  useDemandesWatcher({
    enabled: isSignedIn ,//&& !isAdmin,
    loading: SignalementsUtilisateurLoading,
    demandes: signalementsUtilisateur,
    previousRef: previousSignalementsUserRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: false,
    getNotification: getSignalementUserNotification,
  })



  useDemandesWatcher({
    enabled: isSignedIn && isPrestataire && !!prestataireId,
    loading: ReservationsPrestataireLoading,
    demandes: reservationsPrestataire,
    previousRef: previousReservationsPrestataireRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: true,
    filter: reservation =>
      reservation.TypeReservation === "reservation" &&
      Number(reservation.Statut) === 2,
    getNotification: getNewReservationForPrestataireNotification,
  })

  useDemandesWatcher({
    enabled: isSignedIn && !!utilisateurId,
    loading: ReservationsUtilisateurLoading,
    demandes: reservationsUtilisateur,
    previousRef: previousReservationsUtilisateurRef,
    addNotification,
    notifyFirstLoad: true,
    onlyNew: true,
    filter: reservation =>
      String(reservation.TypeReservation).trim().toLowerCase() === "annonce" &&
      Number(reservation.Statut) === 2,
    getNotification: getNewReservationForAnnonceOwnerNotification,
  })

  useDemandesWatcher({
    enabled: isSignedIn && !!utilisateurId,
    loading: ReservationsUtilisateurLoading,
    demandes: reservationsUtilisateur,
    previousRef: previousReservationsUserSuiviRef,
    addNotification,
    notifyFirstLoad: false,
    onlyNew: false,
    filter: reservation => String(reservation.TypeReservation).trim().toLowerCase() === "reservation",
    getNotification: getReservationUserNotification,
  })

  useDemandesWatcher({
    enabled: isSignedIn && isPrestataire && !!prestataireId,
    loading: ReservationsPrestataireLoading,
    demandes: reservationsPrestataire,
    previousRef: previousReservationsPrestataireSuiviRef,
    addNotification,
    notifyFirstLoad: false,
    onlyNew: false,
    filter: reservation => String(reservation.TypeReservation).trim().toLowerCase() === "annonce",
    getNotification: getReservationPrestataireNotification,
  })

  return null
}

const useDemandesWatcher = ({
  enabled,
  loading,
  demandes,
  previousRef,
  addNotification,
  notifyFirstLoad = false,
  onlyNew = false,
  filter = () => true,
  getNotification,
}) => {
  useEffect(() => {
    if (!enabled || loading) return

    const currentDemandes = Array.isArray(demandes) ? demandes : []
    const previousDemandes = previousRef.current

    if (currentDemandes.length === 0) {
      previousRef.current = []
      return
    }

    const isFirstLoad = previousDemandes.length === 0

    let demandesToNotify = []

    if (isFirstLoad) {
      demandesToNotify = notifyFirstLoad ? currentDemandes.filter(filter) : []
    } else if (onlyNew) {
      demandesToNotify = currentDemandes.filter(demande => {
        const isNew = !previousDemandes.some(prev => prev.Id === demande.Id)
        return isNew && filter(demande)
      })
    } else {
      demandesToNotify = currentDemandes.filter(demande => {
        const previousDemande = previousDemandes.find(prev => prev.Id === demande.Id)

        const isNew = !previousDemande
        const statusChanged =
          previousDemande && previousDemande.Statut !== demande.Statut

        return (isNew || statusChanged) && filter(demande)
      })
    }

    demandesToNotify.forEach(demande => {
      const notification = getNotification(demande)

      addNotification({
        id: `${notification.role}_${demande.Id}_${Date.now()}_${Math.random()}`,
        ...notification,
        read: false,
        demandeId: demande.Id,
        animalId: demande.IdAnimal,
        date: new Date().toISOString(),
      })
    })

    previousRef.current = currentDemandes
  }, [
    enabled,
    loading,
    demandes,
    previousRef,
    addNotification,
    notifyFirstLoad,
    onlyNew,
    filter,
    getNotification,
  ])
}

const getNewAdoptionForRefugeNotification = demande => {
  return {
    title: "📋 Nouvelle demande d'adoption",
    message: `${demande?.utilisateur?.Prenom || "Quelqu'un"} ${
      demande?.utilisateur?.Nom || ""
    } souhaite adopter ${demande?.animal?.Nom || "un animal"}`,
    type: "adoption_request",
    role: "refuge",
  }
}

const getAdoptionUserNotification = demande => {
  const animalName = demande?.animal?.Nom || "l'animal"

  switch (demande.Statut) {
    case 1:
      return {
        title: "📝 Demande envoyée",
        message: `Votre demande pour ${animalName} a été envoyée au refuge.`,
        type: "info",
        role: "adoptant",
      }

    case 2:
      return {
        title: "🔍 Demande en cours d'étude",
        message: `Votre demande pour ${animalName} est étudiée par le refuge.`,
        type: "info",
        role: "adoptant",
      }

    case 3:
      return {
        title: "❌ Demande refusée",
        message: `Votre demande pour ${animalName} a été refusée.`,
        type: "error",
        role: "adoptant",
      }

    case 4:
      return {
        title: "🔄 Demande annulée",
        message: `Votre demande pour ${animalName} a été annulée.`,
        type: "warning",
        role: "adoptant",
      }

    case 5:
      return {
        title: "✅ Demande acceptée !",
        message: `Félicitations ! Votre demande pour ${animalName} a été acceptée.`,
        type: "success",
        role: "adoptant",
      }

    case 6:
      return {
        title: "👀 Demande consultée",
        message: `Le refuge a consulté votre demande pour ${animalName}.`,
        type: "info",
        role: "adoptant",
      }

    default:
      return {
        title: "📬 Mise à jour",
        message: `Votre demande a été mise à jour.`,
        type: "info",
        role: "adoptant",
      }
  }
}

const getTransfertDepartNotification = demande => {
  const animalName = demande?.animal?.Nom || "l'animal"

  switch (demande.Statut) {
    case 1:
      return {
        title: "📝 Demande de transfert envoyée",
        message: `Votre demande de transfert pour ${animalName} a été envoyée au refuge cible.`,
        type: "info",
        role: "refuge_depart",
      }

    case 5:
      return {
        title: "❌ Transfert refusé",
        message: `Votre demande de transfert pour ${animalName} a été refusée.`,
        type: "error",
        role: "refuge_depart",
      }

    case 4:
      return {
        title: "✅ Transfert accepté",
        message: `Votre demande de transfert pour ${animalName} a été acceptée.`,
        type: "success",
        role: "refuge_depart",
      }

    case 6:
      return {
        title: "👀 Transfert consulté",
        message: `Le refuge cible a consulté votre demande de transfert pour ${animalName}.`,
        type: "info",
        role: "refuge_depart",
      }

    default:
      return {
        title: "📬 Mise à jour du transfert",
        message: `Votre demande de transfert pour ${animalName} a été mise à jour.`,
        type: "info",
        role: "refuge_depart",
      }
  }
}

const getTransfertCibleNotification = demande => {
  const animalName = demande?.animal?.Nom || "l'animal"

  switch (demande.Statut) {
    case 1:
      return {
        title: "📥 Nouvelle demande de transfert",
        message: `Un refuge souhaite transférer ${animalName} vers votre refuge.`,
        type: "transfer_request",
        role: "refuge_cible",
      }

    case 2:
      return {
        title: "🔍 Transfert en cours d'étude",
        message: `La demande de transfert pour ${animalName} est en cours d'étude.`,
        type: "info",
        role: "refuge_cible",
      }

    case 3:
      return {
        title: "❌ Transfert refusé",
        message: `La demande de transfert pour ${animalName} a été refusée.`,
        type: "error",
        role: "refuge_cible",
      }

    case 5:
      return {
        title: "🔄 Transfert annulé",
        message: `La demande de transfert pour ${animalName} a été annulée.`,
        type: "warning",
        role: "refuge_cible",
      }

    case 4:
      return {
        title: "✅ Transfert accepté",
        message: `La demande de transfert pour ${animalName} a été acceptée.`,
        type: "success",
        role: "refuge_cible",
      }

    case 6:
      return {
        title: "👀 Transfert consulté",
        message: `La demande de transfert pour ${animalName} a été consultée.`,
        type: "info",
        role: "refuge_cible",
      }

    default:
      return {
        title: "📬 Mise à jour du transfert",
        message: `La demande de transfert pour ${animalName} a été mise à jour.`,
        type: "info",
        role: "refuge_cible",
      }
  }
}

const getNewSignalementForAdminNotification = signalement => {
  return {
    title: "🚨 Nouveau signalement",
    message: `${signalement?.utilisateur?.Prenom || "Un utilisateur"} ${
      signalement?.utilisateur?.Nom || ""
    } a envoyé un signalement.`,
    type: "signalement",
    role: "admin",
  }
}

const getSignalementUserNotification = signalement => {
  console.log("les signalements", signalement)
  switch (signalement.Statut) {
    case 1:
      return {
        title: "🚨 Signalement envoyé",
        message: "Votre signalement a bien été envoyé.",
        type: "info",
        role: "utilisateur",
      }

    case 2:
      return {
        title: "🔍 Signalement en traitement",
        message: "Votre signalement est en cours de traitement.",
        type: "info",
        role: "utilisateur",
      }

    case 3:
      return {
        title: "✅ Signalement traité",
        message: "Votre signalement a été traité par l'administration.",
        type: "success",
        role: "utilisateur",
      }

    case 4:
      return {
        title: "✅ Signalement traité",
        message: "Votre signalement a été traité par l'administration.",
        type: "success",
        role: "utilisateur",
      }

    case 5:
      return {
        title: "❌ Signalement rejeté",
        message: "Votre signalement a été rejeté.",
        type: "error",
        role: "utilisateur",
      }

    default:
      return {
        title: "📬 Mise à jour du signalement",
        message: "Votre signalement a été mis à jour.",
        type: "info",
        role: "utilisateur",
      }
  }
}



const getNewReservationForPrestataireNotification = reservation => {
  return {
    title: "📅 Nouvelle réservation",
    message: "Vous avez reçu une nouvelle demande de réservation.",
    type: "reservation_request",
    role: "prestataire",
  }
}

const getNewReservationForAnnonceOwnerNotification = reservation => {
  return {
    title: "📅 Nouvelle candidature",
    message: "Un prestataire a répondu à votre annonce.",
    type: "reservation_request",
    role: "utilisateur",
  }
}

const getReservationUserNotification = reservation => {
  switch (Number(reservation.Statut)) {
    case 2:
      return {
        title: "🔍 Réservation en cours de traitement",
        message: "Votre réservation est en cours de traitement.",
        type: "info",
        role: "utilisateur",
      }

    case 3:
      return {
        title: "✅ Réservation acceptée",
        message: "Votre réservation a été acceptée.",
        type: "success",
        role: "utilisateur",
      }

    case 4:
      return {
        title: "❌ Réservation rejetée",
        message: "Votre réservation a été rejetée.",
        type: "error",
        role: "utilisateur",
      }

    default:
      return {
        title: "📬 Mise à jour de réservation",
        message: "Votre réservation a été mise à jour.",
        type: "info",
        role: "utilisateur",
      }
  }
}

const getReservationPrestataireNotification = reservation => {
  switch (Number(reservation.Statut)) {
    case 2:
      return {
        title: "🔍 Candidature en cours de traitement",
        message: "Votre réponse à l’annonce est en cours de traitement.",
        type: "info",
        role: "prestataire",
      }

    case 3:
      return {
        title: "✅ Candidature acceptée",
        message: "Votre réponse à l’annonce a été acceptée.",
        type: "success",
        role: "prestataire",
      }

    case 4:
      return {
        title: "❌ Candidature rejetée",
        message: "Votre réponse à l’annonce a été rejetée.",
        type: "error",
        role: "prestataire",
      }

    default:
      return {
        title: "📬 Mise à jour de candidature",
        message: "Votre réponse à l’annonce a été mise à jour.",
        type: "info",
        role: "prestataire",
      }
  }
}