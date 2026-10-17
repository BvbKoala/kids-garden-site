const list = document.querySelector('#subject-list');
for (const subject of globalThis.GARDEN_SUBJECTS) {
  const entry = document.createElement(subject.available ? 'a' : 'article');
  entry.className = `subject subject-${subject.id}`;
  entry.dataset.subject = subject.id;
  if (subject.available) entry.href = subject.href;
  else entry.setAttribute('aria-label', `${subject.name}，筹备中`);
  entry.innerHTML = `<div class="subject-top"><span class="subject-caption">${subject.caption}</span><i data-lucide="${subject.icon}"></i></div>
    <div class="subject-mark" aria-hidden="true">${subject.mark || '<i data-lucide="compass"></i>'}</div>
    <h2>${subject.name}</h2><p class="subject-detail">${subject.detail || '筹备中'}</p>
    <div class="subject-bottom">${subject.available ? '<span>去玩一玩</span><i data-lucide="arrow-right"></i>' : '<span>敬请期待</span><i data-lucide="sprout"></i>'}</div>`;
  list.append(entry);
}
window.lucide?.createIcons();

function updateSeedCount() {
  const rewardSummary = GardenRewards.snapshot();
  const days=document.querySelector('#study-days'),summary=document.querySelector('#study-days-summary');
  if(rewardSummary.error){summary.textContent='学习天数暂时无法读取，请家长检查记录。';}else{const count=Object.values(rewardSummary.days).filter(day=>day.rounds>0).length;if(days)days.textContent=String(count);else{summary.replaceChildren('您已经快乐学习 ');const number=document.createElement('strong');number.id='study-days';number.textContent=String(count);summary.append(number,' 天啦');}}
  document.querySelector('#seed-count').textContent = rewardSummary.error ? '请家长检查记录' : `${rewardSummary.balance} 颗星星`;
}
updateSeedCount();
window.addEventListener('pageshow', updateSeedCount);
window.addEventListener('storage', updateSeedCount);

window.addEventListener('garden-rewards-changed',updateSeedCount);
