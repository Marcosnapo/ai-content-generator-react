// src/api.js
// Este archivo configura el cliente Axios para interactuar con tu API FastAPI.

import axios from 'axios';

// Define la URL base de tu API FastAPI desplegada en Render.
// ¡IMPORTANTE! Reemplaza con la URL de tu servicio web en Render.
// Ejemplo: const API_BASE_URL = 'https://fastapi-clean-api.onrender.com';
const API_BASE_URL = 'https://fastapi-clean-api.onrender.com'; // <-- ¡Asegúrate de que esta sea TU URL de Render!

// Crea una instancia de Axios con la URL base configurada.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // Por defecto, enviamos JSON
  },
});

// Interceptor para añadir el token de autenticación a cada petición.
// Esto es crucial para las rutas protegidas de tu API.
api.interceptors.request.use(
  (config) => {
    // Obtiene el token de acceso del almacenamiento local (donde lo guardaremos al iniciar sesión).
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Si hay un token, lo añade al encabezado 'Authorization' como un token Bearer.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Devuelve la configuración de la petición modificada.
  },
  (error) => {
    // Maneja cualquier error que ocurra antes de enviar la petición.
    return Promise.reject(error);
  }
);

// Exporta la instancia de Axios configurada para usarla en otros componentes.
export default api;
