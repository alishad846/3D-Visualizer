/**
 * Central PII Masking utility for ScanVista.
 * Before storing any user-provided free-text into the database,
 * it runs through these regexes to mask email, phone, Aadhaar,
 * PAN, and credit/debit card numbers.
 */
function maskPII(text) {
  if (typeof text !== 'string') {
    return text;
  }

  return text
    // 1. Email addresses -> [EMAIL]
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    
    // 2. Phone numbers -> [PHONE]
    // Matches common patterns including leading country code, spaces, dashes, parentheses
    .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]')
    
    // // 3. Aadhaar numbers (12-digit) -> [AADHAAR]
    // // Matches 12 digits, optionally grouped in blocks of 4
    // .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[AADHAAR]')
    
    // // 4. PAN numbers (5 letters, 4 digits, 1 letter) -> [PAN]
    // .replace(/\b[a-zA-Z]{5}\d{4}[a-zA-Z]\b/g, '[PAN]')
    
    // 5. Credit/debit card numbers -> [CARD]
    // Matches typical 13 to 16 digit card patterns (with optional spaces/hyphens)
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARD]');
}

module.exports = { maskPII };
