// frontend/src/hooks/useAnimal.js

import { useQuery } from "@tanstack/react-query"
import { animalApi } from "../lib/api"
import { useEspeces } from "./useEspece"
import { useRaces } from "./useRace"
import { useMemo } from "react"
import { useStatut } from "./useStatut"
import { Statut } from "../../../backend/src/modeles/statut.model"

export const useAnimals = () => {

    const {especeMap, EspecesLoading} = useEspeces()
    const {raceMap, RacesLoading} = useRaces(especeMap)
    const {statutMap} = useStatut()

    const {data:AnimauxData, isLoading:AnimauxLoading, isError, error } = useQuery({
        queryKey: ["animaux"],
        queryFn: animalApi.getAll,
    })

    //const animalsRaw = AnimauxData ?? []


    const getTailleLabel = (cm) => {
        if (cm <= 30) return 'Petit'
        if (cm <= 60) return 'Moyen'
        return 'Grand'
    }

    const animals = useMemo(() => {
        
        const animalsRaw = AnimauxData ?? []

        return animalsRaw.map(a => {
            const statut = statutMap.get(a.Statut)
            const race = raceMap.get(a.Race)
            const espece = race ? especeMap.get(race.Espece) : undefined

            return {
            ...a,
            TailleLabel: getTailleLabel(a.Taille), // 👈 ICI
            statut: statut
                ? {
                    Id: statut.Id,
                    Nom: statut.Nom,
                    Description: statut.Description
                }
                : null,
            Race: race
                ? {
                    Id: race.Id,
                    Nom: race.Nom,
                    Description: race.Description,
                    Origine: race.Origine,
                    EsperanceVie: race.EsperanceVie,
                    Maintenance: race.Maintenance,
                    TailleMoyenne: race.TailleMoyenne,
                    PoidsMoyen: race.PoidsMoyen,
                    Couleurs: race.Couleurs,
                    Classification: race.Classification,
                    Pelage: race.Pelage,
                    TaillePelageMoyen: race.TaillePelageMoyen,
                    Habitat: race.Habitat,
                    Inteligence: race.Inteligence,
                    Imunite: race.Imunite,
                    Alergies: race.Alergies,
                    Espece: espece
                    ? {
                        Id: espece.Id,
                        Nom: espece.Nom,
                        Description: espece.Description
                        }
                    : null
                }
                : null
            }
        })
    }, [AnimauxData, raceMap, especeMap])

    

    return ({
        animals,
        isLoading: AnimauxLoading || EspecesLoading || RacesLoading,
        isError,
        error
    })
}

export const useAnimal = (id) => {
    const { data: animal, isLoading, isError, error } = useQuery({
        queryKey: ["animal", id],  // 👈 Clé unique avec l'ID
        queryFn: () => animalApi.getSpecific(id),  // 👈 Appel API direct
        enabled: !!id  // Ne s'exécute que si id existe
    })

    return { animal, isLoading, isError, error }
}