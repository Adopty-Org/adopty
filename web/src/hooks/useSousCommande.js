// frontend/src/hooks/useSousCommande.js

import { useQuery } from "@tanstack/react-query"
import { sousCommandeApi } from "../lib/api"
import { useMemo } from "react"
import { useStatut } from "./useStatut";

export const useSousCommandes = () => {

    const {data:SousCommandesData, isLoading:SousCommandesLoading, isError, error } = useQuery({
        queryKey: ["sousCommandes"],
        queryFn: sousCommandeApi.getAll,
    }); 

    const {statutMap} = useStatut()

    //const sousCommandes = SousCommandesData ?? [];

    const sousCommandes = useMemo(() => {
        const sousCommandesRaw = SousCommandesData ?? []
        
        return sousCommandesRaw.map(commande => {
            const statut = statutMap.get(commande.Statut)
            
            
            return {
                ...commande,
                statut: statut,
                
            }
        })
    }, [SousCommandesData, statutMap])

    const sousCommandeMap = useMemo(
        () => new Map(sousCommandes.map(e => [e.Id, e])),
        [sousCommandes]
    );

    return ({
        sousCommandes,
        sousCommandeMap,
        SousCommandesLoading,
        isError,
        error
    })
}