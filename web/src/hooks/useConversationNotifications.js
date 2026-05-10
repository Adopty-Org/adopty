// frontend/src/hooks/useConversationNotifications.js
import { useEffect, useCallback, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNotifications } from '../context/NotificationContext'
import { conversationApi, conversationParticipantApi, utilisateurApi, messageApi, messageReadApi } from '../lib/api'

export const useConversationNotifications = () => {
  const { user } = useUser()
  const { addMessageNotification } = useNotifications()
  const previousUnreadState = useRef({})
  const isChecking = useRef(false)

  const fetchUnreadCount = async (conversationId, userId) => {
    try {
      const messages = await messageReadApi.getByConversation(conversationId)
      const unreadMessages = messages.filter(msg => {
        if (msg.senderId === userId || msg.SenderId === userId) return false
        const hasRead = msg.readBy && msg.readBy.includes(userId)
        return !hasRead
      })
      return unreadMessages.length
    } catch (err) {
      return 0
    }
  }

  const checkConversations = useCallback(async () => {
    if (!user?.id || isChecking.current) return
    
    isChecking.current = true
    
    try {
      const utilisateur = await utilisateurApi.getByClerkId(user.id)
      if (!utilisateur?.Id) return

      const allConversations = await conversationApi.getAll()
      
      for (const conv of allConversations) {
        try {
          const response = await conversationParticipantApi.getParticipantsOfConversation(conv.Id)
          const participants = response.data || response
          const isUserParticipant = participants.some(p => p.Id === utilisateur.Id)
          
          if (isUserParticipant) {
            // Récupérer le nom d'affichage
            const otherParticipants = participants.filter(p => p.Id !== utilisateur.Id)
            let displayName = `Conversation ${conv.Id}`
            if (conv.Type === "direct" && otherParticipants.length === 1) {
              const other = otherParticipants[0]
              displayName = `${other.Prenom || ''} ${other.Nom || ''}`.trim() || "Utilisateur"
            }
            
            const messages = await messageApi.getMessagesByConversation(conv.Id)
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
            const unreadCount = await fetchUnreadCount(conv.Id, utilisateur.Id)
            
            if (unreadCount > 0) {
              const previousUnread = previousUnreadState.current[conv.Id] || 0
              
              if (unreadCount > previousUnread) {
                addMessageNotification(
                  conv.Id,
                  lastMessage?.Contenu,
                  displayName,
                  unreadCount
                )
              }
              previousUnreadState.current[conv.Id] = unreadCount
            } else {
              delete previousUnreadState.current[conv.Id]
            }
          }
        } catch (err) {
          console.error(`Error checking conv ${conv.Id}:`, err)
        }
      }
    } catch (err) {
      console.error("Error checking conversations:", err)
    } finally {
      isChecking.current = false
    }
  }, [user, addMessageNotification])

  useEffect(() => {
    if (!user?.id) return
    
    // Vérification immédiate
    checkConversations()
    
    // Vérification périodique (toutes les 10 secondes pour être plus léger)
    const interval = setInterval(checkConversations, 10000)
    
    // Vérifier quand l'onglet devient visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkConversations()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, checkConversations])
}