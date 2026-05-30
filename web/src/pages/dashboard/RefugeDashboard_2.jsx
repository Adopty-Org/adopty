import { useEffect, useMemo, useState, useCallback } from 'react'
import { PageTransition, FadeIn } from '../../components/Animations'
import Modal from '../../components/ui/Modal'
import AnimalForm from '../../components/forms/AnimalForm'
import ProductForm from '../../components/forms/ProductForm'
import { useRefuge, useRefuges } from '../../hooks/useRefuge'
import { NewLoadingLayout } from '../../components/Loadingpage'
import { useUtilisateur, useUtilisateurs } from '../../hooks/useUtilisateur'
import { useUser } from '@clerk/clerk-react'
import DemandeDetailModal from '../../components/ui/DemandeDetailModal'
import { animalApi, demandeAdoptionApi, demandeTransfertApi, produitApi, refugeApi, sousCommandeApi, utilisateurApi } from '../../lib/api'
import TransfertModal from '../../components/ui/TransfertModal'
import UpdateStatusModal from '../../components/ui/UpdateStatusModal'

const RefugeDashboard = () => {
  //const { backendUserId } = useRoleAccess()
  const [isLoading, setIsLoading] = useState(true)
  const [apiIssues, setApiIssues] = useState([])
  const [myRefuges, setMyRefuges] = useState([])
  const [myAnimals, setMyAnimals] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [myAdoptions, setMyAdoptions] = useState([])
  const [myTransferts, setMyTransferts] = useState([])
  const [myOrders, setMyOrders] = useState([])
  
  // États pour le CRUD Animaux
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)

  // États pour le CRUD Produits
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [hasLoaded, setHasLoaded] = useState(false) // ✅ Flag pour éviter les rechargements
  const {user}= useUser()
  const {utilisateur, isLoading: UtilisateurLoading, refetch} = useUtilisateur(user?.id)
  const {utilisateurMap} = useUtilisateurs()
  const {refuge, RefugesLoading} = useRefuge(utilisateur?.Refuge[0]?.Id, utilisateurMap)
  const {refuges,RefugesLoading: refugesLoading} = useRefuges()

  const [selectedDemande, setSelectedDemande] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [demandeDetailModalOpen, setDemandeDetailModalOpen] = useState(false)

  // États pour les transferts
  const [transfertModalOpen, setTransfertModalOpen] = useState(false)
  const [selectedAnimalForTransfert, setSelectedAnimalForTransfert] = useState(null)
  const [demandeType, setDemandeType] = useState('adoption') // 'adoption' ou 'transfert'
  const [allRefuges, setAllRefuges] = useState([]) // Pour la liste des refuges disponibles

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  console.log("Refuges dans le dashboard :", refuge)

  const loadDashboardData = useCallback(async () => {
    //if (!backendUserId) return
    setIsLoading(true)
    setApiIssues([])
    setIsLoading(true)

    // ⚠️ Important: Vérifier que refuges existe et n'est pas vide
    if (!RefugesLoading && !refuge && !UtilisateurLoading) {
      console.log("Attente des données des refuges...")
      return
    }

    try {
      // 1. Récupérer les refuges de l'utilisateur connecté
      if(!RefugesLoading && !UtilisateurLoading){
        console.log("le refuge avant d'assiger le truc")
        setMyRefuges(refuge)
      }

      if(!refugesLoading){
        const filteredRefuges = refuges//.filter(r => r.Id !== refuge?.Id) // Exclure le refuge actuel
        console.log("le refuge avant d'assiger le truc")
        setAllRefuges(filteredRefuges)
      }
      

      /*if (refugesList.length === 0) {
        setIsLoading(false)
        return
      }

      const refugeId = refugesList[0].id

      // 2. Charger animaux, produits, adoptions et commandes en parallèle (filtrés par refuge)

      const issues = []
*/
      if (!RefugesLoading && !UtilisateurLoading/*animauxResult.status === 'fulfilled'*/) {
        setMyAnimals(/*mapAnimals(Array.isArray(animauxResult.value) ? animauxResult.value : [])*/refuge?.animals)
      } else {
        /*issues.push('Animaux')
        normalizeApiError(animauxResult.reason)*/
      }/*
*/
      // ✅ Maintenant refuges[0] devrait être disponible
      const refugeId = refuge?.Id
      if (refugeId) {
        // Récupérer les animaux depuis l'API si nécessaire
        // Si les animaux sont déjà dans l'objet refuge, vérifier la structure
        const animals = refuge?.animals || []
        console.log("animals :  ", animals)
        setMyAnimals(animals)
        setIsLoading(false)
        // Pour les produits, adoptions, commandes - utiliser les API
        // ... votre code
      }

      if (!RefugesLoading && !UtilisateurLoading/*produitsResult.status === 'fulfilled'*/) {
        setMyProducts(refuge?.produits/*mapProduits(Array.isArray(produitsResult.value) ? produitsResult.value : [])*/)
      }/* else {
        issues.push('Produits')
        normalizeApiError(produitsResult.reason)
      }*/

      if (!RefugesLoading && !UtilisateurLoading/*adoptionsResult.status === 'fulfilled'*/) {
        // Filtrer les demandes en cours si nécessaire
        const demandesEnCours = refuge?.demandesAdoption?.filter(
            demande => demande.Statut === 6 || demande.Statut === 2 // Exemple: statuts en cours || en attente
        );
        
        // Utiliser demandesEnCours si besoin
        console.log('Demandes en cours:', demandesEnCours);
        setMyAdoptions(demandesEnCours);
      }/* else {
        issues.push('Adoptions')
        normalizeApiError(adoptionsResult.reason)
      }*/

      if (!RefugesLoading && !UtilisateurLoading/*adoptionsResult.status === 'fulfilled'*/) {
        // Filtrer les demandes en cours si nécessaire
        const demandesEnCours = refuge?.demandesTransfert?.filter(
            demande => demande.Statut === 6 || demande.Statut === 2 // Exemple: statuts en cours || en attente
        );
        
        // Utiliser demandesEnCours si besoin
        console.log('Demandes en cours:', demandesEnCours);
        setMyTransferts(/*demandesEnCours*/ refuge?.demandesTransfert);
      }/* else {
        issues.push('Transferts')
        normalizeApiError(adoptionsResult.reason)
      }*/

      if (!RefugesLoading && !UtilisateurLoading) {
        setMyOrders(refuge?.sousCommandes/*Array.isArray(ordersResult.value) ? ordersResult.value : []*/)
      }/* else {
        issues.push('Commandes')
        normalizeApiError(ordersResult.reason)
      }

      setApiIssues(issues)*/
    } catch (err) {
      console.error('Erreur dashboard refuge:', err)
      setApiIssues(['Chargement général'])
    } finally {
      setIsLoading(false)
    }
  }, [/*backendUserId*/RefugesLoading, isLoading])

  useEffect(() => {
    loadDashboardData()
  }, [RefugesLoading])

  const stats = useMemo(() => {
    const urgentAnimals = myAnimals?.filter((a) => Boolean(a?.urgent))?.length
    const lowStockProducts = myProducts?.filter((p) => Number(p?.Stock ?? p?.stock ?? 0) <= 5)?.length
    const totalStock = myProducts?.reduce((sum, p) => sum + Number(p?.Stock ?? p?.stock ?? 0), 0)
    return {
      refugeCount: myRefuges.length,
      animalCount: myAnimals.length,
      urgentAnimals,
      productCount: myProducts.length,
      lowStockProducts,
      totalStock,
      adoptionPending: myAdoptions?.filter(a => a.Statut === 'En attente').length,
      transfertPending: myTransferts?.filter(a => a.Statut === 'En attente').length,
      orderCount: myOrders.length,
    }
  }, [myAnimals, myProducts, myRefuges, myAdoptions, myTransferts, myOrders])

  // Handlers Animaux
  const handleDeleteAnimal = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) return
    try {
      await animalApi.delete(id)
      loadDashboardData()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const openAddAnimal = () => { setEditingAnimal(null); setIsAnimalModalOpen(true) }
  const openEditAnimal = (animal) => { setEditingAnimal(animal); setIsAnimalModalOpen(true) }

  // Handlers Produits
  const handleDeleteProduit = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return
    try {
      await produitApi.delete(refuge?.Id, id)
      loadDashboardData()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const openAddProduit = () => { setEditingProduct(null); setIsProductModalOpen(true) }
  const openEditProduit = (product) => { setEditingProduct(product); setIsProductModalOpen(true) }

  // Handlers Adoptions
  const handleUpdateAdoptionStatus = async (demandeId, statut, commentaire) => {
    try {
      await demandeAdoptionApi.updateStatut(refuge?.Id, demandeId, {
        Statut: statut,
        CommentaireRetour: commentaire,
        DateRetours: new Date().toISOString()
      })
      // Rafraîchir les données
      refetch()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  // Handlers Commandes
  const handleUpdateOrderStatus = async (id, status) => {
    try {
      console.log("les statuts de sousCommande dans handleUpdateOrderStatus", status)
      //await updateOrderStatus(id, status)
      await sousCommandeApi.updateStatut({ 
        id: id, 
        formData: { Statut: status } 
      })
      refetch()
      loadDashboardData()
    } catch {
      alert('Erreur lors de la mise à jour de la commande')
    }
  }

  if (RefugesLoading || UtilisateurLoading) {
    return <NewLoadingLayout/>
  }

  const handleOpenDemande = (demande) => {
    setSelectedDemande(demande)
    setIsModalOpen(true)
    }

    /*const handleAccept = async (demandeId) => {
    await handleUpdateAdoptionStatus(demandeId, 'Acceptée')
    }

    const handleRefuse = async (demandeId) => {
    await handleUpdateAdoptionStatus(demandeId, 'Refusée')
    }*/

  //console.log("my refuges" , myRefuges)

  const openDemandeDetails = (demande, type) => {
    setSelectedDemande(demande)
    setDemandeType(type)
    setDemandeDetailModalOpen(true)
  }

  const openTransfertModal = (animal) => {
  setSelectedAnimalForTransfert(animal)
  setTransfertModalOpen(true)
}

// Handlers Transferts
const handleSubmitTransfert = async (transfertData) => {
  try {
    await demandeTransfertApi.create( { IdRefugeDepart: refuge?.Id , IdRefugeCible: transfertData.idRefugeCible , Statut: 2 , CommentaireDepart: transfertData.commentaire , IdAnimal: transfertData.idAnimal }) // 2 = En attente
    refetch()
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de l\'envoi de la demande')
  }
}

const handleAcceptTransfert = async (demandeId, commentaire) => {
  /*try {
    const response = await fetch(`/api/demande_transferts/statut/${demandeId}/${refuge?.Id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Statut: 3, CommentaireRetour: commentaire }) // 3 = Approuvé
    })
    
    if (response.ok) {
      alert('Transfert approuvé avec succès')
      loadDashboardData() // Rafraîchir
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de l\'approbation')
  }*/
}

const handleRefuseTransfert = async (demandeId, commentaire) => {
  /*try {
    const response = await fetch(`/api/demande_transferts/statut/${demandeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Statut: 4, CommentaireRetour: commentaire }) // 4 = Refusé
    })
    
    if (response.ok) {
      alert('Transfert refusé')
      loadDashboardData() // Rafraîchir
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors du refus')
  }*/
}

  /*const handleUpdateOrderStatus = async (orderId, newStatus) => {
    // Ton API call ici
    console.log(`Mise à jour commande ${orderId} vers ${newStatus}`)
    // await updateOrderStatus(orderId, newStatus)
    // Rafraîchir la liste des commandes après mise à jour
  }*/

  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setIsStatusModalOpen(true)
  }

  const changePossesion = async (idUtilisateur, idAnimal, type) => {
    try {
      if(type === 'adoption') {
        await refugeApi.transferToUtilisateur(idAnimal, refuge?.Id, idUtilisateur)
      }else if(type === 'transfert') {
        await refugeApi.transferBetweenRefuges(idAnimal, refuge?.Id, idUtilisateur)
      }
      loadDashboardData() // Rafraîchir les données après changement de possession
      refetch()
    }
    catch (error) {
      console.error('Erreur lors du changement de possession:', error)
      alert('Erreur lors du changement de possession')
    }
  }

  const handleAnimalSuccess = async (id, isEdit) => {
    if(!isEdit){
      await refugeApi.addAnimal(id, utilisateur?.Id)
    }
    
    refetch()
    handleModalClose()
  }


  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div>
          {apiIssues.length > 0 && (
            <div className="inline-block px-3 py-1 bg-[#fff1c2] text-[#7a4a00] border-2 border-black font-bold text-[10px] uppercase tracking-wider mb-3">
              ⚠ Sources indisponibles: {apiIssues.join(', ')}
            </div>
          )}
          <h1 className="font-['Chewy'] text-5xl text-primary">Dashboard Refuge</h1>
          <p className="text-on-surface-variant mt-2">
            Gérez vos animaux, votre boutique refuge et les informations de votre structure.
          </p>
        </div>

        {isLoading && (
          <FadeIn className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-2 border-black rounded-xl">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary">Chargement des données...</p>
          </FadeIn>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
          {[
            { label: 'Adoptions', value: stats.adoptionPending, color: 'text-secondary' },
            { label: 'Commandes', value: stats.orderCount, color: 'text-tertiary' },
            //{ label: 'Refuges', value: stats.refugeCount, color: 'text-primary' },
            { label: 'Animaux', value: stats.animalCount, color: 'text-primary' },
            { label: 'Urgences', value: stats.urgentAnimals, color: 'text-error' },
            { label: 'Produits', value: stats.productCount, color: 'text-primary' },
            { label: 'Stock total', value: stats.totalStock, color: 'text-secondary' },
            { label: 'Stock faible', value: stats.lowStockProducts, color: 'text-tertiary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface-container-lowest border-4 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs uppercase font-bold text-on-surface-variant">{label}</p>
              <p className={`font-['Chewy'] text-4xl ${color} mt-2`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Informations refuge */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">home_work</span>
              Informations refuge
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {!myRefuges ? (
              <p className="text-sm font-bold text-on-surface-variant col-span-2">
                Aucun refuge associé à ce compte. Contactez un administrateur.
              </p>
            ) : (
                <div key={myRefuges?.Id} className="border-2 border-black rounded-xl p-4 bg-white">
                  <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary">{myRefuges?.Nom}</p>
                  <p className="text-sm text-on-surface-variant">{myRefuges?.AddresseGPS}, {myRefuges?.ville}</p>
                  <p className="text-sm font-bold mt-2">{myRefuges?.Telephone}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{myRefuges?.Addresse}</p>
                </div>
            )}
          </div>
        </FadeIn>

        {/* Demandes d'adoption */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">description</span>
              Demandes d'adoption ({myAdoptions?.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['Date', 'Animal', 'Candidat', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
                {myAdoptions?.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center">Aucune demande</td></tr>
                ) : (
                    myAdoptions?.map((adoption) => {
                    let infos = {}
                    try { infos = JSON.parse(adoption.Notes || '{}') } catch {}
                    return (
                        <tr 
                        key={adoption.Id} 
                        className="hover:bg-surface-container transition-colors cursor-pointer"
                        onClick={() => openDemandeDetails(adoption, 'adoption')}//handleOpenDemande(adoption)} // ← Toute la ligne est cliquable
                        >
                        <td className="px-5 py-4">{new Date(adoption.DateDemande).toLocaleDateString('fr-FR')}</td>
                        <td className="px-5 py-4 font-bold">{infos.animalName || `Animal #${adoption.IdAnimal}`}</td>
                        <td className="px-5 py-4">
                            <div className="flex flex-col">
                            <span className="font-bold">{infos.prenom} {infos.nom}</span>
                            <span className="text-xs text-on-surface-variant">{infos.email}</span>
                            </div>
                        </td>
                        <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black 
                            ${adoption.statut?.Statut === 'En attente' ? 'bg-secondary-fixed' :
                                adoption.statut?.Statut === 'Acceptée' ? 'bg-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                            {adoption.statut?.Statut}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            {/* Optionnel: badge pour indiquer que c'est cliquable */}
                            <span className="text-primary">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </span>
                            <button
                              key={adoption.Id}
                              onClick={() => openDemandeDetails(adoption, 'adoption')}
                              className="w-full text-left p-4 border-2 border-black rounded-lg mb-2 hover:bg-surface-container"
                            >
                              {/* Affichage simplifié */}
                            </button>
                        </td>
                        </tr>
                    )
                    })
                )}
                </tbody>
          </table>
        </FadeIn>

        {/* Demandes de transfert */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">description</span>
              Demandes de transfert ({myTransferts?.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['Date', 'Animal', 'Candidat', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
                {myTransferts?.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center">Aucune demande</td></tr>
                ) : (
                    myTransferts?.map((transfert) => {
                    let infos = {}
                    try { infos = JSON.parse(transfert.Notes || '{}') } catch {}
                    return (
                        <tr 
                        key={transfert.Id} 
                        className="hover:bg-surface-container transition-colors cursor-pointer"
                        onClick={() => openDemandeDetails(transfert, 'transfert')}//handleOpenDemande(transfert)} // ← Toute la ligne est cliquable
                        >
                        <td className="px-5 py-4">{new Date(transfert.DateDemande).toLocaleDateString('fr-FR')}</td>
                        <td className="px-5 py-4 font-bold">{infos.animalName || `Animal #${transfert.IdAnimal}`}</td>
                        <td className="px-5 py-4">
                            <div className="flex flex-col">
                            <span className="font-bold">{infos.prenom} {infos.nom}</span>
                            <span className="text-xs text-on-surface-variant">{infos.email}</span>
                            </div>
                        </td>
                        <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black 
                            ${transfert.statut?.Statut === 'En attente' ? 'bg-secondary-fixed' :
                                transfert.statut?.Statut === 'Acceptée' ? 'bg-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                            {transfert.statut?.Statut}
                            </span>
                            <button
                              key={transfert.Id}
                              onClick={() => openDemandeDetails(transfert, 'transfert')}
                              className="w-full text-left p-4 border-2 border-black rounded-lg mb-2 hover:bg-surface-container"
                            >
                              {/* Affichage simplifié */}
                            </button>
                        </td>
                        <td className="px-5 py-4">
                            {/* Optionnel: badge pour indiquer que c'est cliquable */}
                            <span className="text-primary">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </span>
                        </td>
                        </tr>
                    )
                    })
                )}
                </tbody>
          </table>
        </FadeIn>

        {/* Commandes Boutique */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">shopping_cart</span>
              Commandes Boutique ({myOrders?.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['ID', 'Produits', 'Total', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myOrders?.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant font-bold text-sm">Aucune commande pour le moment.</td></tr>
              ) : (
                myOrders?.map((order) => (
                  <tr key={order.Id} className="hover:bg-surface-container transition-colors" onClick={() => openStatusModal(order)}>
                    <td className="px-5 py-4 font-mono text-xs">#{order.Id}</td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {order?.lines?.map((line, idx) => (
                          <p key={idx} className="text-xs font-bold">{line.Quantite}x {line.ProduitNom}</p>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-primary">{Number(order.Total_prix).toFixed(2)} DZD</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black 
                        ${order.Statut === 'Payée' ? 'bg-primary-fixed' : order.Statut === 'Expédiée' ? 'bg-secondary-fixed' : 'bg-surface-container'}`}>
                        {order.Statut}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {order.Statut === 'Payée' && (
                        <button onClick={() => handleUpdateOrderStatus(order.Id, 'Expédiée')}
                          className="px-3 py-1 bg-primary text-white border border-black font-bold text-[10px] uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          Marquer Expédiée
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </FadeIn>

        {/* Animaux CRUD */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">pets</span>
              Animaux ({myAnimals.length})
            </h2>
            <button onClick={openAddAnimal}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              <span className="material-symbols-outlined text-base">add</span>
              Ajouter
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['Nom', 'Espèce', 'Âge', 'Urgence', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myAnimals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">pets</span>
                    <p className="font-bold text-sm">Aucun animal enregistré dans votre refuge.</p>
                    <button onClick={openAddAnimal} className="mt-3 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm">
                      + Ajouter le premier animal
                    </button>
                  </td>
                </tr>
              ) : (
                myAnimals.map((animal) => (
                  <tr key={animal?.Id} className="hover:bg-surface-container transition-colors">
                    <td className="px-5 py-4 font-bold">{animal?.Nom}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{animal?.Race?.Espece?.Nom}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{animal?.Age}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${animal?.urgent ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'}`}>
                        {animal?.urgent ? 'Urgent' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* NOUVEAU BOUTON TRANSFERT */}
                        <button onClick={() => openTransfertModal(animal)}
                          className="p-1.5 border border-black hover:bg-primary-container rounded transition-colors text-primary" title="Demander un transfert">
                          <span className="material-symbols-outlined text-base">swap_horiz</span>
                        </button>
                        <button onClick={() => openEditAnimal(animal)}
                          className="p-1.5 border border-black hover:bg-surface-container rounded transition-colors" title="Éditer">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDeleteAnimal(animal?.Id)}
                          className="p-1.5 border border-black hover:bg-error-container rounded transition-colors text-error" title="Supprimer">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </FadeIn>

        {/* Produits CRUD */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">inventory_2</span>
              Produits en stock ({myProducts.length})
            </h2>
            <button onClick={openAddProduit}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              <span className="material-symbols-outlined text-base">add</span>
              Ajouter
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['Produit', 'Catégorie', 'Prix', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">inventory_2</span>
                    <p className="font-bold text-sm">Aucun produit enregistré.</p>
                    <button onClick={openAddProduit} className="mt-3 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm">
                      + Ajouter le premier produit
                    </button>
                  </td>
                </tr>
              ) : (
                myProducts.map((product) => {
                  const stock = Number(product?.Stock ?? product?.Stock ?? 0)
                  return (
                    <tr key={product?.Id} className="hover:bg-surface-container transition-colors">
                      <td className="px-5 py-4 font-bold">{product?.Nom}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{product?.Categorie}</td>
                      <td className="px-5 py-4 font-extrabold text-primary">{Number(product?.Prix || 0).toFixed(2)} DZD</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${stock <= 5 ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditProduit(product)}
                            className="p-1.5 border border-black hover:bg-surface-container rounded transition-colors" title="Éditer">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => handleDeleteProduit(product?.Id)}
                            className="p-1.5 border border-black hover:bg-error-container rounded transition-colors text-error" title="Supprimer">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </FadeIn>

        {/* Modal Animaux */}
        <Modal isOpen={isAnimalModalOpen} onClose={() => setIsAnimalModalOpen(false)}
          title={editingAnimal ? `Modifier ${editingAnimal.nom}` : 'Ajouter un animal'} size="lg">
          <AnimalForm initialData={editingAnimal} refugeId={myRefuges[0]?.id}
            onClose={() => setIsAnimalModalOpen(false)} onSuccess={ (id,isEdit) => { loadDashboardData(), handleAnimalSuccess(id, isEdit)}} />
        </Modal>

        {/* Modal Produits */}
        <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}
          title={editingProduct ? `Modifier ${editingProduct.nom}` : 'Ajouter un produit'} size="lg">
          <ProductForm initialData={editingProduct} refugeId={myRefuges[0]?.id}
            onClose={() => setIsProductModalOpen(false)} onSuccess={loadDashboardData} />
        </Modal>
      </div>
      <Modal isOpen={demandeDetailModalOpen/*isModalOpen*/} onClose={() => setIsModalOpen(false)}>
        {/*<DemandeDetailModal
        demande={selectedDemande}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={(id, commentaire) => handleUpdateAdoptionStatus(id, 4, commentaire)}// 'Acceptée'
        onRefuse={(id, commentaire) => handleUpdateAdoptionStatus(id, 5, commentaire)}// 'Refusée'
        />*/}
        <DemandeDetailModal
          demande={selectedDemande}
          isOpen={demandeDetailModalOpen}
          onClose={() => setDemandeDetailModalOpen(false)}
          onAccept={demandeType === 'adoption' ? (id, commentaire, idUtilisateur, idAnimal, type) => {handleUpdateAdoptionStatus(id, 4, commentaire); changePossesion(idUtilisateur, idAnimal, type)} : (id, commentaire, idUtilisateur, idAnimal, type) => {handleAcceptTransfert(id, 4, commentaire); changePossesion(idUtilisateur, idAnimal, type)}}
          onRefuse={demandeType === 'adoption' ? (id, commentaire) => handleUpdateAdoptionStatus(id, 5, commentaire) : (id, commentaire) => handleRefuseTransfert(id, 5, commentaire)}
          type={demandeType}
        />
      </Modal>

      {/* Modal de détail (réutilisé pour adoption et transfert) */}
      
      <TransfertModal
        isOpen={transfertModalOpen}
        onClose={() => setTransfertModalOpen(false)}
        animal={selectedAnimalForTransfert}
        refuges={allRefuges}
        onSubmit={handleSubmitTransfert}
      />

      {/* Modal de mise à jour */}
      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onUpdate={handleUpdateOrderStatus}
      />
      
    </PageTransition>
  )
}

export default RefugeDashboard 

