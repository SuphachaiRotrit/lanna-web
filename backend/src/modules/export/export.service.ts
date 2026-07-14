import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ApplicantService } from '../applicant/applicant.service';
import { StatusFilterDto } from '../applicant/dto/query-applicant.dto';

interface ExportQuery {
  status?: StatusFilterDto;
  year?: number;
  programId?: string;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly applicantService: ApplicantService) {}

  /**
   * Export to Excel
   */
  async exportExcel(query: ExportQuery, ids?: string[]): Promise<Buffer> {
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

    // Define columns
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

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B1A1A' }, // Maroon
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Gender mapping
    const genderMap: Record<string, string> = {
      MALE: 'ชาย',
      FEMALE: 'หญิง',
      OTHER: 'อื่นๆ',
    };

    // Status mapping
    const statusMap: Record<string, string> = {
      PENDING: 'รอตรวจสอบ',
      REVIEWING: 'กำลังตรวจสอบ',
      APPROVED: 'อนุมัติ',
      REJECTED: 'ไม่อนุมัติ',
      CANCELLED: 'ยกเลิก',
    };

    // Add data
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
        faculty: applicant.program?.faculty?.name || '-',
        status: statusMap[applicant.status] || applicant.status,
        submittedAt: applicant.submittedAt.toLocaleDateString('th-TH'),
      });
    }

    // Auto-filter
    sheet.autoFilter = {
      from: 'A1',
      to: `U${applicants.length + 1}`,
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export to PDF
   */
  async exportPdf(query: ExportQuery, ids?: string[]): Promise<Buffer> {
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

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fontSize(16).text('มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา', {
        align: 'center',
      });
      doc.fontSize(14).text('รายชื่อผู้สมัครเรียน', { align: 'center' });
      doc.moveDown();

      // Status mapping
      const statusMap: Record<string, string> = {
        PENDING: 'รอตรวจสอบ',
        REVIEWING: 'กำลังตรวจสอบ',
        APPROVED: 'อนุมัติ',
        REJECTED: 'ไม่อนุมัติ',
        CANCELLED: 'ยกเลิก',
      };

      // Summary
      doc.fontSize(10);
      doc.text(`จำนวนผู้สมัครทั้งหมด: ${applicants.length} คน`);
      doc.text(`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`);
      doc.moveDown();

      // Table header
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

      doc
        .moveTo(30, tableTop + 15)
        .lineTo(790, tableTop + 15)
        .stroke();

      // Table rows
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
          doc.fontSize(8).font('Helvetica').text(cell, xPos, y, {
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
}
