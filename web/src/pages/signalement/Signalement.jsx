import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition, FadeIn } from '../../components/Animations'

const STEPS = ['Localisation', 'Description', 'Contact']

const Signalement = () => {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    lieu: '', ville: '', codePostal: '',
    dateObservation: '', heureObservation: '',
    typeAnimal: '', description: '', etatSante: '',
    photos: [],
    prenom: '', nom: '', telephone: '', email: '',
    anonyme: false,
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const inputCls = "w-full bg-white border-2 border-black px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg"
  const labelCls = "block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5 text-on-surface"

  if (submitted) return (
    <div className="min-h-screen bg-[#fbfbe2] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-primary-fixed border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
        </div>
        <h1 className="font-['Chewy'] text-5xl text-primary mb-4">Signalement reçu !</h1>
        <p className="text-on-surface-variant leading-relaxed mb-8">
          Merci pour votre vigilance. Notre équipe a bien reçu votre signalement et va traiter votre demande en priorité. Vous serez contacté(e) dans les plus brefs délais.
        </p>
        <div className="bg-surface-container border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 rounded-xl mb-8 text-left">
          <p className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-2">Référence de signalement</p>
          <p className="font-['Chewy'] text-3xl text-primary">#SIG-{Math.floor(Math.random() * 9000) + 1000}</p>
        </div>
        <div className="flex gap-4">
          <a href="tel:15" className="flex-1 py-3 border-4 border-black bg-[#ba1a1a] text-white font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="material-symbols-outlined">call</span> Urgence vét.
          </a>
          <a href="/" className="flex-1 py-3 border-4 border-black bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="material-symbols-outlined">home</span> Accueil
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <PageTransition>
      {/* Hero Urgence */}
      <div className='bg-[#fbfbe2]'>
      <section className="bg-[#ba1a1a] py-10 px-6 border-b-4 border-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="w-16 h-16 bg-white border-4 border-black rounded-xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            <span className="material-symbols-outlined text-3xl text-[#ba1a1a]">warning</span>
          </div>
          <div>
            <FadeIn>
              <h1 className="font-['Chewy'] text-4xl md:text-5xl text-white mb-2">Signaler un animal en danger</h1>
              <p className="text-white/80 font-body">Votre alerte peut sauver une vie. Notre équipe est disponible 7j/7.</p>
            </FadeIn>
          </div>
          <div className="ml-auto hidden md:block">
            <a href="tel:015" className="flex items-center gap-2 bg-white border-4 border-black px-5 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-[#ba1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
              <span className="material-symbols-outlined">call</span> Appeler le refuge
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Progress steps */}
        <FadeIn className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center font-['Plus_Jakarta_Sans'] font-extrabold text-sm transition-all
                  ${i < step ? 'bg-primary text-white' : i === step ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                  {i < step ? <span className="material-symbols-outlined text-base">check</span> : i + 1}
                </div>
                <span className={`hidden sm:block text-sm font-bold transition-colors ${i === step ? 'text-secondary' : i < step ? 'text-primary' : 'text-on-surface-variant'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 border-t-2 border-dashed mx-2 transition-colors ${i < step ? 'border-primary' : 'border-outline-variant'}`} />
              )}
            </div>
          ))}
        </FadeIn>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 0: Localisation */}
            {step === 0 && (
              <div className="bg-[#ffffff] border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(110,28,12,0.4)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-secondary">location_on</span>
                  Où avez-vous observé l'animal ?
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Description du lieu *</label>
                    <input required className={inputCls} value={form.lieu} onChange={e => update('lieu', e.target.value)} placeholder="Ex: Parc Montcalm, près des jeux pour enfants" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Ville *</label>
                      <input required className={inputCls} value={form.ville} onChange={e => update('ville', e.target.value)} placeholder="Montpellier" />
                    </div>
                    <div>
                      <label className={labelCls}>Code postal</label>
                      <input className={inputCls} value={form.codePostal} onChange={e => update('codePostal', e.target.value)} placeholder="34000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Date d'observation *</label>
                      <input required type="date" className={inputCls} value={form.dateObservation} onChange={e => update('dateObservation', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Heure approximative</label>
                      <input type="time" className={inputCls} value={form.heureObservation} onChange={e => update('heureObservation', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Description */}
            {step === 1 && (
              <div className="bg-[#ffffff] border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(110,28,12,0.4)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-secondary">description</span>
                  Décrivez l'animal
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Type d'animal *</label>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {['Chien', 'Chat', 'Oiseau', 'Lapin', 'Autre'].map(t => (
                        <button key={t} type="button"
                          onClick={() => update('typeAnimal', t)}
                          className={`px-4 py-2 border-2 border-black font-bold text-sm transition-all
                            ${form.typeAnimal === t ? 'bg-secondary text-white shadow-none translate-x-2px translate-y-2px' : 'bg-[#ffffff] hover:bg-surface-container shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>État de santé apparent *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        { label: '🩸 Blessé', value: 'blessé' },
                        { label: '😰 Apeuré', value: 'apeuré' },
                        { label: '⚠️ Maigre/malnutri', value: 'malnutri' },
                        { label: '🏃 Fugué/perdu', value: 'perdu' },
                        { label: '😴 Inconscient', value: 'inconscient' },
                        { label: '❓ Bonne santé', value: 'bon' },
                      ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-2 p-3 border-2 border-black cursor-pointer transition-all rounded-lg
                          ${form.etatSante === opt.value ? 'bg-secondary-fixed border-secondary' : 'bg-[#ffffff] hover:bg-surface-container'}`}>
                          <input type="radio" name="etatSante" value={opt.value} checked={form.etatSante === opt.value} onChange={e => update('etatSante', e.target.value)} className="sr-only" />
                          <span className="font-bold text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description détaillée *</label>
                    <textarea required className={inputCls + ' h-28 resize-none'} value={form.description} onChange={e => update('description', e.target.value)}
                      placeholder="Couleur, taille, comportement, collier, blessures visibles..." />
                  </div>
                  <div>
                    <label className={labelCls}>Photos (optionnel)</label>
                    <div className="border-2 border-dashed border-black bg-surface-container p-8 text-center rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">add_a_photo</span>
                      <p className="text-sm font-bold text-on-surface-variant">Cliquer pour ajouter des photos</p>
                      <p className="text-xs text-on-surface-variant/60">JPG, PNG • Max 5Mo</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Contact */}
            {step === 2 && (
              <div className="bg-[#ffffff] border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(110,28,12,0.4)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-secondary">contact_phone</span>
                  Vos coordonnées
                </h2>
                <p className="text-on-surface-variant text-sm mb-6">Facultatif mais recommandé pour qu'on puisse vous joindre si besoin.</p>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-dashed border-outline cursor-pointer rounded-lg hover:bg-surface-container transition-colors">
                    <input type="checkbox" checked={form.anonyme} onChange={e => update('anonyme', e.target.checked)} className="w-5 h-5 border-2 border-black text-primary" />
                    <div>
                      <p className="font-bold text-sm">Signalement anonyme</p>
                      <p className="text-xs text-on-surface-variant">Nous traiterons votre signalement sans conserver vos coordonnées.</p>
                    </div>
                  </label>

                  {!form.anonyme && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Prénom</label><input className={inputCls} value={form.prenom} onChange={e => update('prenom', e.target.value)} /></div>
                        <div><label className={labelCls}>Nom</label><input className={inputCls} value={form.nom} onChange={e => update('nom', e.target.value)} /></div>
                      </div>
                      <div><label className={labelCls}>Téléphone</label><input className={inputCls} value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="06 XX XX XX XX" /></div>
                      <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={e => update('email', e.target.value)} /></div>
                    </div>
                  )}

                  <div className="bg-secondary-fixed border-2 border-black rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-xl shrink-0">info</span>
                      <p className="text-sm text-on-secondary-fixed leading-relaxed">
                        En soumettant ce formulaire, vous confirmez avoir observé un animal en difficulté et que les informations fournies sont exactes au meilleur de votre connaissance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-8 py-4 border-4 border-black font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider hover:bg-surface-container transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none">
              ← Retour
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 py-4 bg-secondary text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
              Étape suivante →
            </button>
          ) : (
            <button onClick={() => setSubmitted(true)}
              className="flex-1 py-4 bg-[#ba1a1a] text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-xl">report</span>
              Envoyer le signalement
            </button>
          )}
        </div>
      </div>
      </div>
    </PageTransition>
  )
}

export default Signalement
