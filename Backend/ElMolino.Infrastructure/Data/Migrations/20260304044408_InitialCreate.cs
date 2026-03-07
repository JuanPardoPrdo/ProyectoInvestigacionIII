using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ElMolino.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Recursos",
                columns: table => new
                {
                    IdRecurso = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Tipo = table.Column<string>(type: "TEXT", nullable: false),
                    CostoPorReserva = table.Column<decimal>(type: "TEXT", nullable: false),
                    EstadoFisico = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recursos", x => x.IdRecurso);
                });

            migrationBuilder.CreateTable(
                name: "Unidades",
                columns: table => new
                {
                    IdUnidad = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NumeroUnidad = table.Column<string>(type: "TEXT", nullable: false),
                    BloqueTorre = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unidades", x => x.IdUnidad);
                });

            migrationBuilder.CreateTable(
                name: "Personas",
                columns: table => new
                {
                    IdPersona = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdUnidad = table.Column<int>(type: "INTEGER", nullable: false),
                    NombreCompleto = table.Column<string>(type: "TEXT", nullable: false),
                    Documento = table.Column<string>(type: "TEXT", nullable: false),
                    Rol = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: true),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personas", x => x.IdPersona);
                    table.ForeignKey(
                        name: "FK_Personas_Unidades_IdUnidad",
                        column: x => x.IdUnidad,
                        principalTable: "Unidades",
                        principalColumn: "IdUnidad",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EstadosCuenta",
                columns: table => new
                {
                    IdMovimiento = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdPersona = table.Column<int>(type: "INTEGER", nullable: false),
                    Concepto = table.Column<string>(type: "TEXT", nullable: false),
                    Monto = table.Column<decimal>(type: "TEXT", nullable: false),
                    FechaGeneracion = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Pagado = table.Column<bool>(type: "INTEGER", nullable: false),
                    FechaPago = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadosCuenta", x => x.IdMovimiento);
                    table.ForeignKey(
                        name: "FK_EstadosCuenta_Personas_IdPersona",
                        column: x => x.IdPersona,
                        principalTable: "Personas",
                        principalColumn: "IdPersona",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reservas",
                columns: table => new
                {
                    IdReserva = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdPersona = table.Column<int>(type: "INTEGER", nullable: false),
                    IdRecurso = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CostoTotal = table.Column<decimal>(type: "TEXT", nullable: false),
                    EstadoReserva = table.Column<string>(type: "TEXT", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservas", x => x.IdReserva);
                    table.ForeignKey(
                        name: "FK_Reservas_Personas_IdPersona",
                        column: x => x.IdPersona,
                        principalTable: "Personas",
                        principalColumn: "IdPersona",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reservas_Recursos_IdRecurso",
                        column: x => x.IdRecurso,
                        principalTable: "Recursos",
                        principalColumn: "IdRecurso",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Incidentes",
                columns: table => new
                {
                    IdIncidente = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdReserva = table.Column<int>(type: "INTEGER", nullable: false),
                    DescripcionDano = table.Column<string>(type: "TEXT", nullable: false),
                    CostoReparacion = table.Column<decimal>(type: "TEXT", nullable: false),
                    FechaReporte = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidentes", x => x.IdIncidente);
                    table.ForeignKey(
                        name: "FK_Incidentes_Reservas_IdReserva",
                        column: x => x.IdReserva,
                        principalTable: "Reservas",
                        principalColumn: "IdReserva",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Recursos",
                columns: new[] { "IdRecurso", "CostoPorReserva", "EstadoFisico", "Nombre", "Tipo" },
                values: new object[,]
                {
                    { 1, 10000m, "Disponible", "Piscina Principal", "Zona Humeda" },
                    { 2, 50000m, "Disponible", "Salon Comunal", "Espacio Cerrado" }
                });

            migrationBuilder.InsertData(
                table: "Unidades",
                columns: new[] { "IdUnidad", "BloqueTorre", "NumeroUnidad" },
                values: new object[,]
                {
                    { 1, "Edificio Central", "A-101" },
                    { 2, "Edificio Central", "A-102" }
                });

            migrationBuilder.InsertData(
                table: "Personas",
                columns: new[] { "IdPersona", "Documento", "Email", "Estado", "IdUnidad", "NombreCompleto", "PasswordHash", "Rol" },
                values: new object[,]
                {
                    { 1, "0000000000", "admin@elmolino.com", 1, 1, "Super Admin", "$2a$11$Kk3H1F15C6/i2.zVq4TExuXQQz.s/I3XkYlI5Rzv1P.K/P8D.KyyO", "Administrador" },
                    { 2, "1111111111", "juan@residente.com", 1, 2, "Juan Perez", "$2a$11$Kk3H1F15C6/i2.zVq4TExuXQQz.s/I3XkYlI5Rzv1P.K/P8D.KyyO", "Residente" },
                    { 3, "2222222222", "pedro@residente.com", 0, 2, "Pedro Inactivo", "$2a$11$Kk3H1F15C6/i2.zVq4TExuXQQz.s/I3XkYlI5Rzv1P.K/P8D.KyyO", "Residente" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_EstadosCuenta_IdPersona",
                table: "EstadosCuenta",
                column: "IdPersona");

            migrationBuilder.CreateIndex(
                name: "IX_Incidentes_IdReserva",
                table: "Incidentes",
                column: "IdReserva");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_IdUnidad",
                table: "Personas",
                column: "IdUnidad");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_IdPersona",
                table: "Reservas",
                column: "IdPersona");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_IdRecurso",
                table: "Reservas",
                column: "IdRecurso");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EstadosCuenta");

            migrationBuilder.DropTable(
                name: "Incidentes");

            migrationBuilder.DropTable(
                name: "Reservas");

            migrationBuilder.DropTable(
                name: "Personas");

            migrationBuilder.DropTable(
                name: "Recursos");

            migrationBuilder.DropTable(
                name: "Unidades");
        }
    }
}
