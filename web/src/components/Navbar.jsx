import { SignedIn, SignedOut, useAuth, UserButton, useUser } from '@clerk/clerk-react'
import { HomeIcon, InfoIcon, MapPinHouseIcon, PanelLeftIcon, PawPrintIcon, ShoppingBagIcon } from 'lucide-react'
import React, { Children, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart } from '../context/CartContext'
import { AnimatePresence, motion } from 'framer-motion'
import { useProduitPhotos } from '../hooks/useProduit'
import { useNotifications } from '../context/NotificationContext'
import { useEffect } from 'react'
import { useConversationNotifications } from '../hooks/useConversationNotifications'
import { ConversationList } from './chat/ConversationList'
import { ChatRoom } from './chat/ChatRoom'
import { DemandeAdoptionWatcher } from './DemandeAdoptionWatcher'

export const NAVIGATION = [
  {name: "Lobby", path: "/lobby", icon: <HomeIcon className="size-5"/> },
  {name: "Refuges & Animals", path: "/refanimal", icon: <MapPinHouseIcon className="size-5"/> },
  {name: "Encyclopedie", path: "/encyclopedie", icon: <HomeIcon className="size-5"/> },
  {name: "Shop", path: "/shop", icon: <ShoppingBagIcon className="size-5"/> },
  {name: "Services", path: "/services", icon: <PawPrintIcon className="size-5"/> },
  {name: "Conserning us", path: "/conserning", icon: <InfoIcon className="size-5"/> },
  {name: "Signalement", path: "/signalement", icon: <PawPrintIcon className="size-5"/> },
]

function Navbar() {

  const location = useLocation()

  const { cartItems, totalItems, removeFromCart, totalPrice, updateQty } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()

  const { isSignedIn, isLoaded, signOut } = useAuth();
  const isAuthPage = location.pathname === '/auth'
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    if (cartOpen || notificationsOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, notificationsOpen, mobileMenuOpen])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <span className="material-symbols-outlined text-secondary">check_circle</span>
      case 'warning': return <span className="material-symbols-outlined text-warning">warning</span>
      case 'info':
      default: return <span className="material-symbols-outlined text-primary">info</span>
    }
  }

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    return `Il y a ${Math.floor(diff / 86400)} j`
  }

  

  /*useEffect(() => {
    // Si Clerk est chargé et que c'est l'ouverture d'un nouvel onglet,
    // on force la déconnexion pour que la session ne soit pas sauvegardée entre deux onglets/navigateurs
    if (isLoaded) {
      if (!sessionStorage.getItem('app_initialized')) {
        sessionStorage.setItem('app_initialized', 'true')
        if (isSignedIn) {
          signOut()
        }
      }
    }
  }, [isLoaded, isSignedIn, signOut])*/

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  console.log(location);

  // Récupérer le total des messages non lus
  /*const { totalUnread } = */useConversationNotifications()

  // À l'intérieur du composant Navbar, ajoute ces états :
  const [messagingOpen, setMessagingOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)

  
  return (
      
    <div className=' top-0 left-0 right-0 z-50 bg-[#fbfbe2] border-b-2 border-black'>{/* Navbar */}
        
            <div className="navbar bg-[#fbfbe2] w-full flex items-center justify-between px-6 py-2">
                <div className="flex-none lg:hidden">
                    <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost bg-[#fbfbe2]">
                    <PanelLeftIcon className='size-7'/>
                    </label>
                </div>

                {/* Logo */}
                <Link
                  to="/"
                  onClick={() => window.scrollTo(0, 0)}
                  className="font-['Chewy'] text-3xl text-primary hover:scale-105 transition-transform flex-shrink-0"
                >
                  Adopty
                </Link>

                {/*<div className="mx-2  px-2 justify-between flex"><h1> {NAVIGATION.find((item) => item.path === location.pathname)?.name || "Lobby"}</h1></div>*/}
                <div className="hidden flex-none lg:block">
                
                    
                    <div className="hidden lg:flex items-center gap-1">
                    {NAVIGATION.map(link => (
                        <Link
                            key={link.path}   
                            to={link.path}    
                            className={`font-['Plus_Jakarta_Sans'] font-bold text-sm px-3 py-2 rounded-lg transition-all
                            ${link.path === '/signalement'
                                ? 'text-white bg-[#ba1a1a] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1px hover:translate-y-1px hover:shadow-none ml-2'
                                : isActive(link.path)
                                ? 'text-primary bg-surface-container border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'text-primary/70 hover:text-primary hover:bg-surface-container'
                            }`}
                        >
                            {link.path === '/signalement' && (
                            <span className="material-symbols-outlined text-base align-middle mr-1" style={{ fontSize: '14px' }}>
                                warning
                            </span>
                            )}
                            {link.name}   
                        </Link>
                        ))}
                    </div>
                </div>
                
                <div className='flex justify-between space-x-3'>

                  {/* Bouton Messagerie */}
                  <button
                    onClick={() => setMessagingOpen(true)}
                    className="relative p-2 rounded-lg hover:bg-surface-container transition-colors border-2 border-transparent hover:border-black"
                    title="Messagerie"
                  >
                    <span className="material-symbols-outlined text-primary text-2xl">chat_bubble</span>
                    {/*totalUnread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-extrabold rounded-full border-2 border-black flex items-center justify-center">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )*/}
                  </button>

                  {/* DRAWER MESSAGERIE - VIENT DE LA GAUCHE */}
                  <AnimatePresence>
                    {messagingOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-200"
                        onClick={() => setMessagingOpen(false)}
                      >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        
                        <motion.aside
                          initial={{ x: '-100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '-100%' }}
                          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                          className="absolute left-0 top-0 bottom-0 w-full max-w-4xl bg-[#fbfbe2] border-r-4 border-black flex shadow-[8px_0_0_0_rgba(0,0,0,0.3)]"
                          onClick={e => e.stopPropagation()}
                        >
                          {/* En-tête avec titre et fermeture */}
                          <div className="absolute top-0 right-0 p-4 z-10">
                            <button 
                              onClick={() => setMessagingOpen(false)} 
                              className="p-2 border-2 border-black hover:bg-error hover:text-white transition-colors rounded-lg bg-white"
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>

                          {/* Layout conversation + chat */}
                          <div className="flex w-full h-full pt-16">
                            {/* Colonne gauche : liste des conversations - largeur fixe */}
                            <div className="w-80 shrink-0 border-r-2 border-black/20 h-full overflow-hidden">
                              <ConversationList 
                                onSelectConversation={(id) => setSelectedConversation(id)}
                                selectedConversationId={selectedConversation}
                              />
                            </div>

                            {/* Colonne droite : zone de chat avec fond semi-transparent */}
                            <div className="flex-1 h-full bg-black/30 backdrop-blur-sm">
                              {selectedConversation ? (
                                <ChatRoom conversationId={selectedConversation} />
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                  <span className="material-symbols-outlined text-6xl text-white/60 mb-4">chat_bubble_outline</span>
                                  <p className="text-white font-bold text-lg">Sélectionnez une conversation</p>
                                  <p className="text-white/70 text-sm mt-2">Choisissez un discussion pour commencer à discuter</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.aside>
                      </motion.div>
                    )}
                  </AnimatePresence>
                    
                    {/* Notifications */}
                    {/*isSignedIn && !isAuthPage && */(
                      <button
                        onClick={() => setNotificationsOpen(true)}
                        className="relative p-2 rounded-lg hover:bg-surface-container transition-colors border-2 border-transparent hover:border-black"
                        title="Notifications"
                      >
                        <span className="material-symbols-outlined text-primary text-2xl">notifications</span>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-extrabold rounded-full border-2 border-black flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                    )}


                    {/* Panier */}
                    <button
                    onClick={() => setCartOpen(true)}
                    className="relative p-2 rounded-lg hover:bg-surface-container transition-colors border-2 border-transparent hover:border-black"
                    title="Panier"
                    >
                    <span className="material-symbols-outlined text-primary text-2xl">shopping_basket</span>
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs font-extrabold rounded-full border-2 border-black flex items-center justify-center">
                        {totalItems}
                        </span>
                    )}
                    </button>

                    {/* NOTIFICATIONS DRAWER */}
                    <AnimatePresence>
                      {notificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-200"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                          <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#fbfbe2] border-l-4 border-black flex flex-col shadow-[-8px_0_0_0_rgba(0,0,0,0.3)]"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between p-5 border-b-4 border-black bg-surface-container">
                              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined">notifications</span>
                                Notifications {unreadCount > 0 && <span className="bg-error text-white text-sm px-2 py-0.5 rounded-full border border-black">{unreadCount}</span>}
                              </h2>
                              <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                  <button onClick={markAllAsRead} className="text-xs font-bold text-primary underline mr-2">
                                    Tout marquer lu
                                  </button>
                                )}
                                <button onClick={() => setNotificationsOpen(false)} className="p-2 border-2 border-black hover:bg-error hover:text-white transition-colors rounded-lg flex items-center justify-center">
                                  <span className="material-symbols-outlined">close</span>
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                              {notifications.length === 0 ? (
                                <div className="text-center py-16 text-on-surface-variant">
                                  <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">notifications_active</span>
                                  <p className="font-bold text-lg">Aucune notification</p>
                                  <p className="text-sm mt-2 opacity-80">Vous êtes à jour !</p>
                                </div>
                              ) : (
                                notifications.map(notification => (
                                  <div 
                                    key={notification.id} 
                                    className={`relative p-4 border-2 border-black rounded-xl transition-colors cursor-pointer
                                      ${notification.read ? 'bg-surface-container-lowest opacity-70' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1px hover:translate-y-1px hover:shadow-none'}`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                  >
                                    {!notification.read && (
                                      <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-error rounded-full border border-black"></span>
                                    )}
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                      </div>
                                      <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-primary">{notification.title}</p>
                                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notification.message}</p>
                                        <p className="text-[10px] font-bold text-primary/50 mt-2 uppercase tracking-wider">{formatNotificationTime(notification.date)}</p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeNotification(notification.id)
                                      }} 
                                      className="absolute bottom-3 right-3 p-1.5 border border-black/20 hover:bg-error-container hover:border-error text-error rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100"
                                      title="Supprimer"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.aside>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CART DRAWER */}
                    <AnimatePresence>
                        {cartOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-200"
                            onClick={() => setCartOpen(false)}
                        >
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                            <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#fbfbe2] border-l-4 border-black flex flex-col shadow-[-8px_0_0_0_rgba(0,0,0,0.3)]"
                            onClick={e => e.stopPropagation()}
                            >
                            <div className="flex items-center justify-between p-5 border-b-4 border-black bg-surface-container">
                                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined">shopping_basket</span>
                                Panier {totalItems > 0 && <span className="bg-secondary text-white text-sm px-2 py-0.5 rounded-full border border-black">{totalItems}</span>}
                                </h2>
                                <button onClick={() => setCartOpen(false)} className="p-2 border-2 border-black hover:bg-error hover:text-white transition-colors rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {cartItems.length === 0 ? (
                                <div className="text-center py-16 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">shopping_basket</span>
                                    <p className="font-bold text-lg">Votre panier est vide</p>
                                    <Link to="/shop" onClick={() => setCartOpen(false)} className="mt-4 inline-block text-sm font-bold text-primary underline">
                                    Découvrir la boutique →
                                    </Link>
                                </div>
                                ) : (
                                cartItems.map(item => {
                                  
                                  // Utiliser la première photo ou une image par défaut
                                  const photoUrl = item?.photos?.[0]?.Url || '/placeholder-image.jpg'
                                  console.log("Cart Item:", item)
                                  return (
                                    <div key={item?.Id} className="flex items-start gap-4 p-4 bg-surface-container-lowest border-2 border-black rounded-xl">
                                    <img src={photoUrl} alt={item?.Nom} className="w-16 h-16 object-cover border-2 border-black rounded-lg shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm truncate">{item?.Nom}</p>
                                        <p className="text-xs text-on-surface-variant">{item?.Categorie}</p>
                                        {/* ✅ Boutons + et - */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQty(item?.Id, item?.Quantite - 1)}
                                                className="w-7 h-7 flex items-center justify-center border-2 border-black rounded-lg bg-white hover:bg-gray-100 transition-colors"
                                                disabled={item?.Quantite <= 1}
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button> {console.log("Quantité:", item)}
                                            
                                            <span className="font-bold text-sm w-8 text-center">{item?.Quantite}</span>
                                            
                                            <button 
                                                onClick={() => updateQty(item?.Id, item?.Quantite + 1)}
                                                className="w-7 h-7 flex items-center justify-center border-2 border-black rounded-lg bg-white hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                        <p className="font-extrabold text-primary mt-1">{item?.Prix.toFixed(2)}€ × {item?.Quantite}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item?.Id)} className="p-1.5 border border-black hover:bg-error-container text-error rounded transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                    </div>
                                )}
                                ))}
                            </div>

                            {cartItems.length > 0 && (
                                <div className="p-5 border-t-4 border-black space-y-3">
                                <div className="flex justify-between text-lg font-['Plus_Jakarta_Sans'] font-extrabold">
                                    <span>Total</span>
                                    <span className="text-primary">{totalPrice.toFixed(2)}€</span>
                                </div>
                                <Link 
                                    to="/paiement" 
                                    onClick={() => setCartOpen(false)}
                                    className="w-full py-4 bg-primary text-white text-center font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all block"
                                >
                                    Commander →
                                </Link>
                                </div>
                            )}
                            </motion.aside>
                        </motion.div>
                        )}
                    </AnimatePresence>
                
                    
                    {/* Dashboard temporaire (public pour le moment) */}
                    <Link to="/dashboard" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1px hover:translate-y-1px hover:shadow-none transition-all" title="Dashboard Admin">
                        <span className="material-symbols-outlined text-primary text-xl">admin_panel_settings</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-primary uppercase">Dashboard</span>
                    </Link>

                    {/* Profil / Auth */}
                    <div className="hidden md:block flex items-center gap-2 bg-surface-container-high text-primary font-['Plus_Jakarta_Sans'] font-bold px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm rounded-full">
                        <SignedOut>
                            <Link to="/login" className="flex items-center gap-2 bg-primary text-white font-['Plus_Jakarta_Sans'] font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all text-sm">
                            <span className="material-symbols-outlined text-sm">login</span> Connexion
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link to="/profil" className="flex items-center gap-2 bg-surface-container-high text-primary font-['Plus_Jakarta_Sans'] font-bold px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all text-sm rounded-full">
                            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-6 h-6" } }} />
                            Profil
                            </Link>
                        </SignedIn>
                    </div>
                </div>
            </div>
            {/* Page content here */}
        
      </div>
  )
}

export default Navbar


