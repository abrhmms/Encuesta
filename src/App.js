import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Analisis from "./pages/Analisis"; // Asegúrate de que la ruta sea correcta
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <nav>
          <ul>
            <li><Link to="/">Cuestionario</Link></li>
            <li><Link to="/analisis">Análisis de Cuestionario</Link></li> {/* Enlace a la página de Análisis */}
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/analisis" element={<Analisis />} /> {/* Ruta para la página de Análisis */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
