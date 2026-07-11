import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async estimate(addressId: string) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Dirección no encontrada');
    if (!address.latitude || !address.longitude) {
      throw new NotFoundException('La dirección no tiene coordenadas registradas');
    }

    const warehouse = await this.prisma.warehouse.findFirst({ where: { isActive: true } });
    if (!warehouse) throw new NotFoundException('No hay una bodega activa configurada');

    const origin = { latitude: warehouse.latitude, longitude: warehouse.longitude };
    const dest = { latitude: address.latitude, longitude: address.longitude };

    try {
      return await this.estimateWithOSRM(origin, dest);
    } catch {
      return this.estimateWithHaversine(origin, dest);
    }
  }

  private async estimateWithOSRM(warehouse: { latitude: number; longitude: number }, address: { latitude: number; longitude: number }) {
    const url =
      `https://router.project-osrm.org/route/v1/driving/${warehouse.longitude},${warehouse.latitude};${address.longitude},${address.latitude}?overview=false`;

    const { data } = await axios.get(url, { timeout: 5000 });

    if (!data.routes || data.routes.length === 0) {
      throw new Error('OSRM no encontró una ruta');
    }

    const route = data.routes[0];
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const durationMin = Math.ceil(route.duration / 60);

    return {
      distanceKm,
      durationMin,
      estimatedArrival: this.formatEstimatedArrival(durationMin),
      method: 'osrm',
    };
  }

  private estimateWithHaversine(warehouse: { latitude: number; longitude: number }, address: { latitude: number; longitude: number }) {
    const R = 6371;
    const dLat = this.toRad(address.latitude - warehouse.latitude);
    const dLon = this.toRad(address.longitude - warehouse.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(warehouse.latitude)) *
        Math.cos(this.toRad(address.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const linearKm = Math.round(R * c * 10) / 10;

    // Velocidad promedio en ciudad ~30 km/h
    const avgSpeedKmh = 30;
    const estimatedMinutes = Math.ceil((linearKm / avgSpeedKmh) * 60);

    return {
      distanceKm: linearKm,
      durationMin: estimatedMinutes,
      estimatedArrival: this.formatEstimatedArrival(estimatedMinutes),
      method: 'haversine',
    };
  }

  private formatEstimatedArrival(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
