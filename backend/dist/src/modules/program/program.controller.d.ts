import { ProgramService } from './program.service';
export declare class ProgramController {
    private readonly programService;
    constructor(programService: ProgramService);
    findAll(): Promise<{
        currentApplicants: number;
        isFull: boolean;
        _count: {
            applicants: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        nameEn: string | null;
        faculty: string;
        degree: string;
        description: string | null;
        duration: string | null;
        maxQuota: number;
    }[]>;
    findAllAdmin(): Promise<{
        currentApplicants: number;
        isFull: boolean;
        _count: {
            applicants: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        nameEn: string | null;
        faculty: string;
        degree: string;
        description: string | null;
        duration: string | null;
        maxQuota: number;
    }[]>;
    findOne(id: string): Promise<({
        _count: {
            applicants: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        nameEn: string | null;
        faculty: string;
        degree: string;
        description: string | null;
        duration: string | null;
        maxQuota: number;
    }) | null>;
    create(data: {
        name: string;
        nameEn?: string;
        faculty: string;
        degree: string;
        description?: string;
        duration?: string;
        maxQuota?: number;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        nameEn: string | null;
        faculty: string;
        degree: string;
        description: string | null;
        duration: string | null;
        maxQuota: number;
    }>;
    update(id: string, data: Partial<{
        name: string;
        nameEn: string;
        faculty: string;
        degree: string;
        description: string;
        duration: string;
        maxQuota: number;
        isActive: boolean;
    }>): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        nameEn: string | null;
        faculty: string;
        degree: string;
        description: string | null;
        duration: string | null;
        maxQuota: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        nameEn: string | null;
        faculty: string;
        degree: string;
        description: string | null;
        duration: string | null;
        maxQuota: number;
    }>;
}
