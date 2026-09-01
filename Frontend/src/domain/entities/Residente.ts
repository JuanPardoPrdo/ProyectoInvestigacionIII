export interface Residente {
    idPersona: number;
    idUnidad: number;
    numeroUnidad: string;
    bloqueTorre?: string;
    nombreCompleto: string;
    documento: string;
    rol: string;
    email?: string;
    estado: number;
}

export interface Unidad {
    idUnidad: number;
    numeroUnidad: string;
    bloqueTorre?: string;
}

export interface CrearResidenteDto {
    idUnidad: number;
    nombreCompleto: string;
    documento: string;
    email: string;
    password: string;
    rol?: string;
    estado?: number;
}

export interface ActualizarResidenteDto {
    idUnidad: number;
    nombreCompleto: string;
    documento: string;
    email: string;
    password?: string;
    rol?: string;
    estado?: number;
}
