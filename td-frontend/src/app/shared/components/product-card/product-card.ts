import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-card.html',
    styleUrl: './product-card.css'
})
export class ProductCard {
    @Input() product: any;
    @Output() clickCard = new EventEmitter<string>();

    getImageUrl(url: string): string {
        if (!url) return '';
        return url.startsWith('http') ? url : environment.apiUrl + url;
    }

    onClick() {
        this.clickCard.emit(this.product.slug);
    }
}