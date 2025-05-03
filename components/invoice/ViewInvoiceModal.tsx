import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download } from "lucide-react"
import { SavedInvoice, CompanyInfo as CompanyInfoType } from "@/types/invoice"

interface ViewInvoiceModalProps {
  invoice: SavedInvoice | null
  companyInfo: CompanyInfoType
  onClose: () => void
  onDownload: (invoice: SavedInvoice) => void
}

export function ViewInvoiceModal({
  invoice,
  companyInfo,
  onClose,
  onDownload,
}: ViewInvoiceModalProps) {
  if (!invoice) return null

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold">{companyInfo.name}</h3>
              <p className="text-sm text-muted-foreground">{companyInfo.description}</p>
              <p className="text-sm">{companyInfo.location}</p>
              <p className="text-sm">{companyInfo.contact}</p>
              <a
                href={`https://${companyInfo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {companyInfo.website}
              </a>
            </div>

            {/* Client Information */}
            <div>
              <h4 className="text-md font-medium">Client Information</h4>
              <div className="mt-2 space-y-1">
                <p><strong>Client:</strong> {invoice.clientInfo.client || "N/A"}</p>
                <p><strong>Location:</strong> {invoice.clientInfo.location || "N/A"}</p>
                <p><strong>Contact:</strong> {invoice.clientInfo.contact || "N/A"}</p>
                <p><strong>Date:</strong> {invoice.clientInfo.date || new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p><strong>Gauge:</strong> {invoice.clientInfo.gauge}</p>
                <p><strong>CMP:</strong> {invoice.clientInfo.cmpPercentage}%</p>
                <p><strong>Payment Method:</strong> {invoice.clientInfo.paymentMethod}</p>
              </div>
            </div>

            {/* Accessories */}
            <div>
              <h4 className="text-md font-medium">Accessories</h4>
              {invoice.accessories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No accessories added.</p>
              ) : (
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium">ACCESSORIES</th>
                        <th className="text-center py-2 px-2 font-medium">UNIT PRICE</th>
                        <th className="text-center py-2 px-2 font-medium">QUANTITY</th>
                        <th className="text-right py-2 px-2 font-medium">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.accessories.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-2">{item.name}</td>
                          <td className="text-center py-2 px-2">{item.unitPrice.toFixed(2)}</td>
                          <td className="text-center py-2 px-2">{item.quantity}</td>
                          <td className="text-right py-2 px-2">{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totals */}
            <div>
              <h4 className="text-md font-medium">Invoice Totals</h4>
              <div className="mt-2 space-y-1 max-w-md ml-auto">
                <div className="flex justify-between">
                  <span className="font-medium">SUBTOTAL</span>
                  <span>{invoice.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">NIHIL (2.5%)</span>
                  <span>{invoice.totals.nihil.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">GETFund (2.5%)</span>
                  <span>{invoice.totals.getFund.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">COVID-19 (1%)</span>
                  <span>{invoice.totals.covid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">VAT (15%)</span>
                  <span>{invoice.totals.vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">DISCOUNT</span>
                  <span>-{invoice.totals.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">TRANSPORTATION</span>
                  <span>{invoice.totals.transportation.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">INSTALLATION</span>
                  <span>{invoice.totals.installation.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>GRAND TOTAL</span>
                  <span>{invoice.totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="flex items-center gap-1"
            onClick={() => onDownload(invoice)}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}