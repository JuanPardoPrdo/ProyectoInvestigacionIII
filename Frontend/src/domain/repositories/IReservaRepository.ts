import { Reserva, Recurso, EstadoCuentaPersona } from '../entities/Reserva';

export interface IReservaRepository {
    crearReserva(reserva: Reserva): Promise<Reserva>;
    obtenerReservasPorPersona(idPersona: number): Promise<Reserva[]>;
    obtenerTodasLasReservas(): Promise<Reserva[]>;
    cancelarReserva(idReserva: number): Promise<Reserva>;
    verificarConflictoHorario(idRecurso: number, fechaInicio: Date, fechaFin: Date): Promise<boolean>;
}

export interface IRecursoRepository {
    obtenerRecursosDisponibles(): Promise<Recurso[]>;
    obtenerRecursoPorId(idRecurso: number): Promise<Recurso | null>;
}

export interface IEstadoCuentaRepository {
    verificarPazYSalvo(idPersona: number): Promise<EstadoCuentaPersona>;
}
