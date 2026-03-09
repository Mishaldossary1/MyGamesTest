// متغيرات اللعبة
let gameState = {
    team1: { name: 'الفريق الأزرق', score: 0 },
    team2: { name: 'الفريق الأحمر', score: 0 },
    currentTeam: 1,
    grid: [],
    gridSize: 5,
    selectedCell: null,
    questions: [
        { q: "ما هي عاصمة فرنسا؟", a: "باريس" },
        { q: "كم عدد ألوان قوس قزح؟", a: "7" },
        { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", a: "المشتري" },
        { q: "من هو مؤسس الدولة السعودية الأولى؟", a: "محمد بن سعود" },
        { q: "ما هي العملة الرسمية للمملكة العربية السعودية؟", a: "الريال" },
        { q: "كم شهر في السنة الهجرية؟", a: "12" },
        { q: "ما هو الحيوان الذي يلقب بسفينة الصحراء؟", a: "الجمل" },
        { q: "ما هي أكبر قارة في العالم؟", a: "آسيا" },
        { q: "كم عدد اللاعبين في فريق كرة القدم؟", a: "11" },
        { q: "ما هو أسرع حيوان بري في العالم؟", a: "الفهد" },
        { q: "ما هي عاصمة مصر؟", a: "القاهرة" },
        { q: "كم عدد حروف اللغة العربية؟", a: "28" },
        { q: "ما هو الغاز الذي تتنفسه النباتات؟", a: "ثاني أكسيد الكربون" },
        { q: "من هو أول الخلفاء الراشدين؟", a: "أبو بكر الصديق" },
        { q: "ما هي السورة التي تسمى قلب القرآن؟", a: "يس" }
    ],
    currentQuestion: null,
    waitingForAnswer: false
};

// الحروف العربية
const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

// بدء اللعبة
function startGame() {
    // أخذ أسماء الفرق
    const team1Name = document.getElementById('team1Name').value || 'الفريق الأزرق';
    const team2Name = document.getElementById('team2Name').value || 'الفريق الأحمر';
    
    gameState.team1.name = team1Name;
    gameState.team2.name = team2Name;
    
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
    
    updateScores();
    createGrid();
    updateTurnIndicator();
    hideAnswerArea();
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
    
    // إذا كانت الخلية محايدة وليس هناك سؤال معلق
    if (cell.team === 0 && !gameState.waitingForAnswer) {
        gameState.selectedCell = { row, col };
        showNewQuestion();
    }
}

// عرض سؤال جديد
function showNewQuestion() {
    // اختيار سؤال عشوائي
    const randomIndex = Math.floor(Math.random() * gameState.questions.length);
    gameState.currentQuestion = gameState.questions[randomIndex];
    
    // عرض السؤال
    document.getElementById('questionText').textContent = gameState.currentQuestion.q;
    
    // إظهار منطقة الإجابة
    document.getElementById('answerArea').classList.remove('hidden');
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    
    gameState.waitingForAnswer = true;
}

// التحقق من الإجابة
function checkAnswer() {
    const answer = document.getElementById('answerInput').value.trim().toLowerCase();
    const correctAnswer = gameState.currentQuestion.a.toLowerCase();
    
    if (answer === correctAnswer) {
        // إجابة صحيحة
        alert('✅ إجابة صحيحة!');
        claimCell();
    } else {
        // إجابة خاطئة
        alert('❌ إجابة خاطئة!');
        // تبديل الدور
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
        updateTurnIndicator();
    }
    
    // إخفاء منطقة الإجابة
    hideAnswerArea();
}

// أخذ الخلية
function claimCell() {
    const { row, col } = gameState.selectedCell;
    const cell = gameState.grid[row][col];
    
    // تغيير لون الخلية
    cell.team = gameState.currentTeam;
    cell.element.classList.add(`team${gameState.currentTeam}`);
    cell.element.classList.add('selected');
    
    // إزالة تأثير التحديد بعد ثانية
    setTimeout(() => {
        cell.element.classList.remove('selected');
    }, 500);
    
    // التحقق من الفوز
    if (checkWin(row, col)) {
        showWinScreen();
    } else {
        // زيادة نقاط الفريق
        if (gameState.currentTeam === 1) {
            gameState.team1.score++;
        } else {
            gameState.team2.score++;
        }
        updateScores();
        
        // تبديل الدور
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
        updateTurnIndicator();
    }
}

// إخفاء منطقة الإجابة
function hideAnswerArea() {
    document.getElementById('answerArea').classList.add('hidden');
    document.getElementById('questionText').textContent = 'اضغط على أي خلية للحصول على سؤال';
    gameState.waitingForAnswer = false;
    gameState.selectedCell = null;
}

// التحقق من الفوز
function checkWin(row, col) {
    const team = gameState.currentTeam;
    
    // التحقق أفقي
    let count = 1;
    // يمين
    for (let c = col + 1; c < gameState.gridSize; c++) {
        if (gameState.grid[row][c].team === team) count++;
        else break;
    }
    // يسار
    for (let c = col - 1; c >= 0; c--) {
        if (gameState.grid[row][c].team === team) count++;
        else break;
    }
    if (count >= 5) return true;
    
    // التحقق عمودي
    count = 1;
    // أسفل
    for (let r = row + 1; r < gameState.gridSize; r++) {
        if (gameState.grid[r][col].team === team) count++;
        else break;
    }
    // أعلى
    for (let r = row - 1; r >= 0; r--) {
        if (gameState.grid[r][col].team === team) count++;
        else break;
    }
    if (count >= 5) return true;
    
    // التحقق قطري (يمين-أسفل)
    count = 1;
    for (let i = 1; i < gameState.gridSize; i++) {
        const r = row + i, c = col + i;
        if (r < gameState.gridSize && c < gameState.gridSize && gameState.grid[r][c].team === team) count++;
        else break;
    }
    for (let i = 1; i < gameState.gridSize; i++) {
        const r = row - i, c = col - i;
        if (r >= 0 && c >= 0 && gameState.grid[r][c].team === team) count++;
        else break;
    }
    if (count >= 5) return true;
    
    // التحقق قطري (يسار-أسفل)
    count = 1;
    for (let i = 1; i < gameState.gridSize; i++) {
        const r = row + i, c = col - i;
        if (r < gameState.gridSize && c >= 0 && gameState.grid[r][c].team === team) count++;
        else break;
    }
    for (let i = 1; i < gameState.gridSize; i++) {
        const r = row - i, c = col + i;
        if (r >= 0 && c < gameState.gridSize && gameState.grid[r][c].team === team) count++;
        else break;
    }
    if (count >= 5) return true;
    
    return false;
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
    turnElement.style.color = gameState.currentTeam === 1 ? '#3498db' : '#e74c3c';
}

// عرض شاشة الفوز
function showWinScreen() {
    const winnerName = gameState.currentTeam === 1 ? gameState.team1.name : gameState.team2.name;
    document.getElementById('winMessage').textContent = `الفائز هو ${winnerName}!`;
    document.getElementById('winScreen').classList.remove('hidden');
}

// العودة لشاشة البداية
function showStartScreen() {
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}
