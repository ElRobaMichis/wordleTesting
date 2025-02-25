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
    'GATOS', 'HUEVO', 'JAULA', 'LUCHA', 'MENTA', 'NARIZ'
];

async function isValidWord(word) {
    try {
        // Using a free Spanish dictionary API
        const response = await fetch(`https://spanish-words-api.vercel.app/api/exists/${word.toLowerCase()}`);
        if (response.ok) {
            const data = await response.json();
            return data.exists;
        }
        return false;
    } catch (error) {
        console.error('Error checking word validity:', error);
        // Fallback - if API fails, consider all 5-letter words valid temporarily
        return true;
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