# 🎨 El Molino - Frontend Application

[⬅️ Volver al Inicio](../README.md)

El frontend de El Molino es una aplicación web moderna y reactiva construida con **Next.js**, diseñada para proporcionar una experiencia de usuario excepcional y visualmente atractiva.

## 🚀 Tecnologías Utilizadas
- **Framework**: Next.js 15 (App Router)
- **Librería UI**: React 19
- **Estilos**: Vanilla CSS con variables personalizadas y sistema de diseño **Glassmorphism**.
- **Gestión de Estado**: React Hooks (useState, useEffect).
- **Autenticación**: Sistema personalizado basado en sesiones y cookies.

## 💎 Diseño Visual (Premium)
La interfaz destaca por:
- **Efectos de Cristal (Glassmorphism)**: Transparencias y `backdrop-filter: blur`.
- **Modo Oscuro Integrado**: Una paleta de colores profunda y profesional.
- **Micro-animaciones**: Transiciones suaves en hover y estados de carga.
- **Iconografía**: Enfoque minimalista y tipografía "Inter" para máxima legibilidad.

## 🛠️ Instalación y Ejecución

1. **Navegar a la carpeta del proyecto**:
   ```bash
   cd Frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Organización de Archivos
- `src/app`: Rutas y páginas principales del sistema (Login, Home, Admin).
- `src/presentation`: Componentes de UI y hojas de estilo globales.
- `src/infrastructure`: Lógica de comunicación con la API y autenticación.
- `public`: Activos estáticos e imágenes generadas.

## 📡 Comunicación con el Backend
El frontend utiliza **API Routes** de Next.js como proxies para comunicarse de forma segura con el servidor .NET, manejando la inyección de TOKENS JWT de forma automática.
