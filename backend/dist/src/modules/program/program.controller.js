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
exports.ProgramController = void 0;
const common_1 = require("@nestjs/common");
const program_service_1 = require("./program.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let ProgramController = class ProgramController {
    constructor(programService) {
        this.programService = programService;
    }
    async findAll() {
        return this.programService.findAll(false);
    }
    async findAllAdmin() {
        return this.programService.findAll(true);
    }
    async findOne(id) {
        return this.programService.findOne(id);
    }
    async create(data) {
        return this.programService.create(data);
    }
    async update(id, data) {
        return this.programService.update(id, data);
    }
    async remove(id) {
        return this.programService.remove(id);
    }
};
exports.ProgramController = ProgramController;
__decorate([
    (0, common_1.Get)('programs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/programs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/programs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('admin/programs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('admin/programs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/programs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "remove", null);
exports.ProgramController = ProgramController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [program_service_1.ProgramService])
], ProgramController);
//# sourceMappingURL=program.controller.js.map