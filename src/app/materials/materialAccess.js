// Resolves the URL that can actually be opened for a material.
export const getMaterialFileUrl = (material) =>
  material?.file_url || material?.file || ''

// A premium material is only openable when the API has explicitly unlocked it
// for the current viewer (`is_locked === false`) AND returned a file URL.
// Everything else — no lock flag, a locked flag, or a missing URL — is treated
// as locked, so premium files can never be opened by accident.
export const isMaterialLocked = (material) => {
  if (!material?.is_premium) return false
  return material.is_locked !== false || !getMaterialFileUrl(material)
}

// Always open files through the backend gate. The list endpoints deliberately
// withhold `file_url` for locked materials, but the gate is what actually
// enforces the membership check at request time (anonymous/non-member clicks
// get a 403 even if they somehow know the file URL).
export const getMaterialOpenUrl = (material) => {
  if (!material?.id) return ''
  const baseUrl = process.env.baseUrl || ''
  return `${baseUrl}/materials/${material.id}/file`
}
