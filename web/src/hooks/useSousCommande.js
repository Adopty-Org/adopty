import { useQueries, useQuery } from "@tanstack/react-query"
import { ligneCommandeApi, sousCommandeApi } from "../lib/api"
import { useMemo } from "react"
import { useStatut } from "./useStatut"

export const useSousCommandes = () => {
  const {
    data: SousCommandesData,
    isLoading: SousCommandesLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["sousCommandes"],
    queryFn: sousCommandeApi.getAll,
  })

  const { statutMap } = useStatut()

  const sousCommandesRaw = SousCommandesData ?? []

  const lignesQueries = useQueries({
    queries: sousCommandesRaw.map((sc) => ({
      queryKey: ["lignesCommandes", sc.Id],
      queryFn: () => ligneCommandeApi.getBySousCommande(sc.Id),
      enabled: !!sc.Id,
    }))
  })

  const lignesCommandeBySousCommande = useMemo(() => {
    const map = new Map()

    lignesQueries.forEach((query, index) => {
      const sousCommandeId = sousCommandesRaw[index]?.Id
      map.set(sousCommandeId, query.data ?? [])
    })

    return map
  }, [lignesQueries, sousCommandesRaw])

  const sousCommandes = useMemo(() => {
    return sousCommandesRaw.map((commande) => {
      const statut = statutMap.get(commande.Statut)
      const lignesCommande = lignesCommandeBySousCommande.get(commande.Id) ?? []

      return {
        ...commande,
        statut,
        lignesCommande,
        nombreLignes: lignesCommande.length,
      }
    })
  }, [sousCommandesRaw, statutMap, lignesCommandeBySousCommande])

  const sousCommandeMap = useMemo(
    () => new Map(sousCommandes.map(e => [e.Id, e])),
    [sousCommandes]
  )

  const sousCommandeMips = useMemo(() => {
    const map = new Map()

    sousCommandes.forEach(commande => {
      const refugeId = commande.IdRefuge

      if (!map.has(refugeId)) {
        map.set(refugeId, [])
      }

      map.get(refugeId).push(commande)
    })

    return map
  }, [sousCommandes])

  const LignesCommandesLoading = lignesQueries.some(q => q.isLoading)

  return {
    sousCommandes,
    sousCommandeMap,
    SousCommandesLoading: SousCommandesLoading || LignesCommandesLoading,
    sousCommandeMips,
    lignesCommandeBySousCommande,
    isError,
    error
  }
}