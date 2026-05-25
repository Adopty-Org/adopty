import Dashboard from './Dashboard'
import PrestataireDashboard from './PrestataireDashboard'
import RefugeDashboard from './RefugeDashboard_2'
import { ROLE_KEYS } from '../../hooks/useRole'
import { useUser } from "@clerk/clerk-react"
import { useUtilisateur } from "../../hooks/useUtilisateur"
import { NewLoadingLayout } from "../../components/Loadingpage"

const DashboardHub = () => {
    const {user, isLoaded, isSignedIn, } = useUser()
    const {utilisateur, isLoading} = useUtilisateur(user.id)
    
    if (!isLoaded) {
        return <NewLoadingLayout/>
    }
    

    if (isLoading) {
        return <NewLoadingLayout/>
    }

    //console.log("l\'utilisateur : ", utilisateur)
  const  role  = utilisateur?.Roles?.[0]?.Nom

  /*if (role === ROLE_KEYS.ADMIN) {
    return <Dashboard />
  }* /

  if (true){//role === ROLE_KEYS.PRESTATAIRE) {
    return <PrestataireDashboard />
  }*/

  if (true/*role === ROLE_KEYS.REFUGE*/) {
    return <RefugeDashboard />
  }

  return null
}

export default DashboardHub