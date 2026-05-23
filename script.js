const addProductName = document.getElementById('addProductName');
const addButton = document.getElementById('addProductButton');
const listContainer = document.getElementById('listContainer');


//interactive keys
function setupItemListeners(listItem) {
    const incBtn = listItem.querySelector('.inc-item');
    const decBtn = listItem.querySelector('.dec-item');
    const delBtn = listItem.querySelector('.del-item');
    const boughtBtn = listItem.querySelector('.bought');
    const amountSpan = listItem.querySelector('.amount');
    const itemName = listItem.querySelector('.item-name');

    let currentAmount = amountSpan ? parseInt(amountSpan.textContent) : 1;

    if (decBtn)    decBtn.disabled = (currentAmount <= 1);

    if (incBtn) {
        incBtn.addEventListener('click', () => {
            currentAmount++;
            amountSpan.textContent = currentAmount;
            if (decBtn) decBtn.disabled = false;
            updateStatistics();
        });
    }

    if (decBtn) {
        decBtn.addEventListener('click', () => {
            if (currentAmount > 1) {
                currentAmount--;
                amountSpan.textContent = currentAmount;
                if (currentAmount === 1) decBtn.disabled = true;
                updateStatistics();
            }
        });
    }

    if (delBtn) {
        delBtn.addEventListener('click', () => {
            listItem.remove();
            updateStatistics();
        });
    }

    if (boughtBtn) {
        if (listItem.querySelector('s') && !listItem.querySelector('.item-name'))
            listItem.style.opacity = '0.5';


        boughtBtn.addEventListener('click', () => {
            if (listItem.style.opacity === '0.5') {
                listItem.style.opacity = '1';
                if (itemName) listItem.style.textDecoration = 'none';
                boughtBtn.textContent = 'Не куплено';
                if (incBtn) incBtn.style.display = '';
                if (decBtn) decBtn.style.display = '';
                if (delBtn) delBtn.style.display = '';

            }
            else {
                listItem.style.opacity = '0.5';
                if (itemName) listItem.style.textDecoration = 'line-through';
                boughtBtn.textContent = 'Куплено';
                if (incBtn) incBtn.style.display = 'none';
                if (decBtn) decBtn.style.display = 'none';
                if (delBtn) delBtn.style.display = 'none';

            }
            updateStatistics();
        });
    }

    if (itemName) {
        itemName.addEventListener('click', () => {
            if (listItem.style.opacity === '0.5') return;

            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = itemName.textContent.trim();
            editInput.className = 'edit-input';

            itemName.style.display = 'none';
            itemName.parentNode.insertBefore(editInput, itemName);
            editInput.focus();

            const saveChanges = () => {
                const newText = editInput.value.trim();
                if (newText !== '') {
                    itemName.textContent = newText;
                    updateStatistics();
                }
                editInput.remove();
                itemName.style.display = '';
            };

            editInput.addEventListener('blur', saveChanges);
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') editInput.blur();
            });
        });
    }
}




function updateStatistics() {
    const leftToBuyContainer = document.getElementById('leftToBuyContainer');
    const boughtContainer = document.getElementById('boughtContainer');

    if (!leftToBuyContainer || !boughtContainer) return;

    leftToBuyContainer.innerHTML = '';
    boughtContainer.innerHTML = '';

    const items = document.querySelectorAll('#listContainer li');

    const cartData = [];

    items.forEach(item => {
        let nameElement = item.querySelector('.item-name');
        let name = "";

        if (nameElement)   name = nameElement.textContent.trim();
        else {
            let sElement = item.querySelector('s');
            if (sElement) name = sElement.textContent.trim();
            else {
                let itemDiv = item.querySelector('.item');
                if (itemDiv) {
                    let clone = itemDiv.cloneNode(true);
                    let qty = clone.querySelector('.item-quantity'); if (qty) qty.remove();
                    let acts = clone.querySelector('.item-actions'); if (acts) acts.remove();
                    name = clone.textContent.trim();
                }
            }
        }

        const amountSpan = item.querySelector('.amount');
        const quantity = amountSpan ? parseInt(amountSpan.textContent.trim()) : 1;
        const isBought = item.style.opacity === '0.5' || (item.style.opacity !== '1' && item.querySelector('s'));

        cartData.push({ name: name, amount: quantity, isBought: isBought });

        const statHTML = `
            <span class="bought-amount">${isBought ? `<s>${name}</s>` : name}
                <span class="bought-amount-number">${quantity}</span>
            </span>
        `;

        if (isBought)    boughtContainer.insertAdjacentHTML('beforeend', statHTML);
         else   leftToBuyContainer.insertAdjacentHTML('beforeend', statHTML);

    });

    localStorage.setItem('shoppingList', JSON.stringify(cartData));
}





//adding new items
addButton.addEventListener('click', (e) => {
    e.preventDefault();

    const text = addProductName.value.trim();
    if (text === '') return;

    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <div class="item">
            <span class="item-name">${text}</span>
            <div class="item-quantity">
                <button class="dec-item" data-tooltip="Видалити товар">-</button>
                <span class="amount">1</span>
                <button class="inc-item" data-tooltip="Додати товар">+</button>
            </div>
            <div class="item-actions">
                <span class="bought">Не куплено</span>
                <button class="del-item" data-tooltip="Видалити товар">х</button>
            </div>
        </div>
    `;

    setupItemListeners(listItem);
    listContainer.appendChild(listItem);

    updateStatistics();
    addProductName.value = '';
});




addProductName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addButton.click();
    }
});



function loadCartFromStorage() {
    const savedData = localStorage.getItem('myShoppingList');
    if (savedData) {
        const cartArray = JSON.parse(savedData);

        listContainer.innerHTML = '';

        cartArray.forEach(data => {
            const listItem = document.createElement('li');
            if (data.isBought)    listItem.style.opacity = '0.5';
            listItem.innerHTML = `
                <div class="item">
                    <span class="item-name" ${data.isBought ? 'style="text-decoration: line-through;"' : ''}>${data.name}</span>
                    <div class="item-quantity">
                        <button class="dec-item" data-tooltip="Видалити товар">-</button>
                        <span class="amount">${data.amount}</span>
                        <button class="inc-item" data-tooltip="Додати товар">+</button>
                    </div>
                    <div class="item-actions">
                        <span class="bought">${data.isBought ? 'Не куплено' : 'Куплено'}</span>
                        <button class="del-item" data-tooltip="Видалити товар">х</button>
                    </div>
                </div>
            `;

            setupItemListeners(listItem);
            listContainer.appendChild(listItem);
        });

        updateStatistics();
    }
}

loadCartFromStorage();


