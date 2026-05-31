import { IsEnum, IsOptional, IsString, Matches, Length } from 'class-validator';

export enum PaymentMethod {
    CARD = 'CARD',
    TRANSFER = 'TRANSFER',
    CASH = 'CASH',
}

export class CheckoutDto {
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    @Matches(/^\d{16}$/, { message: 'Número de tarjeta debe tener 16 dígitos' })
    cardNumber?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{3,4}$/, { message: 'CVV inválido' })
    cvv?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Formato MM/YY requerido' })
    expiryDate?: string;

    @IsOptional()
    @IsString()
    @Length(1, 50)
    cardType?: string;
}