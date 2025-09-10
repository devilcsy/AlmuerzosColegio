let lunches = JSON.parse(localStorage.getItem('lunchData')) || [
    { id: 1, name: "Almuerzo Corriente", price: 3.5 },
    { id: 2, name: "Almuerzo Vegetariano", price: 4.0 },
    { id: 3, name: "Almuerzo Especial", price: 5.0 }
];

function saveLunches() {
    localStorage.setItem('lunchData', JSON.stringify(lunches));
}

function displayLunches() {
    const lunchList = document.getElementById('lunchList');
    lunchList.innerHTML = '';

    lunches.forEach(lunch => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-2">${lunch.name}</td>
            <td class="border p-2">$${lunch.price.toFixed(2)}</td>
            <td class="border p-2">
                <button onclick="editLunch(${lunch.id})" class="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600">Editar</button>
                <button onclick="deleteLunch(${lunch.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Eliminar</button>
            </td>
        `;
        lunchList.appendChild(row);
    });
}

function addLunch(name, price) {
    const newId = lunches.length > 0 ? Math.max(...lunches.map(l => l.id)) + 1 : 1;
    lunches.push({ id: newId, name, price });
    saveLunches();
    displayLunches();
}

function editLunch(id) {
    const lunch = lunches.find(l => l.id === id);
    if (lunch) {
        const newName = prompt("Nuevo nombre:", lunch.name);
        const newPrice = parseFloat(prompt("Nuevo precio:", lunch.price));
        if (newName && !isNaN(newPrice)) {
            lunch.name = newName;
            lunch.price = newPrice;
            saveLunches();
            displayLunches();
        } else {
            alert("Por favor, ingrese valores válidos.");
        }
    }
}

function deleteLunch(id) {
    if (confirm("¿Está seguro de que desea eliminar este almuerzo?")) {
        lunches = lunches.filter(l => l.id !== id);
        saveLunches();
        displayLunches();
    }
}

document.getElementById('addLunchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('lunchName').value;
    const price = parseFloat(document.getElementById('lunchPrice').value);

    if (name && !isNaN(price)) {
        addLunch(name, price);
        this.reset();
    } else {
        alert("Por favor, ingrese valores válidos.");
    }
});

displayLunches();
