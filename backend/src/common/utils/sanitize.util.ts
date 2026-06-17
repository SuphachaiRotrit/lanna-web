import sanitizeHtml from 'sanitize-html';

export class SanitizeUtil {
  /**
   * Clean string from HTML/XSS
   */
  static clean(input: string): string {
    if (!input) return input;
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }

  /**
   * Sanitize object properties (shallow)
   */
  static cleanObject<T extends object>(obj: T): T {
    const cleaned = { ...obj };
    for (const key of Object.keys(cleaned)) {
      if (typeof (cleaned as any)[key] === 'string') {
        (cleaned as any)[key] = this.clean((cleaned as any)[key]);
      }
    }
    return cleaned;
  }

  /**
   * Validate Thai National ID
   */
  static isValidNationalId(id: string): boolean {
    if (!id || id.length !== 13 || !/^\d+$/.test(id)) {
      return false;
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id.charAt(i)) * (13 - i);
    }
    const check = (11 - (sum % 11)) % 10;
    return check === parseInt(id.charAt(12));
  }
}
