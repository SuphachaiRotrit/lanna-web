"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizeUtil = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
class SanitizeUtil {
    static clean(input) {
        if (!input)
            return input;
        return (0, sanitize_html_1.default)(input, {
            allowedTags: [],
            allowedAttributes: {},
        });
    }
    static cleanObject(obj) {
        const cleaned = { ...obj };
        for (const key of Object.keys(cleaned)) {
            if (typeof cleaned[key] === 'string') {
                cleaned[key] = this.clean(cleaned[key]);
            }
        }
        return cleaned;
    }
    static isValidNationalId(id) {
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
exports.SanitizeUtil = SanitizeUtil;
//# sourceMappingURL=sanitize.util.js.map