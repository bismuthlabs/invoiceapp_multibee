"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import { useMediaQuery } from "@/hooks/use-mobile"
import { ClientInfoSection } from "./ClientInfoSection"
import { AccessoriesSection } from "./AccessoriesSection"
import { TotalsSection } from "./TotalsSection"
import { HistorySection } from "./HistorySection"
import { SettingsSection } from "./SettingsSection"
import { ViewInvoiceModal } from "./ViewInvoiceModal"
import { InvoiceActions } from "./InvoiceActions"
import { CompanyInfo } from "./CompanyInfo"
import { PrintInvoice } from "./PrintInvoice"
import { generateInvoicePDF } from "@/utils/pdfUtils"
import { calculateInvoiceTotals } from "@/utils/invoiceUtils"
import { generateCSV, downloadCSV } from "@/utils/exportUtils"
import { useSettings } from "@/hooks/useSettings"
import { SavedInvoice, Settings, SelectedAccessory, ClientInfo, InvoiceTemplate } from "@/types/invoice"
import { invoiceFormSchema } from "@/schemas/invoiceSchema"
import { z } from "zod"
import { Trash2, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { CardContent } from "../ui/card"
import { useSession, signOut } from "next-auth/react"
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates"
import { Header } from "@/components/layout/Header"

// Normalize Supabase data to SavedInvoice type
const normalizeInvoice = (data: any): SavedInvoice => ({
  id: data.id,
  clientInfo: data.client_info,
  accessories: data.accessories,
  totals: data.totals,
  createdAt: data.created_at,
})

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>

export default function CreateInvoice() {
  const { data: session, update: updateSession } = useSession()
  // State and hooks
  const [expandedSections, setExpandedSections] = useState({
    clientInfo: true,
    accessories: true,
    totals: true,
  })
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([])
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [viewInvoice, setViewInvoice] = useState<SavedInvoice | null>(null)
  const [activeTab, setActiveTab] = useState<"invoice" | "history" | "settings">("invoice")
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<InvoiceTemplate | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { templates, saveTemplate, deleteTemplate, loading } = useInvoiceTemplates()

  const initialSettings: Settings = {
    companyInfo: {
      name: "MULTIBEE 360 COMPANY LIMITED",
      description: "DEALERS IN ALL KINDS OF ROOFING SHEETS",
      location: "Kumasi Office, Beside Opoku Ware SHS",
      contact: "+233244211506",
      website: "www.multibee360.com",
    },
    defaultGauge: "0.30 MSL ALUZINC WRINKLINK",
    defaultTaxRates: {
      nihil: 2.5,
      getFund: 2.5,
      covid: 1,
      vat: 15,
    },
  }
  const { settings } = useSettings(initialSettings)

  // Form setup
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientInfo: {
        client: "",
        location: "",
        contact: "",
        date: "",
        gauge: settings.defaultGauge,
        cmpPercentage: 1,
        paymentMethod: "Cash",
      },
      accessories: [],
      discountPercentage: 0,
      transportationCost: 0,
      installationPercentage: 0,
    },
  })

  // Update form default gauge when settings change
  useEffect(() => {
    form.setValue("clientInfo.gauge", settings.defaultGauge)
  }, [form, settings.defaultGauge])

  // Fetch invoices function
  const fetchInvoices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      const normalizedData = data.map(normalizeInvoice)
      console.log("[CreateInvoice] Fetched invoices:", normalizedData)
      setSavedInvoices(normalizedData)
    } catch (error: any) {
      console.error("[CreateInvoice] Error fetching invoices:", error)
      toast.error(`Failed to load invoices: ${error.message || "Unknown error"}`)
    }
  }, [])

  // Fetch invoices and set up real-time subscription
  useEffect(() => {
    fetchInvoices()

    // Set up real-time subscription
    const channel = supabase
      .channel(`invoices-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invoices" },
        (payload) => {
          console.log("[CreateInvoice] Real-time update:", payload)
          if (payload.eventType === "INSERT") {
            setSavedInvoices((prev) => {
              const exists = prev.some((inv) => inv.id === payload.new.id)
              if (exists) return prev
              return [normalizeInvoice(payload.new), ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            setSavedInvoices((prev) =>
              prev.map((inv) => (inv.id === payload.new.id ? normalizeInvoice(payload.new) : inv))
            )
          } else if (payload.eventType === "DELETE") {
            setSavedInvoices((prev) => prev.filter((inv) => inv.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log("[CreateInvoice] Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchInvoices])

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!session?.user?.id) return

    const channel = supabase
      .channel(`profile-${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${session.user.id}` },
        async (payload) => {
          console.log("[CreateInvoice] Profile update:", payload)
          if (payload.eventType === "UPDATE") {
            // Update the session with the new role
            await updateSession({
              ...session,
              user: {
                ...session.user,
                role: payload.new.role,
              },
            })
          }
        }
      )
      .subscribe((status) => {
        console.log("[CreateInvoice] Profile subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, updateSession])

  // Handlers
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] })
  }

  const resetForm = useCallback(() => {
    form.reset({
      clientInfo: {
        client: "",
        location: "",
        contact: "",
        date: "",
        gauge: settings.defaultGauge,
        cmpPercentage: 1,
        paymentMethod: "Cash",
      },
      accessories: [],
      discountPercentage: 0,
      transportationCost: 0,
      installationPercentage: 0,
    })
    setEditingInvoiceId(null)
  }, [form, settings.defaultGauge])

  const saveInvoice = useCallback(async () => {
    await form.handleSubmit(async (data) => {
      const totals = calculateInvoiceTotals(
        data.accessories,
        data.discountPercentage,
        data.transportationCost,
        data.installationPercentage
      )
      const invoice: SavedInvoice = {
        id: editingInvoiceId || uuidv4(),
        clientInfo: data.clientInfo,
        accessories: data.accessories,
        totals,
        createdAt: editingInvoiceId
          ? savedInvoices.find((inv) => inv.id === editingInvoiceId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      }

      try {
        console.log("[CreateInvoice] Saving invoice:", invoice)
        const { error } = editingInvoiceId
          ? await supabase
              .from("invoices")
              .update({
                client_info: invoice.clientInfo,
                accessories: invoice.accessories,
                totals: invoice.totals,
                updated_at: new Date().toISOString(),
              })
              .eq("id", invoice.id)
          : await supabase.from("invoices").insert({
              id: invoice.id,
              client_info: invoice.clientInfo,
              accessories: invoice.accessories,
              totals: invoice.totals,
              created_at: invoice.createdAt,
            })

        if (error) throw error
        toast.success(editingInvoiceId ? "Invoice updated successfully" : "Invoice saved successfully")
        fetchInvoices()
        resetForm()
      } catch (error: any) {
        console.error("[CreateInvoice] Error saving invoice:", error)
        toast.error(`Failed to save invoice: ${error.message || "Unknown error"}`)
      }
    })()
  }, [form, editingInvoiceId, savedInvoices, resetForm, fetchInvoices])

  const deleteInvoice = useCallback(
    async (id: string) => {
      try {
        console.log("[CreateInvoice] Deleting invoice:", id)
        const { error } = await supabase.from("invoices").delete().eq("id", id)
        if (error) throw error
        fetchInvoices()
      } catch (error: any) {
        console.error("[CreateInvoice] Error deleting invoice:", error)
        toast.error(`Failed to delete invoice: ${error.message || "Unknown error"}`)
      }
    },
    [fetchInvoices]
  )

  const editInvoice = useCallback(
    (invoice: SavedInvoice) => {
      form.reset({
        clientInfo: invoice.clientInfo,
        accessories: invoice.accessories,
        discountPercentage: (invoice.totals.discount / invoice.totals.subtotal) * 100 || 0,
        transportationCost: invoice.totals.transportation,
        installationPercentage: (invoice.totals.installation / invoice.totals.subtotal) * 100 || 0,
      })
      setEditingInvoiceId(invoice.id)
      setActiveTab("invoice")
    },
    [form]
  )

  const downloadInvoice = useCallback(() => {
    const data = form.getValues()
    const totals = calculateInvoiceTotals(
      data.accessories,
      data.discountPercentage,
      data.transportationCost,
      data.installationPercentage
    )
    generateInvoicePDF(data.clientInfo, data.accessories, totals, settings.companyInfo)
  }, [form, settings.companyInfo])

  const downloadSavedInvoice = useCallback(
    (invoice: SavedInvoice) => {
      generateInvoicePDF(invoice.clientInfo, invoice.accessories, invoice.totals, settings.companyInfo)
    },
    [settings.companyInfo]
  )

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const exportCSV = useCallback(() => {
    const csvContent = generateCSV(savedInvoices)
    downloadCSV(csvContent, `invoices_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success("Invoices exported to CSV")
  }, [savedInvoices])

  // Generic templates
  const genericTemplates = useMemo(() => [
    {
      id: `template-${uuidv4()}`,
      name: 'Standard Template',
      clientInfo: {
        client: 'Standard Client',
        location: '123 Main St, Accra',
        contact: '+2330000000000',
        date: new Date().toISOString().split('T')[0],
        gauge: settings.defaultGauge,
        cmpPercentage: 1,
        paymentMethod: 'Cash' as const,
      },
      accessories: [
        {
          id: uuidv4(),
          name: 'MB HIPCAP WRINKLING',
          quantity: 10,
          unitPrice: 142.5,
          unit: 'piece',
          total: 1425, // quantity * unitPrice
        }
      ]
    },
    {
      id: 'premium',
      name: 'Premium Template',
      clientInfo: {
        client: 'Premium Client',
        location: '456 High St, Accra',
        contact: '+2330000000000',
        date: new Date().toISOString().split('T')[0],
        gauge: settings.defaultGauge,
        cmpPercentage: 1.5,
        paymentMethod: 'Bank' as const,
      },
      accessories: [
        {
          id: uuidv4(),
          name: 'MB HIPCAP WRINKLING',
          quantity: 35,
          unitPrice: 142.5,
          unit: 'piece',
          total: 4987.5, // quantity * unitPrice
          
        }
      ]
    }
  ], [settings.defaultGauge])

  const applyTemplate = useCallback((template: typeof genericTemplates[0]) => {
    form.reset({
      ...form.getValues(),
      clientInfo: {
        ...template.clientInfo,
        gauge: settings.defaultGauge, // Preserve default gauge
      },
      accessories: template.accessories,
    })
    toast.success(`Applied template "${template.name}"`)
  }, [form, settings.defaultGauge])

  const totals = useMemo(() => {
    const data = form.getValues()
    return calculateInvoiceTotals(
      data.accessories,
      data.discountPercentage,
      data.transportationCost,
      data.installationPercentage
    )
  }, [form])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Toaster position="top-right" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">PROFORMA INVOICE</h1>
          <InvoiceActions
            editingInvoiceId={editingInvoiceId}
            onPrint={handlePrint}
            onDownload={downloadInvoice}
            onSave={saveInvoice}
            onCancelEdit={resetForm}
            onExportCSV={exportCSV}
            isSaveDisabled={Object.keys(form.formState.errors).length > 0}
          />
        </div>

        <FormProvider {...form}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              {session?.user?.role !== "employee" && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="invoice" className="space-y-6">
              <div className="flex flex-col sm:flex-row md:items-center gap-4 mb-4">
                <h3 className="text-lg font-medium">Templates</h3>
                <div className="flex flex-wrap gap-2">
                  {genericTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      className="flex items-center gap-2"
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
              <ClientInfoSection
                expanded={expandedSections.clientInfo}
                onToggle={() => toggleSection("clientInfo")}
              />
              <AccessoriesSection
                expanded={expandedSections.accessories}
                onToggle={() => toggleSection("accessories")}
              />
              <TotalsSection
                expanded={expandedSections.totals}
                onToggle={() => toggleSection("totals")}
              />
            </TabsContent>

            <TabsContent value="history">
              <HistorySection
                savedInvoices={savedInvoices}
                setSavedInvoices={setSavedInvoices}
                onView={setViewInvoice}
                onEdit={editInvoice}
                onDownload={downloadSavedInvoice}
                onDelete={deleteInvoice}
              />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsSection initialSettings={initialSettings} />
            </TabsContent>
          </Tabs>
        </FormProvider>

        <ViewInvoiceModal
          invoice={viewInvoice}
          companyInfo={settings.companyInfo}
          onClose={() => setViewInvoice(null)}
          onDownload={downloadSavedInvoice}
        />

        <PrintInvoice
          companyInfo={settings.companyInfo}
          clientInfo={form.getValues().clientInfo}
          accessories={form.getValues().accessories}
          totals={totals}
        />
      </div>
    </div>
  )
}