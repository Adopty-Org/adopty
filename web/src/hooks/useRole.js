// frontend/src/hooks/useRole.js

import { useQuery } from "@tanstack/react-query"
import { roleApi } from "../lib/api"
import { useMemo } from "react"

export const useRoles = () => {

    const {data:RolesData, isLoading:RolesLoading, isError, error } = useQuery({
        queryKey: ["roles"],
        queryFn: roleApi.getAll,
    }) 

    const roles = RolesData ?? []

    const roleMap = useMemo(
    () => new Map(roles.map(e => [e.Id, e])),
    [roles]
  )

    return ({
        roles,
        roleMap,
        RolesLoading,
        isError,
        error
    })
}

export const ROLE_KEYS = {
  VISITEUR: 'visiteur',
  UTILISATEUR: 'Utilisateur',
  PRESTATAIRE: 'Prestataire',
  REFUGE: 'Refuge',
  ADMIN: 'Admin',
}

const ROLE_PRIORITY = [
  ROLE_KEYS.ADMIN,
  ROLE_KEYS.REFUGE,
  ROLE_KEYS.PRESTATAIRE,
  ROLE_KEYS.UTILISATEUR,
]

const dashboardRoles = new Set([
  ROLE_KEYS.ADMIN,
  ROLE_KEYS.PRESTATAIRE,
  ROLE_KEYS.REFUGE,
])