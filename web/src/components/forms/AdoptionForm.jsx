import { useState } from 'react'

const AdoptionForm = ({ animal, onClose }) => {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', typeLogement: '', jardin: '',
    animauxActuels: '', enfants: '', motivations: '',
    disponibilite: '', acceptConditions: false,
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
      <div className="w-20 h-20 bg-primary-fixed border-4 border-black rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
      </div>
      <h3 className="font-['Chewy'] text-3xl text-primary">Demande envoyée !</h3>
      <p className="text-on-surface-variant max-w-sm mx-auto">Notre équipe va étudier votre dossier et vous contactera sous 48h pour organiser une rencontre avec {animal?.nom || 'l\'animal'}.</p>
      <button onClick={onClose} className="mt-4 px-8 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
        Fermer
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm transition-colors
              ${step >= s ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
              {step > s ? <span className="material-symbols-outlined text-base">check</span> : s}
            </div>
            {s < 3 && <div className={`h-1 w-12 border-t-2 border-dashed ${step > s ? 'border-primary' : 'border-outline-variant'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-on-surface-variant font-bold">
          {step === 1 ? 'Vos informations' : step === 2 ? 'Votre foyer' : 'Motivations'}
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Prénom *</label><input required className={inputCls} value={form.prenom} onChange={e => update('prenom', e.target.value)} placeholder="Marie" /></div>
            <div><label className={labelCls}>Nom *</label><input required className={inputCls} value={form.nom} onChange={e => update('nom', e.target.value)} placeholder="Martin" /></div>
          </div>
          <div><label className={labelCls}>Email *</label><input required type="email" className={inputCls} value={form.email} onChange={e => update('email', e.target.value)} placeholder="marie@email.com" /></div>
          <div><label className={labelCls}>Téléphone *</label><input required className={inputCls} value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="06 XX XX XX XX" /></div>
          <div><label className={labelCls}>Adresse *</label><input required className={inputCls} value={form.adresse} onChange={e => update('adresse', e.target.value)} placeholder="12 rue de la Forêt, Montpellier" /></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Type de logement *</label>
            <select required className={inputCls} value={form.typeLogement} onChange={e => update('typeLogement', e.target.value)}>
              <option value="">Sélectionner...</option>
              <option>Appartement</option>
              <option>Maison</option>
              <option>Maison avec jardin</option>
              <option>Villa</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Avez-vous un jardin ?</label>
            <div className="flex gap-4 mt-1">
              {['Oui', 'Non', 'Terrasse'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="jardin" value={opt} checked={form.jardin === opt} onChange={e => update('jardin', e.target.value)} className="w-4 h-4 text-primary border-2 border-black" />
                  <span className="font-bold text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div><label className={labelCls}>Animaux déjà présents</label><input className={inputCls} value={form.animauxActuels} onChange={e => update('animauxActuels', e.target.value)} placeholder="Ex: 1 chat de 3 ans" /></div>
          <div><label className={labelCls}>Enfants à la maison ?</label><input className={inputCls} value={form.enfants} onChange={e => update('enfants', e.target.value)} placeholder="Ex: 2 enfants de 5 et 8 ans" /></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Pourquoi souhaitez-vous adopter {animal?.nom} ? *</label>
            <textarea required className={inputCls + ' h-28 resize-none'} value={form.motivations} onChange={e => update('motivations', e.target.value)} placeholder="Dites-nous pourquoi vous et votre famille êtes le foyer idéal..." />
          </div>
          <div>
            <label className={labelCls}>Vos disponibilités</label>
            <select className={inputCls} value={form.disponibilite} onChange={e => update('disponibilite', e.target.value)}>
              <option value="">Sélectionner...</option>
              <option>Je suis à la maison toute la journée</option>
              <option>Je travaille mais rentre le midi</option>
              <option>Je suis absent 8h par jour</option>
              <option>Horaires variables</option>
            </select>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input required type="checkbox" checked={form.acceptConditions} onChange={e => update('acceptConditions', e.target.checked)} className="w-5 h-5 mt-0.5 border-2 border-black text-primary" />
            <span className="text-sm text-on-surface-variant">J'accepte les conditions d'adoption et je m'engage à offrir un foyer stable et aimant.</span>
          </label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 border-2 border-black font-bold text-sm uppercase tracking-wider hover:bg-surface-container transition-colors">
            ← Retour
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(s => s + 1)}
            className="flex-1 py-3 bg-primary text-white font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Continuer →
          </button>
        ) : (
          <button type="submit"
            className="flex-1 py-3 bg-primary text-white font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">send</span>
            Envoyer ma demande
          </button>
        )}
      </div>
    </form>
  )
}

export default AdoptionForm
