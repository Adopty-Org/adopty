// frontend/src/hooks/useEspece.js

import { useQuery } from "@tanstack/react-query"
import { especeApi } from "../lib/api"
import { useMemo } from "react"

export const useEspeces = () => {

    const {data:EspecesData, isLoading:EspecesLoading, isError, error } = useQuery({
        queryKey: ["especes"],
        queryFn: especeApi.getAll,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    }) 

    const especes = EspecesData ?? []

    const especeMap = useMemo(
    () => new Map(especes.map(e => [e.Id, e])),
    [especes]
  )

    return ({
        especes,
        especeMap,
        EspecesLoading,
        isError,
        error
    })
}