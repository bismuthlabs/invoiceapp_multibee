"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { InvoiceTemplate, ClientInfo, SelectedAccessory } from "@/types/invoice"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"

export function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()

  // Normalize Supabase data to InvoiceTemplate type
  const normalizeTemplate = (data: any): InvoiceTemplate => ({
    id: data.id,
    name: data.name,
    clientInfo: data.client_info,
    accessories: data.accessories,
    createdBy: data.created_by,
    createdAt: data.created_at,
  })

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) {
        console.error("[useInvoiceTemplates] Error fetching templates:", error.message || error)
        throw error
      }
      const normalizedData = data.map(normalizeTemplate)
      console.log("[useInvoiceTemplates] Fetched templates:", normalizedData)
      setTemplates(normalizedData)
    } catch (error: any) {
      console.error("[useInvoiceTemplates] Fetch error:", error.message || error)
      toast.error(`Failed to load templates: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save template
  const saveTemplate = useCallback(
    async (name: string, clientInfo: ClientInfo, accessories: SelectedAccessory[]) => {
      try {
        setLoading(true)
        if (!session?.user?.id) {
          console.error("[useInvoiceTemplates] No user session")
          throw new Error("User not authenticated")
        }

        const template = {
          id: crypto.randomUUID(),
          name,
          client_info: clientInfo,
          accessories,
          created_by: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        console.log("[useInvoiceTemplates] Saving template:", template)

        const { error } = await supabase.from("templates").insert(template)
        if (error) {
          console.error("[useInvoiceTemplates] Error saving template:", error.message || error)
          throw error
        }
        toast.success(`Template "${name}" saved`)
        await fetchTemplates() // Refresh templates
      } catch (error: any) {
        console.error("[useInvoiceTemplates] Save error:", error.message || error)
        toast.error(`Failed to save template: ${error.message || "Unknown error"}`)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [fetchTemplates, session]
  )

  // Delete template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.from("templates").delete().eq("id", id)
      if (error) {
        console.error("[useInvoiceTemplates] Error deleting template:", error.message || error)
        throw error
      }
      toast.success("Template deleted")
      await fetchTemplates() // Refresh templates
    } catch (error: any) {
      console.error("[useInvoiceTemplates] Delete error:", error.message || error)
      toast.error(`Failed to delete template: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }, [fetchTemplates])

  // Real-time subscription
  useEffect(() => {
    fetchTemplates()

    const channel = supabase
      .channel(`templates-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "templates" },
        (payload) => {
          console.log("[useInvoiceTemplates] Real-time update:", payload)
          if (payload.eventType === "INSERT") {
            setTemplates((prev) => {
              const exists = prev.some((t) => t.id === payload.new.id)
              if (exists) return prev
              return [normalizeTemplate(payload.new), ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            setTemplates((prev) =>
              prev.map((t) => (t.id === payload.new.id ? normalizeTemplate(payload.new) : t))
            )
          } else if (payload.eventType === "DELETE") {
            setTemplates((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log("[useInvoiceTemplates] Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTemplates])

  return { templates, saveTemplate, deleteTemplate, loading }
}