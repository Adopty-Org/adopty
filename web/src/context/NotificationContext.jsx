import { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  return useContext(NotificationContext)
}

export const NotificationProvider = ({ children }) => {
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

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

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