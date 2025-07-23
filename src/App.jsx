// src/App.jsx
// Componente principal de la aplicación Generador de Contenido con IA.
// Utiliza la API de Google Gemini (modelo gemini-1.5-flash) para generar descripciones de imágenes
// basadas en prompts de texto.
// Maneja la entrada del prompt, el estado de carga, la visualización del contenido generado y los errores.

import React, { useState } from 'react';
import './App.css'; // Importa los estilos CSS para la aplicación

function App() {
  // Estado para almacenar el texto del prompt ingresado por el usuario
  const [prompt, setPrompt] = useState('');
  // Estado para almacenar el contenido generado por la IA (ahora será texto)
  const [generatedContent, setGeneratedContent] = useState(null);
  // Estado para indicar si el contenido se está generando (mostrar indicador de carga)
  const [isLoading, setIsLoading] = useState(false);
  // Estado para almacenar mensajes de error o éxito para el usuario
  const [message, setMessage] = useState('');

  // Función para manejar el cambio en el campo de texto del prompt
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  // Función asíncrona para manejar la generación del contenido
  const handleGenerateContent = async () => {
    setMessage(''); // Limpia mensajes anteriores
    setGeneratedContent(null); // Limpia el contenido generado previamente
    setIsLoading(true); // Activa el indicador de carga

    // Validación básica: si el prompt está vacío, muestra un mensaje de error
    if (!prompt.trim()) {
      setMessage('Por favor, ingresa una descripción para generar el contenido.');
      setIsLoading(false);
      return; // Detiene la ejecución de la función
    }

    try {
      // Configuración de la API de Gemini
      // La clave API se inyecta automáticamente por el entorno de Canvas si se deja vacía.
      // Si estás depurando y la inyección automática falla, puedes pegar tu clave API aquí:
      const apiKey = "AIzaSyCv-2Bv1z7MWEb0Gh_vB-RG4j6Uji7s_I4"; // Deja vacío para que Canvas inyecte la clave API. Si no funciona, pega tu clave aquí.
      // URL de la API de Gemini para el modelo gemini-1.5-flash (para generación de contenido/texto)
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      // Payload (cuerpo de la petición) para el modelo gemini-1.5-flash
      // Se le pide al modelo que genere una descripción detallada de una imagen
      // basada en el prompt del usuario.
      const payload = {
          contents: [
              {
                  role: "user", // El rol del usuario en la conversación
                  parts: [{ text: `Genera una descripción detallada de una imagen basada en el siguiente concepto: "${prompt}". Enfócate en detalles visuales, colores, ambiente y estilo artístico. Sé conciso.` }]
              }
          ],
          // Opcional: Configuración de generación, si se necesita ajustar la respuesta
          generationConfig: {
              // responseMimeType: "text/plain", // Se puede especificar el tipo de respuesta si es necesario
              temperature: 0.7, // Controla la aleatoriedad de la respuesta (0.0-1.0)
              maxOutputTokens: 500 // Limita la longitud de la respuesta generada
          }
      };

      // Realiza la petición POST a la API de Gemini
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Manejo de errores HTTP: Si la respuesta no es exitosa (ej. 4xx, 5xx)
      if (!response.ok) {
        // Intenta leer el cuerpo de la respuesta para obtener un mensaje de error detallado de la API
        const errorData = await response.json();
        const errorMessage = errorData.error && errorData.error.message
                             ? errorData.error.message
                             : `Error ${response.status}: ${response.statusText || 'Respuesta inesperada del servidor.'}`;
        setMessage(`Error de la API: ${errorMessage}`);
        // Para depuración: Imprime el objeto de error completo en la consola
        console.error('Error detallado de la API de Gemini:', errorData);
        setIsLoading(false); // Desactiva el indicador de carga
        return; // Detiene la ejecución si hay un error HTTP
      }

      // Procesa la respuesta exitosa de la API
      const result = await response.json();

      // Verifica si la respuesta contiene el contenido generado
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        // Extrae el texto generado de la respuesta
        const textResponse = result.candidates[0].content.parts[0].text;
        setGeneratedContent(textResponse); // Almacena el texto generado en el estado
        setMessage('¡Descripción generada con éxito!');
      } else {
        // Si la respuesta no tiene el formato esperado, muestra un mensaje de error genérico
        setMessage('Error: No se pudo generar el contenido. Intenta con otra descripción o un prompt más simple.');
        // Para depuración: Imprime la respuesta completa si no tiene el formato esperado
        console.error('Respuesta inesperada de la API de Gemini (sin contenido de texto):', result);
      }

    } catch (error) {
      // Manejo de errores de red o errores inesperados en la petición
      console.error('Error al generar contenido (catch):', error);
      setMessage('Error de conexión o inesperado. Verifica la consola para más detalles.');
    } finally {
      setIsLoading(false); // Desactiva el indicador de carga al finalizar la operación
    }
  };

  return (
    <div className="app-container">
      {/* Título de la aplicación, ahora enfocado en la generación de contenido */}
      <h1>Generador de Contenido con IA</h1>

      <div className="input-section">
        {/* Área de texto para que el usuario ingrese su prompt */}
        <textarea
          placeholder="Describe el concepto para el que quieres generar contenido (ej. 'un gato astronauta en la luna con un traje espacial brillante')"
          value={prompt}
          onChange={handlePromptChange}
          rows="5" // Altura inicial del textarea
        />
        {/* Botón para activar la generación de contenido */}
        <button onClick={handleGenerateContent} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Contenido'}
        </button>
      </div>

      {/* Muestra mensajes de éxito o error al usuario */}
      {message && <p className="message">{message}</p>}

      <div className="image-display-section"> {/* El nombre de la clase puede seguir siendo el mismo, pero ahora muestra texto */}
        {/* Indicador de carga mientras se espera la respuesta de la API */}
        {isLoading && <p>Cargando contenido...</p>}
        {/* Muestra el contenido generado si está disponible y no hay carga */}
        {generatedContent && !isLoading && (
          <div className="generated-text-content"> {/* Contenedor para el texto generado */}
            <h3>Contenido Generado:</h3>
            <p>{generatedContent}</p>
          </div>
        )}
        {/* Mensaje inicial cuando no hay contenido generado ni carga ni mensaje de error */}
        {!generatedContent && !isLoading && !message && (
          <p>Tu contenido generado aparecerá aquí.</p>
        )}
      </div>
    </div>
  );
}

export default App;
