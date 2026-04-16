import { useState } from 'react'
//import { animaux } from '../data/mockData'

export const useFilters = () => {
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

  const filteredAnimaux = animaux.filter(a => {
    if (espece !== 'Tous' && a.espece !== espece) return false
    if (race !== 'Tous' && a.race !== race) return false
    if (taille.length > 0 && !taille.includes(a.taille)) return false
    if (caractere.length > 0 && !caractere.some(c => a.caractere.includes(c))) return false
    if (selectedTraits.length > 0 && !selectedTraits.every(t => a.traits?.includes(t))) return false
    if (search && !a.nom.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Dynamically get available races based on current species
  const availableRaces = ['Tous', ...new Set(animaux
    .filter(a => espece === 'Tous' || a.espece === espece)
    .map(a => a.race))]

  return { 
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
