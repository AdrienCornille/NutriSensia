'use client'

import { useFormContext } from 'react-hook-form'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'

interface FormFieldProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea'
  placeholder?: string
  required?: boolean
  className?: string
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  className = '',
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={name}
            {...register(name)}
            placeholder={placeholder}
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
            rows={4}
          />
        ) : (
          <input
            id={name}
            type={type}
            {...register(name)}
            placeholder={placeholder}
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
          />
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
