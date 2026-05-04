// frontend/src/hooks/useRace.js

import { useQuery } from "@tanstack/react-query"
import { raceApi } from "../lib/api"
import { useMemo } from "react"
import { useCaracteres } from "./useCaractere"

export const useRaces = (especeMap) => {

    const { caracteresByRace } = useCaracteres()

    const { data: RacesData, isLoading: RacesLoading, isError, error } = useQuery({
        queryKey: ["races"],
        queryFn: raceApi.getAll,
    })
    
    const races = RacesData ?? []

    const raceMap = useMemo(
        () => new Map(races.map(r => [r.Id, r])),
        [races]
    )

    // ✅ CORRECTION ICI
    const racesWithEspece = useMemo(() => {
        return races.map(r => {
            const caractereData = caracteresByRace.get(r.Id) ?? []
            return {
                ...r, 
                EspeceObj: especeMap?.get(r.Espece),
                Caracteres: caractereData 
            }
        })
    }, [races, especeMap, caracteresByRace])  // ← Dépendances ici
        
    return {
        races,
        raceMap,
        racesWithEspece,
        isLoading: RacesLoading,
        isError,
        error
    }
}