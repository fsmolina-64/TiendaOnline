import { Controller, Get, Param, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get(':orderId/download')
  download(
    @Param('orderId') orderId: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    return this.invoicesService.generatePdf(orderId, req.user.id, res);
  }
}