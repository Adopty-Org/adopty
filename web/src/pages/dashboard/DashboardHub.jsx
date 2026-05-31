import { useMemo, useState } from "react"
import Dashboard from "./Dashboard"
import PrestataireDashboard from "./PrestataireDashboard"
import RefugeDashboard from "./RefugeDashboard_2"
//import { ROLE_KEYS } from "../../hooks/useRole"
import { useUser } from "@clerk/clerk-react"
import { useUtilisateur } from "../../hooks/useUtilisateur"
import { NewLoadingLayout } from "../../components/Loadingpage"

const DASHBOARD_CONFIG = {
  ["Admin"]: {
    label: "Admin",
    icon: "admin_panel_settings",
    component: Dashboard,
  },
  ["Refuge"]: {
    label: "Refuge",
    icon: "home_work",
    component: RefugeDashboard,
  },
  ["Prestataire"]: {
    label: "Prestataire",
    icon: "handshake",
    component: PrestataireDashboard,
  },
}

const ROLE_PRIORITY = [
  "Admin",
  "Refuge",
  "Prestataire",
]

const DashboardHub = () => {
  const { user, isLoaded } = useUser()
  const { utilisateur, isLoading } = useUtilisateur(user?.id)

  const availableRoles = useMemo(() => {
    const roles = utilisateur?.Roles ?? []

    return roles
      .map(role => role.Nom)
      .filter(role => role !== "Utilisateur") // Exclure le rôle "Utilisateur"
      .filter(role => DASHBOARD_CONFIG[role])
      .sort((a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b))
  }, [utilisateur])

  const [selectedRole, setSelectedRole] = useState(null)

  if (!isLoaded || isLoading) {
    return <NewLoadingLayout />
  }

  if (availableRoles.length === 0) {
    return null
  }

  const activeRole = selectedRole ?? availableRoles[0]
  const ActiveDashboard = DASHBOARD_CONFIG[activeRole].component

  return (
    <div>
      {availableRoles.length > 1 && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex flex-wrap gap-2 bg-surface-container-lowest border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {availableRoles.map(role => {
              const meta = DASHBOARD_CONFIG[role]
              const isActive = activeRole === role

              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-black font-bold text-sm transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-primary hover:bg-primary-fixed"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {meta.icon}
                  </span>
                  Dashboard {meta.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <ActiveDashboard />
    </div>
  )
}

export default DashboardHub