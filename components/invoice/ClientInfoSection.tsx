import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ChevronDown, ChevronUp } from "lucide-react"
import { InvoiceFormData } from "./CreateInvoice"

interface ClientInfoSectionProps {
  expanded: boolean
  onToggle: () => void
}

const gaugeOptions = [
  "0.30 MSL ALUZINC WRINKLING",
  "0.35 ALUZINC WRINKLING",
  "0.40 ALUZINC WRINKLING",
  "0.30 IBR 1000 ALUZINC WRINKLING",
]

const cmpOptions = Array.from({ length: 20 }, (_, i) => i + 1)
const paymentMethods = ["Cash", "Bank", "Mobile Money"]

export function ClientInfoSection({ expanded, onToggle }: ClientInfoSectionProps) {
  const form = useFormContext<InvoiceFormData>()

  return (
    <Card>
      <CardHeader
        className="py-4 px-6 flex flex-row items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <CardTitle className="text-lg font-medium">Client Information</CardTitle>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="clientInfo.client"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>CLIENT:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientInfo.location"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>LOCATION:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientInfo.contact"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>CONTACT:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact details" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientInfo.date"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>DATE:</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientInfo.gauge"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>GAUGE:</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {field.value} <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {gaugeOptions.map((option) => (
                        <DropdownMenuItem key={option} onClick={() => field.onChange(option)}>
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientInfo.cmpPercentage"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>CMP:</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {field.value}% <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {cmpOptions.map((percent) => (
                        <DropdownMenuItem key={percent} onClick={() => field.onChange(percent)}>
                          {percent}%
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientInfo.paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>PAYMENT METHOD:</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {field.value} <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {paymentMethods.map((method) => (
                        <DropdownMenuItem key={method} onClick={() => field.onChange(method)}>
                          {method}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      )}
    </Card>
  )
}