let targetWord = '';
let currentGuess = '';
let currentRow = 0;
let gameEnded = false;
let validWords = [];

const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

async function loadWords() {
    try {
        const response = await fetch('words.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        validWords = data.words.map(word => word.toUpperCase()); // Guardar todas las palabras válidas
        targetWord = validWords[Math.floor(Math.random() * validWords.length)];
        console.log(targetWord); // Para verificar la palabra seleccionada en la consola
    } catch (error) {
        console.error('Error al cargar las palabras:', error);
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

function handleKeyPress(key) {
    if (gameEnded) return; // Detener interacciones si el juego ha terminado

    if (key === 'ENTER') {
        if (currentGuess.length === 5) {
            if (validWords.includes(currentGuess)) {
                checkGuess();
                showMessage(''); // Limpiar el mensaje cuando la palabra es válida
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
        return;
    }

    currentRow++;
    currentGuess = '';

    if (currentRow === 6) {
        showMessage(`¡Juego terminado! La palabra era ${targetWord}`);
        gameEnded = true;
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
