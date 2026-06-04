import { useQueries, useQuery } from "@tanstack/react-query"
import { utilisateurApi } from "../lib/api"
import { useMemo } from "react"
import { usePaniers } from "./usePanier"
import { useAnimal, useAnimals } from "./useAnimal"
import { useWishlists } from "./useWishlist"

export const useUtilisateursNues = () => {
    // 1. Récupérer tous les utilisateurs
    const { data: utilisateursData, isLoading: utilisateursLoading, isError, error } = useQuery({
        queryKey: ["utilisateurs"],
        queryFn: () => utilisateurApi.getAll(),
    })
    const utilisateurs = utilisateursData ?? []

    const utilisateurMap = useMemo(
        () => new Map(utilisateurs.map(c => [c.Id, c])),
        [utilisateurs]
    )

    return { 
        utilisateurs,  // 👈 Tableau d'utilisateurs sans rôles
        isLoading: utilisateursLoading, // 👈 Considérer le chargement uniquement pour les utilisateurs
        utilisateurMap
    }
}

export const useUtilisateurs = () => {

    const {isLoading, panierMips} = usePaniers()
    const {wishlistMap, isLoading: wishlistsLoading} = useWishlists()

    // 1. Récupérer tous les utilisateurs
    const { data: utilisateursData, isLoading: utilisateursLoading, isError, error } = useQuery({
        queryKey: ["utilisateurs"],
        queryFn: () => utilisateurApi.getAll(),
    })

    const utilisateursRaw = Array.isArray(utilisateursData) ? utilisateursData : []
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
        if (!utilisateursRaw) return []

        
        
        return utilisateursRaw.map((utilisateur, index) => {
            const panier = panierMips.get(utilisateur.Id);
            return {
                ...utilisateur,
                panier: panier ?? null,
                wishlist: wishlistMap.get(utilisateur.Id) ?? [],
                roles: rolesQueries[index]?.data ?? []
            }
            
        })
    }, [utilisateursData, rolesQueries, wishlistMap]) // Recalculer si les utilisateurs, les rôles ou les paniers changent

    //console.log("utilisateursfini : ", utilisateurs)

    const isLoadingRoles = rolesQueries.some(query => query.isLoading)

    const utilisateurMap = useMemo(
        () => new Map(utilisateurs.map(c => [c.Id, c])),
        [utilisateurs]
    )

    return { 
        utilisateurs,  // 👈 Tableau d'utilisateurs avec leurs rôles
        isLoading: utilisateursLoading || isLoadingRoles || wishlistsLoading || isLoading, // 👈 Considérer le chargement si les utilisateurs, les rôles ou les paniers sont en cours de chargement
        utilisateurMap,
        isError, 
        error 
    }
}

export const useUtilisateur = (id) => {

    /*if (!id && !sessionStorage.getItem("userId")) {
        console.warn("useUtilisateur appelé sans ID");
        return { utilisateur: null, isLoading: false, isError: true, error: new Error("ID utilisateur requis") };
    }*/
   const finalId = id || sessionStorage.getItem("userId")

    const {isLoading:utilisateurPanierLoading, panierMips, refetch: refetchPaniers} = usePaniers()
    const {animalMapUtilisateur, isLoading} = useAnimals()
    const {wishlistMap, isLoading: wishlistsLoading, refetch: refetchWishlists} = useWishlists()

    const { data: UtilisateurData, isLoading: utilisateurLoanding, isError, error, refetch: refetchUtilisateur } = useQuery({
        queryKey: ["utilisateur", finalId],
        queryFn: () => utilisateurApi.getByClerkId(finalId),
        enabled: !!finalId
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
        // await refetchPaniers()
        await refetchUtilisateur()
        await refetchWishlists()
    }

    // ✅ Plus de .map, on traite directement l'objet
    const utilisateur = useMemo(() => {
        if (!UtilisateurData) return null  // Retourne null si pas de données
        
        const a = UtilisateurData  // L'objet utilisateur directement
        const panier = panierMips.get(a?.Id)
        const animals = animalMapUtilisateur.get(a?.Id)
 
        return {
            ...a,
            Panier: panier,
            Roles : UtilisateurRolesData ?? [],
            Refuge: UtilisateurRefugesData ?? [],
            wishlist: wishlistMap.get(a.Id) ?? [],
            Animals: animals ?? []
        }
    }, [UtilisateurData, UtilisateurRolesData, panierMips, UtilisateurRefugesData, animalMapUtilisateur, wishlistMap]) // Recalculer si les données changent;

    return { utilisateur,
         isLoading: utilisateurLoanding, 
         isError, 
         error, 
         refetch }
}