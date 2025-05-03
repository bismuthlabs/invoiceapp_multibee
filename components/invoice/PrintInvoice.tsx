import { ClientInfo, CompanyInfo as CompanyInfoType, SelectedAccessory } from "@/types/invoice"

interface PrintInvoiceProps {
  companyInfo: CompanyInfoType
  clientInfo: ClientInfo
  accessories: SelectedAccessory[]
  totals: {
    subtotal: number
    nihil: number
    getFund: number
    covid: number
    vat: number
    discount: number
    transportation: number
    installation: number
    grandTotal: number
  }
}

export function PrintInvoice({ companyInfo, clientInfo, accessories, totals }: PrintInvoiceProps) {
  return (
    <div className="hidden print:block p-8 max-w-4xl mx-auto bg-white">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
          <p className="text-sm text-gray-600">{companyInfo.description}</p>
          <p className="text-sm">{companyInfo.location}</p>
          <p className="text-sm">{companyInfo.contact}</p>
          <a href={`https://${companyInfo.website}`} className="text-sm text-blue-600">
            {companyInfo.website}
          </a>
        </div>
        <div className="text-right">
          <img src="/logo_test_7.png" alt="Logo" className="h-12" />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">PROFORMA INVOICE</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Client Information</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p><strong>Client:</strong> {clientInfo.client || "N/A"}</p>
            <p><strong>Location:</strong> {clientInfo.location || "N/A"}</p>
            <p><strong>Contact:</strong> {clientInfo.contact || "N/A"}</p>
          </div>
          <div>
            <p><strong>Date:</strong> {clientInfo.date || "N/A"}</p>
            <p><strong>Gauge:</strong> {clientInfo.gauge || "N/A"}</p>
            <p><strong>CMP:</strong> {clientInfo.cmpPercentage}%</p>
            <p><strong>Payment Method:</strong> {clientInfo.paymentMethod}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Accessories</h3>
        {accessories.length === 0 ? (
          <p className="text-sm text-gray-600">No accessories added.</p>
        ) : (
          <table className="w-full border-collapse mt-2">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium">Accessory</th>
                <th className="text-center py-2 px-2 font-medium">Unit Price</th>
                <th className="text-center py-2 px-2 font-medium">Quantity</th>
                <th className="text-right py-2 px-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {accessories.map((item, index) => (
                <tr key={item.id} className="border-b" style={{ pageBreakInside: index > 20 ? "avoid" : "auto" }}>
                  <td className="py-2 px-2">{item.name}</td>
                  <td className="text-center py-2 px-2">GHS {item.unitPrice.toFixed(2)}</td>
                  <td className="text-center py-2 px-2">{item.quantity}</td>
                  <td className="text-right py-2 px-2">GHS {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium">Invoice Totals</h3>
        <div className="mt-2 space-y-1 max-w-md ml-auto">
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
      </div>

      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-medium mb-4">TERMS OF PAYMENT</h3>
        <div className="space-y-2 text-sm">
          <p><strong>1A.</strong> 70% OF TOTAL COST BEFORE PRODUCTION</p>
          <p><strong>B.</strong> 30% OF TOTAL REMAINING BALANCE AFTER PRODUCTION</p>
          <p><strong>2.</strong> WE ARE RESPONSIBLE FOR SHORTAGE AND EXCESS AT SITE</p>
          <p><strong>3.</strong> THIS QUOTATION IS NOT A CONTRACT, ANY ORDERS PLACED AS</p>
          <p>A RESULT OF THIS QUOTATION ARE SUBJECT TO OUR FURTHER ACCEPTANCE</p>
          <p>AND OUR STANDARD TERMS AND CONDITION FOR SALE</p>
          <p><strong>5A.</strong> ORDERS ONCE PROCESSED ARE NOT REFUNDABLE</p>
          <p><strong>5B.</strong> PAYMENT MADE IN EXCESS OF FINAL INVOICE VALUE WILL BE</p>
          <p>REFUNDED BY CHEQUE IN THE NAME OF THE CLIENT</p>
          <p><strong>C.</strong> PAYMENTS ON ACCOUNT ON ORDERS YET TO BE PRODUCED</p>
          <p>SHALL ATTRACT A 5% ADMINISTRATIVE CHARGE</p>
          <p><strong>6.</strong> WE RECOMMEND USING OUR TRAINED INSTALLERS FOR YOUR PROJECT</p>
          <p><strong>7.</strong> SECURITY OF GOODS SUPPLIED TO SITE IS THE RESPONSIBILITY OF THE CLIENT</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print:block,
          .print:block * {
            visibility: visible;
          }
          .print:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}