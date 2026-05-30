import { useState } from 'react'

const ReservationForm = ({utilisateur, prestataire, initialSlot, onClose }) => {
  const [submitted, setSubmitted] = useState(false)
  /*const [form, setForm] = useState({
    prenom: '', nom: '', telephone: '', email: '',
    animal: '', date: '', heure: '', duree: '1',
    notes: '',
  })*/
 if(!utilisateur?.animals?.length) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-20 h-20 bg-error-container border-4 border-black rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
        </div>
        <h3 className="font-['Chewy'] text-3xl text-error">Aucun animal trouvé</h3>
        <p className="text-on-surface-variant max-w-sm mx-auto">
          Vous devez ajouter au moins un animal à votre profil pour pouvoir faire une réservation.
        </p>
        <button onClick={onClose} className="mt-4 px-8 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          Fermer
        </button>
      </div>
    )
  }


  const [form, setForm] = useState({
  IdUtilisateur: utilisateur?.Id,
  IdProfil: initialSlot?.IdProfil || prestataire?.Id,
  IdAnimal: '',
  IdAnnonce: null,
  TypeService: prestataire?.TypeService || prestataire?.typeService?.Id,
  DateDebut: initialSlot?.DateDebut || '',
  DateFin: initialSlot?.DateFin || '',
  Statut: 'En attente',
  PrixFinal: 0,
  Notes: '',
})

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputCls = "w-full bg-surface-container-lowest border-2 border-black px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
  const labelCls = "block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5 text-on-surface"

  if (submitted) return (
    <div className="text-center py-8 space-y-4">
      <div className="w-20 h-20 bg-secondary-fixed border-4 border-black rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-4xl text-secondary">event_available</span>
      </div>
      <h3 className="font-['Chewy'] text-3xl text-primary">Réservation confirmée !</h3>
      <p className="text-on-surface-variant max-w-sm mx-auto">
        <strong>{prestataire?.Nom}</strong> va vous contacter dans les plus brefs délais pour confirmer le créneau.
      </p>
      <button onClick={onClose} className="mt-4 px-8 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
        Fermer
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {prestataire && (
        <div className="flex items-center gap-3 p-3 bg-primary-fixed border-2 border-black rounded-lg mb-4">
          <img src={prestataire.photo} alt={prestataire?.utilisateur?.Nom} className="w-10 h-10 rounded-full border-2 border-black object-cover" />
          <div>
            <p className="font-bold text-sm text-primary">{prestataire?.utilisateur?.Nom}</p>
            <p className="text-xs text-on-surface-variant">{prestataire?.typeService?.Type} • {prestataire.TarifHoraire}€/h</p>
          </div>
        </div>
      )}

      {/*<div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Prénom *</label><input required className={inputCls} value={form.prenom} onChange={e => update('prenom', e.target.value)} /></div>
        <div><label className={labelCls}>Nom *</label><input required className={inputCls} value={form.nom} onChange={e => update('nom', e.target.value)} /></div>
      </div>
      <div><label className={labelCls}>Téléphone *</label><input required className={inputCls} value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="06 XX XX XX XX" /></div>
      <div><label className={labelCls}>Email *</label><input required type="email" className={inputCls} value={form.email} onChange={e => update('email', e.target.value)} /></div>
      <div><label className={labelCls}>Nom de votre animal *</label><input required className={inputCls} value={form.animal} onChange={e => update('animal', e.target.value)} placeholder="Ex: Caramel, mon Labrador de 2 ans" /></div>*/}
      <div className="p-3 bg-green-50 border-2 border-black rounded-lg text-sm font-bold">
        Créneau choisi : {new Date(form.DateDebut).toLocaleString('fr-FR')} → {new Date(form.DateFin).toLocaleString('fr-FR')}
      </div>
      <select
        required
        value={form.IdAnimal}
        onChange={e => update('IdAnimal', e.target.value)}
        className={inputCls}
      >
        <option value="">Choisir un animal</option>
        {utilisateur?.animals?.map(animal => (
          <option key={animal.Id} value={animal.Id}>
            {animal.Nom}
          </option>
        ))}
      </select>
      <div>
        <label className={labelCls}>Notes particulières</label>
        <textarea className={inputCls + ' h-20 resize-none'} value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Allergies, comportement particulier..." />
      </div>

      {prestataire && (
        <div className="p-3 bg-surface-container border-2 border-dashed border-black rounded-lg text-sm font-bold">
          Total estimé : <span className="text-primary">{(prestataire.TarifHoraire * parseFloat(form.duree || 1)).toFixed(2)} €</span>
        </div>
      )}

      <button type="submit" className="w-full py-3 bg-primary text-white font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2">
        <span className="material-symbols-outlined">event</span>
        Confirmer la réservation
      </button>
    </form>
  )
}

export default ReservationForm
