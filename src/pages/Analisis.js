import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PieController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { database } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analisis = () => {
  const [resultados, setResultados] = useState([]);

  const chartRefs = {
    carrera: useRef(null),
    edad: useRef(null),
    clasificacion: useRef(null),
    genero: useRef(null),
  };

  const canvasRefs = {
    carrera: useRef(null),
    edad: useRef(null),
    clasificacion: useRef(null),
    genero: useRef(null),
  };

  useEffect(() => {
    const encuestasRef = ref(database, "encuestas");
    const handleDataChange = (snapshot) => {
      const data = snapshot.val();
      if (data) setResultados(Object.values(data));
    };

    const unsubscribe = onValue(encuestasRef, handleDataChange);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (resultados.length === 0) return;

    const carreras = {};
    const edades = { "<20": { Positivo: 0, Neutro: 0, Negativo: 0 }, "20-30": { Positivo: 0, Neutro: 0, Negativo: 0 }, ">30": { Positivo: 0, Neutro: 0, Negativo: 0 } };
    const clasificacionesGenerales = { Positivo: 0, Neutro: 0, Negativo: 0 };
    const generos = { Masculino: { Positivo: 0, Neutro: 0, Negativo: 0 }, Femenino: { Positivo: 0, Neutro: 0, Negativo: 0 } };

    const asignarPuntaje = (respuesta) => (respuesta === "a" ? 3 : respuesta === "b" ? 1 : 2);

    resultados.forEach((item) => {
      if (!item || !item.respuestas) return;

      const edad = parseInt(item.respuestas.edad);
      if (isNaN(edad)) return;

      const carrera = item.respuestas.carrera || "Desconocido";
      const genero = item.respuestas.genero || "Otro";

      const puntajeTotal = Array.from({ length: 10 }, (_, i) => asignarPuntaje(item.respuestas[`pregunta${i + 1}`])).reduce((acc, curr) => acc + curr, 0);
      const clasificacion = puntajeTotal >= 21 ? "Positivo" : puntajeTotal <= 10 ? "Negativo" : "Neutro";

      clasificacionesGenerales[clasificacion]++;
      carreras[carrera] = carreras[carrera] || { Positivo: 0, Neutro: 0, Negativo: 0 };
      carreras[carrera][clasificacion]++;

      if (edad < 20) edades["<20"][clasificacion]++;
      else if (edad <= 30) edades["20-30"][clasificacion]++;
      else edades[">30"][clasificacion]++;

      if (generos[genero]) generos[genero][clasificacion]++;
    });

    const crearGrafico = (canvasRef, chartRef, data) => {
      if (chartRef.current) chartRef.current.destroy();
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      chartRef.current = new ChartJS(ctx, {
        type: "pie",
        data,
        options: {
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          animation: { duration: 800, easing: "easeInOutQuad" },
        },
      });
    };

    crearGrafico(canvasRefs.carrera, chartRefs.carrera, {
      labels: Object.keys(carreras),
      datasets: [{ data: Object.values(carreras).map((c) => c.Positivo), backgroundColor: ["#3498db", "#2ecc71", "#9b59b6", "#f1c40f", "#e74c3c", "#1abc9c"] }],
    });

    crearGrafico(canvasRefs.edad, chartRefs.edad, {
      labels: ["<20", "20-30", ">30"],
      datasets: [{ data: Object.values(edades).map((e) => e.Positivo + e.Neutro + e.Negativo), backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"] }],
    });

    crearGrafico(canvasRefs.clasificacion, chartRefs.clasificacion, {
      labels: ["Positivo", "Neutro", "Negativo"],
      datasets: [{ data: Object.values(clasificacionesGenerales), backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"] }],
    });

    crearGrafico(canvasRefs.genero, chartRefs.genero, {
      labels: ["Masculino", "Femenino"],
      datasets: [{ data: Object.values(generos).map((g) => g.Positivo + g.Neutro + g.Negativo), backgroundColor: ["#3498db", "#e74c3c"] }],
    });
  }, [resultados]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-3xl">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900">📊 Análisis de Encuestas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { ref: canvasRefs.carrera, title: "🎓 Distribución por Carrera", color: "from-blue-300 to-blue-500" },
          { ref: canvasRefs.edad, title: "📅 Distribución por Edad", color: "from-green-300 to-green-500" },
          { ref: canvasRefs.clasificacion, title: "📈 Clasificación General", color: "from-yellow-300 to-yellow-500" },
          { ref: canvasRefs.genero, title: "⚧ Distribución por Género", color: "from-red-300 to-red-500" },
        ].map(({ ref, title, color }, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${color} p-4 rounded-lg shadow-md transform hover:scale-105 transition-all`}
          >
            <h2 className="text-lg font-semibold text-white mb-2 text-center">{title}</h2>
            <canvas ref={ref} className="mx-auto w-32 h-32"></canvas>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analisis;
