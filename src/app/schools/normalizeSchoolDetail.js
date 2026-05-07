/**
 * School GET-by-slug responses use Sequelize aliases `address` and `contacts`;
 * college-style screens expect `collegeAddress` and `collegeContacts`.
 */
export default function normalizeSchoolDetail(item) {
  if (!item) return item

  const contacts =
    item.collegeContacts?.length > 0
      ? item.collegeContacts
      : Array.isArray(item.contacts)
        ? item.contacts
        : []

  return {
    ...item,
    collegeAddress: item.address ?? item.collegeAddress ?? {},
    collegeContacts: contacts,
  }
}
