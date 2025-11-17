# Manual de Usuario de Hermes

Este manual te guía paso a paso para registrarte, iniciar sesión, crear planes de viaje, usar el calendario, agregar/editar/eliminar eventos y pedirle al agente (chat) que agende actividades por ti.

## Requisitos
- Cuenta activa y conexión a internet.
- Formatos:
  - Fecha: `YYYY-MM-DD` (ej. `2025-07-14`)
  - Hora: `HH:MM` en 24 horas (ej. `08:30`, `14:00`)
  - Costo: solo números; admite `.` o `,` como separador (ej. `120`, `89.50`, `89,50`).

## Registro
1. Abre la app y ve a `Cuenta`.
2. Pulsa `Registrarse`.
3. Ingresa tu `email` y una `contraseña` segura.
4. Pulsa `Crear cuenta`.
5. Revisa tu correo y verifica la cuenta si llega un email de confirmación.

![Captura: Pantalla de Registro](../assets/docs/registro.png)

## Inicio de Sesión
1. En `Cuenta`, pulsa `Iniciar sesión`.
2. Escribe tu `email` y `contraseña`.
3. Pulsa `Entrar`.
4. ¿Olvidaste tu contraseña? Pulsa `Recuperar`, recibe el correo y sigue el enlace.

![Captura: Pantalla de Inicio de Sesión](../assets/docs/login.png)

## Crear un Plan
1. Ve a `Planes`.
2. Pulsa `Agregar plan`.
3. Completa:
   - `Nombre del plan`: ej. “Europa Verano 2025”.
   - `Fecha de inicio`: `YYYY-MM-DD`.
   - `Fecha de fin`: `YYYY-MM-DD`.
   - `Destino` (opcional).
4. Pulsa `Guardar plan`.

Consejos:
- Usa nombres claros y únicos para facilitar pedidos al agente.
- Verifica que el rango de fechas cubra el viaje.

![Captura: Crear Plan](../assets/docs/crear-plan.png)

## Detalle del Plan y Calendario
- El calendario muestra todas las semanas del rango del plan (mínimo 5 semanas visibles).
- Los días con eventos aparecen marcados.
- Toca un día para ver sus eventos.

![Captura: Calendario del Plan](../assets/docs/calendario.png)

## Agregar un Evento Manualmente
1. En detalle del plan, pulsa `Agregar actividad`.
2. Completa:
   - Obligatorios:
     - `Fecha`: `YYYY-MM-DD` dentro del rango del plan.
     - `Inicio`: `HH:MM` (24h).
   - Opcionales:
     - `Fin`: `HH:MM`.
     - `Lugar`.
     - `Descripción`.
     - `Costo`: solo números; admite `.` o `,`.
3. Pulsa `Guardar actividad`.

Verificación:
- La fecha se marca en el calendario y el evento aparece en la lista del día.

![Captura: Formulario Agregar Evento](../assets/docs/agregar-evento.png)

## Editar un Evento
1. En la lista de “Eventos para <fecha>”, pulsa `Editar`.
2. Cambia los campos necesarios.
3. Pulsa `Guardar cambios`.

Notas:
- Si cambias la fecha, el evento se mueve a ese día y la vista cambia al nuevo día.
- El campo `Costo` solo acepta números y un separador decimal.

![Captura: Modal Editar Evento](../assets/docs/editar-evento.png)

## Eliminar un Evento
1. Pulsa `Eliminar` en el evento.
2. Marca la casilla de confirmación.
3. Pulsa `Eliminar`.

![Captura: Confirmación de Eliminación](../assets/docs/eliminar-evento.png)

## Agendar con el Agente (Chat)
Estructura recomendada de pedido:

> “Agenda [actividad] el [YYYY-MM-DD] a las [HH:MM] en [Lugar] para el viaje [Nombre del plan]. [Descripción opcional]. [Fin opcional]. [Costo opcional].”

Incluye siempre:
- `Nombre exacto del plan`.
- `Fecha` (`YYYY-MM-DD`).
- `Hora de inicio` (`HH:MM` 24h).

Ejemplos correctos:
- “Agenda visita al Louvre el 2025-07-14 a las 09:00 en París para el viaje Europa Verano 2025. Durará hasta las 12:00. Costo 20.”
- “Agenda cena el 2025-07-18 a las 20:30 para el viaje México 2025 en Pujol. Costo 1500.”
- “Agenda traslado al aeropuerto el 2025-07-14 a las 06:00 para el viaje Europa Verano 2025.”

Ejemplos a corregir:
- “Agenda museo mañana” → Falta plan y formatos.
- “Agenda comida 8 pm plan Europa” → Usa 24h y nombre completo.
- “Agenda tour 14/07/2025 9 am París” → Formatea fecha/hora.

![Captura: Chat con Agente](../assets/docs/chat-agente.png)

## Solución de Problemas
- No se guarda el evento:
  - Verifica `Fecha` y `Hora de inicio`.
  - Asegura que la fecha esté dentro del rango del plan.
  - Revisa conexión a internet.
- Costo inválido:
  - Debe ser numérico; usa `.` o `,` como separador.
- No ves el evento en el día:
  - Si cambiaste la fecha al editar, navega a ese día.
  - Refresca la pantalla o vuelve a entrar al plan.
- El plan no se identifica en el chat:
  - Usa el nombre exacto, añade destino o año si hay nombres similares.

## Cómo generar el PDF con capturas
1. Arranca la app (`npm run web`) y abre `http://localhost:8081/`.
2. Toma capturas de cada pantalla mencionada y guárdalas en `assets/docs/` con los nombres indicados (ej. `login.png`).
3. Abre `docs/ManualUsuario.html` en tu navegador.
4. Revisa que todas las imágenes se vean.
5. Imprime a PDF (Ctrl/Cmd+P → “Guardar como PDF”).