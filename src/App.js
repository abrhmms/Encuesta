import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Analisis from "./pages/Analisis"; 
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/Global.css"; // Asegúrate de tener este archivo para los estilos

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <nav className="bg-gray-800 p-4">
          <ul className="flex justify-center space-x-6 text-white">
            <li>
              <Link to="/" className="hover:underline">Cuestionario</Link>
            </li>
            <li>
              <Link to="/analisis" className="hover:underline">Análisis</Link>
            </li>
          </ul>
        </nav>
        <main className="flex-grow p-6">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/analisis" element={<Analisis />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;