let targetWord = '';
let currentGuess = '';
let currentRow = 0;
let gameEnded = false;
let validWords = [];

const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

// List of common 5-letter Spanish words to pick a random target word
const commonWords = [
    'AMIGO', 'BARCO', 'CIELO', 'DAMAS', 'FUEGO', 'GRANO',
    'HIELO', 'JOVEN', 'LENTO', 'MANGO', 'NIEVE', 'PARED',
    'QUESO', 'RELOJ', 'SILLA', 'TARDE', 'VACIO', 'YERNO',
    'ZORRO', 'ARBOL', 'BESOS', 'COSER', 'DUCHA', 'FINCA',
    'GATOS', 'HUEVO', 'JAULA', 'LUCHA', 'MENTA', 'NARIZ',
    // Added more words for local validation
    'PIANO', 'FELIZ', 'LIBRO', 'COMER', 'BELLO', 'CAMPO',
    'MUJER', 'HABER', 'JUGAR', 'NUEVO', 'MEJOR', 'HACER',
    'MUNDO', 'CASA', 'VIVIR', 'TENER', 'AQUEL', 'PODER',
    'VERDE', 'BEBER', 'CASAR', 'NUBES', 'CINCO', 'ANDAR',
    // Common Spanish words that API might not recognize
    'NOCHE', 'LECHE', 'PERRO', 'GATO', 'PLAYA', 'DULCE',
    'CORTO', 'LARGO', 'COCHE', 'VIAJE', 'PUNTO', 'CLASE',
    'COLOR', 'FORMA', 'JARRO', 'BURRO', 'BANCO', 'TIRAR',
    'PLATO', 'TECHO', 'FALSO', 'PARAR', 'SACAR', 'MIRAR'
];

async function isValidWord(word) {
    try {
        // Update API status display
        document.getElementById('api-status').textContent = 'API Status: Checking...';
        document.getElementById('api-word-check').textContent = `Last word checked: ${word}`;
        
        // First check our local dictionary for common words
        if (commonWords.includes(word)) {
            document.getElementById('api-status').textContent = 'API Status: Using local dictionary';
            document.getElementById('api-response').textContent = 'API Response: Word found in local dictionary';
            return true;
        }

        // Try WordsAPI instead - more reliable Spanish dictionary
        // Using proxy URL to avoid CORS issues on GitHub Pages
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/es/${word.toLowerCase()}`);
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('api-status').textContent = 'API Status: Response received';
            document.getElementById('api-response').textContent = `API Response: Word found in dictionary`;
            
            // If we got a response with meanings, the word exists
            if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
                return true;
            }
            
            return false;
        } else if (response.status === 404) {
            // 404 means word not found in dictionary
            document.getElementById('api-status').textContent = 'API Status: Word not found';
            document.getElementById('api-response').textContent = `API Response: Word not in dictionary`;
            return false;
        }
        
        document.getElementById('api-status').textContent = 'API Status: Response error';
        document.getElementById('api-response').textContent = `API Response: HTTP ${response.status}`;
        
        // Fallback to local dictionary if API fails
        return commonWords.includes(word);
    } catch (error) {
        console.error('Error checking word validity:', error);
        document.getElementById('api-status').textContent = 'API Status: Failed';
        document.getElementById('api-response').textContent = `API Response: ${error.message}`;
        
        // Fallback - if API fails, check if word is in our common words list
        return commonWords.includes(word);
    }
}

async function loadWords() {
    try {
        // Set a random target word from our predefined list
        targetWord = commonWords[Math.floor(Math.random() * commonWords.length)];
        console.log('Target word loaded:', targetWord);
        
        // We don't need to preload all valid words, as we'll check them dynamically
        showMessage('¡Juego listo! Intenta adivinar la palabra de 5 letras.');
    } catch (error) {
        console.error('Error setting up game:', error);
        showMessage('Error al iniciar el juego. Por favor, recarga la página.');
    }
}

function createBoard() {
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.id = `row-${i}-col-${j}`;
            board.appendChild(letterBox);
        }
    }
}

function createKeyboard() {
    const rows = [
        'QWERTYUIOP',
        'ASDFGHJKL',
        'ZXCVBNM'
    ];

    rows.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';
        row.split('').forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = 'key';
            keyElement.id = `key-${key}`;
            keyElement.textContent = key;
            keyElement.addEventListener('click', () => handleKeyPress(key));
            rowElement.appendChild(keyElement);
        });
        keyboard.appendChild(rowElement);
    });

    const enterKey = document.createElement('div');
    enterKey.className = 'key';
    enterKey.id = 'key-ENTER';
    enterKey.textContent = 'ENTER';
    enterKey.addEventListener('click', () => handleKeyPress('ENTER'));

    const deleteKey = document.createElement('div');
    deleteKey.className = 'key';
    deleteKey.id = 'key-DELETE';
    deleteKey.textContent = 'DELETE';
    deleteKey.addEventListener('click', () => handleKeyPress('DELETE'));

    const lastRow = document.createElement('div');
    lastRow.className = 'keyboard-row';
    lastRow.appendChild(enterKey);
    lastRow.appendChild(deleteKey);

    keyboard.appendChild(lastRow);
}

async function handleKeyPress(key) {
    if (gameEnded) return;

    if (key === 'ENTER') {
        if (currentGuess.length === 5) {
            // Check if the word is valid using the dictionary API
            const isValid = await isValidWord(currentGuess);
            if (isValid) {
                checkGuess();
                return;
            } else {
                showMessage('La palabra no es válida');
            }
        } else {
            showMessage('La palabra debe tener 5 letras');
        }
        return;
    }

    if (key === 'DELETE') {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
        return;
    }

    if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
        currentGuess += key;
        updateBoard();
    }
}

function handlePhysicalKeyPress(event) {
    const key = event.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        handleKeyPress(key === 'BACKSPACE' ? 'DELETE' : key);
    }
}

function updateBoard() {
    for (let i = 0; i < 5; i++) {
        const letterBox = document.getElementById(`row-${currentRow}-col-${i}`);
        letterBox.textContent = currentGuess[i] || '';
    }
}

function checkGuess() {
    const guess = currentGuess;
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');

    const letterCount = {};
    for (let i = 0; i < 5; i++) {
        letterCount[targetLetters[i]] = (letterCount[targetLetters[i]] || 0) + 1;
    }

    // First pass: mark correct letters
    for (let i = 0; i < 5; i++) {
        const letterBox = document.getElementById(`row-${currentRow}-col-${i}`);
        const letter = guess[i];

        if (letter === targetWord[i]) {
            letterBox.classList.add('correct');
            updateKeyboard(letter, 'correct');
            letterCount[letter]--;
        }
    }

    // Second pass: mark present and absent letters
    for (let i = 0; i < 5; i++) {
        const letterBox = document.getElementById(`row-${currentRow}-col-${i}`);
        const letter = guess[i];

        if (letter !== targetWord[i]) {
            if (targetLetters.includes(letter) && letterCount[letter] > 0) {
                letterBox.classList.add('present');
                updateKeyboard(letter, 'present');
                letterCount[letter]--;
            } else {
                letterBox.classList.add('absent');
                updateKeyboard(letter, 'absent');
            }
        }
    }

    if (guess === targetWord) {
        showMessage('¡Felicidades! Adivinaste la palabra.');
        gameEnded = true;
    } else {
        currentRow++;
        currentGuess = '';
        if (currentRow === 6) {
            gameEnded = true;
            showMessage(`¡Juego terminado! La palabra era ${targetWord}`);
        }
    }
}

function updateKeyboard(letter, status) {
    const keyElement = document.getElementById(`key-${letter}`);
    if (status === 'correct') {
        keyElement.className = 'key correct';
    } else if (status === 'present' && !keyElement.classList.contains('correct')) {
        keyElement.className = 'key present';
    } else if (status === 'absent' && !keyElement.classList.contains('correct') && !keyElement.classList.contains('present')) {
        keyElement.className = 'key absent';
    }
}

function showMessage(text) {
    message.textContent = text;
}

createBoard();
createKeyboard();
loadWords();
document.addEventListener('keydown', handlePhysicalKeyPress);