// ====== UI RENDERING ======
// DOM 渲染函式

const typeLabels = {
  vocabulary: '詞彙',
  grammar: '文法',
  reading: '閱讀',
  cloze: '克漏字',
  conversation: '對話'
};

const difficultyClass = {
  basic: 'badge-difficulty-basic',
  medium: 'badge-difficulty-medium',
  difficult: 'badge-difficulty-difficult'
};

export function esc(s) {
  return String(s).replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

export function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function $(sel) {
  return document.querySelector(sel);
}

export function $$(sel) {
  return document.querySelectorAll(sel);
}

export function renderApp(container) {
  if (!container) container = $('#app');
  return container;
}

// ====== HOME ======
export function renderHome(questions, homeStats = null) {
  const total = questions.length;
  const withAns = questions.filter(q => q.answer).length;
  const years = {};
  questions.forEach(q => { years[q.year] = (years[q.year] || 0) + 1; });
  const yearKeys = Object.keys(years).sort();
  const concepts = [...new Set(questions.flatMap(q => q.concepts || []))].filter(Boolean);

  const stats = homeStats?.stats || { totalAnswered: 0, accuracy: 0, streak: 0 };
  const wrongCount = homeStats?.wrongCount || 0;
  const streakInfo = homeStats?.streakInfo || { consecutiveDays: 0 };

  return `
  ${homeStats ? `
  <div class="card" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd;">
    <div class="card-title">📈 你的學習進度</div>
    <div class="stats-bar" style="background:transparent;">
      <div class="stat"><div class="num">${stats.totalAnswered}</div><div class="label">總答題</div></div>
      <div class="stat"><div class="num">${stats.accuracy}%</div><div class="label">正確率</div></div>
      <div class="stat"><div class="num">${streakInfo.consecutiveDays}</div><div class="label">連續天數</div></div>
      <div class="stat"><div class="num" style="color:var(--danger);">${wrongCount}</div><div class="label">錯題數</div></div>
    </div>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
      <button class="btn btn-sm" style="background:var(--danger);color:white;" onclick="navigate('wrong')">📝 錯題複訓</button>
      <button class="btn btn-sm" style="background:#7c3aed;color:white;" onclick="startReadingQuiz()">📖 閱讀練習</button>
      <button class="btn btn-outline btn-sm" onclick="navigate('stats')">📊 詳細統計</button>
    </div>
  </div>
  ` : ''}

  <div class="stats-bar">
    <div class="stat"><div class="num">${total}</div><div class="label">總題數</div></div>
    <div class="stat"><div class="num">${withAns}</div><div class="label">有答案</div></div>
    <div class="stat"><div class="num">${yearKeys.length}</div><div class="label">年度</div></div>
    <div class="stat"><div class="num">${concepts.length}</div><div class="label">概念</div></div>
  </div>

  <div class="card">
    <div class="card-title">📅 依年度選題</div>
    <div class="year-grid">
      ${yearKeys.map(y => `
      <div class="year-cell" onclick="startQuizByYear(${y})">
        <div class="y-num">${y}年</div>
        <div class="y-count">${years[y]}</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-title">🏷️ 學習概念</div>
    <div class="tag-list">
      ${concepts.map(c => `<span class="tag" onclick="startQuizByConcept('${esc(c)}')">${c}</span>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-title">🔍 條件選題</div>
    <div class="btn-group" style="display:flex;gap:0.6rem;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="navigate('filter')">🔍 進階篩選</button>
      <button class="btn btn-outline" onclick="navigate('list')">📋 瀏覽列表</button>
    </div>
  </div>`;
}

// ====== FILTER ======
export function renderFilter(questions, filters, applyFilterFn) {
  const years = [...new Set(questions.map(q => q.year))].sort();
  const types = [...new Set(questions.map(q => q.type).filter(Boolean))].sort();
  const difficulties = [...new Set(questions.map(q => q.difficulty).filter(Boolean))].sort();
  const concepts = [...new Set(questions.flatMap(q => q.concepts || []))].filter(Boolean).sort();

  const filtered = applyFilterFn(questions, filters);

  return `
  <div class="card">
    <div class="card-title">🔍 條件篩選</div>
    <div class="filters-grid">
      <div class="filter-group">
        <label>年度</label>
        <select id="fi-year" onchange="updateFilter('year', this.value)">
          <option value="">全部</option>
          ${years.map(y => `<option value="${y}" ${filters.year == y ? 'selected' : ''}>${y}年</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>題型</label>
        <select id="fi-type" onchange="updateFilter('type', this.value)">
          <option value="">全部</option>
          ${types.map(t => `<option value="${t}" ${filters.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>難度</label>
        <select id="fi-difficulty" onchange="updateFilter('difficulty', this.value)">
          <option value="">全部</option>
          ${difficulties.map(d => `<option value="${d}" ${filters.difficulty === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>答案</label>
        <select id="fi-answer" onchange="updateFilter('hasAnswer', this.value)">
          <option value="">全部</option>
          <option value="yes" ${filters.hasAnswer === 'yes' ? 'selected' : ''}>有答案</option>
          <option value="no" ${filters.hasAnswer === 'no' ? 'selected' : ''}>無答案</option>
        </select>
      </div>
    </div>
    <div class="filter-group" style="margin-bottom:0.75rem;">
      <label>學習概念</label>
      <select id="fi-concept" onchange="updateFilter('concept', this.value)">
        <option value="">全部概念</option>
        ${concepts.map(c => `<option value="${esc(c)}" ${filters.concept === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="tag-list">
      ${concepts.map(c => `<span class="tag ${filters.concept === c ? 'active' : ''}" onclick="updateFilter('concept', '${esc(c)}')">${c}</span>`).join('')}
    </div>
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
      <span style="font-weight:700;">找到 <span style="color:var(--primary);font-size:1.2rem;">${filtered.length}</span> 題</span>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="startQuizFromFilter()" ${filtered.length === 0 ? 'disabled' : ''}>▶ 開始</button>
        <button class="btn btn-outline btn-sm" onclick="previewQuizFromFilter()" ${filtered.length === 0 ? 'disabled' : ''}>👁 預覽</button>
        <button class="btn btn-outline btn-sm" onclick="printQuizFromFilter()" ${filtered.length === 0 ? 'disabled' : ''}>🖨 列印</button>
      </div>
    </div>
    ${filtered.length === 0 ? '<p style="color:var(--gray-500);text-align:center;padding:1rem;">沒有符合的題目，請調整篩選條件</p>' :
    filtered.slice(0, 5).map((q, i) => renderQCard(q, i)).join('') +
    (filtered.length > 5 ? `<p style="text-align:center;color:var(--gray-500);font-size:0.8rem;margin-top:0.75rem;">還有 ${filtered.length - 5} 題...</p>` : '')
    }
  </div>`;
}

// ====== LIST ======
export function renderList(questions) {
  const years = [...new Set(questions.map(q => q.year))].sort();
  return `
  <div class="card">
    <div class="card-title">📋 題庫列表（${questions.length}題）</div>
  </div>
  ${years.map(y => {
    const qs = questions.filter(q => q.year === y);
    return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <div class="card-title" style="margin:0;">${y}年度</div>
        <button class="btn btn-primary btn-sm" onclick="startQuizByYear(${y})">▶ 開始作答</button>
      </div>
      ${qs.map((q, i) => renderQCard(q, i)).join('')}
    </div>`;
  }).join('')}`;
}

// ====== Q CARD ======
export function renderQCard(q, idx) {
  const typeLabel = typeLabels[q.type] || q.type;
  const diffClass = q.difficulty ? difficultyClass[q.difficulty] : '';
  const hasAns = q.answer ? 'badge-answer-yes' : 'badge-answer-no';
  const ansLabel = q.answer ? '✓有答案' : '✗無';
  const groupBadge = q.group_id ? `<span class="badge badge-group">題組${q.group_id}</span>` : '';
  const passageTag = q.passage ? '<span class="passage-indicator">📄</span>' : '';
  return `
  <div class="q-card" onclick="startQuizAt(${idx})">
    <div class="q-card-header">
      <div class="left">
        <span class="badge badge-year">${q.year}年</span>
        <span class="badge badge-type">${typeLabel}</span>
        ${q.difficulty ? `<span class="badge ${diffClass}">${q.difficulty}</span>` : ''}
        ${groupBadge}
      </div>
      <div style="display:flex;gap:0.3rem;align-items:center;">
        ${passageTag}
        <span class="badge ${hasAns}">${ansLabel}</span>
      </div>
    </div>
    <div class="q-card-qtext">${escHtml(q.question || '')}</div>
    <div class="q-card-footer">
      <div class="q-card-concepts">
        ${(q.concepts || []).map(c => `<span class="concept-pill">${c}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

// ====== PRACTICE ======
export function renderPractice(q, current, total, answers, revealed, mode, groupSiblings = []) {
  const progress = (current / total) * 100;
  const selected = answers[current];
  const isRevealed = revealed[current];
  const typeLabel = typeLabels[q.type] || q.type;
  const diffClass = q.difficulty ? difficultyClass[q.difficulty] : '';

  return `
  <div class="practice-container">
    <div class="progress-header">
      <div class="progress-header-top">
        <span>第 ${current + 1} / ${total} 題</span>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          ${q.group_id ? `<span class="badge badge-group">題組 ${q.group_id}</span>` : ''}
          <span class="badge badge-year">${q.year}年</span>
        </div>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${progress}%"></div></div>
    </div>

    ${q.passage ? `
    <div class="passage-box">
      <div class="passage-label">📄 文章</div>
      ${escHtml(q.passage)}
      ${groupSiblings.length ? `<div class="group-nav">同組題目：${groupSiblings.map((s, i) => `<a onclick="jumpToGroup('${s.id}')">第${s.group_order}題</a>`).join('')}</div>` : ''}
    </div>` : ''}

    <div class="question-box">
      <div class="question-meta">
        <span class="badge badge-type">${typeLabel}</span>
        ${q.difficulty ? `<span class="badge ${diffClass}">${q.difficulty}</span>` : ''}
        ${(q.concepts || []).map(c => `<span class="badge" style="background:var(--gray-100);color:var(--gray-600);">${c}</span>`).join('')}
      </div>
      <div class="question-text">${escHtml(q.question || '')}</div>
      <div class="options-list">
        ${Object.entries(q.options || {}).filter(([k]) => k !== 'passage').map(([k, v]) => {
          let cls = 'option-item';
          let locked = '';
          if (selected && (isRevealed || mode === 'study')) {
            locked = 'locked';
            if (q.answer === k) cls += ' correct';
            else if (selected === k && k !== q.answer) cls += ' wrong';
          } else if (selected === k) {
            cls += ' selected';
          }
          return `<div class="${cls} ${locked}" onclick="pickOption('${k}')">
            <span class="opt-label">${k}</span>
            <span>${escHtml(v)}</span>
          </div>`;
        }).join('')}
      </div>

      ${mode === 'study' && isRevealed ? `
      <div class="reveal-section">
        <div class="reveal-content show">
          <strong>✅ 正確答案：${q.answer}</strong>
          ${q.concepts && q.concepts.length ? `<div style="margin-top:0.4rem;">學習概念：${q.concepts.join('、')}</div>` : ''}
          ${q.note ? `<div style="margin-top:0.3rem;color:var(--gray-500);">${escHtml(q.note)}</div>` : ''}
        </div>
      </div>` : ''}
    </div>

    <div class="practice-nav">
      <button class="btn btn-outline btn-sm" onclick="prevQ()" ${current === 0 ? 'disabled' : ''}>◀ 上一題</button>
      <div class="jump-input">
        跳至 <input type="number" min="1" max="${total}" value="${current + 1}" onchange="jumpTo(this.value - 1)"> 題
      </div>
      ${mode === 'study' && !isRevealed && selected ? `
        <button class="btn btn-sm" style="background:#fef3c7;color:#92400e;border:1.5px solid #fbbf24;" onclick="revealAns()">💡 揭曉答案</button>
      ` : ''}
      <button class="btn btn-primary btn-sm" onclick="nextQ()" ${current === total - 1 ? 'disabled' : ''}>下一題 ▶</button>
    </div>

    <div style="margin-top:1rem;text-align:center;">
      <button class="btn btn-outline btn-sm" onclick="navigate('result')">📊 查看成績</button>
    </div>
  </div>`;
}

// ====== RESULT ======
export function renderResult(result) {
  const { total, answered, correct, wrong, score, elapsed, mode } = result;
  const scoreColor = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';

  return `
  <div class="result-card">
    <div style="font-size:0.85rem;color:var(--gray-500);font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;">你的得分</div>
    <div class="result-score" style="color:${scoreColor};">${score}<span>%</span></div>
    <div class="result-detail">
      <div class="result-detail-item"><div class="rd-num" style="color:var(--success);">${correct}</div><div class="rd-label">答對</div></div>
      <div class="result-detail-item"><div class="rd-num" style="color:var(--danger);">${wrong}</div><div class="rd-label">答錯</div></div>
      <div class="result-detail-item"><div class="rd-num" style="color:var(--gray-500);">${answered}/${total}</div><div class="rd-label">已作答</div></div>
    </div>
    ${mode === 'test' ? `<div style="font-size:0.85rem;color:var(--gray-500);margin-bottom:1.5rem;">⏱ 用時 ${elapsed} 秒</div>` : ''}
    <div class="result-actions">
      <button class="btn btn-primary" onclick="startQuizAgain()">🔄 再試一次</button>
      <button class="btn btn-outline" onclick="navigate('home')">🏠 回首頁</button>
    </div>
  </div>`;
}

// ====== ABOUT ======
export function renderAbout(questions) {
  const concepts = [...new Set(questions.flatMap(q => q.concepts || []))].filter(Boolean);
  const typeCounts = {};
  questions.forEach(q => { typeCounts[q.type] = (typeCounts[q.type] || 0) + 1; });

  const conceptDescs = {
    '詞義理解': '理解單字或情境中的詞義',
    '閱讀推理': '根據文章資訊推斷答案',
    '對話理解': '理解對話情境與言外之意',
    '過去式': '過去式的時態與用法',
    '現在式': '現在式的時態與用法',
    '現在完成式': '現在完成式的時態與用法',
    '未來式': '未來式',
    '比較級與最高級': '形容詞與副詞的比較變化',
    '代名詞': '各類代名詞的用法',
    '介係詞': '時間、地點、方向介係詞的用法',
    '數量詞與片語': '數量詞與片語動詞',
    '克漏字': '克漏字題組',
    '主旨與細節': '文章主旨與細節擷取'
  };

  return `
  <div class="card">
    <div class="card-title">ℹ️ 關於本題庫</div>
    <p style="line-height:1.8;color:var(--gray-700);margin-bottom:1rem;">
      收錄台灣 <strong>102–114年度</strong> 國中教育會考英語科試題，共 <strong>${questions.length}題</strong>（篩除圖片題及無答案題），
      由專業英文教師補正與審查。屬教育研究者約翰·陳所有。
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
      <button class="btn btn-outline btn-sm" onclick="navigate('filter')">🔍 篩選題目</button>
      <button class="btn btn-outline btn-sm" onclick="printAllQuestions()">🖨 列印整份</button>
    </div>
    <p style="font-size:0.8rem;color:var(--gray-500);line-height:1.7;">
      ⚠️ 部分圖片題、聽力題無文字內容，屬原始試卷限制，答案維持空白。
    </p>
  </div>

  <div class="card">
    <div class="card-title">📊 題型分布</div>
    <div class="about-grid">
      ${Object.entries(typeCounts).map(([t, c]) => `
      <div class="about-type-item">
        <div class="at-name">${typeLabels[t] || t}</div>
        <div class="at-count">${c}</div>
        <div class="at-desc">${Math.round(c / questions.length * 100)}%</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-title">🏷️ 學習概念（${concepts.length}類）</div>
    <table class="concept-table">
      <thead><tr><th>概念</th><th>說明</th><th style="text-align:right;">題數</th></tr></thead>
      <tbody>
        ${concepts.map(c => {
          const cnt = questions.filter(q => (q.concepts || []).includes(c)).length;
          return `<tr><td><strong>${c}</strong></td><td style="color:var(--gray-500);font-size:0.8rem;">${conceptDescs[c] || ''}</td><td style="text-align:right;font-weight:700;color:var(--primary);">${cnt}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}

// ====== PRINT ======
export function renderPrintQuiz(questions) {
  const count = questions.length;
  let html = `<div style="max-width:700px;margin:0 auto;padding:1rem 0;font-family:'Noto Sans TC',sans-serif;">`;
  html += `<h1 style="text-align:center;font-size:1.3rem;margin-bottom:0.25rem;">台灣國中教育會考｜英語科練習卷</h1>`;
  html += `<p style="text-align:center;color:#666;font-size:0.85rem;margin-bottom:1.5rem;">共 ${count} 題</p>`;

  questions.forEach((q, idx) => {
    const num = idx + 1;
    const opts = Object.entries(q.options || {}).filter(([k]) => k !== 'passage');
    html += `<div style="margin-bottom:1.5rem;page-break-inside:avoid;padding:0.75rem;border:1px solid #e5e7eb;border-radius:8px;">`;
    html += `<div style="font-weight:700;margin-bottom:0.5rem;">${num}. <span style="background:#dbeafe;color:#1e40af;padding:0.1rem 0.4rem;border-radius:3px;font-size:0.75rem;">${q.year}年</span> <span style="background:#f3f4f6;color:#666;padding:0.1rem 0.4rem;border-radius:3px;font-size:0.75rem;">${q.type}</span></div>`;
    if (q.passage) html += `<div style="background:#fefce8;border:1px solid #fbbf24;border-radius:6px;padding:0.5rem 0.75rem;margin-bottom:0.5rem;font-size:0.85rem;white-space:pre-wrap;">${escHtml(q.passage)}</div>`;
    html += `<div style="margin-bottom:0.5rem;line-height:1.7;font-size:0.95rem;white-space:pre-wrap;">${escHtml(q.question || '')}</div>`;
    opts.forEach(([k, v]) => { html += `<div style="display:flex;gap:0.5rem;line-height:1.6;font-size:0.9rem;margin-bottom:0.25rem;"><strong style="min-width:1.2rem;">(${k})</strong><span>${escHtml(v)}</span></div>`; });
    html += `</div>`;
  });

  html += `<div style="page-break-before:always;margin-top:2rem;padding-top:1rem;border-top:2px solid #333;">`;
  html += `<h2 style="text-align:center;font-size:1.1rem;margin-bottom:1rem;">解答</h2><div style="display:grid;grid-template-columns:repeat(10,1fr);gap:0.4rem;">`;
  questions.forEach((q, i) => { html += `<div style="text-align:center;padding:0.3rem;border:1px solid #ddd;border-radius:4px;"><div style="font-size:0.7rem;color:#999;">${i + 1}</div><div style="font-weight:700;font-size:1rem;">${q.answer || '?'}</div></div>`; });
  html += `</div></div></div>`;

  return html;
}
