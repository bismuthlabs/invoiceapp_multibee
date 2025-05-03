import { useState } from "react"
import { useFormContext } from "react-hook-form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import { InvoiceFormData } from "./CreateInvoice"

interface AccessoriesSectionProps {
  expanded: boolean
  onToggle: () => void
}

const availableAccessories = [
  { id: "acc1", name: "MB HIPCAP WRINKLING", unitPrice: 142.5 },
  { id: "acc2", name: "MB RAINGUTTER WRINKLING", unitPrice: 141.0 },
  { id: "acc3", name: "ROOF SHEET STANDARD", unitPrice: 185.75 },
  { id: "acc4", name: "RIDGE CAP STANDARD", unitPrice: 95.25 },
  { id: "acc5", name: "VALLEY GUTTER", unitPrice: 120.0 },
  { id: "acc6", name: "FLASHING STRIP", unitPrice: 65.5 },
  { id: "acc7", name: "FASTENERS PACK", unitPrice: 45.0 },
  { id: "acc8", name: "SEALANT TUBE", unitPrice: 12.75 },
]

export function AccessoriesSection({ expanded, onToggle }: AccessoriesSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalSelections, setModalSelections] = useState<string[]>([])
  const form = useFormContext<InvoiceFormData>()

  const handleModalSelectionChange = (id: string, checked: boolean) => {
    setModalSelections((prev) =>
      checked ? [...prev, id] : prev.filter((existingId) => existingId !== id)
    )
  }

  const handleAddAccessories = () => {
    const currentAccessories = form.getValues("accessories") || []
    const newAccessories = modalSelections
      .filter((id) => !currentAccessories.some((item) => item.id === id))
      .map((id) => {
        const accessory = availableAccessories.find((a) => a.id === id)!
        return {
          ...accessory,
          quantity: 1,
          total: accessory.unitPrice,
        }
      })

    form.setValue("accessories", [...currentAccessories, ...newAccessories], {
      shouldValidate: true,
    })
    setSheetOpen(false)
    setModalSelections([])
  }

  return (
    <Card>
      <CardHeader
        className="py-4 px-6 flex flex-row items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <CardTitle className="text-lg font-medium">Accessories</CardTitle>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </CardHeader>

      {expanded && (
        <CardContent>
          <div className="mb-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Accessories
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Select Accessories</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {availableAccessories.map((accessory) => (
                    <div key={accessory.id} className="flex items-center gap-2">
                      <Checkbox
                        id={accessory.id}
                        checked={modalSelections.includes(accessory.id)}
                        onCheckedChange={(checked) =>
                          handleModalSelectionChange(accessory.id, !!checked)
                        }
                      />
                      <label htmlFor={accessory.id} className="flex-1">
                        {accessory.name} (GHS {accessory.unitPrice.toFixed(2)})
                      </label>
                    </div>
                  ))}
                </div>
                <Button className="mt-6 w-full" onClick={handleAddAccessories}>
                  Add Selected
                </Button>
              </SheetContent>
            </Sheet>
          </div>

          <FormField
            control={form.control}
            name="accessories"
            render={({ field }) => (
              <FormItem>
                {field.value.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No accessories added yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Accessory</TableHead>
                        <TableHead className="text-center">Unit Price</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {field.value.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-center">
                          GHS {item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const quantity = Math.max(1, parseInt(e.target.value) || 1)
                                const updatedAccessories = [...field.value]
                                updatedAccessories[index] = {
                                  ...item,
                                  quantity,
                                  total: quantity * item.unitPrice,
                                }
                                field.onChange(updatedAccessories)
                              }}
                              className="w-16 mx-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                          GHS {item.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updatedAccessories = field.value.filter(
                                  (_, i) => i !== index
                                )
                                field.onChange(updatedAccessories)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <FormItem />
              </FormItem>
            )}
          />
        </CardContent>
      )}
    </Card>
  )
}