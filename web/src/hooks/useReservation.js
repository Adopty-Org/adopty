// frontend/src/hooks/useReservation.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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

    const reservationProfilMap = useMemo(() => {
        const map = new Map() // key: IdProfil, value: [Reservation, ...]
        reservations.forEach(reservation => {
            const userId = reservation.IdProfil
            if (!map.has(userId)) {
                map.set(userId, [])
            }
            map.get(userId).push(reservation)
        })
        return map
    }, [reservations])

    const reservationAnnonceMap = useMemo(() => {
        const map = new Map()

        reservations
            .filter(r => r.TypeReservation === "annonce")
            .forEach(reservation => {
            const annonceId = reservation.IdAnnonce

            if (!annonceId) return

            if (!map.has(annonceId)) {
                map.set(annonceId, [])
            }

            map.get(annonceId).push(reservation)
            })

        return map
        }, [reservations])


    return ({
        reservations,
        reservationMap,
        reservationProfilMap,
        reservationAnnonceMap,
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

export const useCreateReservation = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (reservationData) => reservationApi.create(reservationData),
        onSuccess: (data) => {
            // Invalider la liste des reservations
            queryClient.invalidateQueries({ queryKey: ["reservations"] })
            
            // Optionnel : ajouter directement au cache
            queryClient.setQueryData(["reservations"], (oldData) => {
                if (!oldData) return [data]
                return [...oldData, data]
            })
            
            console.log("Réservation créée avec succès:", data)
        },
        onError: (error) => {
            console.error("Erreur lors de la création de la réservation:", error)
        }
    })

    return mutation
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ prestataire, id, formData }) => reservationApi.updateStatutOfReservation({ prestataire, id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    }
  })
}

export const useDeleteReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prestataire, id) => reservationApi.delete(prestataire, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    }
  })
}