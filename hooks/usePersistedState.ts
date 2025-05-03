import { useState, useEffect } from "react"

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  transform?: (value: T) => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize with defaultValue for SSR
  const [state, setState] = useState<T>(defaultValue)

  // Load from localStorage only on client-side after mount
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key)
      if (storedValue !== null) {
        const parsedValue = JSON.parse(storedValue)
        setState(transform ? transform(parsedValue) : parsedValue)
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    }
  }, [key, transform])

  // Persist to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, state])

  return [state, setState]
}