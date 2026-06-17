export declare enum StatusFilterDto {
    PENDING = "PENDING",
    REVIEWING = "REVIEWING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare class QueryApplicantDto {
    search?: string;
    status?: StatusFilterDto;
    year?: number;
    programId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
