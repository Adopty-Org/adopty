// frontend/src/hooks/useSignalement.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { signalementApi } from "../lib/api"
import { useMemo } from "react"

export const useSignalements = () => {

    const {data:SignalementsData, isLoading:SignalementsLoading, isError, error } = useQuery({
        queryKey: ["signalements"],
        queryFn: signalementApi.getAll,
    }) 

    const signalements = SignalementsData ?? []

    const signalementMap = useMemo(
    () => new Map(signalements.map(e => [e.Id, e])),
    [signalements]
  )

    return ({
        signalements,
        signalementMap,
        SignalementsLoading,
        isError,
        error
    })
}

export const useSignalementsByUser = (id) => {

    const {data:SignalementsData, isLoading:SignalementsLoading, isError, error } = useQuery({
        queryKey: ["signalements"],
        queryFn: () =>  signalementApi.getSignalementByUtilisateur(id),
    }) 

    const signalements = SignalementsData ?? []

    const signalementMap = useMemo(
    () => new Map(signalements.map(e => [e.Id, e])),
    [signalements]
  )

    return ({
        signalements,
        signalementMap,
        SignalementsLoading,
        isError,
        error
    })
}

export const useCreateSignalement = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (signalementData) => signalementApi.create(signalementData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["signalements"] })

      queryClient.setQueryData(["signalements"], (oldData) => {
        if (!oldData) return [data]
        return [...oldData, data]
      })

      console.log("Signalement créé avec succès:", data)
    },
    onError: (error) => {
      console.error("Erreur lors de la création du signalement:", error)
    }
  })

  return mutation
}

export const useUpdateSignalement = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, formData }) =>
      signalementApi.update({ id, formData }),

    onSuccess: (data, variables) => {
      const { id } = variables

      queryClient.setQueryData(["signalement", id], data)

      queryClient.setQueryData(["signalements"], (oldData) => {
        if (!oldData) return [data]
        return oldData.map(signalement =>
          signalement.Id === id ? data : signalement
        )
      })

      queryClient.invalidateQueries({ queryKey: ["signalements"] })

      console.log("Signalement mis à jour avec succès:", data)
    },
    onError: (error, variables) => {
      console.error(
        `Erreur lors de la mise à jour du signalement ${variables.id}:`,
        error
      )
    }
  })

  return mutation
}

export const useDeleteSignalement = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id) => signalementApi.delete(id),

    onSuccess: (data, id) => {
      queryClient.setQueryData(["signalements"], (oldData) => {
        if (!oldData) return []
        return oldData.filter(signalement => signalement.Id !== id)
      })

      queryClient.removeQueries({ queryKey: ["signalement", id] })

      queryClient.invalidateQueries({ queryKey: ["signalements"] })

      console.log("Signalement supprimé avec succès:", id)
    },
    onError: (error, id) => {
      console.error(
        `Erreur lors de la suppression du signalement ${id}:`,
        error
      )
    }
  })

  return mutation
}