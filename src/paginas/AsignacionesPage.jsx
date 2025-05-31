import React, { useEffect, useState } from 'react';
import '../estilos/Asignaciones.css';

export default function AsignacionesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [grados, setGrados] = useState([]);
  const [ciclos, setCiclos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    id_est: '',
    id_grado: '',
    id_ciclo: '',
    seccion: ''
  });

  const [idEditando, setIdEditando] = useState(null);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [resEstudiantes, resAsignaciones, resGrados, resCiclos] = await Promise.all([
        fetch('http://www.bakend-notas.somee.com/Estudiante/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Estudiante/Asignacion/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Grado/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Ciclo/Buscar')
      ]);

      const dataEstudiantes = await resEstudiantes.json();
      const dataAsignaciones = await resAsignaciones.json();
      const dataGrados = await resGrados.json();
      const dataCiclos = await resCiclos.json();

      setEstudiantes(dataEstudiantes);
      setAsignaciones(dataAsignaciones);
      setGrados(dataGrados);
      setCiclos(dataCiclos);
    } catch (error) {
      console.error('❌ Error al obtener datos', error);
    }
  };

  const obtenerAsignacionPorEstudiante = (id_est) =>
    asignaciones.find(a => String(a.id_est) === String(id_est));

  const obtenerNombreGrado = (id) => {
    const g = grados.find(grado => String(grado.id) === String(id) || String(grado.id_grado) === String(id));
    return g ? g.nombre : 'No asignado';
  };

  const obtenerNombreCiclo = (id) => {
    const c = ciclos.find(ciclo => String(ciclo.id_ciclo) === String(id));
    return c ? c.ciclo : 'No asignado';
  };

  const handleAsignar = (id_est) => {
    setFormulario({ id_est, id_grado: '', id_ciclo: '', seccion: '' });
    setModoEdicion(false);
    setMostrarFormulario(true);
  };

  const handleEditar = (asignacion) => {
    setFormulario({
      id_est: asignacion.id_est,
      id_grado: asignacion.id_grado,
      id_ciclo: asignacion.id_ciclo,
      seccion: asignacion.seccion
    });
    setIdEditando(asignacion.id_estudiante_grado);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleCancelar = () => {
    setFormulario({ id_est: '', id_grado: '', id_ciclo: '', seccion: '' });
    setModoEdicion(false);
    setIdEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = modoEdicion
      ? 'http://www.bakend-notas.somee.com/Estudiante/Asignacion/Modificar'
      : 'http://www.bakend-notas.somee.com/Estudiante/Asignacion/Ingresar';

    const payload = modoEdicion
      ? { id_estudiante_grado: idEditando, ...formulario }
      : formulario;

    try {
      const res = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      alert(modoEdicion ? '✅ Asignación actualizada' : '✅ Asignación registrada');
      obtenerDatos();
      handleCancelar();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const estudiantesFiltrados = estudiantes.filter(est => {
    const texto = busqueda.toLowerCase();
    const asignacion = obtenerAsignacionPorEstudiante(est.id_estudiante);
    const estadoAsignacion = asignacion ? 'asignado' : 'no_asignado';

    const coincideBusqueda =
      `${est.nombre} ${est.apellido} ${est.carnet}`.toLowerCase().includes(texto);

    const coincideEstado =
      estadoFiltro === '' || estadoFiltro === estadoAsignacion;

    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="contenedor">
      <h2>Asignaciones de Estudiantes</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o carnet..."
          className="input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="input"
          style={{ maxWidth: '200px' }}
        >
          <option value="">Todos los estados</option>
          <option value="asignado">Asignado</option>
          <option value="no_asignado">No asignado</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Carnet</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {estudiantesFiltrados.map((est, idx) => {
            const asignacion = obtenerAsignacionPorEstudiante(est.id_estudiante);
            return (
              <tr key={est.id_estudiante}>
                <td>{idx + 1}</td>
                <td>{est.nombre}</td>
                <td>{est.apellido}</td>
                <td>{est.carnet}</td>
                <td>
                  {asignacion
                    ? <span className="asignado">Asignado ✅</span>
                    : <span className="no-asignado">No asignado ❌</span>}
                </td>
                <td>
                  {asignacion ? (
                    <button className="btn-accion" onClick={() => handleEditar(asignacion)}>✏️ Editar</button>
                  ) : (
                    <button className="btn-accion" onClick={() => handleAsignar(est.id_estudiante)}>➕ Asignar</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {mostrarFormulario && (
        <>
          <div className="fondo-modal" onClick={handleCancelar}></div>
          <form className="formulario-estudiante" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>{modoEdicion ? 'Editar Asignación' : 'Nueva Asignación'}</h3>

            <select name="id_grado" value={formulario.id_grado} onChange={handleChange} required>
              <option value="">Seleccionar grado</option>
              {grados.map(g => (
                <option key={g.id || g.id_grado} value={g.id || g.id_grado}>
                  {g.nombre}
                </option>
              ))}
            </select>

            <select name="id_ciclo" value={formulario.id_ciclo} onChange={handleChange} required>
              <option value="">Seleccionar ciclo</option>
              {ciclos.map(c => (
                <option key={c.id_ciclo} value={c.id_ciclo}>
                  {c.ciclo}
                </option>
              ))}
            </select>

            <input
              name="seccion"
              placeholder="Sección"
              value={formulario.seccion}
              onChange={handleChange}
              required
            />

            <div className="acciones-form">
              <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
              <button type="button" className="cancelar" onClick={handleCancelar}>Cancelar</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
