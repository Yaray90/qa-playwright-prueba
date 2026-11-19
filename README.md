# Prueba técnica QA Automation — Playwright

Automatización de pruebas sobre dos aplicaciones públicas de práctica:

- **E2E** en [saucedemo.com](https://www.saucedemo.com) con Playwright + Page Object Model, en 3 navegadores.
- **API** en [restful-booker](https://restful-booker.herokuapp.com) con Playwright (`request`) y, además, con una colección de Postman ejecutable con Newman.
- **Carga** con JMeter sobre la misma API: 10 usuarios durante 1 minuto, con aserciones e informe HTML.
- **CI** con GitHub Actions, que ejecuta las pruebas de Playwright (E2E + API) en cada push.

## Requisitos

- Node.js (versión LTS)
- Para la prueba de carga: Java 8+ y Apache JMeter 5.6.3, con su carpeta `bin` añadida al `PATH`

## Instalación

```bash
npm ci
npx playwright install
```

## Cómo ejecutar

| Qué | Comando |
|---|---|
| Todo Playwright (E2E + API) | `npx playwright test` |
| Solo E2E en un navegador | `npx playwright test --project=firefox` |
| Solo API (Playwright) | `npx playwright test --project=api` |
| Informe HTML de Playwright | `npx playwright show-report` |
| API con Postman/Newman | `npm run test:postman` |
| Prueba de carga (JMeter) | `npm run test:load` |

La colección de Postman también se puede importar en Postman: `postman/restful-booker.postman_collection.json` junto con su environment.

El informe de JMeter queda en `jmeter/report/index.html`.

## Estructura

```
/pages              Page Objects de saucedemo (Login, Inventory, Cart, Checkout)
/tests              Pruebas E2E
/tests/api          Pruebas de API con Playwright
/postman            Colección y environment de Postman
/jmeter             Plan de carga (.jmx), resultados (.jtl) e informe HTML
/.github/workflows  Workflow de CI
```

## Cobertura

### E2E — saucedemo (10 casos × 3 navegadores = 30 ejecuciones)

| Archivo | Casos |
|---|---|
| `login.spec.js` | Login correcto · contraseña incorrecta · usuario bloqueado · usuario vacío · contraseña vacía |
| `cart.spec.js` | Añadir producto: el contador muestra 1 y el producto aparece en el carrito |
| `checkout.spec.js` | Compra completa hasta "Thank you for your order!" · validación de nombre, apellido y código postal obligatorios (data-driven) |

En los login fallidos verifico dos cosas: que se muestra el mensaje de error **y** que el usuario no accede al inventario.

### API — restful-booker (5 casos)

| Caso | Verificaciones |
|---|---|
| Crear | Status y body igual a lo enviado |
| Consultar | Status y contenido |
| Modificar con token | Status, body de respuesta y GET posterior (persistencia) |
| Borrar con token | Status y GET posterior con 404 |
| Modificar sin token | 403 y GET posterior que confirma que la reserva no cambió |

La colección de Postman cubre el mismo flujo de forma encadenada.

### Carga — JMeter

- 10 usuarios, ramp-up de 10 s, 60 s de duración.
- Cada usuario se autentica una vez; en cada iteración crea, consulta y borra una reserva, con 1 s de pausa entre peticiones.
- Aserciones de status en cada petición y de existencia de `bookingid`.

**Resultados** (ejecución del [FECHA]):

| Petición | Muestras | Error % | Mediana | p90 | p95 | p99 |
|---|---|---|---|---|---|---|
| Total | [ ] | [ ] | [ ] ms | [ ] ms | [ ] ms | [ ] ms |
| POST /auth | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| POST /booking | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| GET /booking/{id} | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| DELETE /booking/{id} | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

**Cómo interpretarlos:**
- El throughput (~7 peticiones/s) lo limita la pausa de 1 s del plan, no el servidor. La prueba mide cómo responde la API con 10 usuarios realistas, no su capacidad máxima.
- Los tiempos incluyen mi red (desde Cuba), no solo el servidor.
- Las primeras peticiones (POST /auth) son más lentas por el calentamiento. Algunos picos de ~3 s afectaron a varias peticiones a la vez, lo que apunta al servidor o a la red en ese instante.
- Al cortarse la prueba a los 60 s, algunas iteraciones quedan a medias y dejan unas pocas reservas sin borrar.

## CI

`.github/workflows/playwright.yml` ejecuta `npx playwright test` (E2E en 3 navegadores + API) en cada push y guarda el informe HTML como artefacto. JMeter y Newman se ejecutan en local: la carga no tiene sentido desde un runner compartido, y Newman duplica la cobertura de API que ya valida el CI.

## Decisiones

- **JavaScript**: el enunciado permitía TS, JS o Java; elegí JS para reducir la configuración con el tiempo limitado.
- **3 motores en lugar de 2**: Chromium, Firefox y WebKit. WebKit es el motor de Safari, pero **no es Safari real**: validar en Safari requeriría macOS.
- **Page Object Model**: las páginas exponen locators y acciones; las aserciones están solo en los tests. Un cambio de selector se corrige en un único sitio.
- **Selectores `data-test`**: son atributos pensados para testing y no se rompen con cambios de diseño o CSS.
- **Añadir al carrito por nombre visible**: se filtra la tarjeta por texto (`filter({ hasText })`) en lugar de construir el selector a partir del nombre.
- **`waitUntil: 'domcontentloaded'`** en la navegación: los tests solo necesitan el DOM y los locators ya esperan a cada elemento. Esperar al evento `load` causaba timeouts puntuales con mi conexión.
- **Reintentos solo en CI (2)**: las pruebas atacan aplicaciones públicas de terceros. Playwright marca como *flaky* los tests que pasan al reintentar, así que no quedan ocultos.
- **API con Playwright y con Postman**: el ejercicio pedía Playwright, y en mi trabajo habitual uso Postman/Newman. Playwright permite tener UI y API en la misma suite, informe y CI; la colección de Postman sirve para explorar la API a mano y ejecutarla con Newman.
- **Tests de API independientes**: cada test crea su propia reserva en el `beforeEach`, en lugar de encadenar crear → consultar → borrar. Así, si falla la creación, no arrastra a los demás. En Postman, en cambio, el flujo va encadenado, que es el patrón natural de una colección.
- **Status reales, no los del estándar**: restful-booker devuelve **200 al crear** (REST indica 201) y **201 al borrar** (REST indica 200/204). Los tests verifican lo que la API hace realmente; en un proyecto real lo reportaría como desviación del estándar.
- **JMeter**: login una vez por usuario (Once Only Controller), borrado al final de cada iteración para no dejar datos, *think time* de 1 s para simular usuarios reales, y *Start Next Thread Loop* tras un error para evitar errores en cascada.

## Incidencias del entorno

Trabajo desde Cuba, y la red afectó a dos cosas:
- **Descarga de navegadores**: el primer `npx playwright install` falló por timeouts y por un error de certificado TLS. Al reintentar instalando cada navegador por separado, funcionó.
- **Timeout intermitente en Firefox**: un test falló en `page.goto` esperando el evento `load`. El error mostraba que el test no llegó a interactuar con la página, así que lo clasifiqué como fallo de entorno y no del test (en CI pasaba). De ahí la decisión de usar `domcontentloaded`.

## Cómo usé la IA

Usé **Claude Code** para generar el código y **Claude (chat)** como segundo revisor, para cuestionar lo generado y entender cada parte. Yo dirigí qué se construía, ejecuté y validé cada bloque antes de commitear, y decidí qué correcciones aplicar. Playwright, JMeter y GitHub Actions eran herramientas nuevas para mí; aproveché la revisión también para aprenderlas.

**Qué le pedí**
- Page Objects con selectores `data-test` y sin aserciones.
- Tests E2E de login, carrito y checkout, incluidos casos negativos y validación data-driven.
- Tests de API con token, la colección de Postman y el plan de JMeter.
- Separar las pruebas de API en su propio proyecto de Playwright, para que no se ejecutaran en cada navegador.

**Qué acepté**
- La estructura de los Page Objects, los tests y la configuración base de Playwright.
- El diseño del plan de JMeter (auth una vez por usuario, flujo crear → consultar → borrar).

**Qué corregí**

*Código generado de más o frágil:*
- Métodos que no pedí y que ningún test usaba (`sortBy`, `removeFromCart`, `removeItem`, `continueShopping`): eliminados.
- Un helper que construía el selector a partir del nombre del producto: sustituido por la localización por texto visible.
- Bloques comentados de ejemplo en el config: eliminados.
- Aserciones redundantes en la API (tres `toBe` ya cubiertos por un `toEqual`): eliminadas.

*Huecos de cobertura (detectados en la revisión):*
- Los login fallidos no verificaban que el usuario no accede: añadí `not.toHaveURL`.
- La modificación por API no verificaba que el cambio persistía: añadí un GET posterior. Lo mismo en Postman, donde además faltaba confirmar que el PUT sin token no modificaba nada.
- No se probaba que la autenticación fuera obligatoria: añadí el caso sin token (403).

*Errores de la IA que verifiqué:*
- En un resumen afirmó haber creado un locator (`errorMessage` en `CheckoutPage`) que no existía. Desde entonces verifiqué el código, no los resúmenes.
- Dijo que había 9 escenarios; con `npx playwright test --list` comprobé que eran 10.
- Datos de prueba con un nombre real de persona: cambiados por datos neutros.

*JMeter:*
- El plan seguía ejecutando la iteración tras un error, lo que convertía un fallo en varios: cambiado a *Start Next Thread Loop*.
- Usaba el id dinámico en el nombre de las peticiones, lo que fragmentaba el informe en cientos de filas: cambiado a nombres estáticos para poder agregar los percentiles.

*Diagnóstico:*
- Ante el timeout intermitente no apliqué el arreglo típico de subir los timeouts: primero leí el error, identifiqué que era de red y cambié la estrategia de espera.

## Qué haría con más tiempo

- Mover la URL de saucedemo a `baseURL` para poder apuntar a otros entornos.
- Centralizar los datos de prueba (usuarios, contraseñas, payloads), que ahora se repiten en varios archivos.
- Añadir verificaciones intermedias en el checkout (totales, URL de cada paso).
- Limpiar las reservas creadas por los tests de API con un `afterEach`.
- Sacar las credenciales del repo (variables de entorno o secrets de CI). Aquí son las credenciales públicas de la demo.
- Probar los usuarios con fallos intencionados de saucedemo (`problem_user`, `error_user`, `performance_glitch_user`).
- Ejecutar Newman en el CI y publicar su informe.

## Tiempo invertido

Total: **[4h y 15m]**, desglosado:

Parte del tiempo fue aprendizaje: era la primera vez que usaba Playwright, JMeter y GitHub Actions.