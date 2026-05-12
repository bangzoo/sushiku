import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateNomorOrder(): string {
  const now = new Date()
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, '')
  const timePart = now.getTime().toString().slice(-4)
  return `ORD${datePart}${timePart}`
}

export function formatTanggal(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatWaktu(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function hitungMargin(hargaJual: number, hargaModal: number): number {
  if (hargaJual === 0) return 0
  return Math.round(((hargaJual - hargaModal) / hargaJual) * 100)
}

export function getLabelPelanggan(totalOrder: number, totalBelanja: number) {
  if (totalOrder >= 10 || totalBelanja >= 500_000) return 'vip'
  if (totalOrder >= 3) return 'regular'
  return 'baru'
}

export function getWarnaSisaStok(stokSekarang: number, stokMinimum: number) {
  if (stokSekarang <= stokMinimum) return 'red'
  if (stokSekarang <= stokMinimum * 2) return 'yellow'
  return 'green'
}

export function openWhatsApp(nomor: string, pesan: string) {
  const nomorBersih = nomor.replace(/\D/g, '').replace(/^0/, '62')
  const url = `https://wa.me/${nomorBersih}?text=${encodeURIComponent(pesan)}`
  window.open(url, '_blank')
}
