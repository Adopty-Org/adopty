import { useQueries, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { ligneWishlistApi, wishlistApi } from "../lib/api"

export const useWishlists = () => {
  const {
    data: WishlistsData,
    isLoading: WishlistsLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["wishlists"],
    queryFn: wishlistApi.getAll,
  })

  const wishlists = WishlistsData ?? []

  const ligneWishlistQueries = useQueries({
    queries: wishlists?.map(wishlist => ({
      queryKey: ["ligneWishlist", wishlist?.Id],
      queryFn: () => ligneWishlistApi.getLignesByWishlist(wishlist?.Id),
      enabled: !!wishlist?.Id,
    }))
  })

  const LigneWishlistLoading = ligneWishlistQueries.some(q => q.isLoading)

  const wishlistsWithLignes = useMemo(() => {
    return wishlists.map((wishlist, index) => ({
      ...wishlist,
      ligneWishlist: ligneWishlistQueries[index]?.data ?? []
    }))
  }, [wishlists, ligneWishlistQueries])

  const wishlistMap = useMemo(
    () => new Map(wishlistsWithLignes.map(w => [w.IdUtilisateur, w])),
    [wishlistsWithLignes]
  )

  return {
    wishlists,
    wishlistMap,
    wishlistsWithLignes,
    isLoading: WishlistsLoading || LigneWishlistLoading,
    isError,
    error,
    refetch
  }
}