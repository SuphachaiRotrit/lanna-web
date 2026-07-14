import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Controller('api/admin/faculties')
@UseGuards(JwtAuthGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  async findAll() {
    return this.facultyService.findAll();
  }

  @Post()
  async create(@Body() data: CreateFacultyDto) {
    return this.facultyService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateFacultyDto) {
    return this.facultyService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.facultyService.remove(id);
  }
}
