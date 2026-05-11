import { useState, useEffect } from 'react'
import { animalApi } from '../../lib/api'
//import { createAnimal, updateAnimal } from '../../services/authApi'
//import { getRaces, getStatuts } from '../../services/publicApi'

const AnimalForm = ({ initialData = null, refugeId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [races, setRaces] = useState([])
  const [statuts, setStatuts] = useState([])
  
  const animalId = initialData?.id ?? initialData?.Id ?? null

  const [formData, setFormData] = useState({
    Nom: initialData?.nom ?? initialData?.Nom ?? '',
    Prenom: initialData?.prenom ?? initialData?.Prenom ?? '',
    Age: initialData?.age ?? initialData?.Age ?? 0,
    Genre: initialData?.Genre ?? (initialData?.Genre === 'non' ? 'Femelle' : 'Male'),
    Poids: String(initialData?.poids ?? initialData?.Poids ?? '').replace('kg', ''),
    Taille: initialData?.taille ?? initialData?.Taille ?? 'Moyen',
    Couleur: initialData?.Couleur ?? '',
    EtatSantee: initialData?.EtatSantee ?? 'Bon',
    Sterilise: initialData?.Sterilise === 'oui' || initialData?.Sterilise === true,
    Temperament: Array.isArray(initialData?.caractere) ? initialData.caractere.join(', ') : (initialData?.Temperament ?? ''),
    NiveauEnergetique: initialData?.NiveauEnergetique ?? 'Moyen',
    SociableEnfant: initialData?.SociableEnfant === 'oui' || initialData?.SociableEnfant === true || initialData?.SociableEnfant === undefined,
    SociableAnimaux: initialData?.SociableAnimaux === 'oui' || initialData?.SociableAnimaux === true || initialData?.SociableAnimaux === undefined,
    Statut: initialData?.statutId ?? initialData?.Statut ?? 1,
    Race: initialData?.raceId ?? initialData?.Race ?? 1,
    IdRefuge: refugeId ?? initialData?.idRefuge ?? initialData?.IdRefuge,
    Bio: initialData?.description ?? initialData?.Bio ?? '',
  })

  const [photos, setPhotos] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [racesData, statutsData] = await Promise.all([getRaces(), getStatuts()])
        setRaces(Array.isArray(racesData) ? racesData : [])
        setStatuts(Array.isArray(statutsData) ? statutsData : [])
      } catch (err) {
        console.error('Erreur chargement listes:', err)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (animalId) {
        await animalApi.update(animalId, formData)
      } else {
        const data = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value)
        })
        photos.forEach(photo => {
          data.append('photos', photo)
        })
        await animalApi.create(data)
      }
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Une erreur est survenue lors de l'enregistrement."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {error && (
        <div className="p-4 bg-error-container text-on-error-container border-2 border-black rounded-lg font-bold text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nom</label>
          <input
            required
            name="Nom"
            value={formData.Nom}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="Ex: Barnabé"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Prénom (Alias)</label>
          <input
            name="Prenom"
            value={formData.Prenom}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="Ex: Le petit roi"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Âge (années)</label>
          <input
            required
            type="number"
            name="Age"
            value={formData.Age}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            name="Poids"
            value={formData.Poids}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="0.0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Genre</label>
          <select
            name="Genre"
            value={formData.Genre}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <option value="Male">Mâle</option>
            <option value="Femelle">Femelle</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Race</label>
          <select
            name="Race"
            value={formData.Race}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            {races.map(r => (
              <option key={r.Id} value={r.Id}>{r.Nom}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Statut</label>
          <select
            name="Statut"
            value={formData.Statut}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            {statuts.map(s => (
              <option key={s.Id} value={s.Id}>{s.Statut}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Couleur</label>
          <input
            name="Couleur"
            value={formData.Couleur}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="Ex: Noir et Blanc"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">État de santé</label>
          <input
            name="EtatSantee"
            value={formData.EtatSantee}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="Ex: Excellente"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Taille</label>
          <select
            name="Taille"
            value={formData.Taille}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <option value="Petit">Petit</option>
            <option value="Moyen">Moyen</option>
            <option value="Grand">Grand</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Énergie</label>
          <select
            name="NiveauEnergetique"
            value={formData.NiveauEnergetique}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <option value="Bas">Bas</option>
            <option value="Moyen">Moyen</option>
            <option value="Haut">Haut</option>
          </select>
        </div>
      </div>

      {!initialData && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Photos (Min. 1)</label>
          <input
            required
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bio / Description</label>
        <textarea
          name="Bio"
          value={formData.Bio}
          onChange={handleChange}
          rows="3"
          className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          placeholder="Racontez son histoire..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="Sterilise"
            checked={formData.Sterilise}
            onChange={handleChange}
            className="w-5 h-5 border-2 border-black rounded text-primary focus:ring-0"
          />
          <span className="text-sm font-bold">Stérilisé</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="SociableEnfant"
            checked={formData.SociableEnfant}
            onChange={handleChange}
            className="w-5 h-5 border-2 border-black rounded text-primary focus:ring-0"
          />
          <span className="text-sm font-bold">Ok Enfants</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="SociableAnimaux"
            checked={formData.SociableAnimaux}
            onChange={handleChange}
            className="w-5 h-5 border-2 border-black rounded text-primary focus:ring-0"
          />
          <span className="text-sm font-bold">Ok Animaux</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface-container-lowest py-2 border-t-2 border-black">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-4 border-2 border-black font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-4 bg-primary text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

export default AnimalForm