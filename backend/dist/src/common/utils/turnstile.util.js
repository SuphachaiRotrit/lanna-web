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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TurnstileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnstileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let TurnstileService = TurnstileService_1 = class TurnstileService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TurnstileService_1.name);
        this.secretKey = this.configService.get('TURNSTILE_SECRET_KEY') || '1x0000000000000000000000000000000AA';
    }
    async verifyToken(token) {
        if (!token) {
            throw new common_1.UnauthorizedException('CAPTCHA token is missing');
        }
        try {
            const response = await axios_1.default.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                secret: this.secretKey,
                response: token,
            });
            const { success, 'error-codes': errorCodes } = response.data;
            if (!success) {
                this.logger.warn(`Turnstile verification failed: ${JSON.stringify(errorCodes)}`);
                throw new common_1.UnauthorizedException('CAPTCHA verification failed');
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Turnstile error: ${error.message}`);
            throw new common_1.UnauthorizedException('Unable to verify CAPTCHA');
        }
    }
};
exports.TurnstileService = TurnstileService;
exports.TurnstileService = TurnstileService = TurnstileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TurnstileService);
//# sourceMappingURL=turnstile.util.js.map