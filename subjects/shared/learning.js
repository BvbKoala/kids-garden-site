(() => {
const subject=document.body.dataset.subject;
const names={literacy:'识字课堂',math:'数学课堂',knowledge:'常识课堂'};
const root=document.querySelector('#learning');
const KEY='learning-garden-study-v1';
const book=GardenMistakeBook.open(localStorage,subject);let afterNotebook=null;
const defaults=()=>({version:1,sound:true,options:3,range:10,carry:false,completed:{},seen:[]});
let prefs=defaults(),storageError='',round=null,audio=null,speechToken=0,cancelAudio=null;
try {const raw=localStorage.getItem(KEY);if(raw){const data=JSON.parse(raw);if(data.version!==1||!data.completed||typeof data.completed!=='object'||Array.isArray(data.completed)||!Object.values(data.completed).every(n=>Number.isSafeInteger(n)&&n>=0)||!Array.isArray(data.seen))throw Error();prefs={...prefs,...data};}}
catch {storageError='学习记录暂时无法读取。请家长先备份记录，再检查浏览器。';}
if(![10,20,100,1000].includes(prefs.range))prefs.range=10;
if(![2,3].includes(prefs.options))prefs.options=3;
const topics=subject==='literacy'?GardenContent.literacyGroups:subject==='knowledge'?GardenContent.knowledgeGroups:[{id:'count',name:'数一数',symbol:'🍎'},{id:'compare',name:'比一比',symbol:'⚖️'},{id:'shape',name:'找形状',symbol:'🔺'},{id:'add',name:'加一加',symbol:'➕'},{id:'subtract',name:'减一减',symbol:'➖'},{id:'mixed',name:'加减小冒险',symbol:'🌈'}];
const courses=topics.flatMap(topic=>Array.from({length:subject==='knowledge'?Math.ceil(topic.questions.length/5):1},(_,part)=>({id:`${subject}:${topic.id}:${part}`,topic:topic.id,part,name:topic.name})));
const previousOrders=prefs.courseOrders&&typeof prefs.courseOrders==='object'&&!Array.isArray(prefs.courseOrders)?prefs.courseOrders:{};
// Old knowledge rounds chose random questions: retain their counts without inventing fixed five-question course passes.
const legacy=subject==='knowledge'?[]:courses.filter(course=>prefs.completed[`${subject}:${course.topic}`]>0).map(course=>course.id);
const order=GardenCourseOrder.open(courses.map(course=>course.id),previousOrders[subject],legacy);
prefs.courseOrders={...previousOrders,[subject]:order.state};
function courseFor(topic,id){return id?courses.find(course=>course.id===id&&course.topic===topic):courses.find(course=>course.topic===topic&&!order.done(course.id))||courses.find(course=>course.topic===topic);}
const headerContinue=document.createElement('button');headerContinue.id='header-continue';headerContinue.className='header-continue';headerContinue.textContent='▶ 继续课程';document.querySelector('.subject-header').append(headerContinue);headerContinue.onclick=()=>{if(round&&!round.finished){root.scrollIntoView({block:'start'});return;}const c=courses.find(c=>c.id===order.current());start(c.topic,[],c.id);};
function blocked(){status('先完成前一课，就能解锁这一课。');speak(['g-locked']);}
function showCourses(topic){
 if(subject!=='knowledge')return start(topic);
 const list=courses.filter(course=>course.topic===topic);if(!list.length||!order.allowed(list[0].id))return blocked();
 home();root.querySelector('.topic-list').insertAdjacentHTML('afterend',`<section class="ordered-lessons"><h2>${list[0].name} · 一课一课来</h2><p>每课 5 题，全部答对后解锁下一课。</p><div class="course-grid">${list.map(course=>`<button class="course-tile" data-course="${course.id}" ${order.allowed(course.id)?'':'disabled'}><strong>${order.allowed(course.id)?'🌱':'🔒'} 第 ${course.part+1} 课</strong><small>第 ${course.part*5+1}–${Math.min((course.part+1)*5,topics.find(t=>t.id===topic).questions.length)} 题 · ${order.done(course.id)?'已通过':order.allowed(course.id)?'可以学习':'尚未解锁'}</small></button>`).join('')}</div></section>`);
 root.querySelectorAll('[data-course]').forEach(button=>button.onclick=()=>start(topic,[],button.dataset.course));guideButton('home-guide-courses',['g-knowledge-courses']);
}
function save(){if(storageError)return false;try{localStorage.setItem(KEY,JSON.stringify(prefs));return true;}catch{storageError='学习记录没有保存成功。请家长检查浏览器存储空间。';return false;}}
const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function stopSound(){root.querySelectorAll('.being-read').forEach(n=>n.classList.remove('being-read'));speechToken++;if(audio){audio.pause();audio=null;}if(cancelAudio){cancelAudio();cancelAudio=null;}}
function numberClips(n){
 if(n<=10)return ['n-'+n];if(n===1000)return ['n-1','thousand'];
 const a=[];if(n>=100){a.push('n-'+Math.floor(n/100),'hundred');n%=100;if(n>0&&n<10)a.push('n-0');}
 if(n>=10){const tens=Math.floor(n/10);if(tens>1||a.length)a.push('n-'+tens);a.push('n-10');n%=10;}
 if(n)a.push('n-'+n);return a;
}
function clipForQ(q){if(q.a!==undefined&&q.sign)return [...numberClips(q.a),q.sign==='+'?'plus':'minus',...numberClips(q.b),'equals-question'];return [q.audio];}
async function speak(ids,onStart=()=>{}){
 stopSound();const error=root.querySelector('#audio-error');if(error)error.textContent='';if(!prefs.sound||document.hidden)return;window.dispatchEvent(new CustomEvent('garden-audio-start',{detail:'shared-study'}));
 const token=speechToken,list=ids.filter(Boolean),prepared=globalThis.GardenSpeechJoin?.prepare(list.map(id=>`../shared/audio/${id}.mp3`));
 for(const [index,id] of list.entries()){
   if(token!==speechToken||document.hidden)return;onStart(id);
   const clip=prepared?.get(index)||new Audio(`../shared/audio/${id}.mp3`);audio=clip;
   const ok=await new Promise(resolve=>{let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timeout);clip.onended=clip.onerror=null;if(cancelAudio===cancel)cancelAudio=null;resolve(value);};const cancel=()=>finish(true);cancelAudio=cancel;const timeout=setTimeout(()=>{clip.pause();finish(false);},60000);clip.onended=()=>finish(true);clip.onerror=()=>finish(false);clip.play().catch(()=>finish(false));});
   if(token!==speechToken)return;
   if(!ok){const el=document.querySelector('#audio-error');if(el)el.textContent='声音暂时没播放出来，可以再点一次喇叭。';return;}
 }
 if(token===speechToken){audio=null;root.querySelectorAll('.being-read').forEach(n=>n.classList.remove('being-read'));}
}
function guideButton(id,clips,auto=true){root.insertAdjacentHTML('afterbegin',`<button class="voice-guide" id="${id}">🔊 听听怎么玩</button>`);root.querySelector('#'+id).onclick=()=>speak(clips);if(auto)speak(clips);}
function status(text){document.querySelector('#status').textContent=text;}
function home(){
 stopSound();round=null;document.title=`${names[subject]} · 儿童学习乐园`;

 root.innerHTML=`<div class="intro"><p class="muted">小小发现，大大开心</p><h1>${names[subject]}</h1><p class="course-overview">已通过 ${Object.keys(order.state.passed).length} / ${courses.length} 课 · 前一课通关后解锁下一课</p><button class="primary" id="continue-course">${order.frontier()===courses.length?'重练已通过课程':'继续第 '+(order.frontier()+1)+' 课'}</button><p>${subject==='literacy'?'先点图片听一听，再找汉字朋友。':subject==='math'?'数一数，想一想。一次只玩五小题。':'听一个生活小问题，找个好办法。'}</p></div>${storageError?`<p class="storage-notice">${storageError}</p>`:''}<div class="topic-list">${topics.map(t=>`<button class="topic ${order.allowed(courses.find(course=>course.topic===t.id).id)?'':'course-locked'}" data-topic="${t.id}" ${order.allowed(courses.find(course=>course.topic===t.id).id)?'':'disabled'}><span class="symbol" aria-hidden="true">${t.symbol}</span>${t.name}<small>${!order.allowed(courses.find(course=>course.topic===t.id).id)?'🔒 尚未解锁 · ':''}${prefs.completed[subject+':'+t.id]?'已完成 '+prefs.completed[subject+':'+t.id]+' 轮':'去发现'}${subject==='knowledge'?' · '+t.questions.length+' 道题':''}${subject==='math'&&['add','subtract','mixed'].includes(t.id)?' · '+prefs.range+' 以内':''}</small></button>`).join('')}</div><details class="settings"><summary>家长 · 学习设置</summary><p>建议陪孩子一起探索，每次 3–5 分钟，从容易的内容开始。每完成 3 轮会提示休息。</p><label>播放声音<input id="sound-setting" type="checkbox" ${prefs.sound?'checked':''}></label><label>每题选项<select id="option-setting"><option value="2" ${prefs.options===2?'selected':''}>2 个</option><option value="3" ${prefs.options===3?'selected':''}>3 个</option></select></label>${subject==='math'?`<label>加减法范围<select id="range-setting">${[10,20,100,1000].map(n=>`<option value="${n}" ${prefs.range===n?'selected':''}>${n} 以内</option>`).join('')}</select></label><label>进位、退位练习<input id="carry-setting" type="checkbox" ${prefs.carry?'checked':''}></label><p>10 以内配实物图；更大数显示百、十、个位分解。1000 以内是可选拓展，由家长按孩子情况选择。进位、退位从 20 以内开始。</p>`:''}<p>不计时、不扣分；每轮目标不重复，答对后自动前进。学习记录只留在本浏览器。</p><a href="../../records.html">查看与备份记录</a></details>`;
 root.querySelector('.intro').insertAdjacentHTML('beforeend',`<button id="mistake-book">📖 我的错题本 · ${book.items().length}</button><p class="course-overview">继续学习前先练错题，复习按 1、3、7、14、30 天巩固。</p>`);root.querySelector('#mistake-book').onclick=()=>{afterNotebook=null;showNotebook();};
 root.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>subject==='literacy'?learnWords(b.dataset.topic):subject==='knowledge'?showCourses(b.dataset.topic):start(b.dataset.topic));
 root.querySelector('#continue-course').onclick=()=>{const course=courses.find(c=>c.id===order.current());subject==='literacy'?learnWords(course.topic):start(course.topic,[],course.id);};
 root.querySelector('#sound-setting').onchange=e=>{prefs.sound=e.target.checked;stopSound();save();};
 root.querySelector('#option-setting').onchange=e=>{prefs.options=Number(e.target.value);save();};
 if(subject==='knowledge')guideButton('home-guide',['g-knowledge-home']);
 if(subject==='math'){root.querySelector('#range-setting').onchange=e=>{prefs.range=Number(e.target.value);save();home();root.querySelector('.settings').open=true;};root.querySelector('#carry-setting').onchange=e=>{prefs.carry=e.target.checked;save();};}
}
function learnWords(topic){
 const course=courseFor(topic);if(!course||!order.allowed(course.id))return blocked();
 const group=GardenContent.literacyGroups.find(g=>g.id===topic);if(!group)return;stopSound();round=null;
 root.innerHTML=`<button id="back">← 返回</button><div class="intro"><h1>${group.name}</h1><p>点一下，听汉字朋友的名字。</p></div><div class="study-cards">${group.words.map(([char,name,symbol],i)=>`<button class="study-card" data-word="${i}" aria-label="听 ${char}，${name}"><span aria-hidden="true">${symbol}</span><strong>${char}</strong><small>${name} 🔊</small></button>`).join('')}</div><div class="intro"><button class="primary" id="start">找一找汉字朋友</button><p id="audio-error" class="audio-error" role="status"></p></div>`;
 root.querySelector('#back').onclick=home;root.querySelector('#start').onclick=()=>start(topic);
 root.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{const id=`literacy-${topic}-${b.dataset.word}`;if(!prefs.seen.includes(id)){prefs.seen.push(id);save();}speak([id]);});
}
function makePool(topic){
 if(subject==='math')return GardenMath.questions(topic,prefs).map(q=>({...q,audio:q.id.startsWith('count')?'count-question':q.id.startsWith('compare')?'compare-question':'shape-question'}));
 if(subject==='literacy'){
 const group=GardenContent.literacyGroups.find(g=>g.id===topic);
 return group.words.map(([char,name,symbol],i)=>({id:`literacy-${topic}-${i}`,prompt:'听一听，哪个字是它的朋友？',speech:`${name}的${char}，在哪儿？`,symbol,answer:char,options:group.words.map(w=>w[0]),audio:`find-${topic}-${i}`,explanation:`${char} · ${name}`}));
 }
 return GardenContent.knowledgeGroups.find(g=>g.id===topic).questions.map(([prompt,options,correct,symbol,explanation],i)=>({id:`knowledge-${topic}-${i}`,prompt,options,answer:options[correct],symbol,explanation,audio:`question-${topic}-${i}`,explanationAudio:`explain-${topic}-${i}`,optionAudio:options.map((_,j)=>`option-${topic}-${i}-${j}`)}));
}
function start(topic,previous=[],courseId,bypassBook=false){
 const course=courseFor(topic,courseId);if(!course||!order.allowed(course.id))return blocked();
 if(book.blocked){status(book.error);speak(['g-save-error']);return;}
 if((!bypassBook&&book.items().length)||(bypassBook&&book.items().some(item=>GardenWordReview.isDue(item)))){afterNotebook=()=>start(topic,previous,courseId,true);return startNotebook();}
 stopSound();const source=makePool(topic),pool=shuffle(subject==='knowledge'?source.slice(course.part*5,course.part*5+5):source),old=new Set(previous.map(q=>q.id));
 const questions=[...pool.filter(q=>!old.has(q.id)),...pool.filter(q=>old.has(q.id))].slice(0,5);
 if(!questions.length)return;
 round={topic,course:course.id,questions,allQuestions:[...questions],failed:new Set(),pending:new Set(),attempts:0,index:0,locked:false,id:`${subject}-${Date.now()}-${Math.random()}`};draw();
}

function quantity(n){return `<div class="count-picture" aria-label="${n} 个苹果">${Array.from({length:n},()=>'<span aria-hidden="true">🍎</span>').join('')}</div>`;}
function decomposition(n){return `<div>${n}<br>${Math.floor(n/1000)?Math.floor(n/1000)+' 千 · ':''}${Math.floor(n%1000/100)} 百 · ${Math.floor(n%100/10)} 十 · ${n%10} 个</div>`;}
function picture(q){
 if(q.count)return quantity(q.count);
 if(q.visual==='compare')return `<div class="compare"><div><p>左边</p>${quantity(q.a)}</div><div><p>右边</p>${quantity(q.b)}</div></div>`;
 if(q.visual==='quantity')return `<div class="compare"><div><p>${q.a}</p>${quantity(q.a)}</div><div><p>${q.sign==='+'?'再添':'拿走'} ${q.b}</p>${quantity(q.b)}</div></div>`;
 if(q.visual==='place')return `<div class="place-blocks">${decomposition(q.a)}<span>${q.sign}</span>${decomposition(q.b)}</div><p class="sound-hint">百、十、个，一起想一想。</p>`;
 return `<div class="picture" aria-hidden="true">${q.symbol||''}</div>`;
}
function draw(){
 if(!round)return;if(round.index===round.questions.length){if(round.pending.size){round.questions=shuffle(round.allQuestions.filter(q=>round.pending.has(q.id)));round.pending.clear();round.index=0;}else{finish();return;}}
 stopSound();round.locked=false;round.attempts=0;const q=round.questions[round.index];
 const distractors=shuffle(q.options.filter(o=>o!==q.answer)).slice(0,prefs.options-1);round.options=shuffle([q.answer,...distractors]);
 root.innerHTML=`<div class="game-head"><button id="leave">← 返回</button><div class="round-progress" aria-label="第 ${round.index+1} 题，共 ${round.questions.length} 题">${round.questions.map((_,i)=>`<span class="${i<round.index?'done':''}"></span>`).join('')}</div><span>${round.index+1} / ${round.questions.length}</span></div><section class="question"><h1>${q.prompt}</h1>${round.notebook?'<p class="notebook-label">📖 错题优先复习 · 复习不解锁新课</p>':''}${picture(q)}<button id="repeat" aria-label="再听一次">🔊 再听一次</button><p class="sound-hint">${subject==='knowledge'||q.id.startsWith('shape')||q.id.startsWith('compare')?'喇叭会读出问题和每个选项。':'点选一个朋友。'}</p><p id="audio-error" class="audio-error" role="status"></p></section><div class="options ${subject==='knowledge'?'words':''}">${round.options.map((o,i)=>`${subject==='knowledge'?'<div class="spoken-option">':''}<button class="option ${subject==='knowledge'||q.id.startsWith('shape')||q.id.startsWith('compare')?'text':''}" data-choice="${i}">${subject==='knowledge'||q.id.startsWith('shape')||q.id.startsWith('compare')?`<small>${i+1} · </small>`:''}${o}</button>${subject==='knowledge'?`<button class="option-speaker" data-listen-option="${i}" aria-label="听第${i+1}个答案">🔊</button></div>`:''}`).join('')}</div><p class="feedback" role="status"></p>`;
 root.querySelector('#leave').onclick=home;
 const promptClips=()=>{const clips=clipForQ(q);if(subject==='knowledge')for(const [i,o] of round.options.entries())clips.push('choice-'+(i+1),q.optionAudio[q.options.indexOf(o)]);else if(q.id.startsWith('shape')||q.id.startsWith('compare'))for(const [i,o] of round.options.entries())clips.push('choice-'+(i+1),({圆形:'circle',正方形:'square',三角形:'triangle',长方形:'rectangle',椭圆形:'oval',左边:'left',右边:'right'})[o]);return clips;};
 const narrate=(guide=false)=>speak([...(guide&&subject==='knowledge'?[round.notebook?'g-knowledge-review':'g-knowledge-question']:[]),...promptClips()],id=>{root.querySelectorAll('[data-choice]').forEach((b,i)=>b.classList.toggle('being-read',id===q.optionAudio?.[q.options.indexOf(round.options[i])]));});
 root.querySelector('#repeat').onclick=()=>{if(!round.locked)narrate();};
 if(subject==='knowledge'){root.querySelector('.question').insertAdjacentHTML('beforeend','<button class="voice-guide" id="game-guide">🔊 怎么玩</button>');root.querySelector('#game-guide').onclick=()=>{if(!round.locked)narrate(true);};root.querySelectorAll('[data-listen-option]').forEach(b=>b.onclick=()=>{if(!round.locked){const i=Number(b.dataset.listenOption);speak(['choice-'+(i+1),q.optionAudio[q.options.indexOf(round.options[i])]]);}});}
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.choice)));
 narrate(!round.guided);round.guided=true;status(`第 ${round.index+1} 题，${q.prompt}`);
}
async function answer(index){
 if(!round||round.locked)return;const current=round,q=current.questions[current.index];
 const feedback=root.querySelector('.feedback');
 if(current.options[index]!==q.answer){current.failed.add(q.id);current.pending.add(q.id);current.attempts++;book.miss(q.id,q);feedback.textContent='没关系，再听听、想一想。'+(book.error||'');status(feedback.textContent);
 if(current.attempts<2){speak(['retry',...clipForQ(q),...(subject==='knowledge'?current.options.flatMap((o,i)=>['choice-'+(i+1),q.optionAudio[q.options.indexOf(o)]]):[])]);return;}current.locked=true;root.querySelectorAll('[data-choice],[data-listen-option],#repeat,#game-guide').forEach(b=>b.disabled=true);feedback.textContent='先学一学：'+q.answer+'。稍后还会再考。';await speak(q.explanationAudio?['g-knowledge-teach',q.optionAudio[q.options.indexOf(q.answer)],q.explanationAudio]:subject==='math'&&/^\d+$/.test(String(q.answer))?numberClips(Number(q.answer)):[({圆形:'circle',正方形:'square',三角形:'triangle',长方形:'rectangle',椭圆形:'oval',左边:'left',右边:'right'})[q.answer]||q.audio]);if(round===current){current.index++;draw();}return;}
 if(current.attempts)current.pending.add(q.id);
 current.locked=true;root.querySelectorAll('[data-choice],[data-listen-option],#repeat,#game-guide').forEach(b=>{b.disabled=true;if(b.matches('[data-choice]')&&Number(b.dataset.choice)===index)b.classList.add('correct');});feedback.textContent=q.explanation;status(q.explanation);
 await speak(q.explanationAudio?['great',q.explanationAudio]:['great']);
 if(round!==current||!current.locked)return;current.index++;draw();
}
function finish(){
 const current=round;if(!current||current.finished||current.index!==current.questions.length||!current.questions.length)return;current.finished=true;stopSound();
 if(!book.settle(current.allQuestions.map(q=>q.id),[...current.failed])){current.finished=false;status(book.error);root.innerHTML='<p role="status">'+book.error+'</p><button id="retry-notebook-save">重试保存</button>';root.querySelector('#retry-notebook-save').onclick=finish;speak(['g-save-error']);return;}
 const key=subject+':'+current.topic;if(!current.notebook){prefs.completed[key]=(prefs.completed[key]||0)+1;order.pass(current.course);save();}
 const topic=subject==='math'&&['add','subtract','mixed'].includes(current.topic)?`${current.topic}-${prefs.range}-${prefs.carry?'carry':'base'}`:current.topic;
 const reward=GardenRewards.award(subject,current.notebook?'mistake-review':topic,current.id);
 root.innerHTML=`<section class="finish"><div class="symbol" aria-hidden="true">🌟</div><h1>小冒险，完成啦！</h1><p>你认真完成了这一关，又有了新发现！</p><p class="feedback">${reward.error||storageError||(reward.amount?`⭐ 获得 ${reward.amount} 颗星星${reward.bonusAmount?' · 五科打卡完成，额外 +5 颗！':''}`:'这一关的星星已经记好啦。')}</p>${reward.rest?'<div class="rest-panel"><h2>让小眼睛休息一下</h2><p>离开屏幕，喝口水，看看远处。花园会等你回来。</p></div>':''}<div class="finish-actions"><a class="reward-link" href="../../rewards.html">🌱 布置花园</a><button class="primary" id="next-round">下一关</button><button id="rest">休息一下</button></div></section>`;
 root.querySelector('#rest').onclick=()=>{stopSound();round=null;speak(['g-rest']);root.innerHTML='<section class="finish"><div class="symbol">🌳</div><h1>休息时间</h1><p>去走一走、看看远处吧。下次再一起探索。</p><a class="reward-link" href="../../index.html">回到学习乐园</a></section>';};
 root.querySelector('#next-round').onclick=()=>{if(current.notebook){const resume=afterNotebook;afterNotebook=null;if(resume)resume();else home();return;}const following=courses[courses.findIndex(course=>course.id===current.course)+1];if(following)start(following.topic,[],following.id);else{home();status('所有课程都通过啦！可以选择已通过的课程重练。');}};status('小冒险完成啦');
 guideButton('finish-guide',['g-finish'],false);speak([...(reward.amount===1?(reward.bonusAmount?['star-earned','daily-checkin-bonus']:['star-earned']):[]),reward.error||storageError?'g-save-error':'g-finish']);
}

function showNotebook(){stopSound();round=null;const items=book.items();root.innerHTML=`<button id="book-back">← 返回</button><h1>📖 我的错题本</h1><p>待巩固 ${items.length} 题。继续学习前优先抽取最多 5 道错题；会混入熟悉的题，不按固定位置记答案。</p><p>${book.error}</p>${items.length?'<button id="book-start" class="primary">🔊 开始错题复习</button>':'<p>还没有错题，继续探索吧。</p>'}<div class="course-grid">${items.map(x=>`<article class="course-tile"><strong>${x.payload.prompt}</strong><small>答错 ${x.mistakes} 次 · 巩固 ${x.stage}/5</small></article>`).join('')}</div>`;root.querySelector('#book-back').onclick=home;if(root.querySelector('#book-start'))root.querySelector('#book-start').onclick=startNotebook;root.querySelectorAll('.course-tile').forEach((el,i)=>{el.insertAdjacentHTML('beforeend',`<button data-book-listen="${i}" aria-label="听题目">🔊</button>`);el.querySelector('button').onclick=()=>speak(clipForQ(items[i].payload));});guideButton('book-guide',[items.length?'g-knowledge-book':'g-book-empty']);}
function startNotebook(){if(book.blocked){status(book.error);speak(['g-save-error']);return;}const items=book.items().slice(0,5);if(!items.length){const resume=afterNotebook;afterNotebook=null;if(resume)resume();else home();return;}stopSound();const questions=items.map(x=>x.payload),course=courses.find(c=>c.id===order.current()),fillers=shuffle(makePool(course.topic)).filter(q=>!questions.some(x=>x.id===q.id)).slice(0,5-questions.length);questions.push(...fillers);round={notebook:true,topic:course.topic,course:course.id,questions:shuffle(questions),allQuestions:[...questions],failed:new Set(),pending:new Set(),attempts:0,index:0,locked:false,id:`${subject}-review-${Date.now()}-${Math.random()}`};draw();}
window.addEventListener('pagehide',stopSound);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound();});window.addEventListener('garden-audio-start',e=>{if(e.detail!=='shared-study')stopSound();});home();
})();
