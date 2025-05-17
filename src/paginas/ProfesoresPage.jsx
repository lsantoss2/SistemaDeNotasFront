import React, { useEffect, useState } from 'react';

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    id_prof: '',
    dpi: '',
    fecha: '',
    id_usuario: ''
  });

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [profRes, userRes] = await Promise.all([
        fetch('http://www.bakend-notas.somee.com/Profesores/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Usuario/Buscar')
      ]);

      const profesoresData = await profRes.json();
      const usuariosData = await userRes.json();

      setProfesores(profesoresData);
      setUsuarios(usuariosData);

      const combinados = profesoresData.map(prof => {
        const user = usuariosData.find(u => u.id_usuario === prof.id_usuario) || {};
        return {
          ...prof,
          usuario: user.usuario || 'N/A',
          nombre: user.nombre || 'N/A',
          apellido: user.apellido || 'N/A',
          rol: user.rol ?? 'N/A'
        };
      });

      setCombinedData(combinados);
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
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
        setFormulario({ id_prof: '', dpi: '', fecha: '', id_usuario: '' });
        setMostrarFormulario(false);
        obtenerDatos();
      } else {
        alert("❌ Error al registrar\n" + texto);
      }
    } catch (error) {
      alert("❌ Error de conexión");
      console.error(error);
    }
  };

  const handleEditar = (prof) => {
    setFormulario({
      id_prof: prof.id_prof,
      dpi: prof.dpi,
      fecha: prof.fecha,
      id_usuario: prof.id_usuario
    });
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleModificar = async (e) => {
    e.preventDefault();
    const { id_prof, dpi, fecha, id_usuario } = formulario;

    const query = new URLSearchParams({
      id: id_prof,
      DPI: dpi,
      fecha_contratacion: fecha,
      id_usuario
    });

    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Profesores/Modificar?${query.toString()}`, {
        method: 'PUT'
      });
      const texto = await res.text();

      if (res.ok) {
        alert("✅ Profesor modificado");
        setFormulario({ id_prof: '', dpi: '', fecha: '', id_usuario: '' });
        setModoEdicion(false);
        setMostrarFormulario(false);
        obtenerDatos();
      } else {
        alert("❌ Error al modificar\n" + texto);
      }
    } catch (error) {
      console.error('❌ Error al modificar:', error);
    }
  };

  const handleEliminar = async (id_prof) => {
    if (!confirm(`¿Eliminar al profesor con ID ${id_prof}?`)) return;

    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Profesores/Eliminar?id=${id_prof}`, {
        method: 'DELETE'
      });

      const texto = await res.text();

      if (res.ok) {
        alert('🗑️ Profesor eliminado');
        obtenerDatos();
      } else {
        alert(`❌ No se pudo eliminar\n${texto}`);
      }
    } catch (error) {
      alert('❌ Error al eliminar profesor');
      console.error(error);
    }
  };

  const profesoresFiltrados = combinedData.filter(p => {
    const texto = busqueda.toLowerCase();
    return (
      p.dpi.toLowerCase().includes(texto) ||
      p.fecha.toLowerCase().includes(texto) ||
      p.usuario?.toLowerCase().includes(texto) ||
      p.nombre?.toLowerCase().includes(texto) ||
      p.apellido?.toLowerCase().includes(texto) ||
      String(p.id_usuario).includes(texto)
    );
  });

  const obtenerNombreRol = (rol) => {
    switch (rol) {
      case 0: return "Administrador";
      case 1: return "Profesor";
      case 2: return "Tutor";
      default: return "Desconocido";
    }
  };

  return (
    <div className="contenedor">
      <h2>Profesores Registrados</h2>

      <button onClick={() => {
        setFormulario({ id_prof: '', dpi: '', fecha: '', id_usuario: '' });
        setModoEdicion(false);
        setMostrarFormulario(true);
      }}>+ Agregar Profesor</button>

      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ margin: '10px 0', width: '100%' }}
      />

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Usuario</th>
            <th>DPI</th>
            <th>Fecha Contratación</th>
            <th>ID Usuario</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {profesoresFiltrados.map((p) => (
            <tr key={p.id_prof}>
              <td>{p.id_prof}</td>
              <td>{p.nombre}</td>
              <td>{p.apellido}</td>
              <td>{p.usuario}</td>
              <td>{p.dpi}</td>
              <td>{p.fecha}</td>
              <td>{p.id_usuario}</td>
              <td>{obtenerNombreRol(p.rol)}</td>
              <td>
                <button onClick={() => handleEditar(p)}>✏️</button>
                <button onClick={() => handleEliminar(p.id_prof)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarFormulario && (
        <form onSubmit={modoEdicion ? handleModificar : handleRegistrar} style={{ marginTop: '2rem' }}>
          <h3>{modoEdicion ? 'Editar Profesor' : 'Registrar Profesor'}</h3>
          {modoEdicion && <input name="id_prof" placeholder="ID" value={formulario.id_prof} onChange={handleChange} required readOnly />}
          <input name="dpi" placeholder="DPI" value={formulario.dpi} onChange={handleChange} required />
          <input type="date" name="fecha" placeholder="Fecha de Contratación" value={formulario.fecha} onChange={handleChange} required />
          <input name="id_usuario" placeholder="ID Usuario" type="number" value={formulario.id_usuario} onChange={handleChange} required />
          <div style={{ marginTop: '10px' }}>
            <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
            <button type="button" onClick={() => setMostrarFormulario(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
