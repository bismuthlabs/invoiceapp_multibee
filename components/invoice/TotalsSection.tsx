import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { calculateInvoiceTotals } from "@/utils/invoiceUtils"
import { InvoiceFormData } from "./CreateInvoice"

interface TotalsSectionProps {
  expanded: boolean
  onToggle: () => void
}

export function TotalsSection({ expanded, onToggle }: TotalsSectionProps) {
  const form = useFormContext<InvoiceFormData>()
  const { accessories, discountPercentage, transportationCost, installationPercentage } =
    form.watch()

  const totals = calculateInvoiceTotals(
    accessories || [],
    discountPercentage || 0,
    transportationCost || 0,
    installationPercentage || 0
  )

  return (
    <Card>
      <CardHeader
        className="py-4 px-6 flex flex-row items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <CardTitle className="text-lg font-medium">Invoice Totals</CardTitle>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (%):</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportationCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transportation Cost (GHS):</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="installationPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Installation (%):</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal</span>
              <span>GHS {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NIHIL (2.5%)</span>
              <span>GHS {totals.nihil.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">GETFund (2.5%)</span>
              <span>GHS {totals.getFund.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">COVID-19 (1%)</span>
              <span>GHS {totals.covid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VAT (15%)</span>
              <span>GHS {totals.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Discount</span>
              <span>-GHS {totals.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Transportation</span>
              <span>GHS {totals.transportation.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Installation</span>
              <span>GHS {totals.installation.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Grand Total</span>
              <span>GHS {totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}