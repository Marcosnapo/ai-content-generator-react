// src/components/TodoList.jsx
// Este componente gestiona la visualización, adición, actualización y eliminación de tareas.

import React, { useState, useEffect } from 'react';
import api from '../api'; // Importa la instancia de Axios configurada

function TodoList() {
  const [todos, setTodos] = useState([]); // Estado para almacenar la lista de tareas
  const [newTodoTitle, setNewTodoTitle] = useState(''); // Estado para el título de la nueva tarea
  const [newTodoDescription, setNewTodoDescription] = useState(''); // Estado para la descripción de la nueva tarea
  const [message, setMessage] = useState(''); // Estado para mensajes de éxito/error

  // useEffect para cargar las tareas cuando el componente se monta o cuando se actualizan las tareas
  useEffect(() => {
    fetchTodos();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Función para obtener las tareas del usuario desde la API
  const fetchTodos = async () => {
    setMessage(''); // Limpia mensajes anteriores
    try {
      const response = await api.get('/todos/'); // Llama a la ruta GET /todos/
      setTodos(response.data); // Actualiza el estado con las tareas obtenidas
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.');
        // Opcional: forzar logout si el token es inválido
        // localStorage.removeItem('accessToken');
        // window.location.reload();
      } else if (error.response) {
        setMessage(`Error al cargar tareas: ${error.response.data.detail || 'Algo salió mal'}`);
      } else {
        setMessage(`Error de red: ${error.message}`);
      }
      console.error('Error al obtener tareas:', error);
    }
  };

  // Función para añadir una nueva tarea
  const handleAddTodo = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!newTodoTitle.trim()) {
      setMessage('El título de la tarea no puede estar vacío.');
      return;
    }
    try {
      // Llama a la ruta POST /todos/ para crear una nueva tarea
      const response = await api.post('/todos/', {
        title: newTodoTitle,
        description: newTodoDescription.trim() === '' ? null : newTodoDescription, // Envía null si está vacío
        completed: false,
      });
      setTodos([...todos, response.data]); // Añade la nueva tarea al estado
      setNewTodoTitle(''); // Limpia el campo del título
      setNewTodoDescription(''); // Limpia el campo de la descripción
      setMessage('Tarea añadida exitosamente.');
    } catch (error) {
      if (error.response) {
        setMessage(`Error al añadir tarea: ${error.response.data.detail || 'Algo salió mal'}`);
      } else {
        setMessage(`Error de red: ${error.message}`);
      }
      console.error('Error al añadir tarea:', error);
    }
  };

  // Función para alternar el estado 'completado' de una tarea
  const handleToggleComplete = async (todoId, currentCompleted) => {
    setMessage('');
    try {
      // Obtiene la tarea actual para asegurar que tenemos todos los campos
      const currentTodoResponse = await api.get(`/todos/${todoId}`);
      const currentTodo = currentTodoResponse.data;

      // Llama a la ruta PUT /todos/{id} para actualizar la tarea
      const response = await api.put(`/todos/${todoId}`, {
        title: currentTodo.title,
        description: currentTodo.description,
        completed: !currentCompleted, // Invierte el estado de completado
      });
      // Actualiza el estado de las tareas en el frontend
      setTodos(todos.map((todo) => (todo.id === todoId ? response.data : todo)));
      setMessage('Estado de la tarea actualizado.');
    } catch (error) {
      if (error.response) {
        setMessage(`Error al actualizar tarea: ${error.response.data.detail || 'Algo salió mal'}`);
      } else {
        setMessage(`Error de red: ${error.message}`);
      }
      console.error('Error al actualizar tarea:', error);
    }
  };

  // Función para eliminar una tarea
  const handleDeleteTodo = async (todoId) => {
    setMessage('');
    try {
      // Llama a la ruta DELETE /todos/{id}
      await api.delete(`/todos/${todoId}`);
      // Filtra la tarea eliminada del estado
      setTodos(todos.filter((todo) => todo.id !== todoId));
      setMessage('Tarea eliminada exitosamente.');
    } catch (error) {
      if (error.response) {
        setMessage(`Error al eliminar tarea: ${error.response.data.detail || 'Algo salió mal'}`);
      } else {
        setMessage(`Error de red: ${error.message}`);
      }
      console.error('Error al eliminar tarea:', error);
    }
  };

  return (
    <div className="todo-list-container">
      <h3>Tu Lista de Tareas</h3>
      {message && <p className="message">{message}</p>}

      {/* Formulario para añadir nueva tarea */}
      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input
          type="text"
          placeholder="Título de la nueva tarea"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={newTodoDescription}
          onChange={(e) => setNewTodoDescription(e.target.value)}
        />
        <button type="submit">Añadir Tarea</button>
      </form>

      {/* Lista de tareas */}
      {todos.length === 0 ? (
        <p>No tienes tareas aún. ¡Añade una!</p>
      ) : (
        <ul className="todo-items">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <div className="todo-info">
                <h4>{todo.title}</h4>
                {todo.description && <p>{todo.description}</p>}
              </div>
              <div className="todo-actions">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id, todo.completed)}
                />
                <button onClick={() => handleDeleteTodo(todo.id)} className="delete-button">
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
