# ⚙️ El Molino - Backend API

[⬅️ Volver al Inicio](../README.md)

Esta es la capa de servicios y persistencia del sistema El Molino, construida con **.NET Core** siguiendo los principios de **Clean Architecture** para asegurar escalabilidad y mantenibilidad.

## 🚀 Tecnologías Utilizadas
- **Lenguaje**: C# (.NET 10)
- **Framework Web**: ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Base de Datos**: SQLite (Persistence local)
- **Seguridad**: JWT (JSON Web Tokens) para autenticación y roles de usuario.
- **Otras Librerías**: BCrypt.Net-Next (Hasheo de contraseñas).

## 🏗️ Arquitectura
El proyecto está dividido en capas para separar la lógica de negocio de la infraestructura:
- **ElMolino.Domain**: Entidades base del sistema (Reserva, Recurso, Persona).
- **ElMolino.Application**: Lógica de aplicación, DTOs e interfaces de servicios.
- **ElMolino.Infrastructure**: Implementación de base de datos (DbContext) y repositorios.
- **ElMolino.API**: Controladores REST y configuración del servidor.

## 🛠️ Instalación y Ejecución

1. **Navegar a la carpeta del proyecto**:
   ```bash
   cd Backend/ElMolino.API
   ```

2. **Restaurar dependencias**:
   ```bash
   dotnet restore
   ```

3. **Ejecutar la aplicación**:
   ```bash
   dotnet run
   ```
   La API estará disponible en `http://localhost:5080`.

## 📦 Dependencias Principales
- `Microsoft.EntityFrameworkCore.Sqlite`
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `BCrypt.Net-Next`

## 🔑 Autenticación
El sistema utiliza roles para proteger endpoints específicos:
- `Administrador`: Acceso total a la gestión de recursos.
- `Residente`: Permisos para gestionar reservas personales.
