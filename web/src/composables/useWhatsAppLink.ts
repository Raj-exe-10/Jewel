import type { Product } from '../types/catalogue'

// Contract: specs/001-amore-jewelry-catalogue/contracts/whatsapp-link-contract.md

function assertPhone(businessPhoneE164: string): void {
  if (!businessPhoneE164 || !businessPhoneE164.trim()) {
    throw new Error('A business phone number (E.164, no leading +) is required to build a WhatsApp link.')
  }
}

export function buildProductEnquiryLink(product: Product, businessPhoneE164: string): string {
  assertPhone(businessPhoneE164)
  const message = `Hi Amore, I'm interested in "${product.name}". Could you share more details?`
  return `https://wa.me/${businessPhoneE164}?text=${encodeURIComponent(message)}`
}

export function buildGeneralEnquiryLink(businessPhoneE164: string): string {
  assertPhone(businessPhoneE164)
  const message = `Hi Amore, I'd like to know more about your jewelry collection.`
  return `https://wa.me/${businessPhoneE164}?text=${encodeURIComponent(message)}`
}

export function buildInstagramProfileLink(instagramHandle: string): string {
  const handle = instagramHandle.trim().replace(/^@/, '')
  return `https://instagram.com/${handle}`
}
