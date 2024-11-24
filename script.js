const bag = {};
let tokenIdCounter = 0; // To give each row a unique id

function addNewTokenRow(name = '', count = 1) {
    const bagContents = document.getElementById('bag-contents');
    const tokenId = `token-${tokenIdCounter++}`; // Unique id for the token

    const row = document.createElement('div');
    row.classList.add('token-row');
    row.dataset.tokenId = tokenId;
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Token Name';
    nameInput.value = name;
    
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.placeholder = 'Count';
    countInput.min = '0';
    countInput.value = count;
    
    const removeButton = document.createElement('button');
    removeButton.onclick = () => {
		row.remove();
        removeToken(tokenId);
    };
    
	removeButton.appendChild(document.createElement('i')).className = 'fas fa-trash';
	// <i class="fas fa-trash"></i>
    row.appendChild(nameInput);
    row.appendChild(countInput);
    row.appendChild(removeButton);
    bagContents.appendChild(row);
    
    // Update the bag when inputs are changed
	console.log("updating the bag?");
    nameInput.onblur = () => updateToken(row, tokenId, nameInput, countInput);
    countInput.oninput = () => updateToken(row, tokenId, nameInput, countInput);

    // Initialize the token in the bag
    updateToken(row, tokenId, nameInput, countInput);
}

function updateToken(row, tokenId, nameInput, countInput) {
    const name = nameInput.value.trim();
    const count = parseInt(countInput.value, 10) || 0;

    if (!name || count === 0) {
        delete bag[tokenId]; // Remove invalid or empty tokens
    } else {
        bag[tokenId] = { name, count };
    }

    updateProbabilities();
}

function removeToken(tokenId) {
    delete bag[tokenId];
    updateProbabilities();
}

function resetBag() {
    document.getElementById('bag-contents').innerHTML = '';
    for (const key in bag) {
        delete bag[key];
    }
    updateProbabilities();
}

function calculateQuery() {
    const draws = parseInt(document.getElementById('query-draws').value, 10);
    const targetToken = document.getElementById('query-token').value.trim();
    const resultElement = document.getElementById('query-result');
    
    if (!targetToken || isNaN(draws) || draws < 1) {
        resultElement.textContent = 'Please provide a valid number of draws and token name.';
        return;
    }
    
    // Find the target token in the bag
    const totalTokens = Object.values(bag).reduce((sum, token) => sum + token.count, 0);
    const targetEntry = Object.values(bag).find(token => token.name === targetToken);
    
    if (!targetEntry) {
        resultElement.textContent = `The token "${targetToken}" does not exist in the bag.`;
        return;
    }
    
    const targetCount = targetEntry.count;
    
    if (draws > totalTokens) {
        resultElement.textContent = 'You cannot draw more tokens than are in the bag!';
        return;
    }
    
    // Calculate the probability using hypergeometric distribution
    const probability = calculateHypergeometric(totalTokens, targetCount, draws);
    resultElement.textContent = `The probability of getting at least one "${targetToken}" in ${draws} draws is ${probability.toFixed(2)}%.`;
}

function calculateHypergeometric(total, target, draws) {
    // Probability of NOT drawing the target token in a single draw:
    const probNoTarget = 1 - target / total;
    
    // Probability of NEVER drawing the target token in `draws` draws:
    const probNoTargetAllDraws = Array.from({ length: draws }).reduce((prob, _, i) => {
        return prob * ((total - target - i) / (total - i));
    }, 1);
    
    // Probability of at least one target token:
    return (1 - probNoTargetAllDraws) * 100;
}

function generateProbabilityGrid() {
    const gridContainer = document.getElementById('grid-container');
    // const maxDraws = parseInt(document.getElementById('max-draws').value, 10);

	const maxDraws = 5;
	
    if (isNaN(maxDraws) || maxDraws < 1) {
        gridContainer.innerHTML = 'Please provide a valid maximum number of draws.';
        return;
    }
    
    const totalTokens = Object.values(bag).reduce((sum, token) => sum + token.count, 0);
    if (totalTokens === 0) {
        gridContainer.innerHTML = 'The bag is empty. Add tokens to see probabilities.';
        return;
    }
    
    // Create the grid table
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    
    // Create the header row (X-Axis: Draw Counts)
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th'); // Empty top-left corner
    headerRow.appendChild(cornerCell);
    
    for (let draw = 1; draw <= maxDraws; draw++) {
        const headerCell = document.createElement('th');
        headerCell.textContent = `Draw ${draw}`;
        headerCell.style.border = '1px solid black';
        headerCell.style.padding = '5px';
        headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);
    
    // Create rows for each token (Y-Axis: Token Names)
    for (const token of Object.values(bag)) {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('th');
        nameCell.textContent = token.name;
        nameCell.style.border = '1px solid black';
        nameCell.style.padding = '5px';
        row.appendChild(nameCell);
        
        for (let draw = 1; draw <= maxDraws; draw++) {
            const cell = document.createElement('td');
            const probability = calculateHypergeometric(totalTokens, token.count, draw);
            cell.textContent = isNaN(probability) ? '-' : `${probability.toFixed(0)}%`;
            cell.style.border = '1px solid black';
            cell.style.padding = '5px';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    
    gridContainer.innerHTML = ''; // Clear old grid
    gridContainer.appendChild(table);
}

// Reuse the hypergeometric function
function calculateHypergeometric(total, target, draws) {
    const probNoTargetAllDraws = Array.from({ length: draws }).reduce((prob, _, i) => {
        return prob * ((total - target - i) / (total - i));
    }, 1);
    
    return (1 - probNoTargetAllDraws) * 100;
}

// Trigger grid generation on bag updates
function updateProbabilities() {
    generateProbabilityGrid();
}
