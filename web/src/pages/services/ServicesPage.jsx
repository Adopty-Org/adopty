import React, { useState } from 'react'
import { FadeIn, PageTransition } from '../../components/Animations'
import ServiceCard from '../../components/ui/ServiceCard'
import Modal from '../../components/ui/Modal'
import ReservationForm from '../../components/forms/ReservationForm'

function ServicesPage() {
  const [activeTab, setActiveTab] = useState('Baby-sitting')
  const [selectedPrestataire, setSelectedPrestataire] = useState(null)

 // const filtered = prestataires.filter(p => p.service === activeTab)



  return (
    <PageTransition>
      {/* Hero */}
      <section className="bg-primary py-16 px-6 border-b-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-6 right-12 text-9xl font-['Chewy'] text-white rotate-12">🐾</div>
          <div className="absolute bottom-4 left-8 text-7xl font-['Chewy'] text-white -rotate-6">🐕</div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-6">
              <span className="material-symbols-outlined text-sm">pets</span>
              <span className="font-bold text-sm uppercase tracking-widest">Nos Services</span>
            </div>
            <h1 className="font-['Chewy'] text-5xl md:text-7xl text-white mb-4 leading-tight">
              Des services de<br />
              <span className="text-[#fe9e72]">confiance</span>
            </h1>
            <p className="text-white/80 max-w-xl text-lg font-body">
              Des prestataires certifiés et passionnés prennent soin de votre compagnon quand vous en avez besoin.
            </p>
          </FadeIn>

          {/* Stats rapides */}
          <FadeIn delay={0.2} className="flex flex-wrap gap-6 mt-10">
            {[
              { icon: 'verified_user', label: 'Prestataires certifiés', value: '19+' },
              { icon: 'star', label: 'Note moyenne', value: '4.8/5' },
              { icon: 'event_available', label: 'Réservations réussies', value: '1,240+' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3 bg-white/10 border-2 border-white/30 px-5 py-3 rounded-xl">
                <span className="material-symbols-outlined text-[#fe9e72] text-2xl">{stat.icon}</span>
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-white text-xl">{stat.value}</p>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <FadeIn className="flex gap-3 mb-10">
          {['Baby-sitting', 'Promenade'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-7 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black transition-all
                ${activeTab === tab
                  ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-surface-container-lowest text-primary hover:bg-surface-container hover:translate-x-2px hover:translate-y-2px shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none'
                }`}
            >
              <span className="material-symbols-outlined">{tab === 'Baby-sitting' ? 'home' : 'directions_walk'}</span>
              {tab}
            </button>
          ))}
        </FadeIn>

        {/* Grid prestataires */}
        {/*filtered.length === 0 ? (
          <FadeIn className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">search_off</span>
            <p className="font-bold text-xl">Aucun prestataire disponible pour ce service.</p>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <ServiceCard key={p.id} prestataire={p} delay={i * 0.1} onReserver={setSelectedPrestataire} />
            ))}
          </div>
        )*/}

        {/* Devenir prestataire */}
        <FadeIn delay={0.3} className="mt-20 bg-[#ffdbcd] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-5xl mb-4 block">🐾</span>
              <h2 className="font-['Chewy'] text-4xl text-primary mb-4">Devenez Prestataire Adopty !</h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Vous aimez les animaux et souhaitez partager votre passion tout en générant des revenus ? Rejoignez notre réseau de prestataires certifiés et bienveillants.
              </p>
              <ul className="space-y-2 mb-6">
                {['Horaires flexibles', 'Rémunération attractive', 'Formation offerte', 'Assurance incluse'].map(item => (
                  <li key={item} className="flex items-center gap-2 font-bold text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Votre prénom" className="bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
                <input type="text" placeholder="Votre nom" className="bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
              </div>
              <input type="email" placeholder="Votre email" className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
              <select className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                <option>Service proposé</option>
                <option>Baby-sitting</option>
                <option>Promenade</option>
                <option>Les deux</option>
              </select>
              <button className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
                Rejoindre le réseau →
              </button>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Modal réservation */}
      <Modal
        isOpen={!!selectedPrestataire}
        onClose={() => setSelectedPrestataire(null)}
        title={`Réserver — ${selectedPrestataire?.nom || ''}`}
        size="md"
      >
        <ReservationForm prestataire={selectedPrestataire} onClose={() => setSelectedPrestataire(null)} />
      </Modal>
    </PageTransition>
  )
}

export default ServicesPage