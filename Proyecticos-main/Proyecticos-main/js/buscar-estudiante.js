let students = JSON.parse(localStorage.getItem('studentData')) || [];

function searchStudent(name) {
    const results = students.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
    const resultDiv = document.getElementById('searchResult');
    resultDiv.innerHTML = '';

    if (results.length === 0) {
        resultDiv.innerHTML = `<p class="text-red-500">No se encontraron estudiantes con ese nombre.</p>`;
        return;
    }

    results.forEach(s => {
        const p = document.createElement('p');
        p.textContent = `ID: ${s.id} | Nombre: ${s.name} | Grado: ${s.grade}`;
        resultDiv.appendChild(p);
    });
}

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('searchName').value;
    if (name) {
        searchStudent(name);
    } else {
        alert("Por favor ingrese un nombre.");
    }
});
