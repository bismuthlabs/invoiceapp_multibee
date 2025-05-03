import { useState, useCallback } from "react"
import { SavedInvoice } from "@/types/invoice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"
import { Eye, Edit, Download, Trash2, Undo2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface HistorySectionProps {
  savedInvoices: SavedInvoice[]
  setSavedInvoices: React.Dispatch<React.SetStateAction<SavedInvoice[]>>
  onView: (invoice: SavedInvoice) => void
  onEdit: (invoice: SavedInvoice) => void
  onDownload: (invoice: SavedInvoice) => void
  onDelete: (id: string) => void
}

export function HistorySection({
  savedInvoices,
  setSavedInvoices,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: HistorySectionProps) {
  const [recentlyDeleted, setRecentlyDeleted] = useState<SavedInvoice | null>(null)

  const handleDelete = useCallback(
    async (invoice: SavedInvoice) => {
      try {
        console.log("[HistorySection] Deleting invoice:", invoice.id)
        setRecentlyDeleted(invoice)
        onDelete(invoice.id)
        toast.success("Invoice deleted", {
          id: "delete-invoice",
          duration: 5000,
          position: "top-right",
        })
      } catch (error: any) {
        console.error("[HistorySection] Error in handleDelete:", error)
        toast.error(`Failed to delete invoice: ${error.message || "Unknown error"}`)
      }
    },
    [onDelete]
  )

  const handleUndo = useCallback(async () => {
    if (!recentlyDeleted) return

    try {
      console.log("[HistorySection] Undoing delete for invoice:", recentlyDeleted.id)
      const { error } = await supabase.from("invoices").insert({
        id: recentlyDeleted.id,
        client_info: recentlyDeleted.clientInfo,
        accessories: recentlyDeleted.accessories,
        totals: recentlyDeleted.totals,
        created_at: recentlyDeleted.createdAt,
      })

      if (error) throw error

      // Remove any existing invoice with the same id to prevent duplicates
      setSavedInvoices((prev) => {
        const filtered = prev.filter((inv) => inv.id !== recentlyDeleted.id)
        return [recentlyDeleted, ...filtered]
      })
      setRecentlyDeleted(null)
      toast.success("Invoice restored")
    } catch (error: any) {
      console.error("[HistorySection] Error undoing delete:", error)
      toast.error(`Failed to restore invoice: ${error.message || "Unknown error"}`)
    }
  }, [recentlyDeleted, setSavedInvoices])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
      </CardHeader>
      <CardContent>
        {savedInvoices.length === 0 ? (
          <p className="text-muted-foreground">No invoices found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedInvoices.map((invoice) => {
                // Safe property access
                const clientName = invoice?.clientInfo?.client || "Unknown"
                const createdAt = invoice?.createdAt || ""
                const grandTotal = invoice?.totals?.grandTotal || 0

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{clientName}</TableCell>
                    <TableCell>
                      {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>GHS {Number(grandTotal).toFixed(2)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(invoice)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(invoice)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(invoice)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(invoice)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        {recentlyDeleted && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleUndo}>
              <Undo2 className="h-4 w-4 mr-2" />
              Undo Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}