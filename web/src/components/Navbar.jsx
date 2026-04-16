import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { HomeIcon, InfoIcon, MapPinHouseIcon, PanelLeftIcon, PawPrintIcon, ShoppingBagIcon } from 'lucide-react'
import React, { Children, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart } from '../context/CartContext'
import { AnimatePresence, motion } from 'framer-motion'

export const NAVIGATION = [
  {name: "Lobby", path: "/lobby", icon: <HomeIcon className="size-5"/> },
  {name: "Encyclopedie", path: "/encyclopedie", icon: <HomeIcon className="size-5"/> },
  {name: "Shop", path: "/shop", icon: <ShoppingBagIcon className="size-5"/> },
  {name: "Services", path: "/services", icon: <PawPrintIcon className="size-5"/> },
  {name: "Refuges & Animals", path: "/refanimal", icon: <MapPinHouseIcon className="size-5"/> },
  {name: "Conserning us", path: "/conserning", icon: <InfoIcon className="size-5"/> },
  {name: "Signalement", path: "/signalement", icon: <PawPrintIcon className="size-5"/> },
]

function Navbar() {

  const location = useLocation()

  const { cartItems, totalItems, removeFromCart, totalPrice } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  console.log(location);

  
  return (
      
    <div className=' top-0 left-0 right-0 z-50 bg-[#fbfbe2] border-b-2 border-black'>{/* Navbar */}
        
            <div className="navbar bg-[#fbfbe2] w-full flex items-center justify-between w-full px-6 py-2">
                <div className="flex-none lg:hidden">
                    <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
                    <PanelLeftIcon className='size-7'/>
                    </label>
                </div>
                <div className="mx-2  px-2 justify-between flex"><h1> {NAVIGATION.find((item) => item.path === location.pathname)?.name || "Lobby"}</h1></div>
                <div className="hidden flex-none lg:block">
                
                    
                    <div className="hidden lg:flex items-center gap-1">
                    {NAVIGATION.map(link => (
                        <Link
                            key={link.path}   
                            to={link.path}    
                            className={`font-'Plus_Jakarta_Sans' font-bold text-sm px-3 py-2 rounded-lg transition-all
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
                                <h2 className="font-'Plus_Jakarta_Sans' font-extrabold text-xl text-primary flex items-center gap-2">
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
                                    <Link to="/boutique" onClick={() => setCartOpen(false)} className="mt-4 inline-block text-sm font-bold text-primary underline">
                                    Découvrir la boutique →
                                    </Link>
                                </div>
                                ) : (
                                cartItems.map(item => (
                                    <div key={item.id} className="flex items-start gap-4 p-4 bg-surface-container-lowest border-2 border-black rounded-xl">
                                    <img src={item.photo} alt={item.nom} className="w-16 h-16 object-cover border-2 border-black rounded-lg shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-'Plus_Jakarta_Sans' font-bold text-sm truncate">{item.nom}</p>
                                        <p className="text-xs text-on-surface-variant">{item.categorie}</p>
                                        <p className="font-extrabold text-primary mt-1">{item.prix.toFixed(2)}€ × {item.qty}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 border border-black hover:bg-error-container text-error rounded transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                    </div>
                                ))
                                )}
                            </div>

                            {cartItems.length > 0 && (
                                <div className="p-5 border-t-4 border-black space-y-3">
                                <div className="flex justify-between text-lg font-'Plus_Jakarta_Sans' font-extrabold">
                                    <span>Total</span>
                                    <span className="text-primary">{totalPrice.toFixed(2)}€</span>
                                </div>
                                <Link 
                                    to="/paiement" 
                                    onClick={() => setCartOpen(false)}
                                    className="w-full py-4 bg-primary text-white text-center font-'Plus_Jakarta_Sans' font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all block"
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
                        <span className="font-'Plus_Jakarta_Sans' font-bold text-xs text-primary uppercase">Dashboard</span>
                    </Link>

                    {/* Profil / Auth */}
                    <div className="hidden md:block">
                        <SignedOut>
                            <Link to="/login" className="flex items-center gap-2 bg-primary text-white font-'Plus_Jakarta_Sans' font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all text-sm">
                            <span className="material-symbols-outlined text-sm">login</span> Connexion
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link to="/profil" className="flex items-center gap-2 bg-surface-container-high text-primary font-'Plus_Jakarta_Sans' font-bold px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all text-sm rounded-full">
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



{/*<header className="fixed top-0 left-0 right-0 z-50 bg-base-300 border-b-2 border-black">
      
      {/* NAVBAR WRAPPER *}
      <nav className="flex items-center justify-between w-full px-6 py-3">

        {/* LEFT *}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 border-2 border-black"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            <PanelLeftIcon className="size-6" />
          </button>

          <Link
            to="/lobby"
            className="font-bold text-xl hover:scale-105 transition"
          >
            Adopty
          </Link>
        </div>

        {/* CENTER (DESKTOP NAV) *}
        <div className="hidden lg:flex items-center gap-1">
          {NAVIGATION.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all
                ${link.path === '/signalement'
                  ? 'text-white bg-red-600 border-2 border-black'
                  : isActive(link.path)
                    ? 'bg-surface-container border-2 border-black text-primary'
                    : 'text-primary/70 hover:text-primary hover:bg-surface-container'
                }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT ACTIONS *}
        <div className="flex items-center gap-3">

          {/* CART *}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 border-2 border-transparent hover:border-black rounded-lg"
          >
            <ShoppingBasket className="text-primary" />

            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {totalItems}
              </span>
            )}
          </button>

          {/* DASHBOARD *}
          <Link
            to="/dashboard"
            className="hidden md:flex px-3 py-2 border-2 border-black rounded-lg"
          >
            Admin
          </Link>

          {/* AUTH *}
          <SignedOut>
            <Link
              to="/login"
              className="px-4 py-2 bg-primary text-white border-2 border-black"
            >
              Connexion
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

      </nav>

      {/* MOBILE MENU *}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t-2 border-black bg-base-100 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {NAVIGATION.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 border-2 border-black"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER *}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            onClick={() => setCartOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white border-l-4 border-black p-5"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                Panier ({totalItems})
              </h2>

              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between border p-2">
                    <div>
                      <p className="font-bold">{item.nom}</p>
                      <p className="text-sm">{item.prix}€ x {item.qty}</p>
                    </div>

                    <button onClick={() => removeFromCart(item.id)}>
                      ❌
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 font-bold text-lg">
                Total: {totalPrice.toFixed(2)}€
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

    </header> */}


{/*<div className="flex flex-col min-h-screen">
      {/* HEADER *}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbfbe2] border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(21,66,18,1)]">
        <nav className="flex justify-between items-center w-full px-6 py-3 max-w-full mx-auto">
          {/* Logo *}
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="font-['Chewy'] text-3xl text-primary hover:scale-105 transition-transform flex-shrink-0"
          >
            Adopty
          </Link>

          {/* Desktop nav *}
          <div className="hidden lg:flex items-center gap-1">
            {NAVIGATION.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-'Plus_Jakarta_Sans' font-bold text-sm px-3 py-2 rounded-lg transition-all
                  ${link.to === '/signalement'
                    ? 'text-white bg-[#ba1a1a] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ml-2'
                    : isActive(link.to)
                      ? 'text-primary bg-surface-container border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'text-primary/70 hover:text-primary hover:bg-surface-container'
                  }`}
              >
                {link.to === '/signalement' && (
                  <span className="material-symbols-outlined text-base align-middle mr-1" style={{ fontSize: '14px' }}>warning</span>
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions *}
          <div className="flex items-center gap-4">
            {/* Panier *}
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

            {/* Dashboard temporaire (public pour le moment) *}
            <Link to="/dashboard" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all" title="Dashboard Admin">
              <span className="material-symbols-outlined text-primary text-xl">admin_panel_settings</span>
              <span className="font-'Plus_Jakarta_Sans' font-bold text-xs text-primary uppercase">Dashboard</span>
            </Link>

            {/* Profil / Auth *}
            <div className="hidden md:block">
              <SignedOut>
                <Link to="/auth" className="flex items-center gap-2 bg-primary text-white font-'Plus_Jakarta_Sans' font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all text-sm">
                  <span className="material-symbols-outlined text-sm">login</span> Connexion
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/mon-profil" className="flex items-center gap-2 bg-surface-container-high text-primary font-'Plus_Jakarta_Sans' font-bold px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all text-sm rounded-full">
                  <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-6 h-6" } }} />
                  Profil
                </Link>
              </SignedIn>
            </div>

            {/* Mobile menu toggle *}
            <button onClick={() => setMobileMenuOpen(v => !v)} className="lg:hidden p-2 border-2 border-black hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>

        {/* Mobile menu *}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-4 border-black bg-[#fbfbe2] overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {NAVIGATION.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block font-bold py-2.5 px-4 border-2 border-black transition-all text-sm
                      ${link.to === '/signalement'
                        ? 'bg-[#ba1a1a] text-white'
                        : isActive(link.to)
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-container'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 mt-2 border-t-2 border-black/10 space-y-2">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-surface-container text-primary font-bold py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                    <span className="material-symbols-outlined text-base align-middle mr-2">admin_panel_settings</span>
                    Dashboard Admin
                  </Link>
                  <SignedOut>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-primary text-white font-bold py-3 border-2 border-black">
                      Se connecter
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/mon-profil" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-surface-container-high text-primary font-bold py-3 border-2 border-black">
                      Mon Profil
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN *}
      <main className="flex-1 pt-[72px]">
        {/*Children || <Outlet />*}
      </main>

      {/* FOOTER *}
      <footer className="bg-[#154212] text-[#fbfbe2] border-t-4 border-black mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-start px-8 py-16 w-full max-w-7xl mx-auto gap-12">
          <div className="max-w-xs">
            <span className="font-['Chewy'] text-4xl text-[#fbfbe2] mb-4 block">Adopty</span>
            <p className="font-['Sora'] text-sm text-[#fbfbe2]/80 leading-relaxed">
              L'Éveil Naturel de l'adoption animale. Nous transformons des vies, une patte à la fois.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 border-2 border-[#fbfbe2]/40 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors rounded-lg">
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
              <a href="#" className="w-10 h-10 border-2 border-[#fbfbe2]/40 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors rounded-lg">
                <span className="material-symbols-outlined text-sm">public</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="font-'Plus_Jakarta_Sans' font-bold text-sm uppercase tracking-wider text-secondary-fixed">Navigation</h4>
              <ul className="font-['Sora'] text-sm space-y-2">
                {NAVIGATION.slice(0, 4).map(l => (
                  <li key={l.to}><Link to={l.to} className="text-[#fbfbe2]/80 hover:text-secondary-container transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-'Plus_Jakarta_Sans' font-bold text-sm uppercase tracking-wider text-secondary-fixed">Informations</h4>
              <ul className="font-['Sora'] text-sm space-y-2">
                {['Mentions Légales', 'Confidentialité', 'FAQ', 'Partenaires'].map(l => (
                  <li key={l}><a href="#" className="text-[#fbfbe2]/80 hover:text-secondary-container transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-highest/10 p-6 border-2 border-dashed border-[#fbfbe2]/20 rounded-xl">
            <h4 className="font-'Plus_Jakarta_Sans' font-bold text-sm uppercase tracking-wider mb-4">Restez informé</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email..." className="bg-transparent border-2 border-[#fbfbe2]/40 px-4 py-2 text-sm focus:outline-none focus:bg-[#fbfbe2]/10 text-[#fbfbe2] placeholder-[#fbfbe2]/40 rounded-lg flex-1" />
              <button className="bg-secondary text-white px-4 py-2 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-[#fbfbe2]/10 py-6 px-8 text-center max-w-7xl mx-auto">
          <p className="font-['Sora'] text-xs text-[#fbfbe2]/50">© 2024 Adopty - L'Éveil Naturel. Tous droits réservés.</p>
        </div>
      </footer>

      {/* CART DRAWER *}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
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
                <h2 className="font-'Plus_Jakarta_Sans' font-extrabold text-xl text-primary flex items-center gap-2">
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
                    <Link to="/boutique" onClick={() => setCartOpen(false)} className="mt-4 inline-block text-sm font-bold text-primary underline">
                      Découvrir la boutique →
                    </Link>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-surface-container-lowest border-2 border-black rounded-xl">
                      <img src={item.photo} alt={item.nom} className="w-16 h-16 object-cover border-2 border-black rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-'Plus_Jakarta_Sans' font-bold text-sm truncate">{item.nom}</p>
                        <p className="text-xs text-on-surface-variant">{item.categorie}</p>
                        <p className="font-extrabold text-primary mt-1">{item.prix.toFixed(2)}€ × {item.qty}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 border border-black hover:bg-error-container text-error rounded transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 border-t-4 border-black space-y-3">
                  <div className="flex justify-between text-lg font-'Plus_Jakarta_Sans' font-extrabold">
                    <span>Total</span>
                    <span className="text-primary">{totalPrice.toFixed(2)}€</span>
                  </div>
                  <Link 
                    to="/paiement" 
                    onClick={() => setCartOpen(false)}
                    className="w-full py-4 bg-primary text-white text-center font-'Plus_Jakarta_Sans' font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all block"
                  >
                    Commander →
                  </Link>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div> */}