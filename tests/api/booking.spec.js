// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Pruebas de API contra restful-booker (https://restful-booker.herokuapp.com).
 * Usan el fixture `request` de Playwright. El baseURL lo aporta el proyecto
 * 'api' definido en playwright.config.js.
 */
test.describe('Booking API', () => {
  // Payload base que se usa para crear la reserva en cada test.
  const bookingPayload = {
    firstname: 'Test',
    lastname: 'User',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-01-01',
      checkout: '2026-01-10',
    },
    additionalneeds: 'Breakfast',
  };

  let token;
  let bookingid;

  test.beforeEach(async ({ request }) => {
    // 1) Obtener el token de autenticación.
    const authResponse = await request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(authResponse.status()).toBe(200);
    token = (await authResponse.json()).token;
    expect(token).toBeTruthy();

    // 2) Crear una reserva nueva para que cada test tenga su propio bookingid.
    const createResponse = await request.post('/booking', {
      data: bookingPayload,
    });
    expect(createResponse.status()).toBe(200);
    bookingid = (await createResponse.json()).bookingid;
    expect(bookingid).toBeTruthy();
  });

  test('crear: el body devuelto coincide con lo enviado', async ({ request }) => {
    const response = await request.post('/booking', {
      data: bookingPayload,
    });

    // La API devuelve 200 (no el 201 que dictaría REST para una creación).
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.bookingid).toBeTruthy();
    // El objeto `booking` devuelto debe reflejar exactamente lo enviado.
    expect(body.booking).toEqual(bookingPayload);
  });

  test('consultar: GET devuelve la reserva creada', async ({ request }) => {
    const response = await request.get(`/booking/${bookingid}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual(bookingPayload);
  });

  test('modificar: PUT con cookie token actualiza los campos', async ({ request }) => {
    const updatedPayload = {
      ...bookingPayload,
      firstname: 'Modified',
      lastname: 'Booking',
      totalprice: 999,
    };

    const response = await request.put(`/booking/${bookingid}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${token}`,
      },
      data: updatedPayload,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual(updatedPayload);

    // El GET posterior confirma que los cambios quedaron persistidos.
    const getResponse = await request.get(`/booking/${bookingid}`);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toEqual(updatedPayload);
  });

  test('borrar: DELETE con token elimina la reserva y luego GET da 404', async ({ request }) => {
    const deleteResponse = await request.delete(`/booking/${bookingid}`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`,
      },
    });

    // La API devuelve 201 (no el 204/200 que dictaría REST para un borrado).
    expect(deleteResponse.status()).toBe(201);

    // Tras borrar, la reserva ya no existe: GET devuelve 404.
    const getResponse = await request.get(`/booking/${bookingid}`);
    expect(getResponse.status()).toBe(404);
  });

  test('modificar sin token: PUT devuelve 403 y la reserva no cambia', async ({ request }) => {
    const updatedPayload = {
      ...bookingPayload,
      firstname: 'ShouldNot',
      lastname: 'Change',
      totalprice: 1,
    };

    // PUT sin cookie de token: la API lo rechaza con 403 Forbidden.
    const putResponse = await request.put(`/booking/${bookingid}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: updatedPayload,
    });

    expect(putResponse.status()).toBe(403);

    // El GET posterior confirma que la reserva sigue con los datos originales.
    const getResponse = await request.get(`/booking/${bookingid}`);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toEqual(bookingPayload);
  });
});
