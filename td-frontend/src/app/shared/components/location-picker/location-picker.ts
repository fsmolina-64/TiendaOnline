import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, afterNextRender, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  province: string;
  city: string;
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-picker.html',
  styleUrl: './location-picker.css',
})
export class LocationPicker implements OnChanges, OnDestroy {
  @Input() initialLat?: number;
  @Input() initialLng?: number;
  @Input() initialAddress?: string;
  @Output() locationChange = new EventEmitter<LocationResult | null>();

  loadingAddress = false;
  selectedAddress = '';
  hasMarker = signal(false);
  map: any;
  marker: any;
  private leaflet: any;
  private resizeObserver?: ResizeObserver;

  constructor(private host: ElementRef, private zone: NgZone) {
    afterNextRender(() => {
      this.initMap();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const latChanged = changes['initialLat'] && !changes['initialLat'].firstChange;
    const lngChanged = changes['initialLng'] && !changes['initialLng'].firstChange;
    if (!latChanged && !lngChanged) return;
    if (!this.map) return;

    if (this.initialLat != null && this.initialLng != null) {
      this.syncMarkerFromInputs(this.initialLat, this.initialLng);
    } else {
      this.resetMarker();
    }
  }

  async initMap() {
    const container = this.host.nativeElement.querySelector('.map-container') as HTMLElement;
    if (!container) return;

    try {
      const L = await import('leaflet');
      this.leaflet = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const cuenca: [number, number] = [-2.9006, -79.0046];

      this.map = L.map(container, {
        center: this.initialLat && this.initialLng ? [this.initialLat, this.initialLng] : cuenca,
        zoom: this.initialLat && this.initialLng ? 16 : 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      if (this.initialLat && this.initialLng) {
        this.placeMarker(this.initialLat, this.initialLng);
        this.selectedAddress = this.initialAddress ?? '';
        if (!this.selectedAddress) {
          this.reverseGeocode(this.initialLat, this.initialLng);
        }
      }

      this.map.on('click', (e: any) => {
        this.zone.run(() => {
          this.addMarker(e.latlng.lat, e.latlng.lng);
        });
      });

      this.resizeObserver = new ResizeObserver(() => {
        this.map?.invalidateSize();
      });
      this.resizeObserver.observe(container);
    } catch {
      /* Leaflet failed to load */
    }
  }

  private placeMarker(lat: number, lng: number) {
    const L = this.leaflet;
    if (!L || !this.map) return;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        this.zone.run(() => {
          this.reverseGeocode(pos.lat, pos.lng);
        });
      });
    }
    this.hasMarker.set(true);
  }

  private removeMarkerFromMap() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    this.hasMarker.set(false);
    this.selectedAddress = '';
  }

  private addMarker(lat: number, lng: number) {
    this.placeMarker(lat, lng);
    this.reverseGeocode(lat, lng);
  }

  private syncMarkerFromInputs(lat: number, lng: number) {
    this.map.setView([lat, lng], 16);
    this.placeMarker(lat, lng);
    this.selectedAddress = this.initialAddress ?? this.selectedAddress;
  }

  private resetMarker() {
    this.removeMarkerFromMap();
  }

  clearMarker() {
    this.removeMarkerFromMap();
    this.locationChange.emit(null);
  }

  async reverseGeocode(lat: number, lng: number) {
    this.loadingAddress = true;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`,
      );
      const data = await res.json();
      const addr = data.address || {};
      const displayName = data.display_name || `${lat}, ${lng}`;
      this.selectedAddress = displayName;

      this.locationChange.emit({
        lat,
        lng,
        address: displayName,
        province: addr.state || addr.region || addr.province || 'Azuay',
        city: addr.city || addr.town || addr.village || addr.county || 'Cuenca',
      });
    } catch {
      this.selectedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      this.locationChange.emit({
        lat,
        lng,
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        province: 'Azuay',
        city: 'Cuenca',
      });
    }
    this.loadingAddress = false;
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.map) {
      this.map.remove();
    }
  }
}
