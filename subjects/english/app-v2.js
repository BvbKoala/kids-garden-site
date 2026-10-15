const lessons = globalThis.ABC_LESSONS;
const words = lessons.flatMap(lesson => lesson.words);
const byId = new Map(words.map(word => [word.id, word]));
const initial = () => ({ sound:true, hints:true, difficulty:3, selected:'A', seen:[], correct:{}, completed:{}, stickers:[], rounds:0, wordReview:{} });
let stored;
try { stored = JSON.parse(localStorage.getItem('abc-garden-v2') || localStorage.getItem('abc-garden-v1') || 'null'); } catch {}
let prefs = { ...initial(), ...stored };
if (!lessons.some(l => l.letter === prefs.selected)) prefs.selected = 'A';
if (![2,3].includes(Number(prefs.difficulty))) prefs.difficulty = 3;
if (!Array.isArray(prefs.seen)) prefs.seen = [];
if (!Array.isArray(prefs.stickers)) prefs.stickers = [];
if (!prefs.correct || typeof prefs.correct !== 'object') prefs.correct = {};
if (!prefs.completed || typeof prefs.completed !== 'object') prefs.completed = {};
const review = globalThis.GardenWordReview;
prefs.wordReview = review.normalize(prefs.wordReview, byId.keys());
let view = 'garden', game = null, playToken = 0, currentAudio = null, audioResolve = null, wordPage = 0;
const batchSize = 5;
const curriculum = globalThis.GardenCourseProgress;
const courses = curriculum.catalog(lessons,batchSize);
prefs.courseProgress = curriculum.normalize(prefs.courseProgress,courses,prefs);
const openingCourse = courses[curriculum.current(prefs.courseProgress,courses)];
prefs.selected = openingCourse.letter;wordPage = openingCourse.page;
const courseIndex = () => courses.findIndex(course=>course.letter===prefs.selected&&course.page===wordPage);
const courseAllowed = index => curriculum.accessible(prefs.courseProgress,courses,index);
const dueReview = () => review.due(prefs.wordReview);
function requireReview() {
  if(!dueReview().length)return false;
  renderReviewBook();notice('先完成今天到期的单词复习，再开始课程。');return true;
}
function moveToCourse(index) {
  if(requireReview())return;
  if(!courseAllowed(index)){notice('先通过前一课，就能解锁这里啦。');return;}
  prefs.selected=courses[index].letter;wordPage=courses[index].page;save();view='garden';render();
}
function continueCourse() { moveToCourse(curriculum.current(prefs.courseProgress,courses)); }
function courseStatus() {
  const index=courseIndex(), passed=Object.keys(prefs.courseProgress.passed).length, due=dueReview().length;
  return `<div class="course-status"><span class="course-pill">第 ${index+1} / ${courses.length} 课 · ${prefs.courseProgress.passed[courses[index].id]?'已通过':'进行中'}</span><p>已通过 ${passed} / ${courses.length} 课 · 每课 5 个单词，通关后解锁下一课。</p>${due?`<p class="course-review-alert">今天还有 ${due} 个词到期，先完成复习，再学课程。</p>`:''}<button class="secondary" id="continue-course">${due?'先完成今日复习':'继续学习进度'}</button></div>`;
}
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const icon = name => `<i data-lucide="${name}"></i>`;
const lesson = () => lessons.find(l => l.letter === prefs.selected);
const batchWords = () => lesson().words.slice(wordPage*batchSize,(wordPage+1)*batchSize);
// The final generated atlas places its third row slightly above the grid center.
const sprite = w => `<span class="sprite atlas ${w.atlas?'new-atlas':''}" style="--sheet:url('assets/${w.atlas||'alphabet-'+w.sheet}.png');--x:${w.col*100/3}%;--y:${!w.atlas&&w.sheet===5&&w.row===2?64:w.row*100/3}%" role="img" aria-label="${w.zh}"></span>`;
function icons() { window.lucide?.createIcons(); }
function save() {
  try { localStorage.setItem('abc-garden-v2', JSON.stringify(prefs)); } catch {}
}
function shuffle(items) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function markSeen(w) { if (!prefs.seen.includes(w.id)) prefs.seen.push(w.id); save(); }
function stopAudio() {
  playToken++;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (audioResolve) { audioResolve(); audioResolve = null; }
}
function notice(text) {
  document.querySelector('.audio-notice')?.remove();
  const el=document.createElement('div');el.className='audio-notice';el.textContent=text;document.body.append(el);
  setTimeout(()=>el.remove(),4000);
}
function updateCaption() {
  const caption=document.querySelector('#sound-caption');
  if (caption && game) {
    caption.hidden=prefs.sound && !game.audioFailed;
    caption.textContent=game.kind==='match'?game.target.letter:`${game.target.word} · ${game.target.zh}`;
  }
}
async function speak(...ids) {
  stopAudio(); updateCaption();
  if (!prefs.sound) return;
  const token=playToken;
  for (const id of ids) {
    if (token!==playToken) return;
    const audio=new Audio(['star-earned','daily-checkin-bonus'].includes(id)?`../shared/audio/${id}.mp3`:`assets/audio/${id}.mp3`);currentAudio=audio;
    await new Promise(resolve=>{
      let settled=false;
      const finish=()=>{if(settled)return;settled=true;if(audioResolve===finish)audioResolve=null;resolve();};
      const failure=()=>{if(token===playToken){if(game){game.audioFailed=true;updateCaption();}notice('声音暂时无法播放，请点喇叭再试一次');}finish();};
      audioResolve=finish;audio.onended=finish;audio.onerror=failure;audio.play().catch(failure);
    });
  }
}
function wordLabel(w) {
  const index=w.word.toLowerCase().indexOf(w.lower);
  return `${w.word.slice(0,index)}<em>${w.word[index]}</em>${w.word.slice(index+1)}`;
}
function card(w) {
  return `<button class="word-card" data-word="${w.id}" aria-label="听 ${w.letter} 和 ${w.word}" ${dueReview().length&&!prefs.courseProgress.passed[courses[courseIndex()].id]?'disabled':''}><span class="card-top"><span class="letter-pair">${w.letter}<small>${w.lower}</small></span><span class="tiny-sound">${icon('volume-2')}</span></span>${sprite(w)}<span class="word-name">${wordLabel(w)}</span><span class="word-zh">${w.zh}${w.position==='end'?' · 词尾含 '+w.letter:w.position==='middle'?' · 词中含 '+w.letter:''}</span></button>`;
}
function letterPicker(compact=false) {
  return `<div class="alphabet-grid ${compact?'compact':''}" aria-label="选择字母">${lessons.map(l=>{
    const count=l.words.filter(w=>prefs.seen.includes(w.id)).length;
    const locked=!courseAllowed(courses.findIndex(course=>course.letter===l.letter));
    return `<button class="alphabet-key ${l.letter===prefs.selected?'selected':''} ${count===l.words.length?'visited':''} ${locked?'course-locked':''}" ${locked?'disabled':''} data-letter="${l.letter}" aria-label="${locked?'尚未解锁，':''}学习 ${l.letter}，已接触${count}个单词" aria-pressed="${l.letter===prefs.selected}"><strong>${locked?'<span class="letter-lock" aria-hidden="true">🔒</span>':''}${l.letter}<small>${l.lower}</small></strong>${compact?'':`<span class="letter-preview">${sprite(l.words[0])}</span><span class="letter-progress">${count} / ${l.words.length}</span>`}</button>`;
  }).join('')}</div>`;
}
function reviewSummary() {
  const active = review.active(prefs.wordReview).length, due = review.due(prefs.wordReview).length;
  const mastered = Object.values(prefs.wordReview).filter(entry=>entry.stage===5).length;
  return `<section class="review-band"><div><p class="eyebrow">LITTLE MEMORY GARDEN</p><h2>${due?'先复习，再学新课':'把朋友，记得更牢'}</h2><p>${active ? `待巩固 ${active} 个 · 今天可复习 ${due} 个` : '答错的单词会来到这里，陪你慢慢记住。'}${mastered ? ` · 已记牢 ${mastered} 个` : ''}</p></div><button class="primary" id="review-book">${icon('book-open')}我的错题本${active?` · ${active}`:''}</button></section>`;
}
function renderReviewBook() {
  stopAudio(); game=null; view='review';
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.id==='review-book-nav'));
  const now=Date.now(), due=review.due(prefs.wordReview,now), active=review.active(prefs.wordReview);
  const entries=Object.keys(prefs.wordReview).sort((a,b)=>(prefs.wordReview[a].stage===5)-(prefs.wordReview[b].stage===5)||prefs.wordReview[a].nextDue-prefs.wordReview[b].nextDue);
  app.innerHTML=`<section class="review-book"><button class="secondary" id="back">← 回到英语花园</button><p class="eyebrow">MY MEMORY GARDEN</p><h1>我的单词错题本</h1><p>今天可复习 <strong>${due.length}</strong> 个 · 待巩固 ${active.length} 个 · 已记牢 ${entries.length-active.length} 个</p><p class="review-help">${due.length?'完成全部到期复习后，才会开放课程学习。':'今天的到期复习已完成，可以继续学习课程。'}错词会和其他朋友打乱练习。每次最多 5 个目标，每题有两次机会；答错后会在本组末尾再认一次，全部认对才获得星星。</p>${!due.length?'<button class="primary review-continue" id="continue-course">继续课程学习 →</button>':''}${active.length?`<button class="primary" id="review-start">${icon('shuffle')}${due.length?'开始今日复习':'提前巩固一下'}</button>`:'<p class="review-empty">'+(entries.length?'这一批朋友都完成间隔复习啦！继续学习，遇到忘记的词也可以再来。':'这里还没有错词，先去和单词朋友玩一玩吧。')+'</p>'}<details class="review-plan"><summary>怎样才算记牢？</summary><p>先补练认对，再按 1、3、7、14、30 天的间隔复习。到期后第一次就答对，才能点亮下一步；提前练习不推进进度，答错会从头巩固。完成 5 次到期复习标记为“已记牢”，以后答错仍会回到错题本。这是练习进度，不代表一定不会遗忘。</p></details><div class="review-grid">${entries.map(id=>{
    const w=byId.get(id),entry=prefs.wordReview[id],mastered=entry.stage===5;
    const date=new Date(entry.nextDue).toLocaleDateString('zh-CN',{month:'long',day:'numeric'});
    return `<article class="review-card ${mastered?'mastered':''}" data-review-word="${id}"><button data-word="${id}" aria-label="听 ${w.word}">${sprite(w)}<strong>${w.word}</strong><span>${w.zh}</span></button><span class="review-status">${mastered?'✓ 已记牢':review.isDue(entry,now)?'今天可以复习':`${date}再见`}</span><div class="memory-steps" aria-label="完成 ${entry.stage} / 5 次到期复习">${review.intervals.map((days,i)=>`<span class="${i<entry.stage?'done':''}">${days}天</span>`).join('')}</div><small>答错 ${entry.mistakes} 次 · 到期复习 ${entry.stage}/5</small></article>`;
  }).join('')}</div></section>`;
  icons();window.scrollTo(0,0);
}
function activities() {
  return `<div class="activity-list"><button class="activity" data-game="listen">${icon('headphones')}<span><strong>听音找朋友</strong><small>${prefs.selected} · 第 ${wordPage+1} 组</small></span></button><button class="activity" data-game="match">${icon('puzzle')}<span><strong>字母找伙伴</strong><small>大写和小写，一起来配对</small></span></button></div>`;
}
function render() {
  stopAudio(); game=null;
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  const l=lesson();
  if(view==='garden') {
    app.innerHTML=`<section class="garden"><div class="garden-head"><p class="eyebrow">26 LETTERS · ${words.length} LITTLE DISCOVERIES</p><div class="letter-switch"><button class="icon-button" id="prev-letter" aria-label="上一个字母" ${l.index===0?'disabled':''}>${icon('chevron-left')}</button><h1>今天，和 ${l.letter} 做朋友</h1><button class="icon-button" id="next-letter" aria-label="下一个字母" ${l.index===25||!courseAllowed(courses.findIndex(course=>course.letter===lessons[l.index+1]?.letter))?'disabled':''}>${icon('chevron-right')}</button></div><p>${l.letter} 的 10 个朋友，都在等你呀。</p>${courseStatus()}</div><div class="word-pagination"><button class="icon-button" id="prev-page" aria-label="上一组单词" ${wordPage===0?'disabled':''}>${icon('chevron-left')}</button><span>第 ${wordPage+1} 组 <small>· ${wordPage*batchSize+1}–${Math.min((wordPage+1)*batchSize,l.words.length)} / ${l.words.length}</small></span><button class="icon-button" id="next-page" aria-label="下一组单词" ${(wordPage+1)*batchSize>=l.words.length||!courseAllowed(courseIndex()+1)?'disabled':''}>${icon('chevron-right')}</button></div><div class="letter-cards word-batch">${batchWords().map(card).join('')}</div><div class="start-wrap"><button class="primary" id="start">${icon('play')}开始玩 ${l.letter}</button><span class="path-info">课程顺序：A 第 1 组 → A 第 2 组 → B 第 1 组…</span></div></section><section class="alphabet-band"><div class="section-heading"><h2>今天想认识谁？</h2><span>已接触 ${prefs.seen.length} / ${words.length} 个单词</span></div>${letterPicker(true)}</section><section class="activity-band"><div class="section-heading"><h2>选一个，玩一玩</h2><span>${l.letter} 的小小冒险</span></div>${activities()}</section>`;
    app.querySelector('.alphabet-band').insertAdjacentHTML('beforebegin',reviewSummary());
  } else {
    app.innerHTML=`<section class="lesson"><p class="eyebrow" style="text-align:center">THE ALPHABET HOUSE</p><h1 class="lesson-title">26 个字母，${words.length} 个朋友</h1><p class="lesson-note">按 A 到 Z 顺序学习，每组通关后解锁下一组</p>${letterPicker()}</section>`;
  }
  icons(); window.scrollTo(0,0);
}
function selectLetter(letter) {
  const index=courses.findIndex(course=>course.letter===letter);if(index<0)return;
  moveToCourse(index);
  if(prefs.selected===letter&&view==='garden')speak(letter);
}
function changePage(delta) {
  const page=wordPage+delta;
  if(page<0||page>=Math.ceil(lesson().words.length/batchSize))return;
  moveToCourse(courseIndex()+delta);
}

function nearbyLessons() { return lessons.slice(Math.min(lesson().index,23),Math.min(lesson().index,23)+3); }
function startGame(kind,journey=false,reviewMode=false) {
  if(!['listen','match'].includes(kind))return;
  if(!reviewMode&&(requireReview()||!courseAllowed(courseIndex())))return;
  stopAudio();view=kind;
  let pool=kind==='match'?nearbyLessons().map(l=>l.words[0]):batchWords();
  if(reviewMode){
    const due=review.due(prefs.wordReview), active=review.active(prefs.wordReview);
    const candidates=due.length?due:active;
    if(!candidates.length){renderReviewBook();return;}
    const chosen=shuffle(candidates).slice(0,3).map(id=>byId.get(id));
    const selectedIds=new Set(chosen.map(w=>w.id));
    const familiar=words.filter(w=>prefs.seen.includes(w.id)||courses.slice(0,curriculum.current(prefs.courseProgress,courses)+1).some(course=>course.wordIds.includes(w.id)));
    const fillers=shuffle(familiar.filter(w=>!selectedIds.has(w.id)&&!active.includes(w.id))).slice(0,batchSize-chosen.length);
    pool=[...chosen,...fillers];
    // Even when every word is in the notebook, mix in other distinct words.
    if(pool.length<batchSize)pool.push(...shuffle(familiar.filter(w=>!pool.some(p=>p.id===w.id))).slice(0,batchSize-pool.length));
  }
  const targets=shuffle(pool);
  game={kind,journey,reviewMode,courseIndex:courseIndex(),letter:reviewMode?'复习':prefs.selected,pool,page:wordPage,round:0,total:targets.length,targets,pass:0,retries:new Map(),failed:new Set(),solved:new Set(),finished:false,locked:false,selected:null,firstTry:true};
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.game===kind));
  drawRound();
}
function targetAudio() { return game.kind==='match'?game.target.letter:game.target.id; }
function drawRound() {
  if(!game)return;
  if(game.round>=game.total){
    if(game.retries.size){
      game.targets=shuffle([...game.retries.values()]);game.retries.clear();
      game.round=0;game.total=game.targets.length;game.pass++;
    }else{complete();return;}
  }
  Object.assign(game,{locked:false,selected:null,firstTry:true,attempts:0,audioFailed:false});
  const target=game.targets[game.round];game.target=target;
  game.options=shuffle([target,...shuffle((game.reviewMode?words:game.pool).filter(w=>w.id!==target.id&&(game.kind==='match'||w.zh!==target.zh))).slice(0,Number(prefs.difficulty)-1)]);
  const match=game.kind==='match';
  app.innerHTML=`<section class="game"><div class="game-top"><button class="icon-button" id="back" aria-label="回到花园">${icon('arrow-left')}</button><div class="progress-dots" aria-label="第${game.round+1}题，共${game.total}题">${Array.from({length:game.total},(_,i)=>`<span class="${i<game.round?'done':''}"></span>`).join('')}</div><span class="eyebrow" style="margin:0">${game.letter} · ${game.round+1} / ${game.total}</span></div><p class="attempt-note" id="attempt-note">${game.pass?`再认一次 · 第 ${game.pass} 轮 · `:''}每题两次机会 · 还可以选 2 次</p><div class="game-head"><h1 class="game-title">${match?'谁是它的小写伙伴？':'你听见了哪个朋友？'}</h1>${match?`<div class="question-word">${target.letter}</div>`:''}<button class="prompt-button" id="repeat" aria-label="再听一次">${icon('volume-2')}</button><p id="sound-caption" class="sound-caption" hidden></p></div><div class="game-options ${game.options.length===2?'two':''}">${game.options.map(w=>`<button class="option" data-choice="${w.id}" aria-label="${match?w.lower:w.zh}">${match?`<span class="match-letter">${w.lower}</span>`:sprite(w)}</button>`).join('')}</div><div class="feedback" role="status"></div><div class="game-controls"></div></section>`;
  icons();window.scrollTo(0,0);
  speak(...(prefs.hints?[match?'hint-match':'hint-listen']:[]),targetAudio());

}
function feedback(text) {
  const el=document.querySelector('.feedback');if(el)el.textContent=text;
  document.querySelector('#announcement').textContent=text;
}
function lockOptions() { document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true); }
function advanceRound(current, round, pass) {
  if(game!==current||game.round!==round||game.pass!==pass||!game.locked||game.finished)return;
  game.round++;drawRound();
}
async function answer(id) {
  if(!game||game.locked||game.finished||!game.options.some(w=>w.id===id))return;
  if(!game.reviewMode&&dueReview().some(id=>!game.failed.has(id))){requireReview();return;}
  const current=game, round=game.round, pass=game.pass;
  const button=document.querySelector(`[data-choice="${id}"]`);
  game.attempts++;
  if(id!==game.target.id) {
    game.firstTry=false;game.failed.add(game.target.id);game.retries.set(game.target.id,game.target);
    if(game.kind==='listen'){review.mistake(prefs.wordReview,game.target.id);save();}
    button?.classList.add('retry');setTimeout(()=>button?.classList.remove('retry'),350);
    const note=document.querySelector('#attempt-note');
    if(game.attempts<2){
      if(note)note.textContent='还可以选 1 次 · 这个朋友稍后会再来';
      feedback('再听一遍，还有一次机会。');speak('try-again',targetAudio());return;
    }
    game.locked=true;lockOptions();
    document.querySelector(`[data-choice="${game.target.id}"]`)?.classList.add('correct');
    if(note)note.textContent='两次机会用完了 · 先认识它，稍后再来';
    feedback(game.kind==='match'?`这是 ${game.target.letter} 的小写 ${game.target.lower}，稍后再认一次。`:`这是 ${game.target.word} · ${game.target.zh}，稍后再认一次。`);
    await speak(targetAudio());
    if(game===current&&game.round===round&&game.pass===pass)advanceRound(current,round,pass);
    return;
  }
  game.locked=true;button?.classList.add('correct');
  const scoreKey=game.kind==='match'?`letter-${game.target.letter}`:id;
  if(game.firstTry)prefs.correct[scoreKey]=(prefs.correct[scoreKey]||0)+1;
  game.solved.add(id);
  if(game.kind!=='match')markSeen(game.target);else save();
  feedback((game.kind==='match'?`找到伙伴啦！${game.target.letter} 和 ${game.target.lower}`:`找到了！${game.target.word} · ${game.target.zh}`)+(game.firstTry?'':'，稍后再认一次。'));
  lockOptions();
  const note=document.querySelector('#attempt-note');if(note)note.textContent=game.firstTry?'认对啦！': '认对啦，稍后再认一次。';
  await speak('great');
  if(game===current&&game.round===round&&game.pass===pass)advanceRound(current,round,pass);
}

function complete() {
  if(!game||game.finished||game.retries.size||game.round<game.total||game.pool.some(w=>!game.solved.has(w.id)))return;
  game.finished=true;
  if(game.kind==='listen'){
    review.settle(prefs.wordReview,game.solved,game.failed);
    if(!game.reviewMode)curriculum.pass(prefs.courseProgress,courses,game.courseIndex);
  }
  stopAudio();prefs.rounds++;
  const key=`${game.letter}-${game.kind}`;prefs.completed[key]=(prefs.completed[key]||0)+1;
  save();
  const reward=globalThis.GardenRewards?.award('english',`${game.letter}-${game.kind}-${wordPage}`,`english-${Date.now()}-${Math.random()}`);
  const rewardText=reward?.error|| (reward?.amount ? `⭐ 获得 ${reward.amount} 颗星星！${reward.bonusAmount?' 四科打卡完成，额外 +5 颗星星！':''}` : '这一关的星星已经记好啦。');
  app.innerHTML=`<section class="game completion"><div class="reward">${icon('star')}</div><p class="eyebrow">A LITTLE MOMENT TO SHINE</p><h1>${game.reviewMode?'单词复习':game.letter+' 的小冒险'}，完成啦！</h1><p>${game.failed.size?'刚才答错的朋友，也都重新认对啦！':'每个朋友都认对啦！'}${game.kind==='listen'&&game.failed.size?' 错词已安排间隔复习。':''}</p><p class="reward-note">${rewardText}${reward?.rest?' 你已经探索了好几轮，去喝口水、看看远处吧。':''}</p><a class="reward-entry" href="../../rewards.html">🌱 布置我的花园</a><div class="reward-row">${game.kind==='match'?game.pool.map(w=>`<span class="reward-letter">${w.letter}${w.lower}</span>`).join(''):game.pool.map(w=>`<div class="word-reward">${sprite(w)}<strong>${w.word}</strong></div>`).join('')}</div><div class="completion-actions"><button class="primary" id="next-round">${icon('play')}${game.reviewMode?(dueReview().length?'继续今日复习':'继续课程学习'):'下一关'}</button>${game.kind==='listen'?'<button class="secondary" id="review-book">查看错题本</button>':''}<button class="secondary" id="rest">休息一下</button></div></section>`;
  icons();if(reward?.amount===1)speak(...(reward.bonusAmount?['star-earned','daily-checkin-bonus']:['star-earned']));else speak('finish');
}
function showModal(html) {stopAudio();document.querySelector('#modal-content').innerHTML=html;modal.showModal();icons();}
function parentSettings() {
  document.querySelector('#modal-content').innerHTML=`<h2>家长设置</h2><div class="settings-row"><label for="voice-setting">播放声音</label><input id="voice-setting" type="checkbox" ${prefs.sound?'checked':''}></div><div class="settings-row"><label for="hint-setting">中文语音提示</label><input id="hint-setting" type="checkbox" ${prefs.hints?'checked':''}></div><div class="settings-row"><label for="difficulty">每题选项</label><select id="difficulty"><option value="2" ${prefs.difficulty==2?'selected':''}>2 个</option><option value="3" ${prefs.difficulty==3?'selected':''}>3 个</option></select></div><div class="stats"><div><strong>${prefs.seen.length}</strong><span>已接触 / ${words.length} 词</span></div><div><strong>${Object.values(prefs.correct).reduce((a,b)=>a+b,0)}</strong><span>首次独立答对</span></div><div><strong>${prefs.rounds}</strong><span>完成的游戏</span></div></div><p class="settings-note">每个字母 10 个词，共 ${words.length} 个，分成两组练习。字母录音读名称，不是自然拼读教学。同一字母在不同词中可以发不同的音。X 组包含词中或词尾含 X 的词，均有单独标记。课程按 A 第 1 组、A 第 2 组、B 第 1 组依次解锁。听音找图整组通关后解锁下一课，字母配对是辅助练习。每天先完成全部到期复习，再进入课程。每题最多选两次，错词需在本组末尾补练到首次答对，才发放星星。错题本按 1、3、7、14、30 天安排到期复习；复习词会混入其他单词。记录只保存在当前浏览器。</p><button class="secondary" id="reset">重置学习记录</button>`;icons();
}
function updateSound() {
  document.querySelector('#sound').innerHTML=icon(prefs.sound?'volume-2':'volume-x');
  document.querySelector('#sound').setAttribute('aria-label',prefs.sound?'关闭声音':'开启声音');
  updateCaption();icons();save();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.word){const w=byId.get(b.dataset.word);if(w){if(view!=='review'&&dueReview().length&&!prefs.courseProgress.passed[courses[courseIndex()].id]){requireReview();return;}markSeen(w);speak(w.letter,w.id);}return;}
  if(b.dataset.letter){selectLetter(b.dataset.letter);return;}
  if(b.dataset.view){view=b.dataset.view;render();return;}
  if(b.dataset.game){startGame(b.dataset.game);return;}
  if(b.dataset.choice){
    answer(b.dataset.choice);
    return;
  }
  switch(b.id){
    case 'home':case 'back':case 'rest':view='garden';render();break;
    case 'prev-letter':selectLetter(lessons[lesson().index-1]?.letter);break;
    case 'next-letter':selectLetter(lessons[lesson().index+1]?.letter);break;
    case 'prev-page':changePage(-1);break;
    case 'next-page':case 'next-batch':changePage(1);break;
    case 'continue-course':continueCourse();break;
    case 'review-book':case 'review-book-nav':renderReviewBook();break;
    case 'review-start':startGame('listen',false,true);break;
    case 'start':startGame('listen',true);break;
    case 'repeat':if(game){game.audioFailed=false;speak(targetAudio());}break;
    case 'next-round':{
      if(!game||!game.finished)break;
      if(game.reviewMode){if(dueReview().length)startGame('listen',false,true);else continueCourse();break;}
      const kind=game.kind, journey=game.journey, next=journey?({listen:'match'})[kind]:null;
      if(next){startGame(next,true);break;}
      if(requireReview())break;
      const nextIndex=game.courseIndex+1;
      if(journey||kind==='listen'){
        if(nextIndex>=courses.length){view='garden';render();notice('52 课都通过啦！可以重练课程或去错题本巩固。');break;}
        if(!courseAllowed(nextIndex)){notice('先完成当前课程，就能解锁下一课。');break;}
        prefs.selected=courses[nextIndex].letter;wordPage=courses[nextIndex].page;save();
      }
      startGame(journey?'listen':kind,journey);break;
    }
    case 'sound':prefs.sound=!prefs.sound;stopAudio();updateSound();if(prefs.sound)speak(game?.target?targetAudio():'hello');break;
    case 'parent':showModal(`<h2>请家长来帮忙</h2><p>算一算，再进入设置。</p><form id="gate-form"><label class="gate">12 + 9 = <input id="gate-answer" type="number" inputmode="numeric" aria-label="计算结果" required></label><button class="primary" type="submit">进入设置</button><p class="modal-error" role="status"></p></form>`);break;
    case 'close-modal':modal.close();break;
    case 'reset':document.querySelector('#modal-content').innerHTML='<h2>重新开始？</h2><p>这会清除当前浏览器的英语学习记录，农场星星余额不会清除。</p><button class="secondary" id="cancel-reset">保留记录</button> <button class="primary" id="confirm-reset">确认重置</button>';break;
    case 'cancel-reset':parentSettings();break;
    case 'confirm-reset':prefs={...initial(),sound:prefs.sound,hints:prefs.hints,difficulty:prefs.difficulty};prefs.courseProgress=curriculum.normalize(null,courses,prefs);wordPage=0;save();try{localStorage.removeItem('abc-garden-v1');}catch{}game=null;view='garden';render();parentSettings();break;
  }
});
document.addEventListener('submit',e=>{if(e.target.id==='gate-form'){e.preventDefault();if(document.querySelector('#gate-answer').value==='21')parentSettings();else document.querySelector('.modal-error').textContent='请再算一次。';}});
document.addEventListener('change',e=>{
  if(e.target.id==='voice-setting'){prefs.sound=e.target.checked;stopAudio();updateSound();}
  if(e.target.id==='hint-setting')prefs.hints=e.target.checked;
  if(e.target.id==='difficulty')prefs.difficulty=Number(e.target.value);
  save();
});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
save();if(dueReview().length)renderReviewBook();else render();updateSound();
