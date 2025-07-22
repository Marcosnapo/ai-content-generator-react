// src/App.jsx
// Este es el componente principal de tu aplicación React.
// Maneja el estado de autenticación y renderiza el formulario de Auth o la lista de tareas.

import React, { useState, useEffect } from 'react';
import './App.css'; // Estilos generales de App
import AuthForm from './components/AuthForm'; // Importa el componente de autenticación
import TodoList from './components/TodoList'; // ¡Ahora importamos el componente de lista de tareas!

function App() {
  // Estado para saber si el usuario está autenticado.
  // Inicialmente, verifica si hay un token en localStorage.
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  // Función que se llama cuando la autenticación es exitosa (login o registro)
  const handleAuthSuccess = () => {
    setIsAuthenticated(true); // Actualiza el estado a autenticado
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Elimina el token del almacenamiento local
    setIsAuthenticated(false); // Actualiza el estado a no autenticado
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        // Si el usuario está autenticado, muestra el componente TodoList y el botón de cerrar sesión
        <div>
          <h1>¡Bienvenido a tu Lista de Tareas!</h1>
          <TodoList /> {/* ¡Aquí renderizamos el componente de lista de tareas! */}
          <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
        </div>
      ) : (
        // Si el usuario no está autenticado, muestra el formulario de autenticación
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;
