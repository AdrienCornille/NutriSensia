'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { signUpSchema, type SignUpData } from '@/lib/schemas'
import { FormField } from '@/components/ui/FormField'
import { useAppStore } from '@/lib/store'

export function SignUpForm() {
  const { setLoading } = useAppStore()
  
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: SignUpData) => {
    setLoading(true)
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Données du formulaire:', data)
      // Ici, vous ajouteriez la logique d'inscription réelle
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Créer votre compte
          </h2>
          <p className="text-neutral mt-2">
            Rejoignez NutriSensia pour commencer votre voyage nutritionnel
          </p>
        </div>

        <FormField
          name="name"
          label="Nom complet"
          placeholder="Votre nom complet"
          required
        />

        <FormField
          name="email"
          label="Adresse email"
          type="email"
          placeholder="votre@email.com"
          required
        />

        <FormField
          name="password"
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe"
          required
        />

        <FormField
          name="confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Confirmez votre mot de passe"
          required
        />

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
        </motion.button>

        {errors.root && (
          <p className="text-sm text-red-600 text-center">
            {errors.root.message}
          </p>
        )}
      </form>
    </motion.div>
  )
}
