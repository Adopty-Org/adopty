import { createContext, useContext, useState, useEffect } from 'react'
import { DemandeAdoptionWatcher } from '../components/DemandeAdoptionWatcher'
import { demandeAdoptionApi } from '../lib/api'
import { useAuth } from '@clerk/clerk-react'

const NotificationContext = createContext()

export const useNotifications = () => {
  return useContext(NotificationContext)
}

export const NotificationProvider = ({ children }) => {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Initial mock data to show to the user
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Demande d\'adoption acceptée !',
        message: 'Votre demande pour "Biscotte" a été acceptée par le refuge. Cliquez ici pour voir les prochaines étapes.',
        type: 'success',
        read: false,
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
      },
      {
        id: '2',
        title: 'Nouveau message',
        message: 'Le refuge "Les Amis des Animaux" vous a envoyé un message concernant votre dossier.',
        type: 'info',
        read: false,
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: '3',
        title: 'Rappel de rendez-vous',
        message: 'N\'oubliez pas votre rendez-vous demain à 14h00 pour rencontrer Biscotte.',
        type: 'warning',
        read: true,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  /*const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }*/

  const markAsRead = async (id) => {
    // 1. D'abord, trouver la notification
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    // 2. Traiter les actions spécifiques selon le type (sans setNotifications)
    switch (notification.type) {
        case 'adoption_request':
            console.log(`📋 Demande d'adoption ${id} marquée comme lue`);
            if (notification.demandeId) {
                try {
                    await demandeAdoptionApi.updateStatut(notification.demandeId, 6);
                    console.log(`✅ Statut de la demande ${notification.demandeId} mis à jour à "vu" (6)`);
                } catch (error) {
                    console.error("Erreur lors de la mise à jour du statut:", error);
                }
            }
            break;
            
        case 'message':
            console.log(`💬 Message de la conversation ${notification.conversationId} marqué comme lu`);
            if (notification.conversationId) {
                clearMessageNotifications(notification.conversationId);
            }
            break;
            
        case 'success':
            console.log(`✅ Notification de succès ${id} marquée comme lue`);
            break;
            
        case 'error':
            console.log(`❌ Notification d'erreur ${id} marquée comme lue`);
            break;
            
        case 'info':
            console.log(`ℹ️ Notification info ${id} marquée comme lue`);
            break;
            
        default:
            console.log(`🔔 Notification ${id} marquée comme lue`);
    }
    
    // 3. Enfin, marquer la notification comme lue dans l'UI
    setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
    ));
};
// Dans votre NotificationContext.jsx
/*const markAsRead = async (id) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    if (notification.type === 'adoption_request' && notification.demandeId) {
        try {
            //const token = localStorage.getItem('token');
            const token = await getToken();
            const demandeId = notification.demandeId;
            const statut = 6;
            
            const url = `/api/demande_adoptions/demandes/${demandeId}/statut`;
            
            console.log("=== PATCH REQUEST ===");
            console.log("URL:", url);
            console.log("Token existe?", !!token);
            console.log("Demande ID:", demandeId);
            console.log("Nouveau statut:", statut);
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ statut })
            });
            
            console.log("Response status:", response.status);
            console.log("Response statusText:", response.statusText);
            
            const data = await response.json();
            console.log("Response data:", data);
            
            if (!response.ok) {
                throw new Error(data.message || `Erreur ${response.status}`);
            }
            
            console.log(`✅ Demande ${demandeId} marquée comme vue`);
            
        } catch (error) {
            console.error("❌ Erreur PATCH:", error);
        }
    }
    
    // Marquer la notification comme lue
    setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
    ));
};*/

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const addNotification = (notification) => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      date: new Date().toISOString(),
      ...notification
    }
    setNotifications(prev => [newNotif, ...prev])
  }

  // NOUVELLES FONCTIONS POUR LES MESSAGES
  const addMessageNotification = (conversationId, messageContent, displayName, unreadCount) => {
    const newNotif = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: `📨 Nouveau message dans ${displayName}`,
      message: messageContent?.slice(0, 100) || "Vous avez reçu un nouveau message",
      type: 'message',
      read: false,
      conversationId: conversationId,
      unreadCount: unreadCount,
      date: new Date().toISOString()
    }
    
    setNotifications(prev => {
      // Éviter les doublons pour la même conversation récente
      const existingNotif = prev.find(n => n.conversationId === conversationId && n.type === 'message' && !n.read);
      if (existingNotif) {
        // Mettre à jour la notification existante
        return prev.map(n => 
          n.conversationId === conversationId && n.type === 'message' && !n.read
            ? { ...n, message: `${unreadCount} message(s) non lu(s) dans ${displayName}`, unreadCount, date: new Date().toISOString() }
            : n
        );
      }
      return [newNotif, ...prev];
    });
  }

  const clearMessageNotifications = (conversationId) => {
    setNotifications(prev => prev.filter(n => !(n.conversationId === conversationId && n.type === 'message')));
  }
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      addNotification,
      addMessageNotification,      // Nouvelle fonction
      clearMessageNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  )
}