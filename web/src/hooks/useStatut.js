// frontend/src/hooks/useStatut.js

import { useQuery } from "@tanstack/react-query"
import { statutApi } from "../lib/api"
import { useMemo } from "react"

export const useStatut = () => {
    const {data:StatutsData, isLoading:StatutsLoading, isError, error } = useQuery({
        queryKey: ["statuts"],
        queryFn: statutApi.getAll,
    })

    const statut = StatutsData ?? [];

    const statutMap = useMemo(
        () => new Map(statut?.map(r => [r.Id, r])) ?? new Map(),
        [statut]
    )



    return { StatutsData, StatutsLoading, isError, error, statutMap }
}