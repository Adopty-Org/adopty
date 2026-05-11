// frontend/src/hooks/useSignalement.js

import { useQuery } from "@tanstack/react-query"
import { signalementApi } from "../lib/api"
import { useMemo } from "react"

export const useSignalements = () => {

    const {data:SignalementsData, isLoading:SignalementsLoading, isError, error } = useQuery({
        queryKey: ["signalements"],
        queryFn: signalementApi.getAll,
    }) 

    const signalements = SignalementsData ?? []

    const signalementMap = useMemo(
    () => new Map(signalements.map(e => [e.Id, e])),
    [signalements]
  )

    return ({
        signalements,
        signalementMap,
        SignalementsLoading,
        isError,
        error
    })
}