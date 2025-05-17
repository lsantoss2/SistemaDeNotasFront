import React, { useEffect, useState } from 'react';

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState({
    dpi: '',
    fecha: '',
    id_usuario: ''
  });

  useEffect(() => {
    obtenerProfesores();
  }, []);

  const obtenerProfesores = async () => {
    try {
      const res = await fetch('http://www.bakend-notas.somee.com/Profesores/Buscar');
      const texto = await res.text();

      if (!res.ok) {
        console.error('❌ Error en la respuesta del servidor:', texto);
        return;
      }

      const data = JSON.parse(texto);
      setProfesores(data);
    } catch (error) {
      console.error('❌ Error al obtener profesores:', error);
    }
  };

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();

    const { dpi, fecha, id_usuario } = formulario;

    if (!dpi || !fecha || !id_usuario) {
      alert("❌ Todos los campos son obligatorios");
      return;
    }

    const url = `http://www.bakend-notas.somee.com/Profesores/Ingresar?DPI=${dpi}&fecha_contratacion=${fecha}&id_usuario=${id_usuario}`;

    try {
      const res = await fetch(url, { method: 'POST' });
      const texto = await res.text();

      if (res.ok) {
        alert("✅ Profesor registrado correctamente");
        setFormulario({ dpi: '', fecha: '', id_usuario: '' });
        setMostrarFormulario(false);
        obtenerProfesores();
      } else {
        alert("❌ Error al registrar\n" + texto);
      }
    } catch (error) {
      alert("❌ Error de conexión");
      console.error(error);
    }
  };

  const profesoresFiltrados = profesores.filter(p => {
    const texto = busqueda.toLowerCase();
    return (
      String(p.dpi || '').toLowerCase().includes(texto) ||
      String(p.fecha || '').toLowerCase().includes(texto) ||
      String(p.id_usuario || '').toLowerCase().includes(texto)
    );
  });

  return (
    <div className="contenedor">
      <h2>Profesores Registrados</h2>

      <button onClick={() => setMostrarFormulario(true)}>+ Agregar Profesor</button>

      <input
        type="text"
        placeholder="Buscar por DPI, fecha o ID de usuario..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ margin: '10px 0', width: '100%' }}
      />

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>DPI</th>
            <th>Fecha Contratación</th>
            <th>ID Usuario</th>
          </tr>
        </thead>
        <tbody>
          {profesoresFiltrados.map((p, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{p.dpi}</td>
              <td>{p.fecha}</td>
              <td>{p.id_usuario}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario emergente */}
      {mostrarFormulario && (
        <form onSubmit={handleRegistrar} style={{ marginTop: '2rem' }}>
          <h3>Registrar Profesor</h3>
          <input
            name="dpi"
            placeholder="DPI"
            value={formulario.dpi}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="fecha"
            placeholder="Fecha de Contratación"
            value={formulario.fecha}
            onChange={handleChange}
            required
          />
          <input
            name="id_usuario"
            placeholder="ID Usuario"
            type="number"
            value={formulario.id_usuario}
            onChange={handleChange}
            required
          />
          <div style={{ marginTop: '10px' }}>
            <button type="submit">Registrar</button>
            <button type="button" onClick={() => setMostrarFormulario(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
