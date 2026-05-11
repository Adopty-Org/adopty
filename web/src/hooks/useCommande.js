// frontend/src/hooks/useCommande.js

import { useQuery } from "@tanstack/react-query"
import { commandeApi } from "../lib/api"
import { useMemo } from "react"
import { useSousCommandes } from "./useSousCommande"
import { useStatut } from "./useStatut"

export const useCommandes = () => {

    const { sousCommandes, SousCommandesLoading } = useSousCommandes()
    const {statutMap} = useStatut()

    const { data: CommandesData, isLoading: CommandesLoading, isError, error } = useQuery({
        queryKey: ["commandes"],
        queryFn: commandeApi.getAll,
    }) 

    // Créer une Map des sous-commandes par IdCommande
    const sousCommandesByCommande = useMemo(() => {
        const map = new Map() // key: IdCommande, value: [SousCommande, ...]
        
        sousCommandes.forEach(sousCommande => {
            const commandeId = sousCommande.IdCommande
            if (!map.has(commandeId)) {
                map.set(commandeId, [])
            }
            map.get(commandeId).push(sousCommande)
        })
        
        return map
    }, [sousCommandes])

    // Enrichir les commandes avec leurs sous-commandes
    const commandes = useMemo(() => {
        const commandesRaw = CommandesData ?? []
        
        return commandesRaw.map(commande => {
            const sousCommandesList = sousCommandesByCommande.get(commande.Id) ?? []
            const statut = statutMap.get(commande.Statut)
            
            // Calculer le total de la commande (somme des sous-commandes)
            const totalGeneral = sousCommandesList.reduce((sum, sc) => sum + (sc.Total_prix || 0), 0)
            
            return {
                ...commande,
                sousCommandes: sousCommandesList,
                nombreSousCommandes: sousCommandesList.length,
                totalGeneral: totalGeneral,
                // Vérifier si toutes les sous-commandes sont livrées
                estCompletementLivree: sousCommandesList.length > 0 && 
                    sousCommandesList.every(sc => sc.statut?.Statut === "livree"),
                // Statut global de la commande (basé sur les sous-commandes)
                statut: statut,
                statutGlobal: getStatutGlobal(commande.Statut, sousCommandesList)
            }
        })
    }, [CommandesData, sousCommandesByCommande])

    // Map des commandes par ID
    const commandeMap = useMemo(
        () => new Map(commandes.map(c => [c.Id, c])),
        [commandes]
    )

    // Fonction utilitaire pour déterminer le statut global
    const getStatutGlobal = (statutCommande, sousCommandesList) => {
        if (sousCommandesList.length === 0) return statutCommande
        
        const tousLivres = sousCommandesList.every(sc => sc?.statut?.Statut === "livree")
        const unEncours = sousCommandesList.some(sc => sc?.statut?.Statut === "en_cours")
        const unAnnule = sousCommandesList.some(sc => sc?.statut?.Statut === "annulee")
        
        if (tousLivres) return "completee"
        if (unAnnule && !unEncours) return "partiellement_annulee"
        if (unEncours) return "en_cours"
        return statutCommande
    }

    return ({
        commandes,
        commandeMap,
        sousCommandesByCommande, // Utile si besoin d'accès direct
        isLoading: CommandesLoading || SousCommandesLoading,
        isError,
        error
    })
}