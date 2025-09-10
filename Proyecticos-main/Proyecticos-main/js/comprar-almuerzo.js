let lunches = JSON.parse(localStorage.getItem('lunchData')) || [];
let purchases = JSON.parse(localStorage.getItem('purchaseHistory')) || [];

function savePurchases() {
    localStorage.setItem('purchaseHistory', JSON.stringify(purchases));
}

function displayLunchOptions() {
    const list = document.getElementById('buyLunchList');
    list.innerHTML = '';

    lunches.forEach(lunch => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-2">${lunch.name}</td>
            <td class="border p-2">$${lunch.price.toFixed(2)}</td>
            <td class="border p-2">
                <button onclick="buyLunch(${lunch.id})" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Comprar</button>
            </td>
        `;
        list.appendChild(row);
    });
}

function displayPurchases() {
    const history = document.getElementById('purchaseHistory');
    history.innerHTML = '';

    purchases.forEach(p => {
        const li = document.createElement('li');
        li.className = "border-b py-2";
        li.textContent = `${p.name} - $${p.price.toFixed(2)} (${p.date})`;
        history.appendChild(li);
    });
}

function buyLunch(id) {
    const lunch = lunches.find(l => l.id === id);
    if (lunch) {
        const purchase = {
            name: lunch.name,
            price: lunch.price,
            date: new Date().toLocaleString()
        };
        purchases.push(purchase);
        savePurchases();
        displayPurchases();
        alert(`Has comprado: ${lunch.name}`);
    }
}

displayLunchOptions();
displayPurchases();
