import { SavedInvoice } from "@/types/invoice"

export function generateCSV(invoices: SavedInvoice[]): string {
  const headers = [
    "Invoice ID",
    "Client",
    "Location",
    "Contact",
    "Date",
    "Gauge",
    "CMP (%)",
    "Payment Method",
    "Subtotal",
    "NIHIL",
    "GETFund",
    "COVID-19",
    "VAT",
    "Discount",
    "Transportation",
    "Installation",
    "Grand Total",
    "Accessories",
    "Created At",
  ]

  const rows = invoices.map((invoice) => [
    invoice.id,
    invoice.clientInfo.client || "N/A",
    invoice.clientInfo.location || "N/A",
    invoice.clientInfo.contact || "N/A",
    invoice.clientInfo.date || new Date(invoice.createdAt).toLocaleDateString(),
    invoice.clientInfo.gauge,
    invoice.clientInfo.cmpPercentage,
    invoice.clientInfo.paymentMethod,
    invoice.totals.subtotal.toFixed(2),
    invoice.totals.nihil.toFixed(2),
    invoice.totals.getFund.toFixed(2),
    invoice.totals.covid.toFixed(2),
    invoice.totals.vat.toFixed(2),
    invoice.totals.discount.toFixed(2),
    invoice.totals.transportation.toFixed(2),
    invoice.totals.installation.toFixed(2),
    invoice.totals.grandTotal.toFixed(2),
    invoice.accessories.map((a) => `${a.name} (Qty: ${a.quantity}, Total: ${a.total.toFixed(2)})`).join("; "),
    new Date(invoice.createdAt).toISOString(),
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  return csvContent
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.click()
  URL.revokeObjectURL(url)
}