import jsPDF from "jspdf"
import { SavedInvoice } from "@/types/invoice"

export const generateInvoicePDF = (
  clientInfo: SavedInvoice["clientInfo"],
  accessories: SavedInvoice["accessories"],
  totals: SavedInvoice["totals"],
  companyInfo: {
    name: string
    description: string
    location: string
    contact: string
    website: string
  },
) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10
  let y = 10

  // Company Information
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(companyInfo.name, margin, y)
  y += 10
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(companyInfo.description, margin, y)
  y += 5
  doc.text(companyInfo.location, margin, y)
  y += 5
  doc.text(companyInfo.contact, margin, y)
  y += 5
  doc.text(companyInfo.website, margin, y)
  y += 10

  // Invoice Title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("PROFORMA INVOICE", margin, y)
  y += 10

  // Client Information
  doc.setFontSize(12)
  doc.text("Client Information", margin, y)
  y += 5
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(10)
  doc.text(`Client: ${clientInfo.client || "N/A"}`, margin, y)
  y += 5
  doc.text(`Location: ${clientInfo.location || "N/A"}`, margin, y)
  y += 5
  doc.text(`Contact: ${clientInfo.contact || "N/A"}`, margin, y)
  y += 5
  doc.text(`Date: ${clientInfo.date || "N/A"}`, margin, y)
  y += 5
  doc.text(`Gauge: ${clientInfo.gauge}`, margin, y)
  y += 5
  doc.text(`CMP: ${clientInfo.cmpPercentage}%`, margin, y)
  y += 5
  doc.text(`Payment Method: ${clientInfo.paymentMethod}`, margin, y)
  y += 10

  // Accessories Table
  doc.setFontSize(12)
  doc.text("Accessories", margin, y)
  y += 5
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5
  if (accessories.length === 0) {
    doc.setFontSize(10)
    doc.text("No accessories added.", margin, y)
    y += 10
  } else {
    // Table headers
    const headers = ["Accessory", "Unit Price", "Quantity", "Total"]
    const colWidths = [90, 30, 30, 30]
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    headers.forEach((header, i) => {
      doc.text(header, margin + (i === 0 ? 0 : colWidths.slice(0, i).reduce((a, b) => a + b, 0)), y)
    })
    y += 5
    doc.setLineWidth(0.2)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5

    // Table rows
    doc.setFont("helvetica", "normal")
    accessories.forEach((item) => {
      const row = [
        item.name,
        `GHS ${item.unitPrice.toFixed(2)}`,
        item.quantity.toString(),
        `GHS ${item.total.toFixed(2)}`,
      ]
      row.forEach((cell, i) => {
        doc.text(cell, margin + (i === 0 ? 0 : colWidths.slice(0, i).reduce((a, b) => a + b, 0)), y)
      })
      y += 5
    })
    y += 5
  }

  // Totals
  doc.setFontSize(12)
  doc.text("Invoice Totals", margin, y)
  y += 5
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(10)
  const totalsData = [
    { label: "Subtotal", value: `GHS ${totals.subtotal.toFixed(2)}` },
    { label: "NIHIL (2.5%)", value: `GHS ${totals.nihil.toFixed(2)}` },
    { label: "GETFund (2.5%)", value: `GHS ${totals.getFund.toFixed(2)}` },
    { label: "COVID-19 (1%)", value: `GHS ${totals.covid.toFixed(2)}` },
    { label: "VAT (15%)", value: `GHS ${totals.vat.toFixed(2)}` },
    { label: "Discount", value: `-GHS ${totals.discount.toFixed(2)}` },
    { label: "Transportation", value: `GHS ${totals.transportation.toFixed(2)}` },
    { label: "Installation", value: `GHS ${totals.installation.toFixed(2)}` },
    { label: "Grand Total", value: `GHS ${totals.grandTotal.toFixed(2)}` },
  ]
  totalsData.forEach(({ label, value }) => {
    doc.text(label, margin, y)
    doc.text(value, pageWidth - margin - 30, y, { align: "right" })
    y += 5
  })

  // Terms of Payment
  y += 10
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("TERMS OF PAYMENT", margin, y)
  y += 5
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  
  const terms = [
    "1A. 70% OF TOTAL COST BEFORE PRODUCTION",
    "B. 30% OF TOTAL REMAINING BALANCE AFTER PRODUCTION",
    "2. WE ARE RESPONSIBLE FOR SHORTAGE AND EXCESS AT SITE",
    "3. THIS QUOTATION IS NOT A CONTRACT, ANY ORDERS PLACED AS",
    "   A RESULT OF THIS QUOTATION ARE SUBJECT TO OUR FURTHER ACCEPTANCE",
    "   AND OUR STANDARD TERMS AND CONDITION FOR SALE",
    "5A. ORDERS ONCE PROCESSED ARE NOT REFUNDABLE",
    "5B. PAYMENT MADE IN EXCESS OF FINAL INVOICE VALUE WILL BE",
    "    REFUNDED BY CHEQUE IN THE NAME OF THE CLIENT",
    "C. PAYMENTS ON ACCOUNT ON ORDERS YET TO BE PRODUCED",
    "   SHALL ATTRACT A 5% ADMINISTRATIVE CHARGE",
    "6. WE RECOMMEND USING OUR TRAINED INSTALLERS FOR YOUR PROJECT",
    "7. SECURITY OF GOODS SUPPLIED TO SITE IS THE RESPONSIBILITY OF THE CLIENT"
  ]

  terms.forEach(term => {
    doc.text(term, margin, y)
    y += 5
  })

  // Save PDF
  const clientName = clientInfo.client ? clientInfo.client.replace(/\s+/g, "_") : "invoice"
  const date = clientInfo.date ? clientInfo.date.replace(/-/g, "") : new Date().toISOString().slice(0, 10).replace(/-/g, "")
  doc.save(`invoice_${clientName}_${date}.pdf`)
}