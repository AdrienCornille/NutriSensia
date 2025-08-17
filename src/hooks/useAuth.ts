'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { setUser: setStoreUser, setAuthenticated } = useAppStore()

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await auth.getUser()
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
        } else {
          setUser(user)
          setStoreUser(user ? {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || '',
            preferences: null,
          } : null)
          setAuthenticated(!!user)
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setStoreUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          preferences: null,
        } : null)
        setAuthenticated(!!session?.user)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setStoreUser, setAuthenticated])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) {
        throw error
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { name: string }) => {
    try {
      const { data, error } = await auth.signUp(email, password, metadata)
      if (error) {
        throw error
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) {
        throw error
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}
