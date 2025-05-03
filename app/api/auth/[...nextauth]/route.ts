import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, // Add name field
        isSignUp: { label: "Sign Up", type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          if (credentials.isSignUp === "true") {
            // Sign up
            const { data, error } = await supabase.auth.signUp({
              email: credentials.email,
              password: credentials.password,
            })
            if (error) {
              console.error("[NextAuth] Sign-up error:", error)
              throw new Error(error.message)
            }
            if (!data.user) throw new Error("User creation failed")

            // Create profile
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: data.user.id,
                email: credentials.email,
                name: credentials.name || credentials.email.split("@")[0], // Use provided name or fallback
                role: "employee",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            if (profileError) {
              console.error("[NextAuth] Profile upsert error:", profileError)
              throw new Error(`Profile creation failed: ${profileError.message}`)
            }

            console.log("[NextAuth] Created user:", { id: data.user.id, email: data.user.email })
            return { id: data.user.id, email: data.user.email, name: credentials.name, role: "employee" }
          } else {
            // Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })
            if (error) {
              console.error("[NextAuth] Sign-in error:", error)
              throw new Error(error.message)
            }
            if (!data.user) throw new Error("Authentication failed")

            // Fetch profile
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("email, name, role")
              .eq("id", data.user.id)
              .single()
            if (profileError) {
              console.error("[NextAuth] Profile fetch error:", profileError)
              throw new Error(`Profile fetch failed: ${profileError.message}`)
            }

            console.log("[NextAuth] Signed in user:", { id: data.user.id, email: profile.email })
            return { id: data.user.id, email: profile.email, name: profile.name, role: profile.role }
          }
        } catch (error: any) {
          console.error("[NextAuth] Auth error:", error)
          throw new Error(error.message || "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
        session.user.name = token.name as string
      }
      console.log("[NextAuth] Session created:", session)
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = user.role
        token.name = user.name
      }
      console.log("[NextAuth] JWT created:", token)
      return token
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }