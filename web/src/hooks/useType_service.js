// frontend/src/hooks/useType_service.js

import { useQuery } from "@tanstack/react-query"
import { typeServiceApi } from "../lib/api"
import { useMemo } from "react"

export const useTypeServices = () => {
    const {data:TypeServicesData, isLoading:TypeServicesLoading, isError, error } = useQuery({
        queryKey: ["type_services"],
        queryFn: typeServiceApi.getAll,
    })

    const typeServices = TypeServicesData ?? [];

    // Ajouter "Tous" au début de la liste
    const typeServicesWithAll = useMemo(() => {
        return [{ Id: 'all', Type: 'Tous', icon: 'apps' }, ...typeServices]
    }, [typeServices])

    const typeServicesMap = useMemo(
        () => new Map(typeServices?.map(r => [r.Id, r])) ?? new Map(),
        [typeServices]
    )



    return { TypeServicesData, TypeServicesLoading, isError, error, typeServicesMap, typeServicesWithAll }
}