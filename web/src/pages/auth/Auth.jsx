// Auth.jsx - VERSION CORRIGÉE

import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSignUp, useSignIn, useAuth } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS_SIGNUP = ['Compte', 'Informations', 'Rôle']

const InputField = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5 text-on-surface">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full bg-white border-2 border-black px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
    />
  </div>
)

const Auth = () => {
  const navigate = useNavigate()
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp()
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn()

  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Champs communs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [adresse, setAdresse] = useState('')
  const [role, setRole] = useState('') // 'refuge' | 'prestataire' | ''

  // Champs refuge
  const [nomRefuge, setNomRefuge] = useState('')
  const [siret, setSiret] = useState('')
  const [capacite, setCapacite] = useState('')
  const [telephone, setTelephone] = useState('')

  // Champs prestataire
  const [nomEntreprise, setNomEntreprise] = useState('')
  const [service, setService] = useState('')
  const [zone, setZone] = useState('')
  const [tarifHoraire, setTarifHoraire] = useState('')
  const [experience, setExperience] = useState('')

  const [verificationCode, setVerificationCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)

  const resetSignup = () => {
    setStep(0); setRole(''); setError('')
    setEmail(''); setPassword(''); setConfirmPassword('')
    setPrenom(''); setNom(''); setWilaya(''); setAdresse('')
    setNomRefuge(''); setSiret(''); setCapacite(''); setTelephone('')
    setNomEntreprise(''); setService(''); setZone(''); setTarifHoraire(''); setExperience('')
    setPendingVerification(false); setVerificationCode('')
  }

  // LOGIN - Inchangé
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!signInLoaded) return
    setLoading(true); setError('')
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActiveSignIn({ session: result.createdSessionId })
        navigate('/')
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Email ou mot de passe incorrect.')
    } finally { setLoading(false) }
  }

  // SIGNUP Step 0 - Crée le compte Clerk AVEC les métadonnées
  const handleStep0 = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) { 
      setError('Les mots de passe ne correspondent pas.'); 
      return 
    }
    if (!signUpLoaded) return
    setLoading(true); setError('')
    
    try {
      // On crée le compte SANS métadonnées ici (on les ajoutera après vérification)
      await signUp.create({ 
        emailAddress: email, 
        password,
        // On peut déjà passer les infos de base en metadata
        unsafeMetadata: {
          role: 'utilisateur' // temporaire, sera écrasé plus tard
        }
        /*unsafeMetadata: {
          prenom,
          nom,
          role: role || 'utilisateur'
        }*/
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Erreur lors de la création du compte.')
    } finally { setLoading(false) }
  }

  // Vérification email
  const handleVerify = async (e) => {
    e.preventDefault()
    if (!signUpLoaded) return
    setLoading(true); setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode })
      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId })
        setPendingVerification(false)
        setStep(1)
      } else {
        setError('Code invalide. Vérifiez votre email.')
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Code invalide.')
    } finally { setLoading(false) }
  }

  // STEP 1 - Infos perso
  const handleStep1 = async (e) => {
    e.preventDefault()
    
    // On met à jour les métadonnées avec les infos perso
    try {
      await signUp.update({
        unsafeMetadata: {
          prenom,
          nom,
          wilaya,
          adresse,
          role: role || 'utilisateur'
        }
      })
      setStep(2)
    } catch (err) {
      setError('Erreur lors de la sauvegarde des informations.')
    }
  }

  // STEP 2 - Finalisation avec les données spécifiques au rôle
  const handleFinalize = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')

    try {
      // Construction des métadonnées complètes
      const metadata = {
        prenom,
        nom,
        wilaya,
        adresse,
        email,
        role: role || 'utilisateur'
      }

      // Ajout des données spécifiques selon le rôle
      if (role === 'refuge') {
        metadata.refugeData = {
          nomRefuge,
          siret,
          capacite,
          telephone
        }
      } else if (role === 'prestataire') {
        metadata.prestataireData = {
          nomEntreprise,
          service,
          zone,
          tarifHoraire,
          experience
        }
      }

      // Mise à jour finale des métadonnées
      await signUp.update({
        unsafeMetadata: metadata
      })

      // On force la complétion du signup si besoin
      if (signUp.status === 'missing_requirements') {
        await signUp.completeSignUp({ strategy: 'email_code', code: verificationCode })
      }

      // Redirection vers l'accueil
      // Le webhook Clerk → Inngest va se charger de créer l'utilisateur dans votre DB
      navigate('/')
    } catch (err) {
      console.error('Erreur finalisation:', err)
      setError(err.errors?.[0]?.longMessage || 'Erreur lors de la finalisation.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-white border-2 border-black px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"

  return (
    <div className="min-h-screen bg-[#fbfbe2] flex">
      {/* Panel gauche - garder tel quel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary border-r-4 border-black p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -bottom-10 -left-10 text-[300px] leading-none">🐾</div>
        </div>
        <Link to="/" className="font-['Chewy'] text-4xl text-white relative z-10">Adopty</Link>
        <div className="relative z-10">
          <h2 className="font-['Chewy'] text-5xl text-white mb-6 leading-tight">
            Rejoignez la famille<br /><span className="text-secondary-container">L'Éveil Naturel</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: 'pets', text: '500+ animaux attendent leur famille' },
              { icon: 'volunteer_activism', text: 'Une communauté bienveillante' },
              { icon: 'verified', text: 'Adoptions suivies de A à Z' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary-container">{item.icon}</span>
                </div>
                <p className="text-white/80 font-bold text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs relative z-10">© 2024 Adopty — L'Éveil Naturel</p>
      </div>

      {/* Panel droit - formulaires */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="font-['Chewy'] text-3xl text-primary mb-8 block lg:hidden">← Adopty</Link>

          {/* Tabs */}
          <div className="flex border-4 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {[{ id: 'login', label: 'Se connecter' }, { id: 'signup', label: "S'inscrire" }].map(tab => (
              <button key={tab.id} onClick={() => { setMode(tab.id); resetSignup(); setError('') }}
                className={`flex-1 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider transition-colors
                  ${mode === tab.id ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN - inchangé */}
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-['Chewy'] text-4xl text-primary mb-2">Bon retour !</h1>
                <p className="text-on-surface-variant text-sm mb-8">Connectez-vous pour accéder à votre espace.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@email.com" required />
                  <InputField label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
                  {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60">
                    {loading ? 'Connexion...' : 'Se connecter →'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* SIGNUP - version corrigée */}
            {mode === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="font-['Chewy'] text-4xl text-primary mb-1">
                    {step === 0 ? 'Créer un compte' : step === 1 ? 'Vos informations' : 'Votre rôle'}
                  </h1>
                  <p className="text-on-surface-variant text-sm">Étape {step + 1} sur {STEPS_SIGNUP.length}</p>
                  <div className="flex gap-1.5 mt-3">
                    {STEPS_SIGNUP.map((_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-surface-container-high'}`} />
                    ))}
                  </div>
                </div>

                {/* STEP 0 - Email/MDP */}
                {step === 0 && !pendingVerification && (
                  <form onSubmit={handleStep0} className="space-y-4">
                    <InputField label="Email" type="email" value={email} onChange={setEmail} required />
                    <InputField label="Mot de passe" type="password" value={password} onChange={setPassword} required />
                    <InputField label="Confirmer" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
                    {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                      {loading ? 'Création...' : 'Continuer →'}
                    </button>
                  </form>
                )}

                {/* Vérification email */}
                {step === 0 && pendingVerification && (
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="bg-primary-fixed border-2 border-black rounded-xl p-4 text-center">
                      <span className="material-symbols-outlined text-primary text-3xl mb-2 block">mark_email_read</span>
                      <p className="font-bold text-sm">Code envoyé à <strong>{email}</strong></p>
                    </div>
                    <InputField label="Code" value={verificationCode} onChange={setVerificationCode} required />
                    {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                      {loading ? 'Vérification...' : 'Vérifier →'}
                    </button>
                  </form>
                )}

                {/* STEP 1 - Infos personnelles */}
                {step === 1 && (
                  <form onSubmit={handleStep1} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Prénom" value={prenom} onChange={setPrenom} required />
                      <InputField label="Nom" value={nom} onChange={setNom} required />
                    </div>
                    <InputField label="Wilaya" value={wilaya} onChange={setWilaya} required />
                    <InputField label="Adresse" value={adresse} onChange={setAdresse} required />
                    {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                    <button type="submit"
                      className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                      Continuer →
                    </button>
                  </form>
                )}

                {/* STEP 2 - Rôle */}
                {step === 2 && (
                  <form onSubmit={handleFinalize} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'refuge', icon: 'home_work', label: 'Refuge' },
                        { id: 'prestataire', icon: 'handshake', label: 'Prestataire' },
                      ].map(opt => (
                        <button key={opt.id} type="button" onClick={() => setRole(opt.id)}
                          className={`p-5 border-4 border-black text-center transition-all rounded-xl
                            ${role === opt.id ? 'bg-primary text-white shadow-none translate-x-[3px] translate-y-[3px]' : 'bg-white hover:bg-surface-container shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                          <span className="material-symbols-outlined text-3xl mb-2 block">{opt.icon}</span>
                          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm">{opt.label}</p>
                        </button>
                      ))}
                    </div>

                    {/* Champs Refuge */}
                    {role === 'refuge' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <InputField label="Nom du refuge" value={nomRefuge} onChange={setNomRefuge} required />
                        <InputField label="SIRET" value={siret} onChange={setSiret} required />
                        <InputField label="Capacité" value={capacite} onChange={setCapacite} required />
                        <InputField label="Téléphone" value={telephone} onChange={setTelephone} required />
                      </motion.div>
                    )}

                    {/* Champs Prestataire */}
                    {role === 'prestataire' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <InputField label="Nom entreprise" value={nomEntreprise} onChange={setNomEntreprise} required />
                        <select value={service} onChange={e => setService(e.target.value)} required className={inputCls}>
                          <option value="">Sélectionner un service</option>
                          <option value="toilettage">Toilettage</option>
                          <option value="education">Éducation canine</option>
                          <option value="pet-sitting">Pet-sitting</option>
                          <option value="promenade">Promenade</option>
                          <option value="veterinaire">Vétérinaire</option>
                        </select>
                        <InputField label="Zone intervention" value={zone} onChange={setZone} required />
                        <InputField label="Tarif horaire (€)" value={tarifHoraire} onChange={setTarifHoraire} required />
                        <InputField label="Expérience (années)" value={experience} onChange={setExperience} required />
                      </motion.div>
                    )}

                    {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                    
                    <button type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                      {loading ? 'Finalisation...' : 'Finaliser mon inscription'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Auth