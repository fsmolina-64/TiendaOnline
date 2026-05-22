import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async generatePdf(orderId: string, userId: string, res: Response) {
    // Verificar que la orden existe y pertenece al usuario
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        invoice: true,
        user: {
          select: { name: true, email: true, address: true, city: true, province: true },
        },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.userId !== userId) throw new ForbiddenException('No tienes permiso');
    if (!order.invoice) throw new NotFoundException('Factura no disponible');

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="factura-${order.invoice.number}.pdf"`,
    );

    // Crear el PDF
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('TiendaOnline', 50, 50)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666')
      .text('Ecuador', 50, 80);

    // Título factura
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#1a1a2e')
      .text('FACTURA', 400, 50, { align: 'right' })
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666')
      .text(`N°: ${order.invoice.number}`, 400, 80, { align: 'right' })
      .text(`Fecha: ${new Date(order.invoice.issuedAt).toLocaleDateString('es-EC')}`, 400, 95, { align: 'right' });

    // Línea separadora
    doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#e0e0e0').stroke();

    // Datos del cliente
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#1a1a2e')
      .text('CLIENTE', 50, 140)
      .font('Helvetica')
      .fillColor('#333')
      .fontSize(10)
      .text(order.user.name, 50, 158)
      .text(order.user.email, 50, 173);

    if (order.address) {
      doc.text(`${order.address}, ${order.city}, ${order.province}`, 50, 188);
    }

    // Datos de la orden
    doc
      .font('Helvetica-Bold')
      .fillColor('#1a1a2e')
      .text('ORDEN', 350, 140)
      .font('Helvetica')
      .fillColor('#333')
      .text(`ID: #${order.id.slice(0, 8).toUpperCase()}`, 350, 158)
      .text(`Estado: ${this.getStatusLabel(order.status)}`, 350, 173);

    // Línea separadora
    doc.moveTo(50, 215).lineTo(550, 215).strokeColor('#e0e0e0').stroke();

    // Cabecera tabla productos
    doc
      .fillColor('#1a1a2e')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('PRODUCTO', 50, 230)
      .text('CANT.', 320, 230)
      .text('P. UNIT.', 380, 230)
      .text('DESCUENTO', 440, 230)
      .text('TOTAL', 510, 230);

    doc.moveTo(50, 245).lineTo(550, 245).strokeColor('#e0e0e0').stroke();

    // Items
    let y = 258;
    for (const item of order.items) {
      doc
        .font('Helvetica')
        .fillColor('#333')
        .fontSize(9)
        .text(item.product.name, 50, y, { width: 260 })
        .text(item.quantity.toString(), 330, y)
        .text(`$${Number(item.unitPrice).toFixed(2)}`, 380, y)
        .text(`${Number(item.discountPct)}%`, 450, y)
        .text(`$${(Number(item.finalPrice) * item.quantity).toFixed(2)}`, 510, y);
      y += 20;
    }

    // Línea separadora
    doc.moveTo(50, y + 5).lineTo(550, y + 5).strokeColor('#e0e0e0').stroke();

    // Totales
    y += 20;
    doc
      .font('Helvetica')
      .fillColor('#333')
      .fontSize(10)
      .text('Subtotal:', 400, y)
      .text(`$${Number(order.subtotal).toFixed(2)}`, 510, y);

    y += 18;
    doc
      .text('IVA (15%):', 400, y)
      .text(`$${Number(order.tax).toFixed(2)}`, 510, y);

    y += 18;
    doc
      .font('Helvetica-Bold')
      .fillColor('#1a1a2e')
      .fontSize(12)
      .text('TOTAL:', 400, y)
      .text(`$${Number(order.total).toFixed(2)}`, 510, y);

    // Footer
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#aaa')
      .text('Gracias por tu compra — TiendaOnline Ecuador', 50, 720, { align: 'center' });

    doc.end();
  }

  private getStatusLabel(status: string): string {
    const labels: any = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }
}