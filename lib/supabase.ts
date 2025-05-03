import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
})

// import { createClient } from "@supabase/supabase-js"

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error("Supabase URL and Anon Key must be defined in environment variables")
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: true,
//   },
// })

// // Auth utilities
// export async function signIn(email: string, password: string) {
//   const { data, error } = await supabase.auth.signInWithPassword({ email, password })
//   console.log("[Supabase] Sign-in:", { data, error })
//   return { data, error }
// }

// export async function signOut() {
//   const { error } = await supabase.auth.signOut()
//   console.log("[Supabase] Sign-out:", { error })
//   return { error }
// }

// export async function getSession() {
//   const { data, error } = await supabase.auth.getSession()
//   console.log("[Supabase] Session:", { session: data.session, error })
//   return { session: data.session, error }
// }