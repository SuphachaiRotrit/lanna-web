"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const applicant_service_1 = require("./applicant.service");
const create_applicant_dto_1 = require("./dto/create-applicant.dto");
const query_applicant_dto_1 = require("./dto/query-applicant.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const throttler_1 = require("@nestjs/throttler");
let ApplicantController = class ApplicantController {
    constructor(applicantService) {
        this.applicantService = applicantService;
    }
    async create(createDto) {
        return this.applicantService.create(createDto);
    }
    async uploadDocument(id, file, type, req) {
        const isAdmin = !!req.user;
        return this.applicantService.addDocument(id, file, type, isAdmin);
    }
    async findAll(query) {
        return this.applicantService.findAll(query);
    }
    async findOne(id) {
        return this.applicantService.findOne(id);
    }
    async updateStatus(id, status) {
        return this.applicantService.updateStatus(id, status);
    }
};
exports.ApplicantController = ApplicantController;
__decorate([
    (0, common_1.Post)('applicants'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_applicant_dto_1.CreateApplicantDto]),
    __metadata("design:returntype", Promise)
], ApplicantController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('applicants/:id/documents'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicantController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('admin/applicants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_applicant_dto_1.QueryApplicantDto]),
    __metadata("design:returntype", Promise)
], ApplicantController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/applicants/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicantController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('admin/applicants/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApplicantController.prototype, "updateStatus", null);
exports.ApplicantController = ApplicantController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [applicant_service_1.ApplicantService])
], ApplicantController);
//# sourceMappingURL=applicant.controller.js.map