













import React, { useState, useRef } from "react";
import "../styles/Globalinicio.css";
import { database } from "../firebaseConfig"; 
import { ref, push } from "firebase/database";

function Inicio() {
  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    carrera: "",
    genero: "",
    pregunta1: "",
    pregunta2: "",
    pregunta3: "",
    pregunta4: "",
    pregunta5: "",
    pregunta6: "",
    pregunta7: "",
    pregunta8: "",
    pregunta9: "",
    pregunta10: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef(null);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const verificarCamposCompletos = () => {
    return Object.values(formData).every((valor) => valor !== "");
  };

  const verificarEdad = () => {
    const edad = parseInt(formData.edad);
    return edad >= 18 && edad <= 35;
  };

  const clasificarRespuesta = (respuesta) => {
    if (respuesta === "a") return "Positivo";
    if (respuesta === "b") return "Negativo";
    return "Neutro";
  };

  const enviarRespuestas = async (event) => {
    event.preventDefault(); // Añade esto para prevenir el comportamiento por defecto
    
    if (!verificarCamposCompletos()) {
      setErrorMessage("Por favor, completa todos los campos antes de enviar.");
      return;
    }
  
    if (!verificarEdad()) {
      setErrorMessage("La edad debe estar entre 18 y 35 años.");
      return;
    }
  
    setErrorMessage("");
    
    try {
      const respuestasRef = ref(database, "encuestas");
  
      const clasificaciones = Object.keys(formData)
        .filter((key) => key.startsWith("pregunta"))
        .map((key) => clasificarRespuesta(formData[key]));
  
      const totalPositivo = clasificaciones.filter(c => c === "Positivo").length;
      const totalNegativo = clasificaciones.filter(c => c === "Negativo").length;
      const totalNeutro = clasificaciones.filter(c => c === "Neutro").length;
  
      const clasificacionFinal = totalPositivo >= 1 
        ? "Positivo" 
        : totalNegativo > totalPositivo 
        ? "Negativo" 
        : "Neutro";
  
      await push(respuestasRef, {
        respuestas: formData,
        clasificaciones,
        clasificacionFinal,
        fecha: new Date().toLocaleString(),
      });
  
      // Reset más efectivo
      setFormData({
        nombre: "",
        edad: "",
        carrera: "",
        genero: "",
        pregunta1: "",
        pregunta2: "",
        pregunta3: "",
        pregunta4: "",
        pregunta5: "",
        pregunta6: "",
        pregunta7: "",
        pregunta8: "",
        pregunta9: "",
        pregunta10: "",
      });
  
      if (formRef.current) {
        formRef.current.reset();
      }
  
      // Feedback visual más claro
      alert("Encuesta enviada con éxito");
      
      // Opcional: desplazarse al inicio del formulario
      window.scrollTo(0, 0);
  
    } catch (error) {
      console.error("Error al enviar la encuesta:", error);
      setErrorMessage("Ocurrió un error al enviar la encuesta. Por favor, inténtalo de nuevo.");
    }
  };
  

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <p className="inicio-subtitle">
          Responde las siguientes preguntas sobre cómo te sientes en tu vida diaria.
        </p>
      </header>

      {errorMessage && <p style={{ color: "red", fontSize: "small" }}>{errorMessage}</p>}
      
      <form className="form-container" ref={formRef}>
        <div className="pregunta">
          <p>Nombre / Apodo:</p>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </div>

        <div className="pregunta">
          <p>Edad:</p>
          <input type="number" name="edad" value={formData.edad} onChange={handleChange} required />
        </div>

        <div className="pregunta">
          <p>Carrera:</p>
          <select
            name="carrera"
            value={formData.carrera}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona tu carrera</option>
            <option value="Tecnologías de la Información y Comunicación (TIC)">
              Tecnologías de la Información y Comunicación (TIC)
            </option>
            <option value="Mecatrónica">Mecatrónica</option>
            <option value="Administración">Administración</option>
            <option value="Procesos Industriales">Procesos Industriales</option>
            <option value="Ingeniería en Tecnologías de la Producción">
              Ingeniería en Tecnologías de la Producción
            </option>
            <option value="Ingeniería en Tecnologías de la Información y Comunicación">
              Ingeniería en Tecnologías de la Información y Comunicación
            </option>
            <option value="Ingeniería en Mecatrónica">Ingeniería en Mecatrónica</option>
          </select>
        </div>

        <div className="pregunta">
          <p>Género:</p>
          <label><input type="radio" name="genero" value="Masculino" onChange={handleChange} required /> Masculino</label>
          <label><input type="radio" name="genero" value="Femenino" onChange={handleChange} required /> Femenino</label>
        </div>

        <div className="pregunta">
          <p>1. ¿Con qué frecuencia tienes acceso a cigarrillos o alcohol?</p>
          <label><input type="radio" name="pregunta1" value="a" onChange={handleChange} required /> a) Nunca</label>
          <label><input type="radio" name="pregunta1" value="b" onChange={handleChange} required /> b) A veces</label>
          <label><input type="radio" name="pregunta1" value="c" onChange={handleChange} required /> c) Frecuentemente</label>
        </div>

                {/* Pregunta 2 */}
                <div className="pregunta">
          <p>2. ¿Alguna vez te han ofrecido cigarrillos o alcohol en tu círculo social?</p>
          <label>
            <input type="radio" name="pregunta2" value="a" onChange={handleChange} /> a) No, nunca me lo han ofrecido.
          </label><br />
          <label>
            <input type="radio" name="pregunta2" value="b" onChange={handleChange} /> b) Sí, pero no los he consumido.
          </label><br />
          <label>
            <input type="radio" name="pregunta2" value="c" onChange={handleChange} /> c) Sí, y los he probado o consumido regularmente.
          </label><br />
        </div>

        {/* Pregunta 3 */}
        <div className="pregunta">
          <p>3. ¿Cómo influye tu grupo de amigos en el consumo de tabaco o alcohol?</p>
          <label>
            <input type="radio" name="pregunta3" value="a" onChange={handleChange} /> a) No influyen, no consumen o respetan mis decisiones.
          </label><br />
          <label>
            <input type="radio" name="pregunta3" value="b" onChange={handleChange} /> b) Algunos consumen, pero no me presionan a hacerlo.
          </label><br />
          <label>
            <input type="radio" name="pregunta3" value="c" onChange={handleChange} /> c) Me siento presionado a consumir para encajar.
          </label><br />
        </div>

        {/* Pregunta 4 */}
        <div className="pregunta">
          <p>4. ¿Crees que los medios de comunicación promueven el consumo de tabaco y alcohol?</p>
          <label>
            <input type="radio" name="pregunta4" value="a" onChange={handleChange} /> a) No, muestran los riesgos y consecuencias.
          </label><br />
          <label>
            <input type="radio" name="pregunta4" value="b" onChange={handleChange} /> b) A veces, pero también hay campañas de prevención.
          </label><br />
          <label>
            <input type="radio" name="pregunta4" value="c" onChange={handleChange} /> c) Sí, lo presentan como algo normal o atractivo.
          </label><br />
        </div>

        {/* Pregunta 5 */}
        <div className="pregunta">
          <p>5. ¿Cómo crees que el consumo de tabaco o alcohol afecta la concentración en los estudios?</p>
          <label>
            <input type="radio" name="pregunta5" value="a" onChange={handleChange} /> a) No afecta, se puede estudiar normalmente.
          </label><br />
          <label>
            <input type="radio" name="pregunta5" value="b" onChange={handleChange} /> b) Puede afectar la memoria y la concentración.
          </label><br />
          <label>
            <input type="radio" name="pregunta5" value="c" onChange={handleChange} /> c) Afecta gravemente el aprendizaje y la motivación.
          </label><br />
        </div>

        {/* Pregunta 6 */}
        <div className="pregunta">
          <p>6. ¿Has notado que el consumo de estas sustancias ha afectado la asistencia o el desempeño escolar de alguien que conoces?</p>
          <label>
            <input type="radio" name="pregunta6" value="a" onChange={handleChange} /> a) No, no he visto casos cercanos.
          </label><br />
          <label>
            <input type="radio" name="pregunta6" value="b" onChange={handleChange} /> b) Sí, en algunos casos ha causado problemas en la escuela.
          </label><br />
          <label>
            <input type="radio" name="pregunta6" value="c" onChange={handleChange} /> c) Sí, ha llevado a abandono escolar o bajo rendimiento.
          </label><br />
        </div>

        {/* Pregunta 7 */}
        <div className="pregunta">
          <p>7. ¿Crees que el consumo de tabaco o alcohol tiene consecuencias graves en la salud?</p>
          <label>
            <input type="radio" name="pregunta7" value="a" onChange={handleChange} /> a) Sí, puede causar enfermedades a largo plazo.
          </label><br />
          <label>
            <input type="radio" name="pregunta7" value="b" onChange={handleChange} /> b) Depende de la cantidad y frecuencia del consumo.
          </label><br />
          <label>
            <input type="radio" name="pregunta7" value="c" onChange={handleChange} /> c) No, no veo riesgos graves.
          </label><br />
        </div>

        {/* Pregunta 8 */}
        <div className="pregunta">
          <p>8. ¿Has experimentado o conoces casos de problemas de salud relacionados con el consumo de tabaco o alcohol?</p>
          <label>
            <input type="radio" name="pregunta8" value="a" onChange={handleChange} /> a) No, no conozco ningún caso.
          </label><br />
          <label>
            <input type="radio" name="pregunta8" value="b" onChange={handleChange} /> b) Sí, algunos han tenido problemas leves.
          </label><br />
          <label>
            <input type="radio" name="pregunta8" value="c" onChange={handleChange} /> c) Sí, conozco casos con consecuencias graves.
          </label><br />
        </div>

        {/* Pregunta 9 */}
        <div className="pregunta">
          <p>9. ¿Crees que las personas consumen tabaco o alcohol como una forma de lidiar con el estrés o problemas emocionales?</p>
          <label>
            <input type="radio" name="pregunta9" value="a" onChange={handleChange} /> a) No, generalmente hay otras razones.
          </label><br />
          <label>
            <input type="radio" name="pregunta9" value="b" onChange={handleChange} /> b) A veces, algunas personas lo usan para relajarse.
          </label><br />
          <label>
            <input type="radio" name="pregunta9" value="c" onChange={handleChange} /> c) Sí, es una causa común de consumo.
          </label><br />
        </div>

        {/* Pregunta 10 */}
        <div className="pregunta">
          <p>10. ¿Qué tan importante crees que es la educación para prevenir el consumo de tabaco y alcohol?</p>
          <label>
            <input type="radio" name="pregunta10" value="a" onChange={handleChange} /> a) Muy importante, la información ayuda a tomar mejores decisiones.
          </label><br />
          <label>
            <input type="radio" name="pregunta10" value="b" onChange={handleChange} /> b) Algo importante, pero también influyen otros factores.
          </label><br />
          <label>
            <input type="radio" name="pregunta10" value="c" onChange={handleChange} /> c) No es tan importante, cada persona decide por sí misma.
          </label><br />
        </div>

        <button type="submit" onClick={enviarRespuestas}>Enviar</button>
      </form>
    </div>
  );
}

export default Inicio;
