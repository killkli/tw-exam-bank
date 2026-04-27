// ====== MAIN ENTRY POINT ======

import { loadQuestions, loadPassages, getAvailableQuestions, filterQuestions } from './data-loader.js';
import * as Quiz from './quiz.js';
import * as UI from './ui.js';
import * as Tracker from './tracker.js';

// Global state
let APP = {
  questions: [],
  passages: [],
  availableQuestions: [],
  filteredQuestions: [],
  currentView: 'home',
  currentMode: 'study',
  quiz: null,
  filters: { year: '', type: '', difficulty: '', concept: '', hasAnswer: '' }
};

// ====== INIT ======
async function init() {
  try {
    APP.questions = await loadQuestions();
    APP.passages = await loadPassages();
    APP.availableQuestions = APP.questions.filter(q => q.available !== false);
    APP.filteredQuestions = [...APP.availableQuestions];
    navigate('home');
  } catch (e) {
    UI.renderApp().innerHTML = '<div class="loading"><div class="spinner"></div><p>載入失敗，請確認網路連線後重新整理。</p></div>';
    console.error(e);
  }
}

// ====== NAVIGATION ======
function navigate(view) {
  APP.currentView = view;
  UI.$$('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  render();
}

window.navigate = navigate;

function setMode(mode) {
  APP.currentMode = mode;
  UI.$('#mode-study').classList.toggle('active', mode === 'study');
  UI.$('#mode-test').classList.toggle('active', mode === 'test');
}

window.setMode = setMode;

// ====== RENDER ======
function render() {
  const app = UI.renderApp();
  if (!APP.questions.length) {
    app.innerHTML = '<div class="loading"><div class="spinner"></div><p>載入題庫中...</p></div>';
    return;
  }

  switch (APP.currentView) {
    case 'home':
      app.innerHTML = UI.renderHome(APP.availableQuestions, getHomeStats());
      break;
    case 'filter':
      app.innerHTML = UI.renderFilter(APP.availableQuestions, APP.filters, applyFilter);
      break;
    case 'list':
      app.innerHTML = UI.renderList(APP.availableQuestions);
      break;
    case 'about':
      app.innerHTML = UI.renderAbout(APP.availableQuestions);
      break;
    case 'practice':
      renderPractice();
      break;
    case 'result':
      renderResult();
      break;
    case 'wrong':
      renderWrongAnswers();
      break;
    case 'stats':
      renderStats();
      break;
  }
}

function getHomeStats() {
  const stats = Tracker.getStats();
  const wrongCount = Tracker.getWrongAnswerCount();
  const streakInfo = Tracker.getStreakInfo();
  return { stats, wrongCount, streakInfo };
}

// ====== FILTERS ======
function applyFilter(questions, filters) {
  return questions.filter(q => {
    if (filters.year && q.year != filters.year) return false;
    if (filters.type && q.type !== filters.type) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (filters.concept && !(q.concepts || []).includes(filters.concept)) return false;
    if (filters.hasAnswer === 'yes' && !q.answer) return false;
    if (filters.hasAnswer === 'no' && q.answer) return false;
    return true;
  });
}

window.updateFilter = function(key, value) {
  APP.filters[key] = value;
  APP.filteredQuestions = applyFilter(APP.availableQuestions, APP.filters);
  render();
};

window.clearFilters = function() {
  APP.filters = { year: '', type: '', difficulty: '', concept: '', hasAnswer: '' };
  APP.filteredQuestions = [...APP.availableQuestions];
  render();
};

// ====== QUIZ ======
window.startQuiz = function(questions, shuffle = true) {
  const shuffled = Quiz.shuffleQuestions(questions, shuffle);
  APP.quiz = {
    questions: shuffled,
    current: 0,
    answers: {},
    revealed: new Array(shuffled.length).fill(false),
    startTime: Date.now(),
    mode: APP.currentMode
  };
  navigate('practice');
};

window.startQuizFromFilter = function() {
  window.startQuiz(APP.filteredQuestions);
};

window.previewQuizFromFilter = function() {
  window.startQuiz(APP.filteredQuestions.slice(0, Math.min(APP.filteredQuestions.length, 5)));
};

window.startQuizByYear = function(year) {
  const qs = Quiz.getQuestionsByYear(APP.availableQuestions, year);
  if (!qs.length) { alert('該年份沒有可用題目'); return; }
  window.startQuiz(qs);
};

window.startQuizByConcept = function(concept) {
  const qs = Quiz.getQuestionsByConcept(APP.availableQuestions, concept);
  if (!qs.length) { alert('沒有符合的題目'); return; }
  window.startQuiz(qs);
};

window.startQuizAt = function(index) {
  const q = APP.availableQuestions[index];
  if (!q) return;
  const qs = APP.availableQuestions.filter(q2 => q2.year === q.year);
  const startIdx = Math.max(0, qs.indexOf(q) - 2);
  window.startQuiz(qs.slice(startIdx, startIdx + 8));
};

// 錯題複訓
window.startWrongQuiz = function() {
  const wrongAnswers = Tracker.getWrongAnswers();
  const wrongIds = Object.keys(wrongAnswers);
  if (!wrongIds.length) {
    alert('目前沒有錯題記錄');
    return;
  }
  const wrongQuestions = APP.availableQuestions.filter(q => wrongIds.includes(q.id));
  window.startQuiz(wrongQuestions);
};

// 閱讀題組練習
window.startReadingQuiz = function() {
  const readingQuestions = APP.availableQuestions.filter(q => q.type === 'reading' && q.passage);
  if (!readingQuestions.length) {
    alert('沒有閱讀題');
    return;
  }
  window.startQuiz(readingQuestions);
};

function renderPractice() {
  if (!APP.quiz) { navigate('home'); return; }
  if (APP.quiz.current >= APP.quiz.questions.length) { navigate('result'); return; }

  const q = APP.quiz.questions[APP.quiz.current];
  const groupSiblings = Quiz.getGroupSiblings(q, APP.quiz.questions);

  UI.renderApp().innerHTML = UI.renderPractice(
    q,
    APP.quiz.current,
    APP.quiz.questions.length,
    APP.quiz.answers,
    APP.quiz.revealed,
    APP.quiz.mode,
    groupSiblings
  );
}

window.pickOption = function(k) {
  const { current, revealed, questions, mode } = APP.quiz;
  if (revealed[current] && mode === 'study') return;
  APP.quiz.answers[current] = k;
  renderPractice();
};

window.revealAns = function() {
  const { current, questions, answers, mode } = APP.quiz;
  APP.quiz.revealed[current] = true;

  // 記錄答題結果（學習模式才記錄）
  if (mode === 'study') {
    const q = questions[current];
    const userAnswer = answers[current];
    if (userAnswer && q.answer) {
      const correct = userAnswer === q.answer;
      Tracker.recordAnswer(q.id, userAnswer, correct);
    }
  }

  renderPractice();
};

window.nextQ = function() {
  if (APP.quiz.current < APP.quiz.questions.length - 1) {
    APP.quiz.current++;
    renderPractice();
  }
};

window.prevQ = function() {
  if (APP.quiz.current > 0) {
    APP.quiz.current--;
    renderPractice();
  }
};

window.jumpTo = function(idx) {
  if (idx >= 0 && idx < APP.quiz.questions.length) {
    APP.quiz.current = idx;
    renderPractice();
  }
};

window.jumpToGroup = function(id) {
  const idx = APP.quiz.questions.findIndex(q => q.id === id);
  if (idx >= 0) {
    APP.quiz.current = idx;
    renderPractice();
  }
};

function renderResult() {
  if (!APP.quiz) { navigate('home'); return; }

  const result = Quiz.calculateScore(APP.quiz.questions, APP.quiz.answers);
  const elapsed = Math.round((Date.now() - APP.quiz.startTime) / 1000);

  const resultData = {
    total: APP.quiz.questions.length,
    answered: Object.keys(APP.quiz.answers).length,
    correct: result.correct,
    wrong: result.corrected || 0,
    score: result.percentage,
    elapsed,
    mode: APP.quiz.mode
  };

  UI.renderApp().innerHTML = UI.renderResult(resultData);
}

window.startQuizAgain = function() {
  if (APP.quiz && APP.quiz.questions.length) {
    window.startQuiz(APP.quiz.questions, false);
  }
};

// ====== WRONG ANSWERS ======
function renderWrongAnswers() {
  const wrongAnswers = Tracker.getWrongAnswers();
  const wrongIds = Object.keys(wrongAnswers);

  if (!wrongIds.length) {
    UI.renderApp().innerHTML = `
      <div class="card">
        <div class="card-title">📝 錯題本</div>
        <p style="text-align:center;color:var(--gray-500);padding:2rem;">
          目前沒有錯題記錄<br>繼續努力！
        </p>
        <div style="text-align:center;">
          <button class="btn btn-primary" onclick="navigate('home')">回首頁</button>
        </div>
      </div>`;
    return;
  }

  const wrongQuestions = APP.availableQuestions.filter(q => wrongIds.includes(q.id));
  const sorted = wrongQuestions.sort((a, b) => {
    const aTimes = wrongAnswers[a.id]?.times || 0;
    const bTimes = wrongAnswers[b.id]?.times || 0;
    return bTimes - aTimes;
  });

  UI.renderApp().innerHTML = `
    <div class="card">
      <div class="card-title">📝 錯題本 <span style="font-weight:400;color:var(--gray-500);font-size:0.85rem;">共 ${wrongIds.length} 題</span></div>
      <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
        <button class="btn btn-primary btn-sm" onclick="startWrongQuiz()">🔄 複訓錯題</button>
        <button class="btn btn-outline btn-sm" onclick="clearWrongAnswers()">🗑 清除記錄</button>
      </div>
    </div>
    ${sorted.map(q => {
      const times = wrongAnswers[q.id]?.times || 0;
      const lastAnswer = wrongAnswers[q.id]?.lastAnswer || '';
      return UI.renderQCard(q, APP.availableQuestions.indexOf(q)).replace(
        'onclick="startQuizAt(',
        `onclick="startQuizAt(` // keep original
      ).replace('<div class="q-card"', `<div class="q-card" style="border-left:4px solid var(--danger);"`);
    }).join('')}
    <div style="text-align:center;margin-top:1rem;">
      <button class="btn btn-outline btn-sm" onclick="navigate('home')">回首頁</button>
    </div>`;
}

window.clearWrongAnswers = function() {
  if (confirm('確定要清除所有錯題記錄嗎？')) {
    Tracker.clearWrongAnswers();
    renderWrongAnswers();
  }
};

// ====== STATS ======
function renderStats() {
  const stats = Tracker.getStats();
  const streakInfo = Tracker.getStreakInfo();
  const weakPoints = Tracker.getWeakPoints(APP.availableQuestions);

  // 找出最弱的類型
  const weakTypes = Object.entries(weakPoints.byType)
    .filter(([_, v]) => v.total >= 3)
    .sort((a, b) => b[1].wrongRate - a[1].wrongRate)
    .slice(0, 3);

  const typeLabels = { vocabulary: '詞彙', grammar: '文法', reading: '閱讀', cloze: '克漏字', conversation: '對話' };

  UI.renderApp().innerHTML = `
    <div class="card">
      <div class="card-title">📊 學習統計</div>
      <div class="stats-bar">
        <div class="stat"><div class="num">${stats.totalAnswered}</div><div class="label">總答題</div></div>
        <div class="stat"><div class="num">${stats.accuracy}%</div><div class="label">正確率</div></div>
        <div class="stat"><div class="num">${streakInfo.currentStreak}</div><div class="label">連續答對</div></div>
        <div class="stat"><div class="num">${streakInfo.consecutiveDays}</div><div class="label">連續天數</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">⚠️ 弱點分析</div>
      ${weakTypes.length ? `
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${weakTypes.map(([type, data]) => `
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:var(--gray-50);border-radius:8px;">
              <div style="flex:1;">
                <div style="font-weight:600;">${typeLabels[type] || type}</div>
                <div style="font-size:0.8rem;color:var(--gray-500);">錯誤率 ${data.wrongRate}% · ${data.wrong}題錯誤</div>
              </div>
              <div style="width:60px;height:60px;position:relative;">
                <svg viewBox="0 0 36 36" style="transform:rotate(-90deg);">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--gray-200)" stroke-width="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--danger)" stroke-width="3"
                    stroke-dasharray="${data.wrongRate},100" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:1rem;" onclick="startQuizByWeakType('${weakTypes[0][0]}')">加強練習</button>
      ` : '<p style="color:var(--gray-500);text-align:center;padding:1rem;">答題記錄不足，無法分析弱點</p>'}
    </div>

    <div style="text-align:center;margin-top:1rem;">
      <button class="btn btn-outline btn-sm" onclick="navigate('home')">回首頁</button>
    </div>`;
}

window.startQuizByWeakType = function(type) {
  const qs = Quiz.getQuestionsByType(APP.availableQuestions, type);
  if (!qs.length) { alert('沒有符合的題目'); return; }
  window.startQuiz(qs);
};

// ====== PRINT ======
window.printQuizFromFilter = function() {
  printQuiz(APP.filteredQuestions);
};

window.printAllQuestions = function() {
  printQuiz(APP.availableQuestions);
};

function printQuiz(questions) {
  const html = UI.renderPrintQuiz(questions);
  const w = window.open('', '', 'width=750,height=900');
  w.document.write(`<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>英語科練習卷</title><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap" rel="stylesheet"><style>body{font-family:'Noto Sans TC',sans-serif;} @media print{@page{size:A4;margin:1.5cm 2cm;}}</style></head><body>${html}<script>window.onload=function(){window.print();};<\/script></body></html>`);
  w.document.close();
}

// ====== START ======
init();
