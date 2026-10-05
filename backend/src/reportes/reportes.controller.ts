import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequierePermisos } from '../auth/roles.decorator';
import { Permiso } from '../auth/permissions';

@ApiTags('Reportes y Dashboard')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @ApiOperation({ summary: 'Resumen financiero y kpis del dashboard' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.FINANZAS_VIEW)
  @ApiBearerAuth()
  @Get('dashboard')
  async getDashboardSummary() {
    return this.reportesService.getDashboardSummary();
  }

  @ApiOperation({ summary: 'Piezas y repuestos más utilizados en repuestos / reparaciones' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.FINANZAS_VIEW)
  @ApiBearerAuth()
  @Get('piezas-mas-usadas')
  async getPiezasMasUtilizadas() {
    return this.reportesService.getPiezasMasUtilizadas();
  }

  @ApiOperation({ summary: 'Exportar catálogo de inventario completo a archivo Excel (.xlsx)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.INVENTARIO_VIEW)
  @ApiBearerAuth()
  @Get('exportar-inventario')
  async exportarInventario(@Res() res: Response) {
    const buffer = await this.reportesService.exportarInventarioExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Lubripoint_Inventario.xlsx');
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Exportar historial de ventas y órdenes a archivo Excel (.xlsx)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.FINANZAS_VIEW)
  @ApiBearerAuth()
  @Get('exportar-ventas')
  async exportarVentas(@Res() res: Response) {
    const buffer = await this.reportesService.exportarOrdenesExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Lubripoint_Historial_Ventas.xlsx');
    res.send(buffer);
  }
}
