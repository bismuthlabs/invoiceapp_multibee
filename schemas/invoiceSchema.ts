import { z } from "zod"

export const clientInfoSchema = z.object({
  client: z.string().min(2, "Client name must be at least 2 characters").max(100, "Client name must be at most 100 characters"),
  location: z.string().optional(),
  contact: z.string().optional().refine(
    (val) => !val || /^\+?\d{10,15}(-\d{3,4})?$/.test(val),
    { message: "Invalid phone number (e.g., +1234567890 or 123-456-7890)" }
  ),
  date: z.string().refine(
    (val) => {
      const date = new Date(val)
      return !isNaN(date.getTime()) && date <= new Date()
    },
    { message: "Invalid date or date in the future" }
  ),
  gauge: z.string().min(1, "Gauge is required"),
  cmpPercentage: z.number().min(1, "CMP must be at least 1%").max(20, "CMP must be at most 20%"),
  paymentMethod: z.enum(["Cash", "Bank", "Mobile Money"]),
})

export const invoiceFormSchema = z.object({
  clientInfo: clientInfoSchema,
  accessories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      unitPrice: z.number(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      total: z.number(),
    })
  ).min(1, "At least one accessory is required"),
  discountPercentage: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"),
  transportationCost: z.number().min(0, "Transportation cost cannot be negative").max(100000, "Transportation cost cannot exceed 100,000"),
  installationPercentage: z.number().min(0, "Installation cannot be negative").max(100, "Installation cannot exceed 100%"),
})

export const settingsSchema = z.object({
  companyInfo: z.object({
    name: z.string().min(1, "Company name is required"),
    description: z.string().default(""),
    location: z.string().min(1, "Location is required"),
    contact: z.string().refine(
      (val) => /^\+?\d{10,15}(-\d{3,4})?$/.test(val),
      { message: "Invalid phone number (e.g., +1234567890 or 123-456-7890)" }
    ),
    website: z.string().default(""),
  }),
  defaultGauge: z.string().min(1, "Default gauge is required"),
  defaultTaxRates: z.object({
    nihil: z.number().min(0, "Tax rate cannot be negative"),
    getFund: z.number().min(0, "Tax rate cannot be negative"),
    covid: z.number().min(0, "Tax rate cannot be negative"),
    vat: z.number().min(0, "Tax rate cannot be negative"),
  }),
})