import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './paginas/LoginPage';
import DashboardPage from './paginas/DashboardPage';
import EstudiantesPage from './paginas/EstudiantesPage';
import Layout from './componentes/Layout';
import RutaPrivada from './componentes/RutaPrivada';
import UsuariosPage from './paginas/UsuariosPage';
import InformacionPerfilPage from './paginas/InformacionPerfilPage';
import ProfesoresPage from './paginas/ProfesoresPage';
import TutoresPage from './paginas/TutoresPage';
import AsignacionesPage from './paginas/AsignacionesPage';
import NotasPage from './paginas/NotasPage';
import HorariosPage from './paginas/HorariosPage';
import MisNotasPage from './paginas/MisNotasPage'; // ✅ NUEVA IMPORTACIÓN

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/" element={<RutaPrivada><Layout /></RutaPrivada>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="estudiantes" element={<EstudiantesPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="estudiantes/:id" element={<InformacionPerfilPage />} />
        <Route path="profesores" element={<ProfesoresPage />} />
        <Route path="padres" element={<TutoresPage />} />
        <Route path="asignaciones" element={<AsignacionesPage />} />
        <Route path="notas" element={<NotasPage />} />
        <Route path="horarios" element={<HorariosPage />} />
        <Route path="mis-notas" element={<MisNotasPage />} /> {/* ✅ NUEVA RUTA */}
      </Route>
    </Routes>
  );
}
