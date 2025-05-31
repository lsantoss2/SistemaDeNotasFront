import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FormularioPage() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({});
  const [tutores, setTutores] = useState([]);
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    setTitulo(id ? `Editar ${tipo}` : `Registrar ${tipo}`);

    if (tipo === 'estudiante') {
      obtenerTutores();
    }

    if (id) {
      fetch(`http://www.bakend-notas.somee.com/${capitalizar(tipo)}/Buscar?id_${tipo}=${id}`)
        .then(res => res.json())
        .then(data => {
          const datos = Array.isArray(data) ? data[0] : data;

          if (tipo === 'estudiante') {
            if (datos.fecha_nacimiento) {
              const fecha = new Date(datos.fecha_nacimiento);
              const yyyy = fecha.getFullYear();
              const mm = String(fecha.getMonth() + 1).padStart(2, '0');
              const dd = String(fecha.getDate()).padStart(2, '0');
              datos.fecha_nacimiento = `${yyyy}-${mm}-${dd}`;
            }

            datos.id_tutor = datos.id_tutor?.toString() || '';
            datos.parentesco = datos.parentesco || '';
          }

          setFormulario(datos);
        })
        .catch(error => {
          console.error(`❌ Error al obtener ${tipo}:`, error);
          alert('No se pudo cargar la información para editar');
        });
    } else {
      setFormulario(getFormularioInicial(tipo));
    }
  }, [tipo, id]);

  const capitalizar = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1);

  const obtenerTutores = async () => {
    try {
      const [resTutores, resUsuarios] = await Promise.all([
        fetch('http://www.bakend-notas.somee.com/Tutor/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Usuario/Buscar')
      ]);
      const dataTutores = await resTutores.json();
      const dataUsuarios = await resUsuarios.json();

      const tutoresCombinados = dataTutores.map(t => {
        const u = dataUsuarios.find(u => u.id_usuario === t.id_usuario) || {};
        return {
          ...t,
          nombre: u.nombre || '',
          apellido: u.apellido || ''
        };
      });

      setTutores(tutoresCombinados);
    } catch (err) {
      console.error('Error cargando tutores', err);
    }
  };

  const getFormularioInicial = (tipo) => {
    switch (tipo) {
      case 'estudiante':
        return {
          id_estudiante: 0,
          nombre: '',
          apellido: '',
          carnet: '',
          fecha_nacimiento: '',
          id_tutor: '',
          parentesco: ''
        };
      default:
        return {};
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const urlBase = `http://www.bakend-notas.somee.com/${capitalizar(tipo)}`;
    const endpoint = id ? `/Modificar` : '/Ingresar';
    const metodo = id ? 'PUT' : 'POST';

    const datos = { ...formulario };

    if (tipo === 'estudiante') {
      const fecha = new Date(formulario.fecha_nacimiento);
      if (isNaN(fecha)) return alert('❌ Fecha inválida');

      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');
      datos.fecha_nacimiento = `${yyyy}-${mm}-${dd}`;

      const idTutorEntero = parseInt(formulario.id_tutor);
      if (isNaN(idTutorEntero)) return alert("❌ Tutor inválido");
      datos.id_tutor = idTutorEntero;

      datos.id_estudiante = parseInt(id || 0);
    }

    console.log("Datos enviados:", datos);

    try {
      const res = await fetch(urlBase + endpoint, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const texto = await res.text();

      if (res.ok) {
        alert(id ? '✅ Modificado correctamente' : '✅ Registrado correctamente');
        navigate(`/${tipo}s`);
      } else {
        console.error("Respuesta del servidor:", texto);
        alert('❌ Error:\n' + texto);
      }
    } catch (err) {
      alert('❌ Error de red');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>{titulo}</h2>
      <form onSubmit={handleSubmit} className="formulario-estudiante">
        <input name="nombre" placeholder="Nombre" value={formulario.nombre || ''} onChange={handleChange} required />
        <input name="apellido" placeholder="Apellido" value={formulario.apellido || ''} onChange={handleChange} required />

        {tipo === 'estudiante' && (
          <>
            <input name="carnet" placeholder="Carnet" value={formulario.carnet || ''} onChange={handleChange} required />
            <input type="date" name="fecha_nacimiento" value={formulario.fecha_nacimiento || ''} onChange={handleChange} required />

            <select name="id_tutor" value={formulario.id_tutor || ''} onChange={handleChange} required>
              <option value="">Seleccionar tutor</option>
              {tutores
  .filter(t => t.id_tutor !== undefined && t.id_tutor !== null)
  .map((t, idx) => (
    <option key={t.id_tutor} value={t.id_tutor.toString()}>
      {t.nombre} {t.apellido}
    </option>
))}

            </select>

            <select
              name="parentesco"
              value={formulario.parentesco || ''}
              onChange={(e) => {
                setFormulario({
                  ...formulario,
                  parentesco: e.target.value === 'otro' ? '' : e.target.value
                });
              }}
              required
            >
              <option value="">Seleccionar parentesco</option>
              <option value="mamá">Mamá</option>
              <option value="papá">Papá</option>
              <option value="tío">Tío</option>
              <option value="tía">Tía</option>
              <option value="abuelo">Abuelo</option>
              <option value="abuela">Abuela</option>
              <option value="hermano">Hermano</option>
              <option value="hermana">Hermana</option>
              <option value="otro">Otro</option>
            </select>

            {!['mamá', 'papá', 'tío', 'tía', 'abuelo', 'abuela', 'hermano', 'hermana'].includes(formulario.parentesco) && (
              <input
                name="parentesco"
                placeholder="Especifique el parentesco"
                value={formulario.parentesco}
                onChange={handleChange}
                required
              />
            )}
          </>
        )}

        <button type="submit">{id ? 'Guardar cambios' : 'Registrar'}</button>
      </form>
    </div>
  );
}
