import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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

    onClick() {
        this.clickCard.emit(this.product.slug);
    }
}