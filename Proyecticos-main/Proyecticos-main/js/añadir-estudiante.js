let students = JSON.parse(localStorage.getItem('studentData')) || [];

function saveStudents() {
    localStorage.setItem('studentData', JSON.stringify(students));
}

function addStudent(name, grade) {
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    students.push({ id: newId, name, grade });
    saveStudents();
    alert(`Estudiante añadido: ${name}`);
}

document.getElementById('addStudentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('studentName').value;
    const grade = document.getElementById('studentGrade').value;

    if (name && grade) {
        addStudent(name, grade);
        this.reset();
    } else {
        alert("Por favor, complete todos los campos.");
    }
});
