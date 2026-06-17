import { PrismaService } from '../../prisma/prisma.service';
export declare class ProgramService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(adminOnly?: boolean): Promise<{
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
