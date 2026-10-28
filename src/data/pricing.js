export const DEFAULT_PRICING = {
  woods: [
    { name: 'Abete', price: 85, color: '#ddc595' },
    { name: 'Pino', price: 95, color: '#d3a865' },
    { name: 'Castagno', price: 160, color: '#a97d4e' },
    { name: 'Rovere', price: 180, color: '#b89261' },
    { name: 'Noce', price: 240, color: '#75543c' },
  ],
  finishes: [
    { name: 'Grezzo', price: 0 },
    { name: 'Cera naturale', price: 12 },
    { name: 'Verniciato opaco', price: 18 },
    { name: 'Laccato', price: 35 },
  ],
  deliveries: [
    { name: 'Ritiro in sede', price: 0 },
    { name: 'Entro 50 km', price: 60 },
    { name: 'Oltre 50 km', price: 120 },
  ],
  vat: 0.22,
  minSize: 30,
  maxSize: 300,
}

export const PRICING_STORAGE_KEY = 'legno-co-pricing'

export function getPricing() {
  try {
    const saved = window.localStorage.getItem(PRICING_STORAGE_KEY)
    return saved ? { ...DEFAULT_PRICING, ...JSON.parse(saved) } : DEFAULT_PRICING
  } catch {
    return DEFAULT_PRICING
  }
}
