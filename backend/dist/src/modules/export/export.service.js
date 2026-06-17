"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
const PDFDocument = __importStar(require("pdfkit"));
const applicant_service_1 = require("../applicant/applicant.service");
let ExportService = ExportService_1 = class ExportService {
    constructor(applicantService) {
        this.applicantService = applicantService;
        this.logger = new common_1.Logger(ExportService_1.name);
    }
    async exportExcel(query, ids) {
        const applicants = ids
            ? await this.applicantService.findByIds(ids)
            : await this.applicantService.findAllForExport(query);
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'MBU Lanna Registration System';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('ข้อมูลผู้สมัคร', {
            headerFooter: {
                firstHeader: 'มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา',
            },
        });
        sheet.columns = [
            { header: 'เลขที่ใบสมัคร', key: 'applicationNumber', width: 18 },
            { header: 'คำนำหน้า', key: 'prefixName', width: 10 },
            { header: 'ชื่อ', key: 'firstName', width: 15 },
            { header: 'นามสกุล', key: 'lastName', width: 15 },
            { header: 'เลขบัตรประชาชน', key: 'nationalId', width: 18 },
            { header: 'เพศ', key: 'gender', width: 8 },
            { header: 'วันเกิด', key: 'birthDate', width: 15 },
            { header: 'เบอร์โทร', key: 'phone', width: 15 },
            { header: 'อีเมล', key: 'email', width: 25 },
            { header: 'ที่อยู่', key: 'address', width: 30 },
            { header: 'ตำบล', key: 'subDistrict', width: 12 },
            { header: 'อำเภอ', key: 'district', width: 12 },
            { header: 'จังหวัด', key: 'province', width: 12 },
            { header: 'รหัสไปรษณีย์', key: 'postalCode', width: 12 },
            { header: 'สถาบันเดิม', key: 'previousSchool', width: 25 },
            { header: 'วุฒิการศึกษา', key: 'previousEducation', width: 15 },
            { header: 'GPA', key: 'gpa', width: 8 },
            { header: 'หลักสูตร', key: 'program', width: 25 },
            { header: 'คณะ', key: 'faculty', width: 20 },
            { header: 'สถานะ', key: 'status', width: 12 },
            { header: 'วันที่สมัคร', key: 'submittedAt', width: 18 },
        ];
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF8B1A1A' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        const genderMap = {
            MALE: 'ชาย',
            FEMALE: 'หญิง',
            OTHER: 'อื่นๆ',
        };
        const statusMap = {
            PENDING: 'รอตรวจสอบ',
            REVIEWING: 'กำลังตรวจสอบ',
            APPROVED: 'อนุมัติ',
            REJECTED: 'ไม่อนุมัติ',
            CANCELLED: 'ยกเลิก',
        };
        for (const applicant of applicants) {
            sheet.addRow({
                applicationNumber: applicant.applicationNumber,
                prefixName: applicant.prefixName,
                firstName: applicant.firstName,
                lastName: applicant.lastName,
                nationalId: applicant.nationalId,
                gender: genderMap[applicant.gender] || applicant.gender,
                birthDate: applicant.birthDate.toLocaleDateString('th-TH'),
                phone: applicant.phone,
                email: applicant.email || '-',
                address: applicant.address,
                subDistrict: applicant.subDistrict,
                district: applicant.district,
                province: applicant.province,
                postalCode: applicant.postalCode,
                previousSchool: applicant.previousSchool,
                previousEducation: applicant.previousEducation,
                gpa: applicant.gpa || '-',
                program: applicant.program?.name || '-',
                faculty: applicant.program?.faculty || '-',
                status: statusMap[applicant.status] || applicant.status,
                submittedAt: applicant.submittedAt.toLocaleDateString('th-TH'),
            });
        }
        sheet.autoFilter = {
            from: 'A1',
            to: `U${applicants.length + 1}`,
        };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async exportPdf(query, ids) {
        const applicants = ids
            ? await this.applicantService.findByIds(ids)
            : await this.applicantService.findAllForExport(query);
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 30,
                info: {
                    Title: 'รายชื่อผู้สมัครเรียน มมร. วิทยาเขตล้านนา',
                    Author: 'MBU Lanna Registration System',
                },
            });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            doc
                .fontSize(16)
                .text('มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา', {
                align: 'center',
            });
            doc
                .fontSize(14)
                .text('รายชื่อผู้สมัครเรียน', { align: 'center' });
            doc.moveDown();
            const statusMap = {
                PENDING: 'รอตรวจสอบ',
                REVIEWING: 'กำลังตรวจสอบ',
                APPROVED: 'อนุมัติ',
                REJECTED: 'ไม่อนุมัติ',
                CANCELLED: 'ยกเลิก',
            };
            doc.fontSize(10);
            doc.text(`จำนวนผู้สมัครทั้งหมด: ${applicants.length} คน`);
            doc.text(`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`);
            doc.moveDown();
            const tableTop = doc.y;
            const colWidths = [30, 80, 100, 80, 100, 120, 70];
            const headers = [
                'ลำดับ',
                'เลขที่ใบสมัคร',
                'ชื่อ-นามสกุล',
                'เบอร์โทร',
                'หลักสูตร',
                'สถาบันเดิม',
                'สถานะ',
            ];
            let xPos = 30;
            headers.forEach((header, i) => {
                doc
                    .fontSize(9)
                    .font('Helvetica-Bold')
                    .text(header, xPos, tableTop, { width: colWidths[i] });
                xPos += colWidths[i] + 10;
            });
            doc.moveTo(30, tableTop + 15).lineTo(790, tableTop + 15).stroke();
            let y = tableTop + 20;
            applicants.forEach((applicant, index) => {
                if (y > 540) {
                    doc.addPage();
                    y = 30;
                }
                xPos = 30;
                const rowData = [
                    String(index + 1),
                    applicant.applicationNumber,
                    `${applicant.prefixName}${applicant.firstName} ${applicant.lastName}`,
                    applicant.phone,
                    applicant.program?.name || '-',
                    applicant.previousSchool,
                    statusMap[applicant.status] || applicant.status,
                ];
                rowData.forEach((cell, i) => {
                    doc
                        .fontSize(8)
                        .font('Helvetica')
                        .text(cell, xPos, y, {
                        width: colWidths[i],
                        ellipsis: true,
                    });
                    xPos += colWidths[i] + 10;
                });
                y += 18;
            });
            doc.end();
        });
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = ExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [applicant_service_1.ApplicantService])
], ExportService);
//# sourceMappingURL=export.service.js.map