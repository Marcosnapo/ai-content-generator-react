// src/components/AuthForm.jsx
// Este componente maneja el formulario de registro e inicio de sesión.

import React, { useState } from 'react';
import api from '../api'; // Importa la instancia de Axios configurada

function AuthForm({ onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar entre registro e inicio de sesión
  const [username, setUsername] = useState(''); // Estado para el nombre de usuario
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [message, setMessage] = useState(''); // Estado para mensajes de éxito/error

  // Maneja el envío del formulario (registro o login)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recarga de página)
    setMessage(''); // Limpia mensajes anteriores

    try {
      let response;
      if (isRegistering) {
        // Si está en modo registro, llama a la ruta /register de la API
        response = await api.post('/register', { username, password });
        setMessage('Registro exitoso. ¡Ahora puedes iniciar sesión!');
        setIsRegistering(false); // Cambia a modo login después del registro
      } else {
        // Si está en modo login, llama a la ruta /token de la API
        // Nota: Axios para form-data requiere un FormData object o una string URL-encoded
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        response = await api.post('/token', formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Tipo de contenido para form-data
          },
        });
        // Guarda el token de acceso en el almacenamiento local del navegador
        localStorage.setItem('accessToken', response.data.access_token);
        onAuthSuccess(); // Llama a la función de éxito de autenticación pasada por props
      }
    } catch (error) {
      // Manejo de errores de la API
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        setMessage(`Error: ${error.response.data.detail || 'Algo salió mal'}`);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        setMessage('Error: No se pudo conectar al servidor. Verifica tu conexión.');
      } else {
        // Algo más causó el error
        setMessage(`Error: ${error.message}`);
      }
      console.error('Error de autenticación:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering
          ? '¿Ya tienes cuenta? Iniciar Sesión'
          : '¿No tienes cuenta? Registrarse'}
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default AuthForm;
