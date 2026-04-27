// ====== QUIZ LOGIC ======
// 練習邏輯，包含亂數選擇

/**
 * Fisher-Yates 洗牌算法
 */
export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 將題目按題組分組
 * @param {Array} questions - 題目陣列
 * @returns {Array} 題組陣列（每個元素是包含題目的陣列）
 */
export function groupByPassage(questions) {
  const groups = [];
  const groupMap = new Map();

  questions.forEach(q => {
    if (q.group_id) {
      if (!groupMap.has(q.group_id)) {
        groupMap.set(q.group_id, []);
      }
      groupMap.get(q.group_id).push(q);
    } else {
      // 單題視為獨立題組
      groups.push([q]);
    }
  });

  // 將有 group_id 的題組加入
  groupMap.forEach(groupQuestions => {
    // 按 group_order 排序
    const sorted = groupQuestions.sort((a, b) => (a.group_order || 0) - (b.group_order || 0));
    groups.push(sorted);
  });

  return groups;
}

/**
 * 亂數選擇題目（保護題組內部順序）
 * @param {Array} questions - 題目陣列
 * @param {boolean} shuffle - 是否洗牌
 * @returns {Array} 亂序後的題目陣列
 */
export function shuffleQuestions(questions, shuffle = true) {
  if (!shuffle) {
    return [...questions];
  }

  // 將題目按題組分組
  const groups = groupByPassage(questions);

  // 對題組進行洗牌
  const shuffledGroups = shuffleArray(groups);

  // 展開為題目陣列
  return shuffledGroups.flat();
}

/**
 * 根據年份取得題目
 */
export function getQuestionsByYear(questions, year) {
  return questions.filter(q => q.year == year);
}

/**
 * 根據概念取得題目
 */
export function getQuestionsByConcept(questions, concept) {
  return questions.filter(q => (q.concepts || []).includes(concept));
}

/**
 * 根據題型取得題目
 */
export function getQuestionsByType(questions, type) {
  return questions.filter(q => q.type === type);
}

/**
 * 根據難度取得題目
 */
export function getQuestionsByDifficulty(questions, difficulty) {
  return questions.filter(q => q.difficulty === difficulty);
}

/**
 * 取得題目的題組 siblings
 */
export function getGroupSiblings(question, allQuestions) {
  if (!question.group_id) return [];
  return allQuestions.filter(q =>
    q.group_id === question.group_id && q.id !== question.id
  );
}

/**
 * 計算答題正確率
 */
export function calculateScore(questions, answers) {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] && answers[i] === q.answer) correct++;
  });
  return {
    correct,
    total: questions.length,
    percentage: questions.length > 0 ? Math.round(correct / questions.length * 100) : 0
  };
}
