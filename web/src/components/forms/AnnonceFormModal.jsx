// frontend/src/components/forms/AnnonceFormModal.jsx

import { useEffect, useState } from "react"
import Modal from "../ui/Modal"
import { useCreateAnnonce, useUpdateAnnonce } from "../../hooks/useAnnonce"
import { useTypeServices } from "../../hooks/useType_service"

const DEFAULT_FORM = {
  IdUtilisateur: null,
  IdAnimal: "",
  TypeService: "",
  DateDebut: "",
  DateFin: "",
  PrixSouhaite: "",
  Statut: 1,
  Notes: "",
}

const AnnonceFormModal = ({
  animals,
  IdUtilisateur,
  isOpen,
  onClose,
  initialData = null,
  mode = "prestataire", // "prestataire" ou "utilisateur"
}) => {
  const createAnnonce = useCreateAnnonce()
  const updateAnnonce = useUpdateAnnonce()

  const [formData, setFormData] = useState(DEFAULT_FORM)

  const isEdit = Boolean(initialData?.Id)
  const isSubmitting = createAnnonce.isPending || updateAnnonce.isPending

  const { typeServices, TypeServicesLoading } = useTypeServices()


  useEffect(() => {
    if (initialData) {
      setFormData({
        IdUtilisateur: initialData.IdUtilisateur ?? IdUtilisateur,
        IdAnimal: initialData.IdAnimal ?? "",
        TypeAnnonce: initialData.TypeAnnonce ?? (mode === "prestataire" ? "OFFRE" : "DEMANDE"),
        TypeService: initialData.TypeService ?? "",
        DateDebut: initialData.DateDebut?.slice(0, 10) ?? "",
        DateFin: initialData.DateFin?.slice(0, 10) ?? "",
        PrixSouhaite: initialData.PrixSouhaite ?? "",
        Statut: initialData.Statut ?? 1,
        Notes: initialData.Notes ?? "",
      })
    } else {
      setFormData({
        ...DEFAULT_FORM,
        TypeAnnonce: mode === "prestataire" ? "OFFRE" : "DEMANDE",
        IdUtilisateur: IdUtilisateur,
      })
    }
  }, [initialData, mode, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      ...formData,
      IdAnimal: formData.IdAnimal ? Number(formData.IdAnimal) : null,
      TypeService: Number(formData.TypeService),
      PrixSouhaite: Number(formData.PrixSouhaite || 0),
      Statut: Number(formData.Statut),
    }

    try {
      if (isEdit) {
        await updateAnnonce.mutateAsync({
          id: initialData.Id,
          formData: payload,
        })
      } else {
        await createAnnonce.mutateAsync(payload)
      }

      onClose()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'enregistrement de l'annonce")
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier l'annonce" : "Créer une annonce"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-xs font-extrabold uppercase mb-1">
            Type d'annonce
          </label>

          <input type="text" readOnly value={formData.TypeAnnonce === "OFFRE" ? "Offre de service" : "Demande de service"} className="w-full border-2 border-black rounded-lg px-4 py-3 bg-white font-bold" />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase mb-1">
            Type de service
          </label>

          <select
            name="TypeService"
            value={formData.TypeService}
            onChange={handleChange}
            required
            className="w-full border-2 border-black rounded-lg px-4 py-3 bg-white font-bold"
          >
            <option value="">Choisir un service</option>
            {typeServices?.map(type => (
              <option key={type.Id} value={type.Id}>
                {type.Type}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label className="block text-xs font-extrabold uppercase mb-1">
                Animal concerné
            </label>

            <select
                name="IdAnimal"
                value={formData.IdAnimal}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-lg px-4 py-3 bg-white font-bold"
            >
                <option value="">
                Aucun animal
                </option>

                {animals?.map(animal => (
                <option
                    key={animal.Id}
                    value={animal.Id}
                >
                    #{animal.Id} - {animal.Prenom} {animal.Nom}
                </option>
                ))}
            </select>
            </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase mb-1">
              Date début
            </label>

            <input
              type="date"
              name="DateDebut"
              value={formData.DateDebut}
              onChange={handleChange}
              required
              className="w-full border-2 border-black rounded-lg px-4 py-3 bg-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase mb-1">
              Date fin
            </label>

            <input
              type="date"
              name="DateFin"
              value={formData.DateFin}
              onChange={handleChange}
              required
              className="w-full border-2 border-black rounded-lg px-4 py-3 bg-white font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase mb-1">
            Prix souhaité
          </label>

          <input
            type="number"
            name="PrixSouhaite"
            value={formData.PrixSouhaite}
            onChange={handleChange}
            placeholder="Ex: 1500"
            className="w-full border-2 border-black rounded-lg px-4 py-3 bg-white font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase mb-1">
            Notes
          </label>

          <textarea
            name="Notes"
            value={formData.Notes}
            onChange={handleChange}
            rows={4}
            placeholder="Décris ton annonce..."
            className="w-full border-2 border-black rounded-lg px-4 py-3 bg-white font-bold resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border-2 border-black rounded-lg font-bold bg-white"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 border-2 border-black rounded-lg font-bold bg-primary text-white disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AnnonceFormModal