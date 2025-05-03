import { SelectedAccessory } from "@/types/invoice"

export const calculateInvoiceTotals = (
  selectedAccessories: SelectedAccessory[],
  discountPercentage: number,
  transportationCost: number,
  installationPercentage: number,
) => {
  const subtotal = selectedAccessories.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = subtotal * (discountPercentage / 100)
  const installationAmount = subtotal * (installationPercentage / 100)
  const grandTotal =
    subtotal +
    subtotal * 0.025 + // NIHIL
    subtotal * 0.025 + // GETFund
    subtotal * 0.01 + // COVID-19
    subtotal * 0.15 + // VAT
    transportationCost + // Transportation
    installationAmount - // Installation
    discountAmount // Discount

  return {
    subtotal,
    nihil: subtotal * 0.025,
    getFund: subtotal * 0.025,
    covid: subtotal * 0.01,
    vat: subtotal * 0.15,
    discount: discountAmount,
    transportation: transportationCost,
    installation: installationAmount,
    grandTotal,
  }
}