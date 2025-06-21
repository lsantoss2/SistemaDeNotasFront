import React, { useEffect, useState } from 'react';

export default function HorariosPage() {
  const [horariosPorEstudiante, setHorariosPorEstudiante] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerHorarios = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario || usuario.rol !== 2) {
          alert('No hay estudiante detectado.');
          return;
        }

        // Obtener todos los cursos
        const resCursos = await fetch('https://proxy-somee.onrender.com/api/Curso/Buscar');
        const cursos = await resCursos.json();

        // Obtener todos los estudiantes
        const resEstudiantes = await fetch('https://proxy-somee.onrender.com/api/Estudiante/Buscar');
        const estudiantes = await resEstudiantes.json();

        // Obtener ID del tutor desde el usuario
        const resTutor = await fetch('https://proxy-somee.onrender.com/api/Tutor/Buscar');
        const tutores = await resTutor.json();
        const tutorEncontrado = tutores.find(t => t.id_usuario === usuario.id);

        if (!tutorEncontrado) {
          alert('Tutor no encontrado.');
          return;
        }

        const estudiantesAsociados = estudiantes.filter(e =>
          e.tutores?.some(t => t.id_tutor === tutorEncontrado.id)
        );

        const resultado = [];

        for (const estudiante of estudiantesAsociados) {
          const cursosEstudiante = cursos.filter(c => c.id_grado === estudiante.id_grado);
          const horariosEstudiante = [];

          for (const curso of cursosEstudiante) {
            const resHorario = await fetch(`https://proxy-somee.onrender.com/api/Horarios/GetHorario?id_curso=${curso.id_curso}`);
            const horario = await resHorario.json();
            horariosEstudiante.push({
              curso: curso.nombre,
              hora_entrada: horario.hora_entrada,
              hora_salida: horario.hora_salida
            });
          }

          resultado.push({
            estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
            horarios: horariosEstudiante
          });
        }

        setHorariosPorEstudiante(resultado);
        setCargando(false);
      } catch (error) {
        console.error('❌ Error al obtener horarios:', error);
        alert('Error al obtener horarios');
      }
    };

    obtenerHorarios();
  }, []);

  return (
    <div className="contenedor-horarios">
      <h2>🕒 Horarios de Clases</h2>
      {cargando ? (
        <p>Cargando horarios...</p>
      ) : horariosPorEstudiante.length === 0 ? (
        <p>No hay horarios disponibles.</p>
      ) : (
        horariosPorEstudiante.map((item, index) => (
          <div key={index} style={{ marginBottom: '2rem' }}>
            <h3>{item.estudiante} - Cursos</h3>
            <table className="tabla-horarios">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Hora de Entrada</th>
                  <th>Hora de Salida</th>
                </tr>
              </thead>
              <tbody>
                {item.horarios.map((horario, i) => (
                  <tr key={i}>
                    <td>{horario.curso}</td>
                    <td>{horario.hora_entrada}</td>
                    <td>{horario.hora_salida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
