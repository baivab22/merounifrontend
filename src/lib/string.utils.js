/**
 * Strips HTML tags from a string.
 * @param {string} html - The HTML string to strip.
 * @returns {string} - The plain text string.
 */
export const stripHtml = (html) => {
    if (!html) return ''
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}
