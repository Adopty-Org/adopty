// frontend/src/hooks/useFilters.js

import { useState, useMemo } from 'react'
import { useAnimals } from './useAnimal'
import { useEspeces } from './useEspece'
import { useCallback } from 'react'

export const useFilters = () => {
  const { animals, isLoading: AnimalsLoading } = useAnimals()
  //const { especes, isLoading: EspecesLoading } = useEspeces()

  // États des filtres
  const [espece, setEspece] = useState('Tous')
  const [race, setRace] = useState('Tous')
  const [taille, setTaille] = useState([])
  const [caractere, setCaractere] = useState([])
  const [selectedTraits, setSelectedTraits] = useState([])
  const [search, setSearch] = useState('')

  // ⚡ MEMOISATION 1: Liste des espèces uniques
  const uniqueEspeces = useMemo(() => {
    console.log('🔄 Recalcul des espèces uniques')
    return ['Tous', ...new Set(animals.map(a => a?.Race?.Espece?.Nom).filter(Boolean))]
  }, [animals])

  // ⚡ MEMOISATION 2: Races disponibles basées sur l'espèce sélectionnée
  const availableRaces = useMemo(() => {
    console.log('🔄 Recalcul des races disponibles')
    const filteredByEspece = animals.filter(a => 
      espece === 'Tous' || a?.Race?.Espece?.Nom === espece
    )
    
    return [
      'Tous',
      ...new Set(
        filteredByEspece
          .map(a => a.Race?.Nom)
          .filter(Boolean)
      )
    ]
  }, [animals, espece])

  const toBool = (val) => {
    if (typeof val === 'boolean') return val
    if (typeof val === 'string') {
      return ['oui', '1', 'true'].includes(val.toLowerCase())
    }
    if (typeof val === 'number') return val === 1
    return false
  }

  const getAnimalTraits = (a) => {
    const traits = []

    if (toBool(a.SociableEnfant ?? a.sociableEnfant)) {
      traits.push('Enfants')
    }

    if (toBool(a.SociableAnimaux ?? a.sociableAnimaux)) {
      traits.push('Animaux')
    }

    if (toBool(a.Sterilise ?? a.sterilise)) {
      traits.push('Sterilise')
    }

    return traits
  }

  // ⚡ MEMOISATION 3: Filtrage principal des animaux
  const filteredAnimaux = useMemo(() => {
    console.log("🔄 Recalcul des animaux filtrés")
    console.log("Animaux totaux avant filtrage:", animals)

    return animals.filter(a => {
      // ✅ Garder seulement les animaux appartenant à un refuge
      if (!a?.possessions[0]?.IdRefuge) return false

      // ❌ Rejeter les animaux appartenant à un utilisateur
      if (a?.possessions[0]?.IdUtilisateur) return false

      if (espece !== "Tous" && a?.Race?.Espece?.Nom !== espece) return false

      if (race !== "Tous" && a?.Race?.Nom !== race) return false

      if (taille.length > 0 && !taille.includes(a.TailleLabel)) return false

      if (search && !a.Nom.toLowerCase().includes(search.toLowerCase())) return false

      if (
        caractere.length > 0 &&
        !caractere.some(id =>
          a?.Caracteres?.some(car => car.Id === id)
        )
      ) return false

      if (selectedTraits.length > 0) {
        const animalTraits = getAnimalTraits(a)

        if (!selectedTraits.every(t => animalTraits.includes(t))) {
          return false
        }
      }

      return true
    })
  }, [animals, espece, race, taille, search, caractere, selectedTraits])

  // ⚡ MEMOISATION 4: Stats pour l'affichage (optionnel)
  const stats = useMemo(() => {
    return {
      total: filteredAnimaux.length,
      parEspece: filteredAnimaux.reduce((acc, a) => {
        const especeName = a?.Race?.Espece?.Nom || 'Inconnu'
        acc[especeName] = (acc[especeName] || 0) + 1
        return acc
      }, {})
    }
  }, [filteredAnimaux])

  // Fonctions toggle (pas besoin de useMemo, ce sont des fonctions simples)
  const toggleTaille = (t) =>
    setTaille(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const toggleCaractere = (c) =>
    setCaractere(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const toggleTrait = (t) =>
    setSelectedTraits(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  // Reset avec useCallback pour stabilité (optionnel)
  const reset = useCallback(() => { 
    setEspece('Tous')
    setRace('Tous')
    setTaille([])
    setCaractere([])
    setSelectedTraits([])
    setSearch('') 
  }, [])

  console.log('📊 useFilters - render avec', {
    totalAnimaux: animals.length,
    filtreEspece: espece,
    filtreRace: race,
    resultatsFiltres: filteredAnimaux.length
  })

  return { 
    especes: uniqueEspeces, // ← Utilise les espèces uniques
    espece, setEspece, 
    race, setRace, 
    availableRaces,
    taille, toggleTaille, 
    caractere, toggleCaractere, 
    selectedTraits, toggleTrait,
    search, setSearch, 
    reset, 
    filteredAnimaux, 
    stats, // ← Optionnel
    isLoading: AnimalsLoading //|| EspecesLoading
  }
}