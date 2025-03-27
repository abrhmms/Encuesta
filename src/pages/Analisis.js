import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PieController,
  BarController,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { database } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PieController,
  BarController,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Menu = ({ setSection, sections }) => (
  <div className="flex flex-wrap justify-center gap-3 mb-8">
    {sections.map((item) => (
      <button
        key={item}
        className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
        onClick={() => setSection(item)}
      >
        {item}
      </button>
    ))}
  </div>
);

const TablaDatos = ({ datos, titulo }) => {
  const formatCellValue = (value) => {
    if (React.isValidElement(value)) return value;
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).filter(k => !k.startsWith('_')).join(', ');
    }
    return value;
  };

  return (
    <div className="mb-10">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-indigo-200 pb-2">
        {titulo}
      </h3>
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              {Object.keys(datos[0]).map((key) => (
                <th
                  key={key}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datos.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
              >
                {Object.entries(item).map(([key, value], i) => (
                  <td
                    key={i}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200 last:border-r-0"
                  >
                    {formatCellValue(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Analisis = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("Datos Completos");

  const chartRefs = useRef({});
  const canvasRefs = useRef({});

  const sections = [
    "Datos Completos",
    "Usuarios por División",
    "Distribución por Edad",
    "Distribución por Género",
    "Análisis de Sentimientos",
    "Respuestas por Pregunta",
  ];

  const destroyCharts = () => {
    Object.values(chartRefs.current).forEach(chart => {
      if (chart) chart.destroy();
    });
  };

  const renderChart = (id, type, data, options = {}) => {
    destroyCharts();
    
    if (!canvasRefs.current[id]) return;
    
    const ctx = canvasRefs.current[id].getContext("2d");
    chartRefs.current[id] = new ChartJS(ctx, {
      type,
      data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: options.title || "" }
        },
        ...options
      },
    });
  };

  const formatSentimiento = (sentimiento) => {
    const color = sentimiento === "Positivo" ? "text-green-600" :
                 sentimiento === "Negativo" ? "text-red-600" : "text-yellow-600";
    return <span className={`font-medium ${color}`}>{sentimiento}</span>;
  };

  useEffect(() => {
    const encuestasRef = ref(database, "encuestas");
    const unsubscribe = onValue(encuestasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.values(data).map((item, index) => ({
          id: index + 1,
          nombre: item.respuestas?.nombre || "Anónimo",
          edad: item.respuestas?.edad || "N/A",
          division: item.respuestas?.carrera || "N/A",
          genero: item.respuestas?.genero || "N/A",
          sentimiento: item.clasificacionFinal || "Neutro",
          respuestas: Object.entries(item.respuestas || {})
            .filter(([key]) => key.startsWith('pregunta'))
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {})
        }));
        setResultados(formattedData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (resultados.length === 0 || loading) return;

    switch (section) {
      case "Usuarios por División":
        const divisionData = resultados.reduce((acc, { division }) => {
          acc[division] = (acc[division] || 0) + 1;
          return acc;
        }, {});

        renderChart("division", "pie", {
          labels: Object.keys(divisionData),
          datasets: [{
            data: Object.values(divisionData),
            backgroundColor: [
              "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
              "#9966FF", "#FF9F40", "#8AC24A", "#607D8B"
            ],
          }]
        }, { title: "Usuarios por División/Carrera" });
        break;

      case "Distribución por Edad":
        const ageData = resultados.reduce((acc, { edad }) => {
          if (edad !== "N/A" && parseInt(edad) >= 18 && parseInt(edad) <= 35) {
            acc[edad] = (acc[edad] || 0) + 1;
          }
          return acc;
        }, {});

        renderChart("edad", "bar", {
          labels: Object.keys(ageData).sort((a, b) => parseInt(a) - parseInt(b)),
          datasets: [{
            label: "Cantidad de usuarios",
            data: Object.values(ageData),
            backgroundColor: "#36A2EB",
          }]
        }, { title: "Distribución por Edad" });
        break;

      case "Distribución por Género":
        const genderData = resultados.reduce((acc, { genero }) => {
          acc[genero] = (acc[genero] || 0) + 1;
          return acc;
        }, {});

        renderChart("genero", "doughnut", {
          labels: Object.keys(genderData),
          datasets: [{
            data: Object.values(genderData),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          }]
        }, { title: "Distribución por Género" });
        break;

      case "Análisis de Sentimientos":
        const sentimentData = resultados.reduce((acc, { sentimiento }) => {
          acc[sentimiento] = (acc[sentimiento] || 0) + 1;
          return acc;
        }, {});

        renderChart("sentimiento", "doughnut", {
          labels: Object.keys(sentimentData),
          datasets: [{
            data: Object.values(sentimentData),
            backgroundColor: [
              "#4BC0C0", // Positivo
              "#FF6384", // Negativo
              "#FFCE56", // Neutro
            ],
          }]
        }, { title: "Análisis de Sentimientos" });
        break;
    }
  }, [section, resultados, loading]);

  const getQuestionStats = () => {
    const stats = {};
    for (let i = 1; i <= 10; i++) {
      const key = `pregunta${i}`;
      stats[key] = { a: 0, b: 0, c: 0 };
      
      resultados.forEach(({ respuestas }) => {
        const respuesta = respuestas[key];
        if (respuesta === 'a') stats[key].a++;
        else if (respuesta === 'b') stats[key].b++;
        else if (respuesta === 'c') stats[key].c++;
      });
    }
    return stats;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (resultados.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <h3 className="text-xl font-medium text-gray-600">No hay datos disponibles</h3>
        <p className="text-gray-500 mt-2">Aún no se han registrado respuestas</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-xl rounded-2xl">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900 border-b-2 border-indigo-100 pb-4">
        📊 Análisis Completo de Encuestas
      </h1>
      
      <Menu setSection={setSection} sections={sections} />
      
      <div className="text-center text-2xl font-bold mb-8 text-indigo-700">
        {section}
      </div>

      {section === "Datos Completos" && (
        <TablaDatos 
          datos={resultados.map(({ id, nombre, edad, division, genero, sentimiento }) => 
            ({ 
              "#": id, 
              "Nombre": nombre, 
              "Edad": edad, 
              "División": division, 
              "Género": genero, 
              "Sentimiento": formatSentimiento(sentimiento)
            })
          )} 
          titulo="Todos los registros"
        />
      )}

      {section === "Respuestas por Pregunta" && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-indigo-200 pb-2">
            Estadísticas por Pregunta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(getQuestionStats()).map(([pregunta, stats]) => (
              <div key={pregunta} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 className="font-semibold text-lg mb-3 text-indigo-700">{pregunta.replace('pregunta', 'Pregunta ')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-24">Opción A:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `${(stats.a / resultados.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 w-10 font-medium">{stats.a}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24">Opción B:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-yellow-500 h-4 rounded-full" 
                        style={{ width: `${(stats.b / resultados.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 w-10 font-medium">{stats.b}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24">Opción C:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-red-500 h-4 rounded-full" 
                        style={{ width: `${(stats.c / resultados.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 w-10 font-medium">{stats.c}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "Usuarios por División" && (
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-md mb-8">
            <canvas 
              ref={el => canvasRefs.current.division = el}
              className="w-full h-96"
            ></canvas>
          </div>
          <div className="w-full">
            <TablaDatos
              datos={Object.entries(
                resultados.reduce((acc, { division }) => {
                  acc[division] = (acc[division] || 0) + 1;
                  return acc;
                }, {})
              ).map(([division, count]) => ({
                "División": division,
                "Usuarios": count,
                "Porcentaje": `${((count / resultados.length) * 100).toFixed(1)}%`
              }))}
              titulo="Detalle por División"
            />
          </div>
        </div>
      )}

      {section === "Distribución por Edad" && (
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-md mb-8">
            <canvas 
              ref={el => canvasRefs.current.edad = el}
              className="w-full h-96"
            ></canvas>
          </div>
          <div className="w-full">
            <TablaDatos
              datos={Object.entries(
                resultados.reduce((acc, { edad }) => {
                  if (edad !== "N/A" && parseInt(edad) >= 18 && parseInt(edad) <= 35) {
                    acc[edad] = (acc[edad] || 0) + 1;
                  }
                  return acc;
                }, {})
              )
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([edad, count]) => ({
                "Edad": `${edad} años`,
                "Cantidad": count,
                "Porcentaje": `${((count / resultados.length) * 100).toFixed(1)}%`
              }))}
              titulo="Detalle por Edad"
            />
          </div>
        </div>
      )}

      {section === "Distribución por Género" && (
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md mb-8">
            <canvas 
              ref={el => canvasRefs.current.genero = el}
              className="w-full h-96"
            ></canvas>
          </div>
          <div className="w-full max-w-2xl">
            <TablaDatos
              datos={Object.entries(
                resultados.reduce((acc, { genero }) => {
                  acc[genero] = (acc[genero] || 0) + 1;
                  return acc;
                }, {})
              ).map(([genero, count]) => ({
                "Género": genero,
                "Cantidad": count,
                "Porcentaje": `${((count / resultados.length) * 100).toFixed(1)}%`
              }))}
              titulo="Detalle por Género"
            />
          </div>
        </div>
      )}

      {section === "Análisis de Sentimientos" && (
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md mb-8">
            <canvas 
              ref={el => canvasRefs.current.sentimiento = el}
              className="w-full h-96"
            ></canvas>
          </div>
          <div className="w-full">
            <TablaDatos
              datos={resultados.map(({ id, nombre, division, sentimiento }) => ({
                "#": id,
                "Nombre": nombre,
                "División": division,
                "Sentimiento": sentimiento
              }))}
              titulo="Detalle por Usuario"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Analisis;