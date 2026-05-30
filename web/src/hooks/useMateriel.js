// frontend/src/hooks/useMateriaux.js

import { useQuery } from "@tanstack/react-query"
import { materiauxApi } from "../lib/api"
import { useMemo } from "react"

export const useMateriaux = () => {

    const {data:MateriauxData, isLoading:MateriauxLoading, isError, error } = useQuery({
        queryKey: ["materiaux"],
        queryFn: materiauxApi.getAll,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    }) 

    const materiaux = MateriauxData ?? []

    const materiauxMap = useMemo(
    () => new Map(materiaux.map(e => [e.Id, e])),
    [materiaux]
  )

    return ({
        materiaux,
        materiauxMap,
        MateriauxLoading,
        isError,
        error
    })
}