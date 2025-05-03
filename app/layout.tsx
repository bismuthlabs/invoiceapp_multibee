import "./globals.css"
import { AuthProvider } from "./providers"

export const metadata = {
  title: "MULTIBEE 360",
  description: "Proforma Invoice Generator for MULTIBEE 360 COMPANY LIMITED",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}