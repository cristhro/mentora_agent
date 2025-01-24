# Plugin Dify para Eliza

Este plugin permite integrar Eliza con [Dify.ai](https://dify.ai), permitiendo interactuar con los modelos de lenguaje configurados en tu cuenta de Dify.

## Instalación

```bash
npm install @elizaos/plugin-dify
```

## Configuración

1. Crea una cuenta en [Dify.ai](https://dify.ai) si aún no tienes una
2. Ve a la sección de configuración de API Keys en tu cuenta de Dify
3. Genera una nueva API key
4. Copia el archivo `.env.example` a `.env` y configura tu API key:

```env
DIFY_API_KEY=tu_api_key_aqui
```

## Uso

El plugin agrega el comando `!dify` que permite enviar mensajes a Dify.ai. Por ejemplo:

```
!dify ¿cuál es el clima hoy?
```

### Características

- Mantiene el contexto de la conversación automáticamente
- Manejo de errores robusto
- Respuestas síncronas
- Metadata incluida en las respuestas (IDs de conversación y mensaje)

### Ejemplos de Uso

```
!dify explícame qué es la inteligencia artificial
!dify ¿puedes resumir el último mensaje?
!dify traduce "hello world" al español
```

## Manejo de Errores

El plugin maneja varios tipos de errores comunes:

- API key no configurada o inválida
- Límites de rate limiting excedidos
- Errores de red o del servidor
- Problemas de formato en las respuestas

## Desarrollo

Para contribuir al desarrollo del plugin:

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Ejecuta el modo de desarrollo:

```bash
npm run dev
```

## Licencia

MIT
