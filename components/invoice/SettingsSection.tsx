import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { Settings } from "@/types/invoice"
import { settingsSchema } from "@/schemas/invoiceSchema"
import { z } from "zod"
import { useSettings } from "@/hooks/useSettings"

interface SettingsSectionProps {
  initialSettings: Settings
}

export function SettingsSection({ initialSettings }: SettingsSectionProps) {
  const { settings, saveSettings } = useSettings(initialSettings)
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  })

  const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
    try {
      await saveSettings(data)
      toast.success("Settings saved successfully")
    } catch (error: any) {
      console.error("[SettingsSection] Error saving settings:", error)
      toast.error(`Failed to save settings: ${error.message || "Unknown error"}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyInfo.name">Company Name</Label>
                <Input
                  id="companyInfo.name"
                  {...form.register("companyInfo.name")}
                  placeholder="Enter company name"
                />
                {form.formState.errors.companyInfo?.name && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.companyInfo.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="companyInfo.description">Description</Label>
                <Input
                  id="companyInfo.description"
                  {...form.register("companyInfo.description")}
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label htmlFor="companyInfo.location">Location</Label>
                <Input
                  id="companyInfo.location"
                  {...form.register("companyInfo.location")}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="companyInfo.contact">Contact</Label>
                <Input
                  id="companyInfo.contact"
                  {...form.register("companyInfo.contact")}
                  placeholder="Enter contact"
                />
              </div>
              <div>
                <Label htmlFor="companyInfo.website">Website</Label>
                <Input
                  id="companyInfo.website"
                  {...form.register("companyInfo.website")}
                  placeholder="Enter website"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Default Gauge</h3>
            <div>
              <Label htmlFor="defaultGauge">Gauge</Label>
              <Input
                id="defaultGauge"
                {...form.register("defaultGauge")}
                placeholder="Enter default gauge"
              />
              {form.formState.errors.defaultGauge && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.defaultGauge.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Default Tax Rates (%)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultTaxRates.nihil">Nihil</Label>
                <Input
                  id="defaultTaxRates.nihil"
                  type="number"
                  step="0.1"
                  {...form.register("defaultTaxRates.nihil", { valueAsNumber: true })}
                  placeholder="Enter nihil rate"
                />
              </div>
              <div>
                <Label htmlFor="defaultTaxRates.getFund">GET Fund</Label>
                <Input
                  id="defaultTaxRates.getFund"
                  type="number"
                  step="0.1"
                  {...form.register("defaultTaxRates.getFund", { valueAsNumber: true })}
                  placeholder="Enter GET Fund rate"
                />
              </div>
              <div>
                <Label htmlFor="defaultTaxRates.covid">COVID</Label>
                <Input
                  id="defaultTaxRates.covid"
                  type="number"
                  step="0.1"
                  {...form.register("defaultTaxRates.covid", { valueAsNumber: true })}
                  placeholder="Enter COVID rate"
                />
              </div>
              <div>
                <Label htmlFor="defaultTaxRates.vat">VAT</Label>
                <Input
                  id="defaultTaxRates.vat"
                  type="number"
                  step="0.1"
                  {...form.register("defaultTaxRates.vat", { valueAsNumber: true })}
                  placeholder="Enter VAT rate"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}