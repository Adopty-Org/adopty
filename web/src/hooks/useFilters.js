import { useState } from 'react'
import { animalApi, especeApi, raceApi } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
//import { animaux } from '../data/mockData'



export const useFilters = () => {

  const {data:AnimauxData, isLoading:AnimauxLoading} = useQuery({
    queryKey: ["animaux"],
    queryFn: animalApi.getAll,
  })

  const {data:RacesData, isLoading:RacesLoading} = useQuery({
    queryKey: ["races"],
    queryFn: raceApi.getAll,
  })

  const {data:EspecesData, isLoading:EspecesLoading} = useQuery({
    queryKey: ["especes"],
    queryFn: especeApi.getAll,
  }) 



  const animalsRaw = AnimauxData ?? []
  const races = RacesData ?? []
  const especes = EspecesData ?? []

  const raceMap = new Map(races.map(r => [r.Id, r]))
  const especeMap = new Map(especes.map(e => [e.Id, e]))

  const getTailleLabel = (cm) => {
    if (cm <= 30) return 'Petit'
    if (cm <= 60) return 'Moyen'
    return 'Grand'
  }

  const animals = animalsRaw.map(a => {
    const race = raceMap.get(a.Race)
    const espece = race ? especeMap.get(race.Espece) : undefined

    return {
      ...a,
      TailleLabel: getTailleLabel(a.Taille), // 👈 ICI
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

  console.log("L'animal :   ", animals)


  
  const [espece, setEspece] = useState('Tous')
  const [race, setRace] = useState('Tous')
  const [taille, setTaille] = useState([])
  const [caractere, setCaractere] = useState([])
  const [selectedTraits, setSelectedTraits] = useState([])
  const [search, setSearch] = useState('')

  const toggleTaille = (t) =>
    setTaille(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const toggleCaractere = (c) =>
    setCaractere(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const toggleTrait = (t) =>
    setSelectedTraits(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const reset = () => { 
    setEspece('Tous')
    setRace('Tous')
    setTaille([])
    setCaractere([])
    setSelectedTraits([])
    setSearch('') 
  }

  const filteredAnimaux = animals.filter(a => {
    if (espece !== 'Tous' && a?.Race?.Espece?.Nom !== espece) return false
    if (race !== 'Tous' && a?.Race?.Nom !== race) return false
    if (taille.length > 0 && !taille.includes(a.TailleLabel)) return false
    if (search && !a.Nom.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Dynamically get available races based on current species
  const availableRaces = [
    'Tous',
    ...new Set(
      animals
        .filter(a => espece === 'Tous' || a?.Race?.Espece?.Nom === espece)
        .map(a => a.Race?.Nom)
        .filter(Boolean)
    )
  ]
  /*['Tous', ...new Set((AnimauxData ?? [])
    .filter(a => espece === 'Tous' || a.espece === espece)
    .map(a => a.race))]*/

  return { 
    especes,
    espece, setEspece, 
    race, setRace, 
    availableRaces,
    taille, toggleTaille, 
    caractere, toggleCaractere, 
    selectedTraits, toggleTrait,
    search, setSearch, 
    reset, filteredAnimaux 
  }
}
