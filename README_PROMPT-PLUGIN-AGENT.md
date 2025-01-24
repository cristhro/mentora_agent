# Guía de Desarrollo de Plugins para Eliza

## Pasos Básicos para Crear un Plugin

1. Copia [text](packages/plugin-bootstrap) a un plugin de agente
2. Cambia el nombre al paquete en el package.json del plugin
3. Añade el nuevo plugin a las dependencias package.json de agent
4. Instalar las dependencias usando pnpm install --no-frozen-lockfile
5. Incluirlo en agent/src/index.ts en AgentRuntime plugins

## Estructura del Plugin

Cada plugin en Eliza debe implementar la interfaz `Plugin` con las siguientes propiedades:

```typescript
interface Plugin {
    name: string; // Identificador único para el plugin
    description: string; // Breve descripción de la funcionalidad
    actions?: Action[]; // Acciones personalizadas proporcionadas por el plugin
    evaluators?: Evaluator[]; // Evaluadores personalizados para evaluación de comportamiento
    providers?: Provider[]; // Proveedores de contexto para generación de mensajes
    services?: Service[]; // Servicios adicionales (opcional)
}
```

## Desarrollo del Plugin

### Estructura de Archivos Recomendada

```
plugin-nombre/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── actions/
    ├── evaluators/
    ├── providers/
    └── services/
```

### Configuración Básica

1. **package.json**

```json
{
    "name": "@elizaos/plugin-nombre",
    "version": "0.1.0",
    "main": "dist/index.js",
    "type": "module",
    "types": "dist/index.d.ts",
    "dependencies": {
        "@elizaos/core": "workspace:*"
    },
    "scripts": {
        "build": "tsup --format esm --dts",
        "dev": "tsup --format esm --dts --watch",
        "lint": "eslint --fix --cache ."
    }
}
```

2. **tsconfig.json**

```json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src"
    },
    "include": ["src"]
}
```

### Implementación del Plugin

```typescript
// src/index.ts
import { Plugin } from "@elizaos/core";

export const miPlugin: Plugin = {
    name: "mi-plugin",
    description: "Descripción de mi plugin",
    actions: [], // Implementa tus acciones
    evaluators: [], // Implementa tus evaluadores
    providers: [], // Implementa tus proveedores
    services: [], // Implementa tus servicios
};
```

## Mejores Prácticas

1. **Modularidad**: Mantén los plugins enfocados en funcionalidades específicas
2. **Dependencias**: Documenta claramente cualquier dependencia externa
3. **Manejo de Errores**: Implementa un manejo robusto de errores
4. **Documentación**: Proporciona documentación clara para acciones y evaluadores
5. **Pruebas**: Incluye pruebas para la funcionalidad del plugin

## Variables de Entorno

Si tu plugin requiere variables de entorno, asegúrate de:

1. Documentarlas en el README.md
2. Proporcionar un archivo .env.example
3. Validar su presencia en tiempo de ejecución

## Integración con el Agente

Después de crear el plugin:

1. Asegúrate de que esté listado en las dependencias de agent/package.json
2. Importa el plugin en agent/src/index.ts
3. Añádelo al array de plugins en AgentRuntime, preferiblemente condicionado a la presencia de las variables de entorno necesarias

## Documentación

Tu plugin debe incluir:

1. README.md con:
    - Descripción general
    - Instrucciones de instalación
    - Configuración requerida
    - Ejemplos de uso
    - Documentación de API
2. Comentarios en el código para funciones y métodos importantes
3. Ejemplos de implementación

## Contribución

Para contribuir un nuevo plugin:

1. Sigue las pautas de estructura del plugin
2. Incluye documentación completa
3. Añade pruebas para toda la funcionalidad
4. Envía un pull request
5. Actualiza el registro de plugins

Para documentación detallada de la API y ejemplos, consulta la [Referencia de API](/api).
