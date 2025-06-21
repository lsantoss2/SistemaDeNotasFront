import React, { useEffect, useState } from 'react';
import '../estilos/CursosPage.css';

export default function CursosPage() {
  const [cursos, setCursos] = useState([]);
  const [formulario, setFormulario] = useState({
    id_curso: '',
    nombre: '',
    id_profesor: '',
    id_grado: '',
    id_horario: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [profesores, setProfesores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [grados, setGrados] = useState([]);

  const horarios = [
    { id_horario: 2, hora_inicio: '07:00:00', hora_fin: '07:45:00' },
    { id_horario: 3, hora_inicio: '07:45:00', hora_fin: '08:30:00' },
    { id_horario: 4, hora_inicio: '08:30:00', hora_fin: '09:15:00' },
    { id_horario: 5, hora_inicio: '09:15:00', hora_fin: '10:00:00' },
    { id_horario: 6, hora_inicio: '10:00:00', hora_fin: '10:45:00' },
    { id_horario: 7, hora_inicio: '10:45:00', hora_fin: '11:30:00' },
    { id_horario: 8, hora_inicio: '11:30:00', hora_fin: '12:15:00' },
    { id_horario: 9, hora_inicio: '12:15:00', hora_fin: '13:00:00' }
  ];

  useEffect(() => {
    obtenerCursos();
    obtenerProfesores();
    obtenerUsuarios();
    obtenerGrados();
  }, []);

  const obtenerCursos = async () => {
    try {
      const res = await fetch('https://proxy-somee.onrender.com/api/Curso/Buscar');
      const data = await res.json();
      setCursos(data);
      console.log('📚 Cursos cargados:', data);
    } catch (error) {
      console.error('❌ Error al cargar cursos:', error);
    }
  };

  const obtenerProfesores = async () => {
    try {
      const res = await fetch('https://proxy-somee.onrender.com/api/Profesores/Buscar');
      const data = await res.json();
      setProfesores(data);
      console.log('👨‍🏫 Profesores cargados:', data);
    } catch (error) {
      console.error('❌ Error al cargar profesores:', error);
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch('https://proxy-somee.onrender.com/api/Usuario/Buscar');
      const data = await res.json();
      setUsuarios(data);
      console.log('🧑‍💻 Usuarios cargados:', data);
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
    }
  };

  const obtenerGrados = async () => {
    try {
      const res = await fetch('https://proxy-somee.onrender.com/api/Grado/Buscar');
      const data = await res.json();
      setGrados(data);
      console.log('🎓 Grados cargados:', data);
    } catch (error) {
      console.error('❌ Error al cargar grados:', error);
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
    console.log('📝 Formulario actualizado:', { ...formulario, [e.target.name]: e.target.value });
  };

  const handleEditar = (curso) => {
    setFormulario({
      id_curso: curso.id_curso,
      nombre: curso.nombre,
      id_profesor: curso.id_profesor,
      id_grado: curso.id_grado,
      id_horario: curso.id_horario
    });
    setModoEdicion(true);
    setMostrarFormulario(true);
    console.log('✏️ Editando curso:', curso);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Deseas eliminar este curso?")) return;
    try {
      const res = await fetch(`https://proxy-somee.onrender.com/api/Curso/Eliminar?id_curso=${id}`, {
        method: 'DELETE'
      });
      const texto = await res.text();
      console.log('🗑️ Respuesta al eliminar:', texto);
      if (res.ok) {
        alert("🗑️ Curso eliminado");
        obtenerCursos();
      } else {
        alert("❌ Error al eliminar:\n" + texto);
      }
    } catch (error) {
      console.error('❌ Error al eliminar curso:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nombre: formulario.nombre,
      id_profesor: parseInt(formulario.id_profesor),
      id_grado: parseInt(formulario.id_grado),
      id_horario: parseInt(formulario.id_horario)
    };

    if (modoEdicion && formulario.id_curso) {
      payload.id_curso = parseInt(formulario.id_curso);
    }

    console.log('🚀 Enviando payload:', payload);

    const url = modoEdicion
      ? 'https://proxy-somee.onrender.com/api/Curso/Modificar'
      : 'https://proxy-somee.onrender.com/api/Curso/Ingresar';

    const metodo = modoEdicion ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const texto = await res.text();
      console.log('📨 Respuesta del servidor:', res.status, texto);
      if (res.ok) {
        alert(modoEdicion ? '✅ Curso actualizado' : '✅ Curso creado');
        setMostrarFormulario(false);
        setModoEdicion(false);
        setFormulario({ id_curso: '', nombre: '', id_profesor: '', id_grado: '', id_horario: '' });
        obtenerCursos();
      } else {
        alert('❌ Error:\n' + texto);
      }
    } catch (err) {
      console.error('❌ Error en conexión:', err);
      alert('❌ Error en conexión: ' + err.message);
    }
  };

  return (
    <div className="contenedor-cursos">
      <div className="encabezado">
        <h2>Cursos Registrados</h2>
        <button className="btn-agregar" onClick={() => {
          setFormulario({ id_curso: '', nombre: '', id_profesor: '', id_grado: '', id_horario: '' });
          setModoEdicion(false);
          setMostrarFormulario(true);
          console.log('➕ Nuevo curso');
        }}>
          + Nuevo Curso
        </button>
      </div>

      <table className="tabla-cursos">
        <thead>
          <tr>
            <th>#</th>
            <th>Curso</th>
            <th>Profesor</th>
            <th>Grado</th>
            <th>Horario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso, idx) => {
            const prof = profesores.find(p => p.id_prof === curso.id_profesor);
            const usuario = usuarios.find(u => u.id_usuario === prof?.id_usuario);
            const grado = grados.find(g => g.id === curso.id_grado);
            const horario = horarios.find(h => h.id_horario === curso.id_horario);

            return (
              <tr key={curso.id_curso}>
                <td>{idx + 1}</td>
                <td>{curso.nombre}</td>
                <td>{usuario ? usuario.nombre : '—'}</td>
                <td>{grado ? grado.nombre : '—'}</td>
                <td>{horario ? `${horario.hora_inicio} - ${horario.hora_fin}` : '—'}</td>
                <td>
                  <button onClick={() => handleEditar(curso)}>✏️</button>
                  <button onClick={() => handleEliminar(curso.id_curso)}>🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {mostrarFormulario && (
        <>
          <div className="fondo-modal" onClick={() => setMostrarFormulario(false)}></div>
          <form className="formulario-curso" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
            <h3>{modoEdicion ? "Editar Curso" : "Nuevo Curso"}</h3>

            <input name="nombre" placeholder="Nombre del curso" value={formulario.nombre} onChange={handleChange} required />

            <select name="id_profesor" value={formulario.id_profesor} onChange={handleChange} required>
              <option value="">Seleccionar profesor</option>
              {profesores.map(p => {
                const u = usuarios.find(u => u.id_usuario === p.id_usuario);
                return (
                  <option key={p.id_prof} value={p.id_prof}>
                    {u ? u.nombre : 'Profesor ' + p.id_prof}
                  </option>
                );
              })}
            </select>

            <select name="id_grado" value={formulario.id_grado} onChange={handleChange} required>
              <option value="">Seleccionar grado</option>
              {grados.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>

            <select name="id_horario" value={formulario.id_horario} onChange={handleChange} required>
              <option value="">Seleccionar horario</option>
              {horarios.map(h => (
                <option key={h.id_horario} value={h.id_horario}>
                  {h.hora_inicio} - {h.hora_fin}
                </option>
              ))}
            </select>

            <div className="acciones-form">
              <button type="submit">Guardar</button>
              <button type="button" className="cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
