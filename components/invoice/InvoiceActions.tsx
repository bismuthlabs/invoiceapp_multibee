import { Button } from "@/components/ui/button"
import { Printer, Download, Save, X, FileSpreadsheet } from "lucide-react"

interface InvoiceActionsProps {
  editingInvoiceId: string | null
  onPrint: () => void
  onDownload: () => void
  onSave: () => void
  onCancelEdit: () => void
  onExportCSV: () => void
  isSaveDisabled: boolean
}

export function InvoiceActions({
  editingInvoiceId,
  onPrint,
  onDownload,
  onSave,
  onCancelEdit,
  onExportCSV,
  isSaveDisabled,
}: InvoiceActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={onPrint} className="flex items-center gap-2">
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={onDownload} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
      <Button variant="outline" size="sm" onClick={onExportCSV} className="flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        Export CSV
      </Button>
      {editingInvoiceId && (
        <Button variant="outline" size="sm" onClick={onCancelEdit} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Cancel Edit
        </Button>
      )}
      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        disabled={isSaveDisabled}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {editingInvoiceId ? "Update Invoice" : "Save Invoice"}
      </Button>
    </div>
  )
}