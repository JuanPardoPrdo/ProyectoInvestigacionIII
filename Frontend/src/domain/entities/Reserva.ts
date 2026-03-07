export interface Reserva {
    idReserva?: number;
    idPersona: number;
    idRecurso: number;
    fechaInicio: Date;
    fechaFin: Date;
    costoTotal?: number;
    estadoReserva?: string;
}

export interface Recurso {
    idRecurso: number;
    nombre: string;
    tipo: string;
    costoPorReserva: number;
    estadoFisico: string;
}

// Representa el Paz y Salvo
export interface EstadoCuentaPersona {
    idPersona: number;
    saldoPendiente: number;
    esPazYSalvo: boolean;
}
