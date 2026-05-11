import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { DemandeAdoptionWatcher } from '../components/DemandeAdoptionWatcher'
import { useUser } from '@clerk/clerk-react'
import { useUtilisateur } from '../hooks/useUtilisateur'

function LobbyLayout() {
  const { user } = useUser()
  const { utilisateur, isLoading } = useUtilisateur(user?.id)
  
  // Vérifier si l'utilisateur est un refuge et a un refuge associé
  const isRefuge = utilisateur?.role === 'Refuge' || utilisateur?.Refuge !== null
  const refugeId = utilisateur?.Refuge[0]?.Id

  console.log("dans le layout :" , utilisateur)

  return (
    <div className='drawer bg-[#fbfbe2]'>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle bg-[#fbfbe2]" />
      <div className="drawer-content flex flex-col">
        <Navbar/>
        
        {/* Watcher conditionnel - uniquement pour les refuges */}
        {!isLoading && isRefuge && refugeId && utilisateur?.Id && (
          <DemandeAdoptionWatcher refugeId={refugeId} utilisateur={utilisateur} />
        )}
        
        <Outlet/>
        <Footer/>
      </div>
      <Sidebar/>
    </div>
  )
}

export default LobbyLayout