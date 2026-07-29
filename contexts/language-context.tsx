'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LanguageCode, DEFAULT_LANGUAGE, getUIText, getSystemPromptInLanguage } from '@/lib/languages'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
  getSystemPrompt: () => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [isMounted, setIsMounted] = useState(false)

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as LanguageCode
    if (savedLanguage) {
      setLanguageState(savedLanguage)
    }
    setIsMounted(true)
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    localStorage.setItem('preferred-language', lang)
  }

  const t = (key: string): string => {
    const texts = getUIText(language)
    return texts[key] || key
  }

  const getSystemPrompt = (): string => {
    return getSystemPromptInLanguage(language)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getSystemPrompt }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
