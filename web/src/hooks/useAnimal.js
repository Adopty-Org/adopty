// frontend/src/hooks/useAnimal.js

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { animalApi } from "../lib/api"
import { useEspeces } from "./useEspece"
import { useRaces } from "./useRace"
import { useMemo, useRef } from "react" // ← Ajoute useRef
import { useStatut } from "./useStatut"
import { useCaracteres } from "./useCaractere"
import { useEffect } from "react"

const EMPTY_ARRAY = []

export const useAnimals = () => {
    const { caracteresByAnimal, caracteresByRace } = useCaracteres()
    const { especeMap, EspecesLoading } = useEspeces()
    const { raceMap, RacesLoading } = useRaces(especeMap, caracteresByRace)
    const { statutMap } = useStatut()

    const { data: AnimauxData, isLoading: AnimauxLoading, isError, error } = useQuery({
        queryKey: ["animaux"],
        queryFn: () => {
        console.count('API GET ANIMAUX')
        return animalApi.getAll()
        },
        //staleTime: 5 * 60 * 1000, // ← Ajoute ça
        staleTime: Infinity,//5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    // Requêtes pour les photos de chaque animal
    const photosQueries = useQueries({
        queries: (AnimauxData ?? []).map(animal => ({
            queryKey: ["animaux", animal.Id, "photos"],
            queryFn: () => {
        console.count(`API GET PHOTOS animal ${animal.Id}`)
        return animalApi.getPhotos(animal.Id)
        },
            enabled: !!animal.Id,
            staleTime: Infinity,//5 * 60 * 1000, // ← Ajoute ça
            //staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false
        }))
    })

    const possessionsQueries = useQueries({
        queries: (AnimauxData ?? []).map(animal => ({
            queryKey: ["animaux", animal.Id, "possessions"],
            queryFn: () => {
            console.count(`API GET POSSESSIONS animal ${animal.Id}`)
            return animalApi.getPossessions(animal.Id)
            },
            enabled: !!animal.Id,
            staleTime: Infinity,//5 * 60 * 1000, // ← Ajoute ça
            //staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false
        }))
    })

    // Ref pour tracker les changements
    const prevAnimauxDataRef = useRef()
    const prevRaceMapRef = useRef()
    const prevEspeceMapRef = useRef()
    const prevStatutMapRef = useRef()
    const prevCaracteresRef = useRef()

    const getTailleLabel = (cm) => {
        if (cm <= 30) return 'Petit'
        if (cm <= 60) return 'Moyen'
        return 'Grand'
    }

    // 🟢 SOLUTION 1: Créer une clé stable à partir des données
    const photosDataKey = useMemo(() => {
        return photosQueries.map(q => q.data).map(d => JSON.stringify(d)).join('|')
    }, [photosQueries.map(q => q.dataStatus, q => q.data)]) // Pas parfait mais mieux

    // 🟢 SOLUTION 2: Utiliser useRef pour stocker et comparer (MÉTHODE RECOMMANDÉE)
    const previousPhotosDataRef = useRef([])
    const previousPossessionsDataRef = useRef([])
    
    // Extraire les données actuelles
    const currentPhotosData = photosQueries.map(q => q.data ?? EMPTY_ARRAY)
    const currentPossessionsData = possessionsQueries.map(q => q.data ?? EMPTY_ARRAY)
    
    // Ne mettre à jour que si les données ont vraiment changé
    const stablePhotosData = useMemo(() => {
        const hasChanged = previousPhotosDataRef.current.length !== currentPhotosData.length ||
            previousPhotosDataRef.current.some((item, idx) => JSON.stringify(item) !== JSON.stringify(currentPhotosData[idx]))
        
        if (hasChanged) {
            previousPhotosDataRef.current = currentPhotosData
        }
        return previousPhotosDataRef.current
    }, [currentPhotosData])
    
    const stablePossessionsData = useMemo(() => {
        const hasChanged = previousPossessionsDataRef.current.length !== currentPossessionsData.length ||
            previousPossessionsDataRef.current.some((item, idx) => JSON.stringify(item) !== JSON.stringify(currentPossessionsData[idx]))
        
        if (hasChanged) {
            previousPossessionsDataRef.current = currentPossessionsData
        }
        return previousPossessionsDataRef.current
    }, [currentPossessionsData])

    // 🟢 MAIN MEMO: Utiliser les données stabilisées
    const animals = useMemo(() => {
        //console.log("🟢 RECALCUL DE animals - devrait être rare maintenant")
        const animalsRaw = AnimauxData ?? []
        
        return animalsRaw.map((a, index) => {
            const statut = statutMap.get(a.Statut)
            const race = raceMap.get(a.Race)
            const espece = race ? especeMap.get(race.Espece) : undefined
            const caractereData = caracteresByAnimal.get(race?.Id) ?? EMPTY_ARRAY
            const photos = stablePhotosData[index] ?? EMPTY_ARRAY
            const possessions = stablePossessionsData[index] ?? EMPTY_ARRAY

            console.log(
  a.Id,
  stablePhotosData[index],
  stablePossessionsData[index]
)
            
            return {
                ...a,
                TailleLabel: getTailleLabel(a.Taille),
                photos: photos,
                possessions: possessions,
                statut: statut ? {
                    Id: statut.Id,
                    Statut: statut.Statut
                } : null,
                Race: race ? {
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
                    Espece: espece ? {
                        Id: espece.Id,
                        Nom: espece.Nom,
                        Description: espece.Description
                    } : null
                } : null,
                Caracteres: caractereData 
            }
        })
    }, [AnimauxData, raceMap, especeMap, statutMap, caracteresByAnimal, stablePhotosData, stablePossessionsData])

    const animalMapUtilisateur = useMemo(() => {
        const map = new Map()
        animals.forEach(animal => {
            const userId = animal.possessions[0]?.IdUtilisateur
            if (userId) {
                if (!map.has(userId)) {
                    map.set(userId, [])
                }
                map.get(userId).push(animal)
            }
        })
        return map
    }, [animals])

    const animalMapRefuge = useMemo(() => {
        const map = new Map()
        animals.forEach(animal => {
            const refugeId = animal.possessions[0]?.IdRefuge
            if (refugeId) {
                if (!map.has(refugeId)) {
                    map.set(refugeId, [])
                }
                map.get(refugeId).push(animal)
            }
        })
        return map
    }, [animals])

    console.log("AnimauxData", animals)
console.log("photosQueries", photosQueries)
console.log("possessionsQueries", possessionsQueries)

photosQueries.forEach((q, i) => {
  console.log(
    "PHOTO",
    AnimauxData?.[i]?.Id,
    q.status,
    q.data,
    q.error
  )
})

possessionsQueries.forEach((q, i) => {
  console.log(
    "POSSESSION",
    AnimauxData?.[i]?.Id,
    q.status,
    q.data,
    q.error
  )
})
possessionsQueries.forEach((q, i) => {
  console.log(
    AnimauxData?.[i]?.Id,
    q.status,
    q.fetchStatus,
    q.data,
    q.error
  )
})

    // 🔍 DEBUG: Voir ce qui change
    useEffect(() => {
        //console.log('🔍 AnimauxData a changé?', prevAnimauxDataRef.current !== AnimauxData)
        //console.log('🔍 raceMap a changé?', prevRaceMapRef.current !== raceMap)
        //console.log('🔍 especeMap a changé?', prevEspeceMapRef.current !== especeMap)
        //console.log('🔍 statutMap a changé?', prevStatutMapRef.current !== statutMap)
        //console.log('🔍 caracteresByAnimal a changé?', prevCaracteresRef.current !== caracteresByAnimal)
        
        prevAnimauxDataRef.current = AnimauxData
        prevRaceMapRef.current = raceMap
        prevEspeceMapRef.current = especeMap
        prevStatutMapRef.current = statutMap
        prevCaracteresRef.current = caracteresByAnimal
    })

    const animalMips = useMemo(
        () => new Map(animals.map(e => [e.Id, e])),
        [animals]
    )

    const isLoadingPhotos = photosQueries.some(query => query.isLoading)
    const isLoadingPossessions = possessionsQueries.some(query => query.isLoading)

    //console.log("animals dans useAnimals : nombre =", animals.length)
    //console.log("isLoadingPhotos:", isLoadingPhotos)
    //console.log("isLoadingPossessions:", isLoadingPossessions)

    return {
        animals,
        isLoading: AnimauxLoading || EspecesLoading || RacesLoading || isLoadingPhotos || isLoadingPossessions,
        isError,
        error,
        animalMapUtilisateur,
        animalMapRefuge,
        animalMips
    }
}

export const useAnimalsOfRefuge = (id) => {
    const {animalMapRefuge} = useAnimals();

    const animalsOfRefuge = animalMapRefuge.get(id);

    return animalsOfRefuge;
}

export const useAnimal = (id) => {

    const { data: AnimalData, isLoading, isError, error } = useQuery({
        queryKey: ["animal", id],
        queryFn: () => animalApi.getSpecific(id),
        enabled: !!id
    })

    const { caracteresByAnimal, caracteresByRace } = useCaracteres()
    const { especeMap, EspecesLoading } = useEspeces()
    const { raceMap, RacesLoading } = useRaces(especeMap, caracteresByRace)
    const { statutMap } = useStatut()

    const { data: PhotosAnimalData, isLoading: isPhotosAnimalLoading, isError: isPhotosAnimalError, error: PhotosAnimalError } = useQuery({
        queryKey: ["animal", id, "photos"],
        queryFn: () => animalApi.getPhotos(id),
        enabled: !!id
    })

    const { data: PossessionsAnimalData, isLoading: isPossessionsAnimalLoading, isError: isPossessionsAnimalError, error: PossessionsAnimalError } = useQuery({
        queryKey: ["animal", id, "possessions"],
        queryFn: () => animalApi.getPossessions(id),
        enabled: !!id
    })

    console.log("data photos : ", PhotosAnimalData)
    console.log("data possessions : ", PossessionsAnimalData)

    const getTailleLabel = (cm) => {
        if (cm <= 30) return 'Petit'
        if (cm <= 60) return 'Moyen'
        return 'Grand'
    }

    // ✅ Plus de .map, on traite directement l'objet
    const animal = useMemo(() => {
        if (!AnimalData) return null  // Retourne null si pas de données
        
        const a = AnimalData  // L'objet animal directement
        
        const statut = statutMap.get(a.Statut)
        const race = raceMap.get(a.Race)
        const espece = race ? especeMap.get(race.Espece) : undefined
        const caractereData = caracteresByAnimal.get(race?.Id) ?? []
        const photos = PhotosAnimalData ?? []
        const possessions = PossessionsAnimalData ?? []

        return {
            ...a,
            TailleLabel: getTailleLabel(a.Taille),
            photos: photos,
            possessions: possessions,
            statut: statut ? {
                Id: statut.Id,
                Statut: statut.Statut,
            } : null,
            Race: race ? {
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
                Espece: espece ? {
                    Id: espece.Id,
                    Nom: espece.Nom,
                    Description: espece.Description
                } : null
            } : null,
            Caracteres: caractereData 
        }
    }, [AnimalData, raceMap, especeMap, caracteresByAnimal, statutMap, PhotosAnimalData, PossessionsAnimalData])

    //console.log("animal , dans useAnimal", animal)

    return { animal, isLoading: isLoading || isPhotosAnimalLoading || isPossessionsAnimalLoading || RacesLoading || EspecesLoading, isError, error }
}

// a changer (ajouter les photos ici car sinon ca ne va pas etre acceptes par le backend tu vois ?)
export const useCreateAnimal = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (animalData) => animalApi.create(animalData),
        onSuccess: (data) => {
            // Invalider la liste des animaux
            queryClient.invalidateQueries({ queryKey: ["animaux"] })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["animaux"], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Animal créé avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la création de l'animal:", error)
        }
    })

    return mutation
}

export const useUpdateAnimal = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ id, data }) => animalApi.update(id, data),
        onSuccess: (data, variables) => {
            const { id } = variables
            
            // 1. Mettre à jour le cache individuel
            queryClient.setQueryData(["animal", id], data)
            
            // 2. Mettre à jour dans la liste des animaux
            queryClient.setQueryData(["animaux"], (oldData) => {
                if (!oldData) return [data]
                return oldData.map(animal => 
                    animal.Id === id ? data : animal
                )
            })
            
            // 3. Invalider les queries dépendantes
            queryClient.invalidateQueries({ queryKey: ["animaux"] })
            
            console.log("Animal mis à jour avec succès:", data)
        },
        onError: (error, variables) => {
            console.error(`Erreur lors de la mise à jour de l'animal ${variables.id}:`, error)
        }
    })

    return mutation
}

export const useDeleteAnimal = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (id) => animalApi.delete(id),
        onSuccess: (data, id) => {
            // 1. Retirer de la liste des animaux
            queryClient.setQueryData(["animaux"], (oldData) => {
                if (!oldData) return []
                return oldData.filter(animal => animal.Id !== id)
            })
            
            // 2. Supprimer du cache individuel
            queryClient.removeQueries({ queryKey: ["animal", id] })
            
            // 3. Supprimer les photos associées
            queryClient.removeQueries({ queryKey: ["animaux", id, "photos"] })
            
            // 4. Invalider la liste pour être sûr
            queryClient.invalidateQueries({ queryKey: ["animaux"] })
            
            console.log("Animal supprimé avec succès:", id)
        },
        onError: (error, id) => {
            console.error(`Erreur lors de la suppression de l'animal ${id}:`, error)
        }
    })

    return mutation
}

// utilise ca comme ex seulement (ou pas , c'est toi qui vois)

/*export const useUploadAnimalPhotos = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ animalId, files }) => animalApi.uploadPhotos(animalId, files),
        onSuccess: (data, variables) => {
            const { animalId } = variables
            
            // Invalider les photos de l'animal
            queryClient.invalidateQueries({ queryKey: ["animaux", animalId, "photos"] })
            queryClient.invalidateQueries({ queryKey: ["animal", animalId] })
            
            // Optionnel : mettre à jour le cache directement
            queryClient.setQueryData(["animaux", animalId, "photos"], (oldData) => {
                if (!oldData) return data
                return [...oldData, ...data]
            })
            
            console.log("Photos uploadées avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de l'upload des photos:", error)
        }
    })

    return mutation
}

export const useDeleteAnimalPhoto = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: ({ animalId, photoId }) => animalApi.deletePhoto(animalId, photoId),
        onSuccess: (data, variables) => {
            const { animalId, photoId } = variables
            
            // Supprimer la photo du cache
            queryClient.setQueryData(["animaux", animalId, "photos"], (oldData) => {
                if (!oldData) return []
                return oldData.filter(photo => photo.Id !== photoId)
            })
            
            // Invalider pour être sûr
            queryClient.invalidateQueries({ queryKey: ["animaux", animalId, "photos"] })
            queryClient.invalidateQueries({ queryKey: ["animal", animalId] })
            
            console.log("Photo supprimée avec succès")
        },
        onError: (error) => {
            console.error("Erreur lors de la suppression de la photo:", error)
        }
    })

    return mutation
}*/