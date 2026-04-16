import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router'
//import { animaux } from '../../data/mockData'

const BreedDetailModal = ({ breed, isOpen, onClose }) => {
  if (!breed) return null

  // Find animals currently at the shelter of this breed
 // const availableAnimals = animaux.filter(a => a.race === breed.nom)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-4 md:inset-x-0 md:top-20 md:bottom-20 max-w-5xl mx-auto bg-[#fbfbe2] z-101 border-4 border-black rounded-3xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          >
            {/* Header / Close */}
            <div className="absolute top-6 right-6 z-10">
              <button 
                onClick={onClose}
                className="w-14 h-14 bg-error text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-xl flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-3xl font-black">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Visual */}
                <div className="h-64 lg:h-full relative border-b-4 lg:border-b-0 lg:border-r-4 border-black">
                  <img src={breed.photo} alt={breed.nom} className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 left-6 bg-secondary text-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
                    <span className="font-['Chewy'] text-3xl">{breed.nom}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 space-y-10">
                  <div>
                    <span className="bg-primary-fixed text-primary font-black px-4 py-1.5 rounded-full border-2 border-black text-xs uppercase tracking-widest mb-4 inline-block">Fiche Encyclopédie</span>
                    <h2 className="font-['Chewy'] text-5xl text-primary mb-6">Tout savoir sur le {breed.nom}</h2>
                    <p className="font-['Plus_Jakarta_Sans'] text-lg text-on-surface-variant leading-relaxed">
                      {breed.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-xs font-black uppercase tracking-tighter text-on-surface-variant mb-1">Origine</p>
                      <p className="font-bold text-lg">{breed.origine}</p>
                    </div>
                    <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-xs font-black uppercase tracking-tighter text-on-surface-variant mb-1">Espérance de vie</p>
                      <p className="font-bold text-lg">{breed.esperanceVie}</p>
                    </div>
                    <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-2">
                      <p className="text-xs font-black uppercase tracking-tighter text-on-surface-variant mb-1">Caractéristique majeure</p>
                      <p className="font-bold text-lg">{breed.traits?.[0] || 'Sociable'}</p>
                    </div>
                  </div>

                  <div className="bg-primary/5 border-2 border-dashed border-primary/30 p-6 rounded-2xl">
                    <h3 className="font-bold text-primary flex items-center gap-2 mb-3 tracking-wide">
                      <span className="material-symbols-outlined text-xl">medical_services</span> SANTÉ & SOINS
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {breed.soins}
                    </p>
                  </div>

                  {/* Section: Available Animals */}
                  <div className="pt-6 border-t-2 border-black/10">
                    <h3 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-4xl">volunteer_activism</span>
                      Ils attendent une famille
                    </h3>
                    
                    {/*availableAnimals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableAnimals.map(animal => (
                          <Link 
                            key={animal.id} 
                            to={`/profil/${animal.id}`}
                            onClick={onClose}
                            className="bg-white border-4 border-black p-3 rounded-2xl flex items-center gap-4 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
                          >
                            <img src={animal.photo} alt={animal.nom} className="w-16 h-16 object-cover rounded-xl border-2 border-black flex-shrink-0" />
                            <div>
                              <p className="font-black text-primary group-hover:text-secondary transition-colors">{animal.nom}</p>
                              <p className="text-xs font-bold text-on-surface-variant opacity-70">{animal.ageLabel} • {animal.caractere[0]}</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-on-surface-variant/30 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all">arrow_forward</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-surface-container rounded-2xl p-8 text-center border-2 border-black border-dashed">
                        <p className="font-bold text-on-surface-variant text-sm mb-4">Nous n'avons aucun {breed.nom} au refuge actuellement.</p>
                        <Link 
                          to="/animaux" 
                          onClick={onClose}
                          className="text-xs font-black uppercase text-primary underline"
                        >
                          Découvrir nos autres compagnons →
                        </Link>
                      </div>
                    )*/}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BreedDetailModal
