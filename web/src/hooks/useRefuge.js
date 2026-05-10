// frontend/src/hooks/useRefuge.js

import { useQuery } from "@tanstack/react-query"
import { refugeApi } from "../lib/api"
import { useMemo } from "react"

export const useRefuge = () => {
    const {data:RefugesData, isLoading:RefugesLoading, isError, error } = useQuery({
        queryKey: ["refuges"],
        queryFn: refugeApi.getAll,
    })

    const refuge = RefugesData ?? [];

    const refugeMap = useMemo(
        () => new Map(refuge?.map(r => [r.Id, r])) ?? new Map(),
        [refuge]
    )



    return { RefugesData, RefugesLoading, isError, error, refugeMap }
}