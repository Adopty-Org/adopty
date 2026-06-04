// frontend/src/hooks/useAnnonce.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { annonceApi } from "../lib/api"
import { useMemo } from "react"

export const useAnnoncesUtilisateur = () => {

    const {data:AnnoncesData, isLoading:AnnoncesLoading, isError, error } = useQuery({
        queryKey: ["annonces", "utilisateur"],
        queryFn: annonceApi.getAllAnnoncesUtilisateur,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    }) 

    const annonces = AnnoncesData ?? []

    const annonceMap = useMemo(
    () => new Map(annonces.map(e => [e.Id, e])),
    [annonces]
  )

    return ({
        annonces,
        annonceMap,
        AnnoncesLoading,
        isError,
        error
    })
}

export const useAnnoncesPrestataire = () => {

    const {data:AnnoncesData, isLoading:AnnoncesLoading, isError, error } = useQuery({
        queryKey: ["annonces", "prestataire"],
        queryFn: annonceApi.getAllAnnoncesPrestataire,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    }) 

    const annonces = AnnoncesData ?? []

    const annonceMap = useMemo(
    () => new Map(annonces.map(e => [e.Id, e])),
    [annonces]
  )

    return ({
        annonces,
        annonceMap,
        AnnoncesLoading,
        isError,
        error
    })
}

export const useCreateAnnonce = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: annonceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annonces"] })
    },
  })
}

export const useUpdateAnnonce = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, formData }) => annonceApi.update(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annonces"] })
    },
  })
}

export const useDeleteAnnonce = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: annonceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annonces"] })
    },
  })
}