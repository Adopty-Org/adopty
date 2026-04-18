import { Link } from "react-router"
import { animalApi } from "../../lib/api"
import { useQuery } from "@tanstack/react-query"

const AnimalWithPhoto = ({ animal, onClose }) => {

  const { data: photos = [] } = useQuery({
    queryKey: ["animalPhotos", animal.Id],
    queryFn: async () => {
      try {
        return await animalApi.getPhotos(animal.Id)
      } catch (error) {
        if (error?.response?.status === 404) return []
        throw error
      }
    },
    enabled: !!animal.Id,
    retry: (failureCount, error) => error?.response?.status !== 404 && failureCount < 3
  })

  return (
    <Link 
    key={animal.Id} 
    to={`/profil_animal/${animal.Id}`}
    onClick={onClose}
    className="bg-white border-4 border-black p-3 rounded-2xl flex items-center gap-4 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
    >
        <img src={photos[0]?.Url} alt={animal.Nom} className="w-16 h-16 object-cover rounded-xl border-2 border-black flex-shrink-0" />
        <div>
            <p className="font-black text-primary group-hover:text-secondary transition-colors">{animal.Nom}</p>
            <p className="text-xs font-bold text-on-surface-variant opacity-70">{animal.Age} • {/*animal.caractere[0]*/}</p>
        </div>
        <span className="material-symbols-outlined ml-auto text-on-surface-variant/30 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all">arrow_forward</span>
    </Link>
  )
}


export default AnimalWithPhoto