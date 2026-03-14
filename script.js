// TAILWIND CSS

tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#8B4513',
                secondary: '#A0522D'
            },
            borderRadius: {
                'none': '0px',
                'sm': '4px',
                DEFAULT: '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '20px',
                '2xl': '24px',
                '3xl': '32px',
                'full': '9999px',
                'button': '8px'
            }
        }
    }
}

let gameState = {
    board: Array(16).fill(0),
    score: 0,
    bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
    gameMode: null,
    previousStates: [],
    aiRunning: false, // checking for ai 
    aiInterval: null // stores the timer ID returned by setInterval. ( if not storred id , i cant stop the ai )
};

function startGame(mode) {
    gameState.gameMode = mode;
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');

    const undoBtn = document.getElementById('undo-btn');
    const aiControls = document.getElementById('ai-controls');

    if (mode === 'ai') {
        aiControls.classList.remove('hidden'); // show AI controls
        undoBtn.classList.add('hidden');        // hide Undo button
    } else {
        aiControls.classList.add('hidden');    // hide AI controls
        undoBtn.classList.remove('hidden');    // show Undo button
    }

    resetGame();
}


function backToMenu() {
    document.getElementById('mode-selection').classList.remove('hidden');
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    if (gameState.aiRunning) {
        toggleAI();
    }
}

function resetGame() {
    gameState.board = Array(16).fill(0);
    gameState.score = 0;
    gameState.previousStates = [];
    updateScore();
    addNewTile();
    addNewTile();
    document.getElementById('game-over').classList.add('hidden');
    renderBoard(); // updating UI with 2 new tiless in the game ..
}

function addNewTile() {
    const emptyCells = gameState.board.reduce((acc, val, idx) => { // acc -> accumulator => [](empty array)
        if (val === 0) acc.push(idx);
        return acc;
    }, []);
    if (emptyCells.length) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameState.board[randomCell] = Math.random() < 0.9 ? 2 : 4; // 90% => 2 ; 10% => 4 ; 
    }
}

function renderBoard() {
    const tiles = document.querySelectorAll('.tile'); // select all tiles 
    gameState.board.forEach((value, index) => {
        tiles[index].textContent = value || '';
        tiles[index].className = `aspect-square rounded flex items-center justify-center tile ${value ? 'tile-' + value : 'bg-gray-200'}`;
        if (value) tiles[index].classList.add('new-tile'); // special animation for new tiles entryy 
    });
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('bestScore', gameState.bestScore); // storing new base score in local storage
        document.getElementById('best-score').textContent = gameState.bestScore; // displaying best score UI
    }
}

// LOGIC BEHIND MOVING A DIRECTION 

function move(direction) {
    const previousBoard = [...gameState.board];
    const previousScore = gameState.score;
    let moved = false;
    let merged = Array(16).fill(false);
    if (direction === 'left' || direction === 'right') {
        for (let row = 0; row < 4; row++) {
            const line = [];
            for (let col = 0; col < 4; col++) {
                const value = gameState.board[row * 4 + col];
                if (value) line.push(value);
            }
            if (direction === 'right') line.reverse();
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    gameState.score += line[i];
                    line.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (line.length < 4) line.push(0);
            if (direction === 'right') line.reverse();
            for (let col = 0; col < 4; col++) {
                if (gameState.board[row * 4 + col] !== line[col]) {
                    moved = true;
                }
                gameState.board[row * 4 + col] = line[col];
            }
        }
    } else {
        for (let col = 0; col < 4; col++) {
            const line = [];
            for (let row = 0; row < 4; row++) {
                const value = gameState.board[row * 4 + col];
                if (value) line.push(value);
            }
            if (direction === 'down') line.reverse();
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    gameState.score += line[i];
                    line.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (line.length < 4) line.push(0);
            if (direction === 'down') line.reverse();
            for (let row = 0; row < 4; row++) {
                if (gameState.board[row * 4 + col] !== line[row]) {
                    moved = true;
                }
                gameState.board[row * 4 + col] = line[row];
            }
        }
    }
    if (moved) {
        gameState.previousStates.push({
            board: previousBoard,
            score: previousScore
        });
        addNewTile();
        updateScore();
        renderBoard();
        if (!canMove()) {
            gameOver();
        }
    }
    return moved; // returns TRUE -> this helps AI - take next decision 
}

function canMove() {
    for (let i = 0; i < 16; i++) {
        if (gameState.board[i] === 0) return true;
        const row = Math.floor(i / 4);
        const col = i % 4;
        if (col < 3 && gameState.board[i] === gameState.board[i + 1]) return true; // HORIZONTAL merges possible
        if (row < 3 && gameState.board[i] === gameState.board[i + 4]) return true; // VERTICLE merges possiblee
    }
    return false;
}

function gameOver() {
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').textContent = gameState.score;
    if (gameState.aiRunning) {
        toggleAI();
    }
}

function undoMove() {
    if (gameState.previousStates.length && gameState.gameMode === 'human') { // checks if there is atleast one prev state 
        const previousState = gameState.previousStates.pop();
        gameState.board = previousState.board;
        gameState.score = previousState.score;
        updateScore();
        renderBoard();
    }
}

function toggleAI() {
    gameState.aiRunning = !gameState.aiRunning; // TOGGLEEE AI 
    const button = document.getElementById('ai-toggle');
    const status = document.getElementById('ai-status');
    const speedCheckbox = document.getElementById('ai-speed');
    if (gameState.aiRunning) {
        button.textContent = 'Stop AI';
        button.classList.remove('bg-secondary');
        button.classList.add('bg-red-500');
        status.textContent = 'Running';
        runAI();
    } else {
        button.textContent = 'Start AI';
        button.classList.remove('bg-red-500');
        button.classList.add('bg-secondary');
        status.textContent = 'Stopped';
        speedCheckbox.checked = false;
        if (gameState.aiInterval) {
            clearInterval(gameState.aiInterval);
        }
    }
}

function toggleAISpeed() {
    const checkbox = document.getElementById('ai-speed');
    const slider = checkbox.nextElementSibling.children[0];
    if (checkbox.checked) {
        slider.classList.add('translate-x-4'); // slider to right 
        if (gameState.aiRunning) {
            runAI(50); // 20 moves per second
        }
    } else {
        slider.classList.remove('translate-x-4'); // slider to left (default)
        if (gameState.aiRunning) {
            runAI(300); // 3 moves per second 
        }
    }
}

function getDynamicDepth(board) {
    const emptyTiles = board.filter(tile => tile === 0).length;
    if (emptyTiles >= 8) return 3; // less forword thinking 
    if (emptyTiles >= 4) return 4; // medium forward thinking 
    return 5; // full forward thinking uptoo next 5 movess 
}

function runAI(speed = 100) { // default 100ms
    if (gameState.aiInterval) clearInterval(gameState.aiInterval);
    gameState.aiInterval = setInterval(() => {
        if (!gameState.aiRunning) return;
        const directions = ['up', 'right', 'down', 'left'];
        let bestScore = -1;
        let bestMove = null;
        for (const direction of directions) {
            const tempBoard = [...gameState.board];
            const movedBoard = MoveTiles(tempBoard, direction);
            if (movedBoard) {
                const movescore = expectimax(movedBoard, 0, false);
                if (movescore > bestScore) {
                    bestScore = movescore;
                    bestMove = direction;
                }
            }
        }
        if (bestMove) move(bestMove);
    }, speed);
}


function expectimax(board, depth, isPlayerTurn) {
    const dynamicDepth = getDynamicDepth(board);
    if (depth >= dynamicDepth || isGameOver(board)) {
        return heuristicScore(board);
    }

    if (isPlayerTurn) {
        let maxScore = -Infinity;
        const moves = ["up", "down", "left", "right"];
        for (const move of moves) {
            const newBoard = simulateMove(board, move);
            if (newBoard) {
                const score = expectimax(newBoard, depth + 1, false);
                maxScore = Math.max(maxScore, score);
            }
        }
        return maxScore;
    } else {
        const emptyTiles = [];
        board.forEach((tile, i) => {
            if (tile === 0) emptyTiles.push(i);
        });

        if (emptyTiles.length === 0) return heuristicScore(board);

        let total = 0;
        for (const index of emptyTiles) {
            const for2 = [...board];
            const for4 = [...board];
            for2[index] = 2;
            for4[index] = 4;
            total += 0.9 * expectimax(for2, depth + 1, true);
            total += 0.1 * expectimax(for4, depth + 1, true);
        }

        return total / emptyTiles.length; //average expectation across all spawn locations.
    }
}

function MoveTiles(board, direction) {
    const t1 = [...board];
    let moved = false;
    if (direction === 'left' || direction === 'right') {
        for (let row = 0; row < 4; row++) {
            const line = [];
            for (let col = 0; col < 4; col++) {
                const value = t1[row * 4 + col];
                if (value) line.push(value);
            }
            if (direction === 'right') line.reverse();
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    line.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (line.length < 4) line.push(0);
            if (direction === 'right') line.reverse();
            for (let col = 0; col < 4; col++) {
                if (t1[row * 4 + col] !== line[col]) {
                    moved = true;
                }
                t1[row * 4 + col] = line[col];
            }
        }
    } else {
        for (let col = 0; col < 4; col++) {
            const line = [];
            for (let row = 0; row < 4; row++) {
                const value = t1[row * 4 + col];
                if (value) line.push(value);
            }
            if (direction === 'down') line.reverse();
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    line.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (line.length < 4) line.push(0);
            if (direction === 'down') line.reverse();
            for (let row = 0; row < 4; row++) {
                if (t1[row * 4 + col] !== line[row]) {
                    moved = true;
                }
                t1[row * 4 + col] = line[row];
            }
        }
    }
    return moved ? t1 : null; // IF moved return new board formed else return NULL 

}

function simulateMove(board, direction) {

    const t1 = [...board]
    if (direction === 'left' || direction === 'right') {
        for (let row = 0; row < 4; row++) {
            const line = [];
            for (let col = 0; col < 4; col++) {
                const value = t1[row * 4 + col];
                if (value) line.push(value);
            }
            if (direction === 'right') line.reverse();
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    line.splice(i + 1, 1);

                }
            }
            while (line.length < 4) line.push(0);
            if (direction === 'right') line.reverse();
            for (let col = 0; col < 4; col++) {
                t1[row * 4 + col] = line[col];
            }
        }
    } else {
        for (let col = 0; col < 4; col++) {
            const line = [];
            for (let row = 0; row < 4; row++) {
                const value = t1[row * 4 + col];
                if (value) line.push(value);
            }
            if (direction === 'down') line.reverse();
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    line.splice(i + 1, 1);

                }
            }
            while (line.length < 4) line.push(0);
            if (direction === 'down') line.reverse();
            for (let row = 0; row < 4; row++) {

                t1[row * 4 + col] = line[row];
            }
        }
    }
    return t1;
}

function isGameOver(board) {
    const backup = [...gameState.board];
    gameState.board = [...board];
    const over = !["up", "down", "left", "right"].some(move => {
        const test = MoveTiles(board, move);
        return test;
    });
    gameState.board = backup;
    return over;
}

function heuristicScore(board) {
    const size = 4;
    let emptyTiles = 0;
    let smoothness = 0;
    let maxTile = 0;
    let weightedPositionalScore = 0;
    let mergePotential = 0;

    const weightMatrix = [
        [65536, 16384, 4096, 1024],
        [256, 512, 128, 16],
        [64, 32, 8, 4],
        [2, 1, 1, 1]
    ];

    function tileDiff(a, b) {
        return a && b ? Math.abs(Math.log2(a) - Math.log2(b)) : 0;
    }


    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / size);
        const col = i % size;
        const value = board[i];

        if (value === 0) {
            emptyTiles++;
        } else {
            if (value > maxTile) maxTile = value;
            weightedPositionalScore += value * weightMatrix[row][col];
        }

        // Merge 
        if (col < size - 1 && board[i] !== 0 && board[i] === board[i + 1]) mergePotential++;
        if (row < size - 1 && board[i] !== 0 && board[i] === board[i + size]) mergePotential++;
    }

    //  big differences
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size - 1; col++) {
            const idx = row * size + col;
            smoothness -= tileDiff(board[idx], board[idx + 1]);
        }
    }

    for (let col = 0; col < size; col++) {
        for (let row = 0; row < size - 1; row++) {
            const idx = row * size + col;
            smoothness -= tileDiff(board[idx], board[idx + size]);
        }
    }



    // Corner bonus
    const cornerMaxTile = Math.max(board[0], board[3], board[12], board[15]);

    // TOTAL SCORE 
    const totalScore =
        emptyTiles * 3000 +
        smoothness * 200 +
        cornerMaxTile * 20 +
        weightedPositionalScore * 10 +
        mergePotential * 1000 +
        maxTile * 2;

    return totalScore;
}

// EVENT LISTENEER for Keyboard ( laptop , computer )
document.addEventListener('keydown', (e) => {
    if (gameState.gameMode !== 'human') return;
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            move('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            move('right');
            break;
        case 'ArrowUp':
            e.preventDefault();
            move('up');
            break;
        case 'ArrowDown':
            e.preventDefault();
            move('down');
            break;
    }
});

// EVENT LISTENER for touch screen (Mobileee users )

let touchStartX = 0;
let touchStartY = 0;
document.querySelector('.game-container').addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX; // START POSITION OF FINGER TOUCH 
    touchStartY = e.touches[0].clientY;
});
document.querySelector('.game-container').addEventListener('touchend', (e) => {
    if (gameState.gameMode !== 'human') return;
    const touchEndX = e.changedTouches[0].clientX; // END POSITION OF FINGER TOUCH 
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        if (dy > 0) {
            move('down');
        } else {
            move('up');
        }
    }
});

document.getElementById('best-score').textContent = gameState.bestScore; // get best score from local storage 
