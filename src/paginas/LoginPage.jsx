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
    const resultado = await loginUsuario(usuario, contrasena);

    if (resultado && resultado.found) {
      alert('✅ Credenciales correctas');
      localStorage.setItem('usuario', JSON.stringify(resultado));
      navigate('/dashboard');
    } else {
      alert('❌ Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      {/* Panel izquierdo */}
      <div className="login-left">
        <h1>¡Bienvenido!</h1>
        <p>Visualiza y gestiona las notas académicas de forma rápida y segura.</p>
      </div>

      {/* Panel derecho */}
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

          <div className="forgot-password">
          </div>
        </form>
      </div>
    </div>
  );
}
