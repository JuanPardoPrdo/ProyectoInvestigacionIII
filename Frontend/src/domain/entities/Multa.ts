export interface Multa {
    idIncidente: number;
    idReserva: number;
    idPersona: number;
    nombreResidente: string;
    documentoResidente: string;
    nombreRecurso: string;
    descripcionDano: string;
    montoMulta: number;
    fechaReporte: string;
    pagado: boolean;
    fechaPago?: string;
    idMovimiento?: number;
}

export interface CrearMultaDto {
    idReserva: number;
    descripcionDano: string;
    montoMulta: number;
}
