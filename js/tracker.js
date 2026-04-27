// ====== LEARNING TRACKER ======
// 學習追蹤：錯題本、學習歷程、統計

const STORAGE_KEY = 'exam_bank_tracker';

// 儲存結構
// {
//   wrongAnswers: { "questionId": { times: 3, lastAnswer: "B", lastTime: timestamp } },
//   history: [{ questionId, answer, correct, time, timestamp }],
//   stats: { totalAnswered: 100, totalCorrect: 80, ... }
// }

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      wrongAnswers: {},
      history: [],
      stats: {
        totalAnswered: 0,
        totalCorrect: 0,
        streak: 0,
        maxStreak: 0,
        lastPracticeDate: null
      }
    };
  } catch (e) {
    console.error('Failed to load tracker data:', e);
    return {
      wrongAnswers: {},
      history: [],
      stats: {
        totalAnswered: 0,
        totalCorrect: 0,
        streak: 0,
        maxStreak: 0,
        lastPracticeDate: null
      }
    };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save tracker data:', e);
  }
}

// 記錄答題結果
export function recordAnswer(questionId, answer, correct) {
  const data = loadData();

  // 更新歷史
  data.history.push({
    questionId,
    answer,
    correct,
    timestamp: Date.now()
  });

  // 保留最近 1000 筆記錄
  if (data.history.length > 1000) {
    data.history = data.history.slice(-1000);
  }

  // 更新統計
  data.stats.totalAnswered++;
  if (correct) {
    data.stats.totalCorrect++;
    data.stats.streak++;
    if (data.stats.streak > data.stats.maxStreak) {
      data.stats.maxStreak = data.stats.streak;
    }
  } else {
    data.stats.streak = 0;

    // 記錄錯題
    if (!data.wrongAnswers[questionId]) {
      data.wrongAnswers[questionId] = {
        times: 0,
        lastAnswer: answer,
        lastTime: Date.now()
      };
    }
    data.wrongAnswers[questionId].times++;
    data.wrongAnswers[questionId].lastAnswer = answer;
    data.wrongAnswers[questionId].lastTime = Date.now();
  }

  data.stats.lastPracticeDate = Date.now();

  saveData(data);
}

// 取得錯題本
export function getWrongAnswers() {
  const data = loadData();
  return data.wrongAnswers;
}

// 取得錯題數量
export function getWrongAnswerCount() {
  const data = loadData();
  return Object.keys(data.wrongAnswers).length;
}

// 清除錯題記錄
export function clearWrongAnswers() {
  const data = loadData();
  data.wrongAnswers = {};
  saveData(data);
}

// 取得學習統計
export function getStats() {
  const data = loadData();
  return {
    ...data.stats,
    accuracy: data.stats.totalAnswered > 0
      ? Math.round(data.stats.totalCorrect / data.stats.totalAnswered * 100)
      : 0
  };
}

// 取得最近練習記錄
export function getRecentHistory(limit = 20) {
  const data = loadData();
  return data.history.slice(-limit);
}

// 取得答題類型分布
export function getTypeStats(questions) {
  const data = loadData();
  const typeStats = {};

  // 初始化
  questions.forEach(q => {
    if (!typeStats[q.type]) {
      typeStats[q.type] = { total: 0, correct: 0 };
    }
    typeStats[q.type].total++;
  });

  // 統計歷史
  data.history.forEach(h => {
    const q = questions.find(q => q.id === h.questionId);
    if (q && typeStats[q.type]) {
      if (h.correct) {
        typeStats[q.type].correct++;
      }
    }
  });

  return typeStats;
}

// 取得弱點分析（錯誤率最高的類型/概念）
export function getWeakPoints(questions) {
  const data = loadData();
  const weakPoints = {
    byType: {},
    byConcept: {},
    byDifficulty: {}
  };

  // 統計各類型錯誤率
  const typeResults = {};
  const conceptResults = {};
  const difficultyResults = {};

  data.history.forEach(h => {
    const q = questions.find(q => q.id === h.questionId);
    if (!q) return;

    // 按類型
    if (!typeResults[q.type]) typeResults[q.type] = { correct: 0, wrong: 0 };
    if (h.correct) typeResults[q.type].correct++;
    else typeResults[q.type].wrong++;

    // 按概念
    (q.concepts || []).forEach(c => {
      if (!conceptResults[c]) conceptResults[c] = { correct: 0, wrong: 0 };
      if (h.correct) conceptResults[c].correct++;
      else conceptResults[c].wrong++;
    });

    // 按難度
    if (q.difficulty) {
      if (!difficultyResults[q.difficulty]) difficultyResults[q.difficulty] = { correct: 0, wrong: 0 };
      if (h.correct) difficultyResults[q.difficulty].correct++;
      else difficultyResults[q.difficulty].wrong++;
    }
  });

  // 計算錯誤率
  Object.entries(typeResults).forEach(([type, r]) => {
    const total = r.correct + r.wrong;
    if (total > 0) {
      weakPoints.byType[type] = {
        wrongRate: Math.round(r.wrong / total * 100),
        total,
        wrong: r.wrong
      };
    }
  });

  Object.entries(conceptResults).forEach(([concept, r]) => {
    const total = r.correct + r.wrong;
    if (total > 0) {
      weakPoints.byConcept[concept] = {
        wrongRate: Math.round(r.wrong / total * 100),
        total,
        wrong: r.wrong
      };
    }
  });

  Object.entries(difficultyResults).forEach(([diff, r]) => {
    const total = r.correct + r.wrong;
    if (total > 0) {
      weakPoints.byDifficulty[diff] = {
        wrongRate: Math.round(r.wrong / total * 100),
        total,
        wrong: r.wrong
      };
    }
  });

  return weakPoints;
}

// 取得 streak 資訊
export function getStreakInfo() {
  const data = loadData();
  const { streak, maxStreak, lastPracticeDate } = data.stats;

  // 計算連續練習天數
  let consecutiveDays = 0;
  if (lastPracticeDate) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const daysSince = Math.floor((now - lastPracticeDate) / dayMs);

    if (daysSince <= 1) {
      consecutiveDays = 1;
      // 檢查之前的練習日期
      const dates = [...new Set(data.history.map(h => new Date(h.timestamp).toDateString()))];
      dates.sort((a, b) => new Date(b) - new Date(a));

      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (prev - curr) / dayMs;
        if (diff <= 1) {
          consecutiveDays++;
        } else {
          break;
        }
      }
    }
  }

  return {
    currentStreak: streak,
    maxStreak,
    consecutiveDays,
    lastPracticeDate
  };
}

// 清除所有學習資料
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}
