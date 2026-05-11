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
import { useEffect, useRef } from 'react'
import { useDemandeAdoptionsByRefuge, useDemandeAdoptionsByUser } from '../hooks/useDemandeAdoption'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '@clerk/clerk-react'
import { setDragLock } from 'framer-motion'
import { useDemandeTransfertsByRefugeCible, useDemandeTransfertsByRefugeDepart } from '../hooks/useDemandeTransfert'

export const DemandeAdoptionWatcher = ({ refugeId, utilisateur }) => {
    const { user, isSignedIn } = useAuth()
    const { addNotification } = useNotifications()
    const previousDemandesRef = useRef([])
    const previousUserDemandesRef = useRef([])
    const previousTransfertsDepartRef = useRef([])  // ← NOUVEAU
    const previousTransfertsCibleRef = useRef([])   // ← NOUVEAU
    
    // Récupérer les demandes selon le rôle
    const isRefuge = utilisateur?.Refuge?.Id
    //const refugeId = isRefuge ? (user?.refugeId || user?.Refuge?.Id) : null
    
    const { demandeAdoptionsRefuge, DemandeAdoptionsLoading: refugeLoading } = 
        useDemandeAdoptionsByRefuge(refugeId, { enabled: !!isRefuge })
    
    const { demandesUtilisateur, DemandesUtilisateurLoading: userLoading } = 
        useDemandeAdoptionsByUser(utilisateur?.Id, { enabled: !!user?.id && !isRefuge })

    const { demandeTransfertsRefugeDepart, DemandeTransfertsDepartLoading: refugeDepartLoading }=
        useDemandeTransfertsByRefugeDepart(refugeId, {enabled: !!isRefuge})

    const { demandeTransfertsRefugeCible, DemandeTransfertsCibleLoading: refugeCibleLoading }=
        useDemandeTransfertsByRefugeCible(refugeId, {enabled: !!isRefuge})

    // Watcher pour le refuge (nouvelles demandes entrants)
    useEffect(() => {
        if (/*!isRefuge ||*/ refugeLoading) return
        
        const demandes = demandeAdoptionsRefuge || []
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousDemandesRef.current
        console.log("c'est passes donc ca a charges", demandes[0].Statut)
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
        console.log("ca load toujours ? : " , userLoading, isRefuge, isSignedIn)
        if (!isSignedIn || isRefuge || userLoading) return
        
        const demandes = demandesUtilisateur || []
        console.log("les demandes : ", demandes)
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousUserDemandesRef.current
        const isFirstLoad = previousDemandes.length === 0
        
        console.log("isFirstLoad:", isFirstLoad)
        console.log("previousDemandes (ancien):", previousDemandes)
        
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
        console.log("ca load toujours ? : " , refugeDepartLoading, isRefuge, isSignedIn)
        if (!isSignedIn || !isRefuge || refugeDepartLoading) return
        
        const demandes = demandeTransfertsRefugeDepart || []
        console.log("les demandes : ", demandes)
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousTransfertsDepartRef.current
        const isFirstLoad = previousDemandes.length === 0
        
        console.log("isFirstLoad:", isFirstLoad)
        console.log("previousDemandes (ancien):", previousDemandes)
        
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
        previousTransfertsDepartRef.current = demandes
        
    }, [demandeTransfertsRefugeDepart, refugeDepartLoading, addNotification, isSignedIn, isRefuge])

    useEffect(() => {
        console.log("ca load toujours ? : " , refugeCibleLoading, isRefuge, isSignedIn)
        if (!isSignedIn || !isRefuge || refugeCibleLoading) return
        
        const demandes = demandeTransfertsRefugeCible || []
        console.log("les demandes : ", demandes)
        if (!Array.isArray(demandes) || demandes.length === 0) return

        const previousDemandes = previousTransfertsCibleRef.current
        const isFirstLoad = previousDemandes.length === 0
        
        console.log("isFirstLoad:", isFirstLoad)
        console.log("previousDemandes (ancien):", previousDemandes)
        
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
}