import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../servicios/api';
import '../estilos/LoginPage.css';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🔐 Iniciando sesión con:', usuario);
    const resultado = await loginUsuario(usuario, contrasena);

    if (!resultado || !resultado.found) {
      alert('❌ Credenciales incorrectas');
      return;
    }

    console.log('🔵 Resultado del login:', resultado);
    const idUsuario = resultado.id;
    console.log('🆔 ID del usuario logueado:', idUsuario);

    localStorage.setItem('usuario', JSON.stringify(resultado));

    // Validar si es tutor (rol 2)
    if (resultado.rol === 2) {
      try {
        const resTutor = await fetch(`http://www.bakend-notas.somee.com/Tutor/Buscar`);
        const tutores = await resTutor.json();
        const tutor = tutores.find(t => t.id_usuario === idUsuario);

        if (!tutor) {
          alert('❌ No se encontró tutor vinculado a este usuario');
          return;
        }

        console.log('📘 Tutor encontrado:', tutor);

        // Obtener lista de estudiantes
        const resEstudiantes = await fetch(`http://www.bakend-notas.somee.com/Estudiante/Buscar`);
        const listaEstudiantes = await resEstudiantes.json();
        console.log('📚 Estudiantes recibidos:', listaEstudiantes);

        // Filtrar estudiantes asociados a este tutor
        const estudiantesAsociados = listaEstudiantes.filter(est =>
          est.tutores?.some(t => t.id_tutor === tutor.id)
        );

        if (estudiantesAsociados.length === 0) {
          alert('❌ No se encontró estudiante vinculado a este tutor');
          return;
        }

        console.log('✅ Estudiantes asociados encontrados:', estudiantesAsociados);
        localStorage.setItem('estudiantesAsociados', JSON.stringify(estudiantesAsociados));
      } catch (error) {
        console.error('❌ Error al buscar tutor o estudiantes:', error);
        alert('❌ Error interno al validar tutor');
        return;
      }
    }

    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>¡Bienvenido!</h1>
        <p>Visualiza y gestiona las notas académicas de forma rápida y segura.</p>
      </div>
      <div className="login-right">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Iniciar sesión</h2>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}
