import React, { useEffect, useState } from 'react';

export default function MisNotasPage() {
  const [notasPorEstudiante, setNotasPorEstudiante] = useState([]);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    obtenerNotas();
  }, []);

  const obtenerNotas = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (!usuario) {
        alert("No hay usuario logueado.");
        return;
      }

      console.log('🟢 ID del usuario logueado:', usuario.id);

      // Obtener estudiantes asociados
      const resEst = await fetch('http://www.bakend-notas.somee.com/Estudiante/Buscar');
      const estudiantes = await resEst.json();

      // Obtener estudiantes relacionados por tutor
      const resTutores = await fetch('http://www.bakend-notas.somee.com/Tutor/Buscar');
      const tutores = await resTutores.json();
      const tutor = tutores.find(t => t.id_usuario === usuario.id);

      if (!tutor) {
        alert('No se encontró tutor asociado.');
        return;
      }

      const estudiantesAsociados = estudiantes.filter(est =>
        est.tutores.some(t => t.id_tutor === tutor.id)
      );

      console.log('🟢 Estudiantes asociados:', estudiantesAsociados);

      if (estudiantesAsociados.length === 0) {
        alert("No hay estudiantes asignados a este tutor.");
        return;
      }

      // Obtener cursos para mostrar nombres
      const resCursos = await fetch('http://www.bakend-notas.somee.com/Curso/Buscar');
      const cursosData = await resCursos.json();
      setCursos(cursosData);

      // Obtener notas
      const resNotas = await fetch('http://www.bakend-notas.somee.com/Notas/Buscar');
      const todasNotas = await resNotas.json();

      const agrupadas = estudiantesAsociados.map(est => {
        const notasEst = todasNotas.filter(n => n.id_estudiante === est.id_estudiante);
        const notasConCurso = notasEst.map(nota => {
          const curso = cursosData.find(c => c.id_curso === nota.id_curso);
          return {
            ...nota,
            nombreCurso: curso?.nombre || 'Sin curso'
          };
        });

        return {
          estudiante: est,
          notas: notasConCurso
        };
      });

      setNotasPorEstudiante(agrupadas);
    } catch (error) {
      console.error("❌ Error al cargar notas:", error);
      alert("Error al cargar notas.");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📘 Mis Notas</h2>

      {notasPorEstudiante.length === 0 ? (
        <p>No hay notas disponibles.</p>
      ) : (
        notasPorEstudiante.map(({ estudiante, notas }) => (
          <div key={estudiante.id_estudiante} style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#003366' }}>👨‍🎓 {estudiante.nombre}</h3>

            {notas.length === 0 ? (
              <p>Este estudiante no tiene notas registradas.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Curso</th>
                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Unidad</th>
                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Punteo</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map(nota => (
                    <tr key={nota.id_nota}>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{nota.nombreCurso}</td>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{nota.unidad}</td>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{nota.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
}
