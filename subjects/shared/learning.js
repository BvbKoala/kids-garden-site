(() => {
const subject=document.body.dataset.subject;
const names={literacy:'识字小花园',math:'数学游乐场',knowledge:'世界探索屋'};
const root=document.querySelector('#learning');
const KEY='learning-garden-study-v1';
const defaults=()=>({version:1,sound:true,options:3,range:10,carry:false,completed:{},seen:[]});
let prefs=defaults(),storageError='',round=null,audio=null,speechToken=0,cancelAudio=null;
try {const raw=localStorage.getItem(KEY);if(raw){const data=JSON.parse(raw);if(data.version!==1||!data.completed||typeof data.completed!=='object'||Array.isArray(data.completed)||!Object.values(data.completed).every(n=>Number.isSafeInteger(n)&&n>=0)||!Array.isArray(data.seen))throw Error();prefs={...prefs,...data};}}
catch {storageError='学习记录暂时无法读取。请家长先备份记录，再检查浏览器。';}
if(![10,20,100,1000].includes(prefs.range))prefs.range=10;
if(![2,3].includes(prefs.options))prefs.options=3;
function save(){if(storageError)return false;try{localStorage.setItem(KEY,JSON.stringify(prefs));return true;}catch{storageError='学习记录没有保存成功。请家长检查浏览器存储空间。';return false;}}
const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function stopSound(){speechToken++;if(audio){audio.pause();audio=null;}if(cancelAudio){cancelAudio();cancelAudio=null;}}
function numberClips(n){
 if(n<=10)return ['n-'+n];if(n===1000)return ['n-1','thousand'];
 const a=[];if(n>=100){a.push('n-'+Math.floor(n/100),'hundred');n%=100;if(n>0&&n<10)a.push('n-0');}
 if(n>=10){const tens=Math.floor(n/10);if(tens>1||a.length)a.push('n-'+tens);a.push('n-10');n%=10;}
 if(n)a.push('n-'+n);return a;
}
function clipForQ(q){if(q.a!==undefined&&q.sign)return [...numberClips(q.a),q.sign==='+'?'plus':'minus',...numberClips(q.b),'equals-question'];return [q.audio];}
async function speak(ids){
 stopSound();if(!prefs.sound)return;
 const token=speechToken;
 for(const id of ids.filter(Boolean)){
   if(token!==speechToken)return;
   const clip=new Audio(`../shared/audio/${id}.mp3`);audio=clip;
   const ok=await new Promise(resolve=>{let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timeout);if(cancelAudio===cancel)cancelAudio=null;resolve(value);};const cancel=()=>finish(true);cancelAudio=cancel;const timeout=setTimeout(()=>finish(false),12000);clip.onended=()=>finish(true);clip.onerror=()=>finish(false);clip.play().catch(()=>finish(false));});
   if(token!==speechToken)return;
   if(!ok){const el=document.querySelector('#audio-error');if(el)el.textContent='声音暂时没播放出来，可以再点一次喇叭。';return;}
 }
 if(token===speechToken)audio=null;
}
function status(text){document.querySelector('#status').textContent=text;}
function home(){
 stopSound();round=null;document.title=`${names[subject]} · 儿童学习花园`;
 const topics=subject==='literacy'?GardenContent.literacyGroups:subject==='knowledge'?GardenContent.knowledgeGroups:[{id:'count',name:'数一数',symbol:'🍎'},{id:'compare',name:'比一比',symbol:'⚖️'},{id:'shape',name:'找形状',symbol:'🔺'},{id:'add',name:'加一加',symbol:'➕'},{id:'subtract',name:'减一减',symbol:'➖'},{id:'mixed',name:'加减小冒险',symbol:'🌈'}];
 root.innerHTML=`<div class="intro"><p class="muted">小小发现，大大开心</p><h1>${names[subject]}</h1><p>${subject==='literacy'?'先点图片听一听，再找汉字朋友。':subject==='math'?'数一数，想一想。一次只玩五小题。':'听一个生活小问题，找个好办法。'}</p></div>${storageError?`<p class="storage-notice">${storageError}</p>`:''}<div class="topic-list">${topics.map(t=>`<button class="topic" data-topic="${t.id}"><span class="symbol" aria-hidden="true">${t.symbol}</span>${t.name}<small>${prefs.completed[subject+':'+t.id]?'已完成 '+prefs.completed[subject+':'+t.id]+' 轮':'去发现'}${subject==='knowledge'?' · '+t.questions.length+' 道题':''}${subject==='math'&&['add','subtract','mixed'].includes(t.id)?' · '+prefs.range+' 以内':''}</small></button>`).join('')}</div><details class="settings"><summary>家长 · 学习设置</summary><p>建议陪孩子一起探索，每次 3–5 分钟，从容易的内容开始。每完成 3 轮会提示休息。</p><label>播放声音<input id="sound-setting" type="checkbox" ${prefs.sound?'checked':''}></label><label>每题选项<select id="option-setting"><option value="2" ${prefs.options===2?'selected':''}>2 个</option><option value="3" ${prefs.options===3?'selected':''}>3 个</option></select></label>${subject==='math'?`<label>加减法范围<select id="range-setting">${[10,20,100,1000].map(n=>`<option value="${n}" ${prefs.range===n?'selected':''}>${n} 以内</option>`).join('')}</select></label><label>进位、退位练习<input id="carry-setting" type="checkbox" ${prefs.carry?'checked':''}></label><p>10 以内配实物图；更大数显示百、十、个位分解。1000 以内是可选拓展，由家长按孩子情况选择。进位、退位从 20 以内开始。</p>`:''}<p>不计时、不扣分；每轮目标不重复，答对后自动前进。学习记录只留在本浏览器。</p><a href="../../records.html">查看与备份记录</a></details>`;
 root.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>subject==='literacy'?learnWords(b.dataset.topic):start(b.dataset.topic));
 root.querySelector('#sound-setting').onchange=e=>{prefs.sound=e.target.checked;stopSound();save();};
 root.querySelector('#option-setting').onchange=e=>{prefs.options=Number(e.target.value);save();};
 if(subject==='math'){root.querySelector('#range-setting').onchange=e=>{prefs.range=Number(e.target.value);save();home();root.querySelector('.settings').open=true;};root.querySelector('#carry-setting').onchange=e=>{prefs.carry=e.target.checked;save();};}
}
function learnWords(topic){
 const group=GardenContent.literacyGroups.find(g=>g.id===topic);stopSound();round=null;
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
function start(topic,previous=[]){stopSound();const pool=shuffle(makePool(topic)),old=new Set(previous.map(q=>q.id));const questions=[...pool.filter(q=>!old.has(q.id)),...pool.filter(q=>old.has(q.id))].slice(0,5);round={topic,questions,index:0,locked:false,id:`${subject}-${Date.now()}-${Math.random()}`};draw();}
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
 if(!round)return;if(round.index===round.questions.length){finish();return;}
 stopSound();round.locked=false;const q=round.questions[round.index];
 const distractors=shuffle(q.options.filter(o=>o!==q.answer)).slice(0,prefs.options-1);round.options=shuffle([q.answer,...distractors]);
 root.innerHTML=`<div class="game-head"><button id="leave">← 返回</button><div class="round-progress" aria-label="第 ${round.index+1} 题，共 ${round.questions.length} 题">${round.questions.map((_,i)=>`<span class="${i<round.index?'done':''}"></span>`).join('')}</div><span>${round.index+1} / ${round.questions.length}</span></div><section class="question"><h1>${q.prompt}</h1>${picture(q)}<button id="repeat" aria-label="再听一次">🔊 再听一次</button><p class="sound-hint">${subject==='knowledge'||q.id.startsWith('shape')||q.id.startsWith('compare')?'喇叭会读出问题和每个选项。':'点选一个朋友。'}</p><p id="audio-error" class="audio-error" role="status"></p></section><div class="options ${subject==='knowledge'?'words':''}">${round.options.map((o,i)=>`<button class="option ${subject==='knowledge'||q.id.startsWith('shape')||q.id.startsWith('compare')?'text':''}" data-choice="${i}">${subject==='knowledge'||q.id.startsWith('shape')||q.id.startsWith('compare')?`<small>${i+1} · </small>`:''}${o}</button>`).join('')}</div><p class="feedback" role="status"></p>`;
 root.querySelector('#leave').onclick=home;
 const promptClips=()=>{const clips=clipForQ(q);if(subject==='knowledge')for(const [i,o] of round.options.entries())clips.push('choice-'+(i+1),q.optionAudio[q.options.indexOf(o)]);else if(q.id.startsWith('shape')||q.id.startsWith('compare'))for(const [i,o] of round.options.entries())clips.push('choice-'+(i+1),({圆形:'circle',正方形:'square',三角形:'triangle',长方形:'rectangle',椭圆形:'oval',左边:'left',右边:'right'})[o]);return clips;};
 root.querySelector('#repeat').onclick=()=>speak(promptClips());
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.choice)));
 speak(promptClips());status(`第 ${round.index+1} 题，${q.prompt}`);
}
async function answer(index){
 if(!round||round.locked)return;const current=round,q=current.questions[current.index];
 const feedback=root.querySelector('.feedback');
 if(current.options[index]!==q.answer){feedback.textContent='没关系，再听听、想一想。';status(feedback.textContent);speak(['retry',...clipForQ(q)]);return;}
 current.locked=true;root.querySelectorAll('[data-choice]').forEach((b,i)=>{b.disabled=true;if(i===index)b.classList.add('correct');});feedback.textContent=q.explanation;status(q.explanation);
 await speak(q.explanationAudio?['great',q.explanationAudio]:['great']);
 setTimeout(()=>{if(round!==current||!current.locked)return;current.index++;draw();},1200);
}
function finish(){
 const current=round;if(current.finished)return;current.finished=true;stopSound();
 const key=subject+':'+current.topic;prefs.completed[key]=(prefs.completed[key]||0)+1;save();
 const topic=subject==='math'&&['add','subtract','mixed'].includes(current.topic)?`${current.topic}-${prefs.range}-${prefs.carry?'carry':'base'}`:current.topic;
 const reward=GardenRewards.award(subject,topic,current.id);
 root.innerHTML=`<section class="finish"><div class="symbol" aria-hidden="true">🌟</div><h1>小冒险，完成啦！</h1><p>你认真完成了这一关，又有了新发现！</p><p class="feedback">${reward.error||storageError||(reward.amount?`⭐ 获得 ${reward.amount} 颗星星${reward.bonusAmount?' · 四科打卡完成，额外 +5 颗！':''}`:'这一关的星星已经记好啦。')}</p>${reward.rest?'<div class="rest-panel"><h2>让小眼睛休息一下</h2><p>离开屏幕，喝口水，看看远处。花园会等你回来。</p></div>':''}<div class="finish-actions"><a class="reward-link" href="../../rewards.html">🌱 布置花园</a><button class="primary" id="next-round">下一关</button><button id="rest">休息一下</button></div></section>`;
 root.querySelector('#rest').onclick=()=>{stopSound();round=null;root.innerHTML='<section class="finish"><div class="symbol">🌳</div><h1>休息时间</h1><p>去走一走、看看远处吧。下次再一起探索。</p><a class="reward-link" href="../../index.html">回到学习花园</a></section>';};
 root.querySelector('#next-round').onclick=()=>start(current.topic,current.questions);status('小冒险完成啦');
 if(reward.amount===1)speak(reward.bonusAmount?['star-earned','daily-checkin-bonus']:['star-earned']);
}
window.addEventListener('pagehide',stopSound);home();
})();
