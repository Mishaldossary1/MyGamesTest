// متغيرات اللعبة
let gameState = {
    team1: { name: 'عزيز', score: 0 },
    team2: { name: 'متعب', score: 0 },
    currentTeam: 1,
    grid: [],
    gridSize: 5,
    timerDuration: 30,
    selectedCell: null,
    currentQuestion: null,
    waitingForAnswer: false,
    questions: gameQuestions || []
};

// المؤقت
let timerInterval;
let timeLeft = 30;
let timerActive = false;

// الحروف العربية
const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

// تصنيفات الأسئلة
const categories = ['عام', 'ديني', 'جغرافيا', 'علوم', 'تاريخ', 'رياضة', 'أدب'];

// أصوات اللعبة
const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/misc/sounds/buzzer-or-wrong-answer.mp3'),
    win: new Audio('https://www.soundjay.com/misc/sounds/applause-2.mp3'),
    click: new Audio('https://www.soundjay.com/button/button-09.mp3'),
    timer: new Audio('https://www.soundjay.com/misc/sounds/tick-tock-1.mp3')
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
    
    // ترتيب حسب النقاط (تنازلي)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // أخذ أفضل 10 فقط
    if (leaderboard.length > 10) leaderboard = leaderboard.slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    loadLeaderboard();
}

// بدء اللعبة
function startGame() {
    // أخذ أسماء الفرق
    const team1Name = document.getElementById('team1Name').value || 'عزيز';
    const team2Name = document.getElementById('team2Name').value || 'متعب';
    
    // أخذ الإعدادات
    gameState.gridSize = parseInt(document.getElementById('gridSize').value);
    gameState.timerDuration = parseInt(document.getElementById('timerDuration').value);
    
    gameState.team1.name = team1Name;
    gameState.team2.name = team2Name;
    
    // تحديث العرض
    document.getElementById('team1NameDisplay').textContent = team1Name;
    document.getElementById('team2NameDisplay').textContent = team2Name;
    
    // إخفاء شاشة البداية وإظهار شاشة اللعبة
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // تحديث حجم الشبكة
    document.getElementById('grid').style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
    
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
    
    // إعادة تعيين دائرة المؤقت
    resetTimerCircle();
}

// إعادة تعيين دائرة المؤقت
function resetTimerCircle() {
    const progress = document.getElementById('timerProgress');
    if (progress) {
        progress.style.strokeDashoffset = '0';
    }
    document.getElementById('timerText').textContent = gameState.timerDuration;
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
    // اختيار سؤال عشوائي
    const randomIndex = Math.floor(Math.random() * gameState.questions.length);
    gameState.currentQuestion = gameState.questions[randomIndex];
    
    // عرض تصنيف عشوائي
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    document.getElementById('questionCategory').textContent = `سؤال ${randomCategory}`;
    
    // عرض السؤال
    document.getElementById('questionText').textContent = gameState.currentQuestion.q;
    document.getElementById('answerArea').classList.remove('hidden');
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    
    gameState.waitingForAnswer = true;
    startTimer();
}

// بدء المؤقت
function startTimer() {
    timeLeft = gameState.timerDuration;
    timerActive = true;
    updateTimerDisplay();
    
    const circumference = 226.2; // 2πr حيث r=36
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        // تحديث دائرة المؤقت
        const progress = (gameState.timerDuration - timeLeft) / gameState.timerDuration;
        const offset = circumference * progress;
        document.getElementById('timerProgress').style.strokeDashoffset = offset;
        document.getElementById('timerText').textContent = timeLeft;
        
        // صوت التحذير آخر 5 ثواني
        if (timeLeft <= 5 && timeLeft > 0) {
            sounds.timer.play();
            document.getElementById('timerProgress').style.stroke = '#e74c3c';
        }
        
        if (timeLeft <= 0) {
            stopTimer();
            sounds.wrong.play();
            alert('⏰ انتهى الوقت!');
            gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
            updateTurnIndicator();
            hideAnswerArea();
            resetTimerCircle();
        }
    }, 1000);
}

// إيقاف المؤقت
function stopTimer() {
    clearInterval(timerInterval);
    timerActive = false;
    document.getElementById('timerProgress').style.stroke = '#3498db';
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
    document.getElementById('timerText').textContent = timeLeft;
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
        alert(`❌ إجابة خاطئة! الإجابة الصحيحة: ${gameState.currentQuestion.a}`);
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
        updateTurnIndicator();
        hideAnswerArea();
    }
    
    resetTimerCircle();
}

// أخذ الخلية
function claimCell() {
    const { row, col } = gameState.selectedCell;
    const cell = gameState.grid[row][col];
    
    cell.team = gameState.currentTeam;
    cell.element.classList.add(`team${gameState.currentTeam}`);
    
    if (checkWin(row, col)) {
        // زيادة النقاط للفريق الفائز
        if (gameState.currentTeam === 1) {
            gameState.team1.score++;
        } else {
            gameState.team2.score++;
        }
        updateScores();
        
        // إظهار تأثير الفوز
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
        
        // تبديل الدور
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
        updateTurnIndicator();
        hideAnswerArea();
    }
}

// التحقق من الفوز
function checkWin(row, col) {
    const team = gameState.currentTeam;
    const size = gameState.gridSize;
    
    // التحقق من جميع الاتجاهات
    const directions = [
        { dr: 0, dc: 1 },  // أفقي
        { dr: 1, dc: 0 },  // عمودي
        { dr: 1, dc: 1 },  // قطري رئيسي
        { dr: 1, dc: -1 }  // قطري عكسي
    ];
    
    for (let dir of directions) {
        let count = 1;
        
        // اتجاه موجب
        for (let i = 1; i < 5; i++) {
            const r = row + dir.dr * i;
            const c = col + dir.dc * i;
            if (r >= 0 && r < size && c >= 0 && c < size && gameState.grid[r][c].team === team) {
                count++;
            } else {
                break;
            }
        }
        
        // اتجاه سالب
        for (let i = 1; i < 5; i++) {
            const r = row - dir.dr * i;
            const c = col - dir.dc * i;
            if (r >= 0 && r < size && c >= 0 && c < size && gameState.grid[r][c].team === team) {
                count++;
            } else {
                break;
            }
        }
        
        if (count >= 5) return true;
    }
    
    return false;
}

// تطبيق تأثير الفوز على الخلايا
function highlightWinningCells(row, col) {
    const team = gameState.currentTeam;
    
    for (let i = 0; i < gameState.gridSize; i++) {
        for (let j = 0; j < gameState.gridSize; j++) {
            if (gameState.grid[i][j].team === team) {
                gameState.grid[i][j].element.classList.add('win-highlight');
            }
        }
    }
}

// إخفاء منطقة الإجابة
function hideAnswerArea() {
    document.getElementById('answerArea').classList.add('hidden');
    document.getElementById('questionText').textContent = 'اضغط على أي حرف لبدء السؤال';
    document.getElementById('questionCategory').textContent = 'سؤال عام';
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
    document.getElementById('currentTeamDisplay').textContent = currentTeamName;
    
    // تحديث البطاقات النشطة
    const team1Card = document.getElementById('team1Card');
    const team2Card = document.getElementById('team2Card');
    
    if (gameState.currentTeam === 1) {
        team1Card.classList.add('active');
        team2Card.classList.remove('active');
    } else {
        team2Card.classList.add('active');
        team1Card.classList.remove('active');
    }
}

// عرض شاشة الفوز
function showWinScreen() {
    sounds.win.play();
    const winnerName = gameState.currentTeam === 1 ? gameState.team1.name : gameState.team2.name;
    const winnerScore = gameState.currentTeam === 1 ? gameState.team1.score : gameState.team2.score;
    
    document.getElementById('winMessage').textContent = `الفائز: ${winnerName}`;
    document.getElementById('winScreen').classList.remove('hidden');
    
    // حفظ الفائز
    saveWinner(winnerName, winnerScore);
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
    loadLeaderboard();
    resetTimerCircle();
};
