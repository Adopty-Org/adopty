// frontend/src/hooks/useReservation.js

import { useQuery } from "@tanstack/react-query"
import { reservationApi } from "../lib/api"
import { useMemo } from "react"

export const useReservations = () => {

    const {data:ReservationsData, isLoading:ReservationsLoading, isError, error } = useQuery({
        queryKey: ["reservations"],
        queryFn: reservationApi.getAll,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    }) 

    const reservations = ReservationsData ?? []

    const reservationMap = useMemo(
        () => new Map(reservations.map(e => [e.Id, e])),
        [reservations]
    )

    const reservationUtilisateurMap = useMemo(() => {
        const map = new Map() // key: IdUtilisateur, value: [Reservation, ...]
        reservations.forEach(reservation => {
            const userId = reservation.IdUtilisateur
            if (!map.has(userId)) {
                map.set(userId, [])
            }
            map.get(userId).push(reservation)
        })
        return map
    }, [reservations])


    return ({
        reservations,
        reservationMap,
        reservationUtilisateurMap,
        ReservationsLoading,
        isError,
        error
    })
}

export const useReservation = (id) => {

    const { reservationMap, ReservationsLoading } = useReservations()

    const reservation = useMemo(() => {
        if (ReservationsLoading) return null
        return reservationMap.get(id) || null
    }, [id, reservationMap, ReservationsLoading])

    return {
        reservation,
        isLoading: ReservationsLoading,
    }
}