import React, { useEffect, useState } from 'react';

export default function NotasPage() {
  const [notas, setNotas] = useState([]);
  const [formulario, setFormulario] = useState({
    id_curso: '',
    id_estudiante: '',
    nota: '',
    unidad: '',
    grado: '',
    ciclo: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    obtenerNotas();
  }, []);

  const obtenerNotas = async () => {
    try {
      const res = await fetch('http://www.bakend-notas.somee.com/Notas/Buscar');
      const data = await res.json();
      setNotas(data);
    } catch (error) {
      alert("❌ Error al cargar notas");
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = modoEdicion
      ? `http://www.bakend-notas.somee.com/Notas/Modificar?id_nota=${idEditando}`
      : 'http://www.bakend-notas.somee.com/Notas/Ingresar';

    try {
      const res = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formulario)
      });

      if (res.ok) {
        alert(modoEdicion ? '✅ Nota actualizada' : '✅ Nota registrada');
        setFormulario({
          id_curso: '',
          id_estudiante: '',
          nota: '',
          unidad: '',
          grado: '',
          ciclo: ''
        });
        setModoEdicion(false);
        setIdEditando(null);
        obtenerNotas();
      } else {
        alert("❌ Error al registrar/modificar nota");
      }
    } catch (error) {
      alert("❌ Error del servidor");
    }
  };

  const handleEditar = (nota) => {
    setFormulario(nota);
    setIdEditando(nota.id_nota);
    setModoEdicion(true);
  };

  const handleEliminar = async (id_nota) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Notas/Eliminar?id_nota=${id_nota}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('🗑️ Nota eliminada');
        obtenerNotas();
      } else {
        alert('❌ No se pudo eliminar');
      }
    } catch (error) {
      alert('❌ Error del servidor');
    }
  };

  const notasFiltradas = notas.filter(n =>
    Object.values(n).some(valor =>
      valor?.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div className="container">
      <h2>Notas de Clases</h2>
      <input
        type="text"
        placeholder="Buscar notas..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <table className="tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>ID Curso</th>
            <th>ID Estudiante</th>
            <th>Nota</th>
            <th>Unidad</th>
            <th>Grado</th>
            <th>Ciclo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {notasFiltradas.map((n, i) => (
            <tr key={n.id_nota}>
              <td>{i + 1}</td>
              <td>{n.id_curso}</td>
              <td>{n.id_estudiante}</td>
              <td>{n.nota}</td>
              <td>{n.unidad}</td>
              <td>{n.grado}</td>
              <td>{n.ciclo}</td>
              <td>
                <button onClick={() => handleEditar(n)}>✏️</button>
                <button onClick={() => handleEliminar(n.id_nota)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{modoEdicion ? 'Editar Nota' : 'Registrar Nota'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="id_curso" placeholder="ID Curso" value={formulario.id_curso} onChange={handleChange} />
        <input name="id_estudiante" placeholder="ID Estudiante" value={formulario.id_estudiante} onChange={handleChange} />
        <input name="nota" placeholder="Nota" value={formulario.nota} onChange={handleChange} />
        <input name="unidad" placeholder="Unidad" value={formulario.unidad} onChange={handleChange} />
        <input name="grado" placeholder="Grado" value={formulario.grado} onChange={handleChange} />
        <input name="ciclo" placeholder="Ciclo" value={formulario.ciclo} onChange={handleChange} />
        <button type="submit">Registrar</button>
        <button type="button" onClick={() => {
          setFormulario({
            id_curso: '', id_estudiante: '', nota: '', unidad: '', grado: '', ciclo: ''
          });
          setModoEdicion(false);
        }}>Cancelar</button>
      </form>
    </div>
  );
}
