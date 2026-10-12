import { wedding } from '@/config/wedding'

/** [pertama, kedua] sesuai `order` di config. */
export function coupleOrder() {
  return wedding.order === 'bride-first' ? ([wedding.bride, wedding.groom] as const) : ([wedding.groom, wedding.bride] as const)
}
