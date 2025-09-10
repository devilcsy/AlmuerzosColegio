// js/estudiantes.js
// DB local: key = "studentData"
// Funciones: añadir, listar, buscar, eliminar
(function () {
  const LS_KEY = 'studentData';
  let students = JSON.parse(localStorage.getItem(LS_KEY)) || [];

  // Guarda en localStorage
  function saveStudents() {
    localStorage.setItem(LS_KEY, JSON.stringify(students));
    console.log('studentData saved:', students);
  }

  // Escape simple para evitar inyección al renderizar
  function esc(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Mostrar listado (buscar <tbody id="studentList">)
  window.displayStudents = function () {
    const tbody = document.querySelector('#studentList');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center">No hay estudiantes registrados.</td></tr>`;
      return;
    }

    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border px-2 py-1">${esc(s.id)}</td>
        <td class="border px-2 py-1">${esc(s.name)}</td>
        <td class="border px-2 py-1">${esc(s.grade)}</td>
        <td class="border px-2 py-1 text-center">
          <button data-id="${esc(s.id)}" class="delete-btn bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Delegación: botones eliminar
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteStudent(id);
      });
    });
  };

  // Añadir estudiante (si recibes id manual, úsalo; si no, genera uno único)
  function addStudent(name, grade, idProvided) {
    const id = idProvided && String(idProvided).trim() !== '' ? String(idProvided).trim() : Date.now().toString();
    students.push({ id, name, grade });
    saveStudents();
    displayStudents();
  }
  window.addStudent = addStudent;

  // Eliminar por id (coerciona a string)
  window.deleteStudent = function (id) {
    if (!confirm('¿Eliminar este estudiante?')) return;
    students = students.filter(s => String(s.id) !== String(id));
    saveStudents();
    displayStudents();
  };

  // Buscar por id exacto o por nombre parcial (case-insensitive)
  window.searchStudent = function (term) {
    const out = document.getElementById('searchResult');
    if (!out) return [];
    out.innerHTML = '';

    const q = String(term || '').trim().toLowerCase();
    if (!q) {
      out.innerHTML = '<p class="text-red-600">Ingrese un término de búsqueda.</p>';
      return [];
    }

    const results = students.filter(s =>
      String(s.id).toLowerCase() === q || s.name.toLowerCase().includes(q)
    );

    if (results.length === 0) {
      out.innerHTML = '<p class="text-red-600">No se encontraron estudiantes.</p>';
      return [];
    }

    results.forEach(r => {
      const div = document.createElement('div');
      div.className = 'p-2 border-b';
      div.innerHTML = `<strong>ID:</strong> ${esc(r.id)} &nbsp; <strong>Nombre:</strong> ${esc(r.name)} &nbsp; <strong>Grado:</strong> ${esc(r.grade)}`;
      out.appendChild(div);
    });

    return results;
  };

  // Vincular formularios si existen en la página
  document.addEventListener('DOMContentLoaded', () => {
    // Formulario de añadir (acepta optional input #studentId)
    const addForm = document.getElementById('addStudentForm');
    if (addForm) {
      addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const idInput = document.getElementById('studentId');
        const nameInput = document.getElementById('studentName');
        const gradeInput = document.getElementById('studentGrade');

        const idVal = idInput ? idInput.value.trim() : '';
        const nameVal = nameInput ? nameInput.value.trim() : '';
        const gradeVal = gradeInput ? gradeInput.value.trim() : '';

        if (!nameVal || !gradeVal) {
          alert('Por favor completa nombre y grado.');
          return;
        }

        // Si el usuario provee un id, verificar duplicado
        if (idVal) {
          if (students.some(s => String(s.id) === idVal)) {
            alert('Ya existe un estudiante con ese ID.');
            return;
          }
          addStudent(nameVal, gradeVal, idVal);
        } else {
          addStudent(nameVal, gradeVal);
        }

        this.reset();
        alert('Estudiante guardado correctamente.');
      });
    }

    // Formulario de búsqueda
    const searchForm = document.getElementById('searchStudentForm') || document.getElementById('buscarForm') || document.getElementById('buscarFormAlt');
    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = document.getElementById('searchName');
        if (!input) return;
        const q = input.value.trim();
        if (!q) {
          alert('Ingrese nombre o ID para buscar.');
          return;
        }
        searchStudent(q);
      });
    }

    // Mostrar listado si existe el contenedor
    displayStudents();
  });

})();
