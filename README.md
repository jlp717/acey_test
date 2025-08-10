# Acey Tennis Analytics

Acey is a tennis analytics application combining mobile video, wearable sensors, and an AI agent. All Phase 1 design documents are stored in the `docs/` directory:

- `docs/architecture.md` — overall system design
- `docs/requirements.md` — functional and non-functional requirements
- `docs/roadmap.md` — six‑month development plan
- `docs/initial-cost-plan.md` — preliminary budget
- `docs/sensor-prototype-plan.md` — early hardware strategy
- `docs/codebase-architecture.md` — project structure overview
- `docs/phase2-preparation.md` — next steps before acquiring hardware

These documents provide a reference for starting implementation with simulated sensor data.

## Configuración del agente de voz

Para que el agente de voz funcione se necesita una clave de la API de Hugging Face.

1. Crear un archivo `.env.local` en la raíz del proyecto con el contenido:

   ```bash
   HF_API_KEY=<token>
   ```

2. Guardar el archivo y reiniciar el servidor de desarrollo si estaba en ejecución:

   ```bash
   npm run dev
   ```

Una vez reiniciado, el agente de voz utilizará la clave configurada para generar respuestas.
