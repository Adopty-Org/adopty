// frontend/src/hooks/useAnimal.js

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { animalApi } from "../lib/api"
import { useEspeces } from "./useEspece"
import { useRaces } from "./useRace"
import { useMemo } from "react"
import { useStatut } from "./useStatut"
import { useCaracteres } from "./useCaractere"

export const useAnimals = () => {
    const { caracteresByAnimal, caracteresByRace } = useCaracteres()
    const { especeMap, EspecesLoading } = useEspeces()
    const { raceMap, RacesLoading } = useRaces(especeMap, caracteresByRace)
    const { statutMap } = useStatut()

    const { data: AnimauxData, isLoading: AnimauxLoading, isError, error } = useQuery({
        queryKey: ["animaux"],
        queryFn: animalApi.getAll,
    })

    // Requêtes pour les photos de chaque animal
    const photosQueries = useQueries({
        queries: (AnimauxData ?? []).map(animal => ({
            queryKey: ["animaux", animal.Id, "photos"],
            queryFn: () => animalApi.getPhotos(animal.Id),
            enabled: !!animal.Id,
        }))
    })

    const getTailleLabel = (cm) => {
        if (cm <= 30) return 'Petit'
        if (cm <= 60) return 'Moyen'
        return 'Grand'
    }

    const animals = useMemo(() => {
        const animalsRaw = AnimauxData ?? []
        
        return animalsRaw.map((a, index) => {
            const statut = statutMap.get(a.Statut)
            const race = raceMap.get(a.Race)
            const espece = race ? especeMap.get(race.Espece) : undefined
            const caractereData = caracteresByAnimal.get(race?.Id) ?? []
            const photos = photosQueries[index]?.data ?? []

            return {
                ...a,
                TailleLabel: getTailleLabel(a.Taille),
                photos: photos, // Ajout des photos
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
    }, [AnimauxData, raceMap, especeMap, statutMap, photosQueries])

    const animalMap = useMemo(
        () => new Map(animals.map(e => [e.IdRefuge, e])),
        [animals]
    )

    const animalMips = useMemo(
        () => new Map(animals.map(e => [e.Id, e])),
        [animals]
    )

    const isLoadingPhotos = photosQueries.some(query => query.isLoading)
    
    return {
        animals,
        isLoading: AnimauxLoading || EspecesLoading || RacesLoading || isLoadingPhotos,
        isError,
        error,
        animalMap,
        animalMips
    }
}

export const useAnimalsOfRefuge = (id) => {
    const {animalMap} = useAnimals();

    const animalsOfRefuge = animalMap.get(id);

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

    console.log("data photos : ", PhotosAnimalData)

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

        return {
            ...a,
            TailleLabel: getTailleLabel(a.Taille),
            photos: photos,
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
    }, [AnimalData, raceMap, especeMap, caracteresByAnimal, statutMap, PhotosAnimalData])

    console.log("animal , dans useAnimal", animal)

    return { animal, isLoading: isLoading || isPhotosAnimalLoading || RacesLoading || EspecesLoading, isError, error }
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