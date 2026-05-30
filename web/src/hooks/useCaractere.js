// frontend/src/hooks/useCaractere.js

import { useQuery } from "@tanstack/react-query"
import {  caracteristiqueApi } from "../lib/api"
import { useMemo } from "react"

export const useCaracteres = () => {

    const {data:CaracteresData, isLoading: CaracteresLoading, isError, error } = useQuery({
        queryKey: ["caracteres"],
        queryFn: caracteristiqueApi.getAll,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })
    
    const caracteres = CaracteresData ?? []

    // 1. Map des caractéristiques par IdRace (caracteristique)
    const caracteresByRace = useMemo(() => {
        const caractData = CaracteresData ?? []
        const map = new Map() // key: IdRace, value: [Caractere, ...]
        
        caractData.forEach(spec => {
            const caracteristiqueId = spec.IdRace
            if (!map.has(caracteristiqueId)) {
                map.set(caracteristiqueId, [])
            }
            map.get(caracteristiqueId).push(spec)
        })
        
        return map
    }, [CaracteresData])

    // 1. Map des caractéristiques par IdAnimal (caracteristique)
    const caracteresByAnimal = useMemo(() => {
        const caractData = CaracteresData ?? []
        const map = new Map() // key: IdAnimal, value: [Caractere, ...]
        
        caractData.forEach(spec => {
            const caracteristiqueId = spec.IdAnimal
            if (!map.has(caracteristiqueId)) {
                map.set(caracteristiqueId, [])
            }
            map.get(caracteristiqueId).push(spec)
        })
        
        return map
    }, [CaracteresData])

    const caractereMap = useMemo(
        () => new Map(caracteres.map(c => [c.Id, c])),
        [caracteres]
    )
    
    return ({
        caracteres,
        caractereMap,
        CaracteresLoading,
        isError,
        error,
        caracteresByRace,
        caracteresByAnimal
    })
}