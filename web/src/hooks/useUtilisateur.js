import { useQueries, useQuery } from "@tanstack/react-query"
import { utilisateurApi } from "../lib/api"
import { useMemo } from "react"
import { usePanier, usePaniers } from "./usePanier"


export const useUtilisateurs = () => {

    const {isLoading, panierMips} = usePaniers()

    // 1. Récupérer tous les utilisateurs
    const { data: utilisateursData, isLoading: utilisateursLoading, isError, error } = useQuery({
        queryKey: ["utilisateurs"],
        queryFn: () => utilisateurApi.getAll(),
    })

    const utilisateursRaw = utilisateursData ?? []
    //console.log("utilisateursRaw : ", utilisateursRaw)

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

        
        
        return utilisateursData.map((utilisateur, index) => {
            const panier = panierMips.get(utilisateur.Id);
            return {
                ...utilisateur,
                panier: panier ?? null,
                roles: rolesQueries[index]?.data ?? []
            }
            
        })
    }, [utilisateursData, rolesQueries, isLoading, panierMips]) // Recalculer si les utilisateurs, les rôles ou les paniers changent

    //console.log("utilisateursfini : ", utilisateurs)

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

    const {isLoading:utilisateurPanierLoading, panierMips, refetch: refetchPaniers} = usePaniers()

    const { data: UtilisateurData, isLoading: utilisateurLoanding, isError, error, refetch: refetchUtilisateur } = useQuery({
        queryKey: ["utilisateur", id],
        queryFn: () => utilisateurApi.getByClerkId(id),
        enabled: !!id
    })

    const utilisateurRaw = UtilisateurData ?? []
    console.log("l\'utilRaw : ",utilisateurRaw)

    const { data: UtilisateurRolesData, isLoading: UtilisateurRolesLoading, isError: isUtilisateurRolesError, error: UtilisateurRolesError, refetch: refetchUtilisateurRoles } = useQuery({
        queryKey: ["utilisateurRoles", utilisateurRaw?.Id],
        queryFn: () => utilisateurApi.getRoles(utilisateurRaw?.Id),
        enabled: !!utilisateurRaw?.Id
    })

    const { data: UtilisateurRefugesData, isLoading: UtilisateurRefugesLoading, isError: isUtilisateurRefugesError, error: UtilisateurRefugesError, refetch: refetchUtilisateurRefuges } = useQuery({
        queryKey: ["utilisateurRefuges", utilisateurRaw?.Id],
        queryFn: () => utilisateurApi.getRefuges(utilisateurRaw?.Id),
        enabled: !!utilisateurRaw?.Id
    })

    // ✅ Fonction pour forcer le refetch
    const refetch = async () => {
        await refetchPaniers()
        await refetchUtilisateur()
    }

    // ✅ Plus de .map, on traite directement l'objet
    const utilisateur = useMemo(() => {
        if (!UtilisateurData) return null  // Retourne null si pas de données
        
        const a = UtilisateurData  // L'objet utilisateur directement
        const panier = panierMips.get(a?.Id)

        return {
            ...a,
            Panier: panier,
            Roles : UtilisateurRolesData ?? [],
            Refuge: UtilisateurRefugesData ?? []
        }
    }, [UtilisateurData, UtilisateurRolesData, panierMips, UtilisateurRefugesData]);

    return { utilisateur, isLoading : utilisateurLoanding || utilisateurPanierLoading || UtilisateurRolesLoading || UtilisateurRefugesLoading, isError, error, refetch }
}