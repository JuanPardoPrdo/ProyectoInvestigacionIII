using Microsoft.EntityFrameworkCore;
using ElMolino.Domain.Entities;

using ElMolino.Application.Interfaces;

namespace ElMolino.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Unidad> Unidades { get; set; } = null!;
        public DbSet<Persona> Personas { get; set; } = null!;
        public DbSet<EstadoCuenta> EstadosCuenta { get; set; } = null!;
        public DbSet<Recurso> Recursos { get; set; } = null!;
        public DbSet<Reserva> Reservas { get; set; } = null!;
        public DbSet<Incidente> Incidentes { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Defino mis llaves primarias y relaciones
            modelBuilder.Entity<Unidad>().HasKey(u => u.IdUnidad);
            modelBuilder.Entity<Persona>().HasKey(p => p.IdPersona);

            modelBuilder.Entity<Persona>()
                .HasOne(p => p.Unidad)
                .WithMany(u => u.Personas)
                .HasForeignKey(p => p.IdUnidad);

            modelBuilder.Entity<EstadoCuenta>().HasKey(ec => ec.IdMovimiento);
            modelBuilder.Entity<EstadoCuenta>()
                .HasOne(ec => ec.Persona)
                .WithMany(p => p.EstadosCuenta)
                .HasForeignKey(ec => ec.IdPersona);

            modelBuilder.Entity<Recurso>().HasKey(r => r.IdRecurso);

            modelBuilder.Entity<Reserva>().HasKey(res => res.IdReserva);
            modelBuilder.Entity<Reserva>()
                .HasOne(res => res.Persona)
                .WithMany(p => p.Reservas)
                .HasForeignKey(res => res.IdPersona);

            modelBuilder.Entity<Reserva>()
                .HasOne(res => res.Recurso)
                .WithMany(r => r.Reservas)
                .HasForeignKey(res => res.IdRecurso);

            modelBuilder.Entity<Incidente>().HasKey(i => i.IdIncidente);
            modelBuilder.Entity<Incidente>()
                .HasOne(i => i.Reserva)
                .WithMany(res => res.Incidentes)
                .HasForeignKey(i => i.IdReserva);

            // Datos iniciales para pruebas
            modelBuilder.Entity<Unidad>().HasData(
                new Unidad { IdUnidad = 1, NumeroUnidad = "A-101", BloqueTorre = "Edificio Central" },
                new Unidad { IdUnidad = 2, NumeroUnidad = "A-102", BloqueTorre = "Edificio Central" }
            );

            // Hash de "password123" para no renegar con cambios en el modelo de EF
            string staticHash = "$2a$11$SHIal0uurHUo5pOVK68iduvUzVamSn9tXomKKmkp61CJ2e/dsTc2W";

            modelBuilder.Entity<Persona>().HasData(
                new Persona { IdPersona = 1, IdUnidad = 1, NombreCompleto = "Super Admin", Documento = "0000000000", Rol = "Administrador", Email = "admin@elmolino.com", Estado = 1, PasswordHash = staticHash },
                new Persona { IdPersona = 2, IdUnidad = 2, NombreCompleto = "Juan Perez", Documento = "1111111111", Rol = "Residente", Email = "juan@residente.com", Estado = 1, PasswordHash = staticHash },
                new Persona { IdPersona = 3, IdUnidad = 2, NombreCompleto = "Pedro Inactivo", Documento = "2222222222", Rol = "Residente", Email = "pedro@residente.com", Estado = 0, PasswordHash = staticHash }
            );

            modelBuilder.Entity<Recurso>().HasData(
                new Recurso { IdRecurso = 1, Nombre = "Piscina Principal", Tipo = "Zona Humeda", CostoPorReserva = 10000, EstadoFisico = "Disponible" },
                new Recurso { IdRecurso = 2, Nombre = "Salon Comunal", Tipo = "Espacio Cerrado", CostoPorReserva = 50000, EstadoFisico = "Disponible" }
            );
        }
    }
}
