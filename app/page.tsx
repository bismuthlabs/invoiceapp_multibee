import { redirect } from "next/navigation"
import CreateInvoice from "@/components/invoice/CreateInvoice"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return (
    <ErrorBoundary>
      <CreateInvoice />
    </ErrorBoundary>
  )
}