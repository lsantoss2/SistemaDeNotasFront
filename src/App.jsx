import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './paginas/LoginPage';
import DashboardPage from './paginas/DashboardPage';
import EstudiantesPage from './paginas/EstudiantesPage';
import Layout from './componentes/Layout';
import RutaPrivada from './componentes/RutaPrivada';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/" element={<RutaPrivada><Layout /></RutaPrivada>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="estudiantes" element={<EstudiantesPage />} />
      </Route>
    </Routes>
  );
}
