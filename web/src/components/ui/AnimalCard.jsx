import { Link } from 'react-router-dom'
import { FadeIn } from '../Animations'
import Badge from './Badge'

const AnimalCard = ({ animal, delay = 0 }) => {
  return (
    <FadeIn delay={delay} className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] transition-all duration-200 flex flex-col">
      <div className="h-56 overflow-hidden relative">
        <img
          alt={animal.nom}
          src={animal.photo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {animal.urgent && (
          <Badge variant="urgent" className="absolute top-3 right-3">Urgent</Badge>
        )}
        <Badge variant="espece" className="absolute top-3 left-3">{animal.espece}</Badge>
      </div>
      <div className="p-5 flex flex-col grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary">{animal.nom}</h3>
          <span className="text-secondary font-bold">{animal.ageLabel}</span>
        </div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">{animal.race}</p>
        <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 font-body grow">{animal.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {animal.caractere.slice(0, 3).map(c => (
            <span key={c} className="text-xs font-bold uppercase tracking-tight bg-surface-variant px-2 py-0.5 border border-black/20 rounded-sm">{c}</span>
          ))}
          <span className="text-xs font-bold uppercase tracking-tight bg-surface-variant px-2 py-0.5 border border-black/20 rounded-sm">{animal.taille}</span>
        </div>
        <Link
          to={`/profil/${animal.id}`}
          className="block text-center w-full py-3 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black hover:translate-x-2px hover:translate-y-2px shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
        >
          En savoir plus
        </Link>
      </div>
    </FadeIn>
  )
}

export default AnimalCard
