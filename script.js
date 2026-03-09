// متغيرات اللعبة
let gameState = {
    team1: { name: 'النسور الزرقاء', score: 0 },
    team2: { name: 'الصقور الحمراء', score: 0 },
    currentTeam: 1,
    grid: [],
    gridSize: 5,
    selectedCell: null,
    currentQuestion: null,
    waitingForAnswer: false,
    level: 'easy'
};

// المؤقت
let timerInterval;
let timeLeft = 30;
let timerActive = false;

// الحروف العربية
const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

// الأسئلة حسب المستوى
const questionsDB = {
    easy: [
        { q: "ما هي عاصمة فرنسا؟", a: "باريس" },
        { q: "كم عدد ألوان قوس قزح؟", a: "7" },
        { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", a: "المشتري" },
        { q: "ما هي عاصمة مصر؟", a: "القاهرة" },
        { q: "كم شهر في السنة الميلادية؟", a: "12" }
    ],
    medium: [
        { q: "ما هي عاصمة البرتغال؟", a: "لشبونة" },
        { q: "كم عدد سور القرآن الكريم؟", a: "114" },
        { q: "من هو مؤسس الدولة السعودية الأولى؟", a: "محمد بن سعود" },
        { q: "ما هي أكبر قارة في العالم؟", a: "آسيا" },
        { q: "في أي عام هبط الإنسان على القمر؟", a: "1969" }
    ],
    hard: [
        { q: "ما هي عاصمة كازاخستان؟", a: "أستانا" },
        { q: "كم عدد الدول الأعضاء في الأمم المتحدة؟", a: "193" },
        { q: "من هو العالم الذي اكتشف الجاذبية؟", a: "نيوتن" },
        { q: "ما هي أطول سورة في القرآن؟", a: "البقرة" },
        { q: "في أي عام تأسست الدرعية؟", a: "1446" }
    ]
};

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
    leaderboard.slice(-5).reverse().forEach(entry => {
        html += `<li>🏆 ${entry.winner} - ${entry.score} نقطة</li>`;
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
    if (leaderboard.length > 10) leaderboard = leaderboard.slice(-10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    loadLeaderboard();
}

// اختيار المستوى
function selectLevel(level) {
    gameState.level = level;
    gameState.gridSize = level === 'easy' ? 5 : (level === 'medium' ? 6 : 7);
    gameState.questions = questionsDB[level];
    
    // تحديث العرض
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.level-btn.${level}`).classList.add('active');
    
    let levelNames = { easy: 'سهل (5×5)', medium: 'متوسط (6×6)', hard: 'صعب (7×7)' };
    document.getElementById('selectedLevel').textContent = `المستوى: ${levelNames[level]}`;
}

// بدء اللعبة
function startGame() {
    // أخذ أسماء الفرق
    const team1Name = document.getElementById('team1Name').value || 'النسور الزرقاء';
    const team2Name = document.getElementById('team2Name').value || 'الصقور الحمراء';
    
    gameState.team1.name = team1Name;
    gameState.team2.name = team2Name;
    gameState.questions = questionsDB[gameState.level];
    
    // تحديث العرض
    document.getElementById('team1NameDisplay').textContent = team1Name;
    document.getElementById('team2NameDisplay').textContent = team2Name;
    
    // إخفاء شاشة البداية وإظهار شاشة اللعبة
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // بدء لعبة جديدة
    resetGame();
}

// إعادة تعيين اللعبة
function resetGame() {
    gameState.team1.score = 0;
    gameState.team2.score = 0;
    gameState.currentTeam = 1;
    gameState.waitingForAnswer = false;
    
    stopTimer();
    updateScores();
    createGrid();
    updateTurnIndicator();
    hideAnswerArea();
    
    // تحديث حجم الشبكة
    document.getElementById('grid').style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
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
}

// عند النقر على خلية
function cellClicked(row, col) {
    const cell = gameState.grid[row][col];
    
    if (cell.team === 0 && !gameState.waitingForAnswer) {
        sounds.click.play();
        gameState.selectedCell = { row, col };
        showNewQuestion();
    }
}

// عرض سؤال جديد
function showNewQuestion() {
    const randomIndex = Math.floor(Math.random() * gameState.questions.length);
    gameState.currentQuestion = gameState.questions[randomIndex];
    
    document.getElementById('questionText').textContent = gameState.currentQuestion.q;
    document.getElementById('answerArea').classList.remove('hidden');
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    
    gameState.waitingForAnswer = true;
    startTimer();
}

// بدء المؤقت
function startTimer() {
    timeLeft = 30;
    timerActive = true;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            stopTimer();
            sounds.wrong.play();
            alert('⏰ انتهى الوقت!');
            gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
            updateTurnIndicator();
            hideAnswerArea();
        }
    }, 1000);
}

// إيقاف المؤقت
function stopTimer() {
    clearInterval(timerInterval);
    timerActive = false;
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = `⏱️ ${timeLeft}`;
}

// التحقق من الإجابة
function checkAnswer() {
    const answer = document.getElementById('answerInput').value.trim().toLowerCase();
    const correctAnswer = gameState.currentQuestion.a.toLowerCase();
    
    stopTimer();
    
    if (answer === correctAnswer) {
        sounds.correct.play();
        alert('✅ إجابة صحيحة!');
        claimCell();
    } else {
        sounds.wrong.play();
        alert('❌ إجابة خاطئة!');
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
        updateTurnIndicator();
        hideAnswerArea();
    }
}

// أخذ الخلية
function claimCell() {
    const { row, col } = gameState.selectedCell;
    const cell = gameState.grid[row][col];
    
    cell.team = gameState.currentTeam;
    cell.element.classList.add(`team${gameState.currentTeam}`);
    
    if (checkWin(row, col)) {
        // تطبيق تأثير الفوز على الخلايا الفائزة
        highlightWinningCells(row, col);
        setTimeout(() => showWinScreen(), 500);
    } else {
        // زيادة النقاط
        if (gameState.currentTeam === 1) {
            gameState.team1.score++;
        } else {
            gameState.team2.score++;
        }
        updateScores();
        
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
        updateTurnIndicator();
        hideAnswerArea();
    }
}

// التحقق من الفوز
function checkWin(row, col) {
    const team = gameState.currentTeam;
    
    // التحقق أفقي
    let count = 1;
    for (let c = col + 1; c < gameState.gridSize; c++) {
        if (gameState.grid[row][c].team === team) count++;
        else break;
    }
    for (let c = col - 1; c >= 0; c--) {
        if (gameState.grid[row][c].team === team) count++;
        else break;
    }
    if (count >= 5) return true;
    
    // التحقق عمودي
    count = 1;
    for (let r = row + 1; r < gameState.gridSize; r++) {
        if (gameState.grid[r][col].team === team) count++;
        else break;
    }
    for (let r = row - 1; r >= 0; r--) {
        if (gameState.grid[r][col].team === team) count++;
        else break;
    }
    if (count >= 5) return true;
    
    return false;
}

// تطبيق تأثير الفوز على الخلايا
function highlightWinningCells(row, col) {
    const team = gameState.currentTeam;
    
    // إضافة تأثير على جميع خلايا الفريق
    for (let i = 0; i < gameState.gridSize; i++) {
        for (let j = 0; j < gameState.gridSize; j++) {
            if (gameState.grid[i][j].team === team) {
                gameState.grid[i][j].element.classList.add('win-effect');
            }
        }
    }
}

// إخفاء منطقة الإجابة
function hideAnswerArea() {
    document.getElementById('answerArea').classList.add('hidden');
    document.getElementById('questionText').textContent = 'اضغط على أي خلية للحصول على سؤال';
    gameState.waitingForAnswer = false;
    gameState.selectedCell = null;
}

// تحديث النقاط
function updateScores() {
    document.getElementById('team1Score').textContent = gameState.team1.score;
    document.getElementById('team2Score').textContent = gameState.team2.score;
}

// تحديث مؤشر الدور
function updateTurnIndicator() {
    const currentTeamName = gameState.currentTeam === 1 ? gameState.team1.name : gameState.team2.name;
    const turnElement = document.getElementById('currentTeamDisplay');
    turnElement.textContent = currentTeamName;
    
    // تفعيل تأثير النبض
    document.querySelector('.turn-indicator').classList.add('active');
    setTimeout(() => {
        document.querySelector('.turn-indicator').classList.remove('active');
    }, 500);
}

// عرض شاشة الفوز
function showWinScreen() {
    sounds.win.play();
    const winnerName = gameState.currentTeam === 1 ? gameState.team1.name : gameState.team2.name;
    const winnerScore = gameState.currentTeam === 1 ? gameState.team1.score : gameState.team2.score;
    
    document.getElementById('winMessage').textContent = `🎊 ${winnerName} 🎊`;
    document.getElementById('winScreen').classList.remove('hidden');
    
    // حفظ الفائز
    saveWinner(winnerName, winnerScore + 1);
}

// العودة لشاشة البداية
function showStartScreen() {
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    loadLeaderboard();
    stopTimer();
}

// لعب مرة أخرى
function playAgain() {
    document.getElementById('winScreen').classList.add('hidden');
    resetGame();
}

// تهيئة الصفحة
window.onload = function() {
    selectLevel('easy');
    loadLeaderboard();
};
