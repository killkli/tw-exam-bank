// ====== DATA LOADER ======
// 負責載入和解析題庫資料

export async function loadQuestions() {
  const res = await fetch('./data/questions.json');
  if (!res.ok) throw new Error('Failed to load questions');
  const data = await res.json();
  return data;
}

export async function loadPassages() {
  const res = await fetch('./data/passages.json');
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}

export function getAvailableQuestions(questions) {
  return questions.filter(q => q.available !== false);
}

export function filterQuestions(questions, filters) {
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

export function groupQuestionsByYear(questions) {
  const groups = {};
  questions.forEach(q => {
    groups[q.year] = groups[q.year] || [];
    groups[q.year].push(q);
  });
  return groups;
}

export function getQuestionGroups(questions) {
  // 將題目按 group_id 分組
  const groups = {};
  questions.forEach(q => {
    if (q.group_id) {
      groups[q.group_id] = groups[q.group_id] || [];
      groups[q.group_id].push(q);
    }
  });
  return groups;
}
