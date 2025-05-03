import { useState, useCallback } from "react"
import toast from "react-hot-toast"

export function useUndo<T>(
  onUndo: (item: T) => void,
  timeoutMs: number = 5000
): {
  triggerUndoableAction: (item: T, message: string) => void
  clearUndo: () => void
} {
  const [undoItem, setUndoItem] = useState<T | null>(null)
  const [toastId, setToastId] = useState<string | null>(null)

  const triggerUndoableAction = useCallback(
    (item: T, message: string) => {
      setUndoItem(item)
      const id = toast(
        <div className="flex items-center gap-2">
          <span>{message}</span>
          <button
            className="text-blue-500 hover:underline"
            onClick={() => {
              onUndo(item)
              toast.dismiss(id)
              setUndoItem(null)
              setToastId(null)
            }}
          >
            Undo
          </button>
        </div>,
        { duration: timeoutMs }
      )
      setToastId(id)

      setTimeout(() => {
        setUndoItem(null)
        setToastId(null)
      }, timeoutMs)
    },
    [onUndo, timeoutMs]
  )

  const clearUndo = useCallback(() => {
    if (toastId) {
      toast.dismiss(toastId)
    }
    setUndoItem(null)
    setToastId(null)
  }, [toastId])

  return { triggerUndoableAction, clearUndo }
}