// ====== STATE MANAGEMENT ======
// 集中管理應用狀態

const STORAGE_KEY = 'exam_bank_state';

let state = {
  questions: [],
  passages: [],
  availableQuestions: [],
  filtered: [],
  currentView: 'home',
  currentMode: 'study', // 'study' or 'test'
  loaded: false,

  // Quiz state
  quiz: {
    questions: [],
    current: 0,
    answers: {},
    revealed: [],
    startTime: 0,
    mode: 'study'
  },

  // Filter state
  filters: {
    year: '',
    type: '',
    difficulty: '',
    concept: '',
    hasAnswer: ''
  }
};

export function getState() {
  return state;
}

export function setState(updates) {
  Object.assign(state, updates);
}

export function getQuestions() {
  return state.questions;
}

export function setQuestions(questions) {
  state.questions = questions;
  state.availableQuestions = questions.filter(q => q.available !== false);
  state.filtered = [...state.availableQuestions];
}

export function getAvailableQuestions() {
  return state.availableQuestions;
}

export function getFilteredQuestions() {
  return state.filtered;
}

export function setFilteredQuestions(filtered) {
  state.filtered = filtered;
}

export function getCurrentView() {
  return state.currentView;
}

export function setCurrentView(view) {
  state.currentView = view;
}

export function getCurrentMode() {
  return state.currentMode;
}

export function setCurrentMode(mode) {
  state.currentMode = mode;
  state.quiz.mode = mode;
}

export function getQuizState() {
  return state.quiz;
}

export function startQuiz(questions) {
  state.quiz = {
    questions,
    current: 0,
    answers: {},
    revealed: new Array(questions.length).fill(false),
    startTime: Date.now(),
    mode: state.currentMode
  };
}

export function setQuizAnswer(index, answer) {
  state.quiz.answers[index] = answer;
}

export function revealQuizAnswer(index) {
  state.quiz.revealed[index] = true;
}

export function setQuizCurrent(index) {
  state.quiz.current = index;
}

export function nextQuizQuestion() {
  if (state.quiz.current < state.quiz.questions.length - 1) {
    state.quiz.current++;
    return true;
  }
  return false;
}

export function prevQuizQuestion() {
  if (state.quiz.current > 0) {
    state.quiz.current--;
    return true;
  }
  return false;
}

export function isQuizComplete() {
  return state.quiz.current >= state.quiz.questions.length;
}

export function getQuizProgress() {
  const { questions, current } = state.quiz;
  return {
    current: current + 1,
    total: questions.length,
    percentage: (current / questions.length) * 100
  };
}

export function getQuizResult() {
  const { questions, answers, revealed, startTime, mode } = state.quiz;
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] && answers[i] === q.answer) correct++;
  });

  return {
    total,
    answered,
    correct,
    wrong: answered - correct,
    score: total > 0 ? Math.round(correct / total * 100) : 0,
    elapsed,
    mode
  };
}

// ====== FILTERS ======
export function getFilters() {
  return state.filters;
}

export function setFilters(filters) {
  state.filters = { ...state.filters, ...filters };
}

export function resetFilters() {
  state.filters = {
    year: '',
    type: '',
    difficulty: '',
    concept: '',
    hasAnswer: ''
  };
}
