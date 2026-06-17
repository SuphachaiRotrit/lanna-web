export declare class SanitizeUtil {
    static clean(input: string): string;
    static cleanObject<T extends object>(obj: T): T;
    static isValidNationalId(id: string): boolean;
}
