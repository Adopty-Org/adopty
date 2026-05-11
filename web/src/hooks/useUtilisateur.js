import { useQueries, useQuery } from "@tanstack/react-query"
import { utilisateurApi } from "../lib/api"
import { useMemo } from "react"


export const useUtilisateurs = () => {
    // 1. Récupérer tous les utilisateurs
    const { data: utilisateursData, isLoading: utilisateursLoading, isError, error } = useQuery({
        queryKey: ["utilisateurs"],
        queryFn: () => utilisateurApi.getAll(),
    })

    const utilisateursRaw = utilisateursData ?? []
    console.log("utilisateursRaw : ", utilisateursRaw)

    // 2. Récupérer les rôles pour CHAQUE utilisateur
    const rolesQueries = useQueries({
        queries: utilisateursRaw.map(utilisateur => ({
            queryKey: ["utilisateurRoles", utilisateur.Id],
            queryFn: () => utilisateurApi.getRoles(utilisateur.Id),
            enabled: !!utilisateur?.Id
        }))
    })

    // 3. Combiner les utilisateurs avec leurs rôles
    const utilisateurs = useMemo(() => {
        if (!utilisateursData) return []
        
        return utilisateursData.map((utilisateur, index) => ({
            ...utilisateur,
            roles: rolesQueries[index]?.data ?? []
        }))
    }, [utilisateursData, rolesQueries])

    const isLoadingRoles = rolesQueries.some(query => query.isLoading)

    const utilisateurMap = useMemo(
        () => new Map(utilisateurs.map(c => [c.Id, c])),
        [utilisateurs]
    )

    return { 
        utilisateurs,  // 👈 Tableau d'utilisateurs avec leurs rôles
        isLoading: utilisateursLoading || isLoadingRoles, 
        utilisateurMap,
        isError, 
        error 
    }
}

export const useUtilisateur = (id) => {

    const { data: UtilisateurData, isLoading, isError, error } = useQuery({
        queryKey: ["utilisateur", id],
        queryFn: () => utilisateurApi.getByClerkId(id),
        enabled: !!id
    })

    const utilisateurRaw = UtilisateurData ?? []
    console.log("l\'utilRaw : ",utilisateurRaw)

    const { data: UtilisateurRolesData, isLoading: UtilisateurRolesLoading, isError: isUtilisateurRolesError, error: UtilisateurRolesError } = useQuery({
        queryKey: ["utilisateurRoles", utilisateurRaw?.Id],
        queryFn: () => utilisateurApi.getRoles(utilisateurRaw?.Id),
        enabled: !!utilisateurRaw?.Id
    })

    const { data: UtilisateurRefugesData, isLoading: UtilisateurRefugesLoading, isError: isUtilisateurRefugesError, error: UtilisateurRefugesError } = useQuery({
        queryKey: ["utilisateurRefuges", utilisateurRaw?.Id],
        queryFn: () => utilisateurApi.getRefuges(utilisateurRaw?.Id),
        enabled: !!utilisateurRaw?.Id
    })

    // ✅ Plus de .map, on traite directement l'objet
    const utilisateur = useMemo(() => {
        if (!UtilisateurData) return null  // Retourne null si pas de données
        
        const a = UtilisateurData  // L'objet utilisateur directement

        return {
            ...a,
            Roles : UtilisateurRolesData ?? [],
            Refuge: UtilisateurRefugesData ?? []
        }
    }, [UtilisateurData, UtilisateurRolesData]);

    return { utilisateur, isLoading, isError, error }
}