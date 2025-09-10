let students = JSON.parse(localStorage.getItem('studentData')) || [];

function displayStudents() {
    const list = document.getElementById('studentList');
    list.innerHTML = '';

    if (students.length === 0) {
        list.innerHTML = `<tr><td colspan="3" class="text-center p-2">No hay estudiantes registrados.</td></tr>`;
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-2">${student.id}</td>
            <td class="border p-2">${student.name}</td>
            <td class="border p-2">${student.grade}</td>
        `;
        list.appendChild(row);
    });
}

displayStudents();
