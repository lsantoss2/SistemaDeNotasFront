import React, { useEffect, useState } from 'react';
import '../estilos/Profesores.css';

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    id_prof: '',
    dpi: '',
    fecha: '',
    id_usuario: '',
    nombre: '',
    apellido: '',
    usuario: ''
  });

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [profRes, userRes, cursosRes] = await Promise.all([
        fetch('http://www.bakend-notas.somee.com/Profesores/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Usuario/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Curso/Buscar')
      ]);

      const profesoresData = await profRes.json();
      const usuariosData = await userRes.json();
      const cursosData = await cursosRes.json();

      setProfesores(profesoresData);
      setUsuarios(usuariosData);
      setCursos(cursosData);

      const combinados = profesoresData.map(prof => {
        const user = usuariosData.find(u => u.id_usuario === prof.id_usuario) || {};
        const curso = cursosData.find(c => c.id_profesor === prof.id_prof) || {};

        return {
          ...prof,
          usuario: user.usuario || 'N/A',
          nombre: user.nombre || 'N/A',
          apellido: user.apellido || 'N/A',
          materia: curso.nombre || 'No asignado'
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
        setFormulario({ id_prof: '', dpi: '', fecha: '', id_usuario: '', nombre: '', apellido: '', usuario: '' });
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
      id_usuario: prof.id_usuario,
      nombre: prof.nombre,
      apellido: prof.apellido,
      usuario: prof.usuario
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
        setFormulario({ id_prof: '', dpi: '', fecha: '', id_usuario: '', nombre: '', apellido: '', usuario: '' });
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
      p.materia?.toLowerCase().includes(texto)
    );
  });

  // Filtrar usuarios con rol 1 y que NO estén ya asignados como profesores (excepto el que se edita)
  const usuariosDisponibles = usuarios.filter(u => {
    const esProfesor = profesores.some(p => p.id_usuario === u.id_usuario);
    if (modoEdicion && parseInt(formulario.id_usuario) === u.id_usuario) {
      return true; // Asegurar que el usuario actual se muestre en edición
    }
    return u.rol === 1 && !esProfesor;
  });

  return (
    <div className="contenedor-profesores">
      <div className="encabezado">
        <h2>Profesores Registrados</h2>
        <button className="btn-agregar" onClick={() => {
          setFormulario({ id_prof: '', dpi: '', fecha: '', id_usuario: '', nombre: '', apellido: '', usuario: '' });
          setModoEdicion(false);
          setMostrarFormulario(true);
        }}>+ Agregar Profesor</button>
      </div>

      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="input"
      />

      <table className="tabla-profesores">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Usuario</th>
            <th>DPI</th>
            <th>Fecha Contratación</th>
            <th>Materia</th>
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
              <td>{p.materia}</td>
              <td>
                <button className="btn-accion" onClick={() => handleEditar(p)}>✏️</button>
                <button className="btn-accion" onClick={() => handleEliminar(p.id_prof)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarFormulario && (
        <>
          <div className="fondo-modal" onClick={() => setMostrarFormulario(false)}></div>

          <form
            className="formulario-profesor"
            onClick={(e) => e.stopPropagation()}
            onSubmit={modoEdicion ? handleModificar : handleRegistrar}
          >
            <h3>{modoEdicion ? 'Editar Profesor' : 'Registrar Profesor'}</h3>
            {modoEdicion && (
              <input
                name="id_prof"
                placeholder="ID"
                value={formulario.id_prof}
                onChange={handleChange}
                readOnly
              />
            )}
            <input name="dpi" placeholder="DPI" value={formulario.dpi} onChange={handleChange} required />
            <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} required />

            <select
              name="id_usuario"
              value={formulario.id_usuario}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar usuario</option>
              {/* Mostrar el usuario actual en edición si no está en la lista */}
              {modoEdicion && !usuariosDisponibles.some(u => u.id_usuario === parseInt(formulario.id_usuario)) && (
                <option value={formulario.id_usuario}>
                  {formulario.nombre} {formulario.apellido} ({formulario.usuario})
                </option>
              )}
              {usuariosDisponibles.map(u => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre} {u.apellido} ({u.usuario})
                </option>
              ))}
            </select>

            <div className="acciones-form">
              <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
              <button type="button" className="cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
