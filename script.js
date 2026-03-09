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
    if (leaderboard.length >
