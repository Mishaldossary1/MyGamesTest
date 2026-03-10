// متغيرات اللعبة
let gameState = {
    team1: { name: 'عزيز', score: 0 },
    team2: { name: 'متعب', score: 0 },
    currentTeam: 1,
    grid: [],
    gridSize: 5,
    selectedCell: null,
    questions: gameQuestions || []
};

let selectedCellByHost = null;  // الخلية اللي اختارها المقدم

// الحروف العربية
const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

// أصوات اللعبة
const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/misc/sounds/buzzer-or-wrong-answer.mp3'),
    win: new Audio('https://www.soundjay.com/misc/sounds/applause-2.mp3'),
    click: new Audio('https://www.soundjay.com/button/button-09.mp3')
};

// تحميل لوحة المتصدرين
function loadLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let listElement = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        listElement.innerHTML = '<p>لا توجد نتائج بعد</p>';
        return;
    }
    
    let html = '<ul>';
    leaderboard.slice(-10).reverse().forEach((entry, index) => {
        html += `<li>${index + 1}. ${entry.winner} - ${entry.score} نقطة</li>`;
    });
    html += '</ul>';
    listElement.innerHTML = html;
}

// حفظ الفائز
function saveWinner(winner, score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({
        winner: winner,
        score: score,
        date: new Date().toLocaleDateString('ar-SA')
    });
    
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) leaderboard = leaderboard.slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    loadLeaderboard();
}

// بدء اللعبة
function startGame() {
    const team1Name = document.getElementById('team1Name').value || 'عزيز';
    const team2Name = document.getElementById('team2Name').value || 'متعب';
    
    gameState.gridSize = parseInt(document.getElementById('gridSize').value);
    gameState.team1.name = team1Name;
    gameState.team2.name = team2Name;
    
    document.getElementById('team1NameDisplay').textContent = team1Name;
    document.getElementById('team2NameDisplay').textContent = team2Name;
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    document.getElementById('grid').style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
    
    resetGame();
}

// إعادة تعيين اللعبة
function resetGame() {
    gameState.team1.score = 0;
    gameState.team2.score = 0;
    gameState.currentTeam = 1;
    
    cancelSelection();
    
    updateScores();
    createGrid();
    updateTurnIndicator();
    
    document.getElementById('hostInstruction').innerHTML = 'اختر حرفاً من الشبكة لبدء الجولة';
}

// إنشاء الشبكة
function createGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    gameState.grid = [];

    for (let i = 0; i < gameState.gridSize; i++) {
        gameState.grid[i] = [];
        for (let j = 0; j < gameState.gridSize; j++) {
            const randomLetter = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
            
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = randomLetter;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.onclick = () => cellClicked(i, j);
            
            gridElement.appendChild(cell);
            gameState.grid[i][j] = {
                element: cell,
                letter: randomLetter,
                team: 0
            };
        }
    }
    
    selectedCellByHost = null;
    enableHostButtons(false);
}

// عند النقر على خلية
function cellClicked(row, col) {
    selectCellForHost(row, col);
}

// اختيار خلية من قبل المقدم
function selectCellForHost(row, col) {
    const cell = gameState.grid[row][col];
    
    if (cell.team === 0) {
        if (selectedCellByHost) {
            selectedCellByHost.element.classList.remove('selected-by-host');
        }
        
        cell.element.classList.add('selected-by-host');
        selectedCellByHost = cell;
        
        enableHostButtons(true);
        
        const currentTeamName = gameState.currentTeam === 1 ? gameState.team1.name : gameState.team2.name;
        document.getElementById('hostInstruction').innerHTML = 
            `🎤 الحرف المختار: <strong>${cell.letter}</strong><br>
             الفريق ${currentTeamName} يجاوب`;
        
        sounds.click.play();
    } else {
        alert('⚠️ هذه الخلية مأخوذة بالفعل!');
    }
}

// تفعيل/تعطيل أزرار المقدم
function enableHostButtons(enable) {
    document.getElementById('correctBtn').disabled = !enable;
    document.getElementById('wrongBtn').disabled = !enable;
    document.getElementById('cancelBtn').disabled = !enable;
}

// إلغاء الاختيار
function cancelSelection() {
    if (selectedCellByHost) {
        selectedCellByHost.element.classList.remove('selected-by-host');
        selectedCellByHost = null;
        enableHostButtons(false);
        document.getElementById('hostInstruction').innerHTML = 'اختر حرفاً من الشبكة لبدء الجولة';
    }
}

// تسجيل إجابة صحيحة
function markCellCorrect() {
    if (!selectedCellByHost) return;
    
    const row = parseInt(selectedCellByHost.element.dataset.row);
    const col = parseInt(selectedCellByHost.element.dataset.col);
    const cell = gameState.grid[row][col];
    
    cell.team = gameState.currentTeam;
    cell.element.classList.add(`team${gameState.currentTeam}`);
    cell.element.classList.remove('selected-by-host');
    
    if (gameState.currentTeam === 1) {
        gameState.team1.score++;
    } else {
        gameState.team2.score++;
    }
    updateScores();
    
    sounds.correct.play();
    
    if (checkWin(row, col)) {
        highlightWinningCells(row, col);
        setTimeout(() => showWinScreen(), 500);
    } else {
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
        updateTurnIndicator();
        
        selectedCellByHost = null;
        enableHostButtons(false);
        document.getElementById('hostInstruction').innerHTML = 'اختر حرفاً من الشبكة لبدء الجولة';
    }
}

// تسجيل إجابة خاطئة
function markCellWrong() {
    if (!selectedCellByHost) return;
    
    const row = parseInt(selectedCellByHost.element.dataset.row);
    const col = parseInt(selectedCellByHost.element.dataset.col);
    const cell = gameState.grid[row][col];
    
    const otherTeam = gameState.currentTeam === 1 ? 2 : 1;
    
    cell.team = otherTeam;
    cell.element.classList.add(`team${otherTeam}`);
    cell.element.classList.remove('selected-by-host');
    
    if (otherTeam === 1) {
        gameState.team1.score++;
    } else {
        gameState.team2.score++;
    }
    updateScores();
    
    sounds.wrong.play();
    
