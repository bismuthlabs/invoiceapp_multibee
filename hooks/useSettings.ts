import { useState, useEffect } from "react"
import { Settings } from "@/types/invoice"
import { supabase } from "@/lib/supabase"

export function useSettings(initialSettings: Settings) {
  const [settings, setSettings] = useState<Settings>(initialSettings)

  // Fetch settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("id", 1)
          .single()
        if (error) throw error
        // console.log("[useSettings] Fetched settings:", data)
        setSettings({
          companyInfo: data.company_info,
          defaultGauge: data.default_gauge,
          defaultTaxRates: data.default_tax_rates,
        })
      } catch (error: any) {
        console.error("[useSettings] Error fetching settings:", error)
        setSettings(initialSettings) // Fallback to initial
      }
    }

    fetchSettings()

    // Real-time subscription
    const channel = supabase
      .channel("settings-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "settings", filter: "id=eq.1" },
        (payload) => {
          console.log("[useSettings] Real-time settings update:", payload)
          setSettings({
            companyInfo: payload.new.company_info,
            defaultGauge: payload.new.default_gauge,
            defaultTaxRates: payload.new.default_tax_rates,
          })
        }
      )
      .subscribe((status) => {
        // console.log("[useSettings] Settings subscription status:", status)
        return
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialSettings])

  // Save settings to Supabase
  const saveSettings = async (newSettings: Settings) => {
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          company_info: newSettings.companyInfo,
          default_gauge: newSettings.defaultGauge,
          default_tax_rates: newSettings.defaultTaxRates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
      if (error) throw error
      console.log("[useSettings] Saved settings:", newSettings)
      setSettings(newSettings)
    } catch (error: any) {
      console.error("[useSettings] Error saving settings:", error)
      throw error
    }
  }

  return { settings, saveSettings }
}

// import { usePersistedState } from "./usePersistedState"
// import { Settings } from "@/types/invoice"

// export function useSettings(initialSettings: Settings) {
//   const [settings, setSettings] = usePersistedState<Settings>("settings", initialSettings)

//   return {
//     settings,
//     updateSettings: setSettings,
//   }
// }