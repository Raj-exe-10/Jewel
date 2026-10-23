import { supabase } from './client'

const PUBLIC_MARKER = '/storage/v1/object/public/'

export function splitFolder(folder: string): { bucket: string; prefix: string } {
  const parts = folder.split('/').filter(Boolean)
  const bucket = parts[0] ?? 'product-photos'
  const prefix = parts.slice(1).join('/')
  return { bucket, prefix }
}

export function publicObjectUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadPublicFile(
  folder: string,
  fileName: string,
  file: Blob,
  contentType?: string,
): Promise<string> {
  const { bucket, prefix } = splitFolder(folder)
  const path = prefix ? `${prefix}/${fileName}` : fileName
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: contentType || (file as File).type || 'application/octet-stream',
    upsert: false,
  })
  if (error) throw error
  return publicObjectUrl(bucket, path)
}

/** Best-effort delete from a public storage URL (or storage path). */
export async function deletePublicUrl(urlOrPath: string): Promise<void> {
  const parsed = parsePublicUrl(urlOrPath)
  if (!parsed) return
  await supabase.storage.from(parsed.bucket).remove([parsed.path])
}

export function parsePublicUrl(urlOrPath: string): { bucket: string; path: string } | null {
  if (!urlOrPath) return null
  const idx = urlOrPath.indexOf(PUBLIC_MARKER)
  if (idx >= 0) {
    const rest = urlOrPath.slice(idx + PUBLIC_MARKER.length)
    const slash = rest.indexOf('/')
    if (slash < 0) return null
    return { bucket: rest.slice(0, slash), path: decodeURIComponent(rest.slice(slash + 1).split('?')[0]!) }
  }
  // Relative "bucket/path" form
  const parts = urlOrPath.split('/').filter(Boolean)
  if (parts.length < 2) return null
  return { bucket: parts[0]!, path: parts.slice(1).join('/') }
}

export function isManagedStorageUrl(url: string): boolean {
  return (
    url.includes(PUBLIC_MARKER) ||
    url.includes('supabase') ||
    url.includes('127.0.0.1') ||
    url.includes('localhost')
  )
}
