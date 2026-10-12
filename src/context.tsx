import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { wedding } from '@/config/wedding'
import type { SectionId } from '@/config/types'
import { dictionaries, type Dict, type Lang } from '@/i18n'
import { parseGuest, type Guest } from '@/lib/guest'
import { tx } from '@/lib/i18nText'
import { useReducedMotion } from '@/hooks/useEnv'
import type { L } from '@/config/types'

export interface FxApi {
  burst: (x?: number, y?: number) => void
  rain: () => void
}

interface AppState {
  lang: Lang
  setLang: (l: Lang) => void
  t: Dict
  /** terjemahkan teks config */
  c: (v: L | undefined) => string
  guest: Guest
  opened: boolean
  setOpened: (v: boolean) => void
  reduced: boolean
  active: SectionId
  setActive: (s: SectionId) => void
  fx: FxApi | null
  setFx: (f: FxApi | null) => void
}

const Ctx = createContext<AppState | null>(null)

function initialLang(): Lang {
  const q = new URLSearchParams(location.search).get('lang') as Lang | null
  if (q && wedding.meta.langs.includes(q)) return q
  try {
    const s = localStorage.getItem('lang') as Lang | null
    if (s && wedding.meta.langs.includes(s)) return s
  } catch {
    /* storage diblokir */
  }
  return wedding.meta.defaultLang
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [opened, setOpened] = useState(false)
  const [active, setActive] = useState<SectionId>('cover')
  const [fx, setFx] = useState<FxApi | null>(null)
  const reduced = useReducedMotion()

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    document.documentElement.lang = l === 'ban' ? 'ban' : l
    try {
      localStorage.setItem('lang', l)
    } catch {
      /* abaikan */
    }
  }, [])

  const c = useCallback((v: L | undefined) => tx(v, lang), [lang])
  const guest = useMemo(
    () => parseGuest(location.search, tx(wedding.guest.fallbackName, lang), tx(wedding.guest.defaultSalutation, lang)),
    [lang],
  )

  const value = useMemo<AppState>(
    () => ({ lang, setLang, t: dictionaries[lang], c, guest, opened, setOpened, reduced, active, setActive, fx, setFx }),
    [lang, setLang, c, guest, opened, reduced, active, fx],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp di luar AppProvider')
  return v
}
