// frontend/src/hooks/useWishlist.js

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { lignePanierApi, panierApi, wishlistApi } from "../lib/api"

export const useWishlists = (especeMap) => {

    const { data: WishlistsData, isLoading: WishlistsLoading, isError, error } = useQuery({
        queryKey: ["wishlists"],
        queryFn: wishlistApi.getAll,
    })
    
    const wishlists = WishlistsData ?? []

    const wishlistMap = useMemo(
        () => new Map(wishlists.map(r => [r.Id, r])),
        [wishlists]
    )

    // ✅ CORRECTION ICI
    const wishlistsWithEspece = useMemo(() => {
        return wishlists.map(r => {
            const caractereData = caracteresByWishlist.get(r.Id) ?? []
            return {
                ...r, 
                EspeceObj: especeMap?.get(r.Espece),
                Caracteres: caractereData 
            }
        })
    }, [wishlists, especeMap, caracteresByWishlist])  // ← Dépendances ici
        
    return {
        wishlists,
        wishlistMap,
        wishlistsWithEspece,
        isLoading: WishlistsLoading,
        isError,
        error
    }
}