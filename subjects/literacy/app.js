(() => {
  const catalog=LiteracyCatalog,core=LiteracyCore,audio=LiteracyAudio;
  const store=core.open(localStorage,catalog,GardenContent.literacyGroups),prefs=store.state;
  const root=document.querySelector('#learning'),byChar=new Map(catalog.characters.map(c=>[c.char,c]));
  const byId=new Map(catalog.characters.map(c=>[c.id,c]));
  const symbols={'一':'1️⃣','二':'2️⃣','三':'3️⃣','日':'☀️','月':'🌙','山':'⛰️','水':'💧','火':'🔥','木':'🌳','人':'🧒','口':'👄','手':'✋','足':'🦶','目':'👁️','耳':'👂','猫':'🐈','狗':'🐕','鱼':'🐟','鸟':'🐦','马':'🐎','牛':'🐄','花':'🌼','草':'🌱','雨':'🌧️','云':'☁️','果':'🍎','米':'🍚','门':'🚪','家':'🏡','车':'🚗','书':'📚','笔':'✏️'};
  const themes=[['数字小火车','🚂'],['月光小营地','🌙'],['森林寻宝队','🌳'],['小兔来做客','🐰'],['池塘音乐会','🐸'],['彩虹邮递员','🌈']];
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let page=0,round=null,writer=null,screenToken=0,lastLesson=null;
  function stop(){audio.stop();screenToken++;if(writer){writer.cancelQuiz();writer.pauseAnimation();writer=null;}}
  function announce(text){document.querySelector('#status').textContent=text;}
  function recordNotice(){const node=root.querySelector('#storage-notice');if(node)node.textContent=store.error;}
  function screen(html){stop();root.innerHTML=html;window.scrollTo(0,0);announce('');}
  const notice=()=>`<p id="storage-notice" class="storage-notice" role="status">${esc(store.error)}</p>`;
  const error=()=>'<p id="audio-error" class="audio-error" role="status"></p>';
  const playWord=word=>audio.play(`audio/${word.audio}.mp3`,prefs.sound);
  async function playPrompt(current,word,withGuide=false){
    const index=current.index;
    if(withGuide&&prefs.sound){const ok=await audio.play(`audio/guide-${current.mode}.mp3`,true);if(!ok)return;}
    if(round!==current||current.locked||current.index!==index)return;
    playWord(word);
  }
  function level(){return catalog.levels.find(l=>l.id===prefs.level);}
  function home(){
    round=null;lastLesson=null;
    const current=level(),lessons=catalog.lessons.filter(l=>l.level===prefs.level),count=catalog.characters.filter(c=>c.level===prefs.level&&prefs.seen.includes(c.id)).length;
    page=Math.min(page,Math.ceil(lessons.length/8)-1);
    const selected=lessons.find(l=>l.id===prefs.lesson)||lessons[0];
    screen(`<section class="literacy-hero"><span class="mascot" aria-hidden="true">🐌</span><span class="level-pill">${current.symbol} ${current.name}</span><h1>识字小花园</h1><p>小蜗牛陪你认识汉字朋友。听一听、拼一拼，再描一描。</p><div class="sprout-progress"><progress value="${count}" max="${current.count}" aria-label="本级已接触 ${count} / ${current.count} 字"></progress><span>已接触 <strong>${count} / ${current.count}</strong> 字</span></div><p class="reading-note">每次只认识几个朋友，慢慢来。</p></section>${notice()}<div class="journey-actions"><button class="primary" id="continue-lesson">🌱 继续探索</button><button id="review" ${store.review(prefs.level).length?'':'disabled'}>🧺 浇水复习</button></div><div class="section-row"><h2>${current.symbol} 选一个小冒险</h2><span>每组 5–6 字</span></div><div class="lesson-list">${lessons.slice(page*8,page*8+8).map(l=>{
      const seen=l.characters.filter(c=>prefs.seen.includes(byChar.get(c).id)).length,done=Object.keys(prefs.completed).some(k=>k.startsWith(l.id+':'));
      const [name,symbol]=themes[(l.number-1)%themes.length];
      return `<button class="lesson-tile ${seen===l.characters.length?'visited':''}" data-lesson="${l.id}"><strong>${symbol} ${name}</strong><small>第 ${l.number} 站${done?' · 已完成小冒险':''}</small><span class="unit-chars">${l.characters.map(c=>`<span>${c}</span>`).join('')}</span><small>已接触 ${seen} / ${l.characters.length} 字</small></button>`;
    }).join('')}</div><div class="page-controls"><button id="previous-page" aria-label="上一页冒险" ${page===0?'disabled':''}>←</button><span>第 ${page+1} / ${Math.ceil(lessons.length/8)} 页</span><button id="next-page" aria-label="下一页冒险" ${(page+1)*8>=lessons.length?'disabled':''}>→</button></div><section class="search-box"><label for="character-search">🔎 家长找字 · 全部 3000 字</label><input id="character-search" placeholder="输入汉字或词语，如：月、学校" maxlength="16" autocomplete="off"><p id="search-summary" role="status"></p><div id="search-results" class="search-results"></div></section><details class="settings"><summary>家长 · 分级与声音</summary><p>4–6 岁默认从基础 300 字开始。分级表示课程顺序，请按孩子兴趣和理解选择；不要求学前完成 3000 字。</p><label>选择学习层级<select id="level-setting">${catalog.levels.map(l=>`<option value="${l.id}" ${l.id===prefs.level?'selected':''}>${l.name} · 累计 ${l.total} 字</option>`).join('')}</select></label><label>播放声音<input id="sound-setting" type="checkbox" ${prefs.sound?'checked':''}></label><label>听音找字选项<select id="option-setting"><option value="2" ${prefs.options===2?'selected':''}>2 个</option><option value="3" ${prefs.options===3?'selected':''}>3 个</option></select></label><p>“已接触”表示看过或听过。浇水篮优先选到期复习的字；完成轮数不等于掌握程度。每轮最多 5 个目标，不计时、不扣分。描字可用手指或鼠标，也可选择看笔顺，不强求精细书写。</p><a href="../../parent.html">家长小窗</a><a href="../../records.html">下载记录备份</a><a href="legacy.html">以前的图片小屋</a></details>`);
    root.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>lesson(b.dataset.lesson));
    root.querySelector('#continue-lesson').onclick=()=>lesson(selected.id);
    root.querySelector('#review').onclick=()=>start(null,'listen',store.review(prefs.level));
    root.querySelector('#previous-page').onclick=()=>{page--;home();};root.querySelector('#next-page').onclick=()=>{page++;home();};
    root.querySelector('#level-setting').onchange=e=>{prefs.level=Number(e.target.value);prefs.lesson=catalog.lessons.find(l=>l.level===prefs.level).id;store.save();page=0;home();root.querySelector('.settings').open=true;};
    root.querySelector('#sound-setting').onchange=e=>{prefs.sound=e.target.checked;audio.stop();store.save();recordNotice();};
    root.querySelector('#option-setting').onchange=e=>{prefs.options=Number(e.target.value);store.save();recordNotice();};
    root.querySelector('#character-search').oninput=e=>search(e.target.value);
  }
  function search(value){
    const query=value.trim(),results=root.querySelector('#search-results'),summary=root.querySelector('#search-summary');results.replaceChildren();
    if(!query){summary.textContent='';return;}
    const entries=catalog.characters.filter(c=>c.char===query||c.words.some(w=>w.text.includes(query)));
    summary.textContent=entries.length?`找到 ${entries.length} 个字朋友${entries.length>18?'，先显示前 18 个':''}。`:'暂时没有找到这个字或词语。';
    for(const c of entries.slice(0,18)){
      const button=document.createElement('button');button.innerHTML=`${c.char}<small>${c.pinyin} · 第 ${c.level} 级</small>`;button.setAttribute('aria-label',`认识 ${c.char}，第 ${c.level} 级`);button.onclick=()=>detail(c,null);results.append(button);
    }
  }
  function lesson(id){
    round=null;const unit=catalog.lessons.find(l=>l.id===id);if(!unit)return home();lastLesson=id;prefs.lesson=id;prefs.level=unit.level;store.save();
    const [name,symbol]=themes[(unit.number-1)%themes.length];
    screen(`<button id="back">← 返回小花园</button><div class="intro"><p class="level-pill">${level().name} · 第 ${unit.number} 站</p><h1>${symbol} ${name}</h1><p>先点一个字听一听，再和朋友们一起玩。</p></div>${notice()}<div class="char-cards">${unit.characters.map(char=>{
      const c=byChar.get(char);return `<article class="char-card"><button data-character="${c.id}" aria-label="认识 ${char}"><span class="char">${char}</span><span class="pinyin">${c.pinyin}</span><p>${c.words[0].text}</p><small>${prefs.seen.includes(c.id)?'见过的朋友':'点我听一听'} 🔊</small></button></article>`;
    }).join('')}</div><h2>今天想怎么玩？</h2><div class="mode-buttons"><button data-mode="listen"><span>🔊</span>听词找字<small>听词语，送字宝宝回家</small></button><button data-mode="build"><span>🧩</span>词语拼搭<small>点字块或拖一拖，搭出小词语</small></button><button data-mode="trace"><span>🖌️</span>笔顺小画板<small>跟着小路描一描，也能看笔顺</small></button></div>`);
    root.querySelector('#back').onclick=home;
    root.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>detail(byId.get(b.dataset.character),id));
    root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(id,b.dataset.mode));
  }
  function detail(entry,returnTo){
    round=null;store.seen(entry);
    screen(`<button id="back">← 返回${returnTo?'小冒险':'小花园'}</button>${notice()}<section class="char-detail"><div><div class="game-picture" aria-hidden="true">${symbols[entry.char]||'🌱'}</div><div class="large-char">${entry.char}</div><p class="large-pinyin">${entry.pinyin}</p><p class="intro reading-note">${entry.strokes} 笔 · 部首 ${entry.radical}</p></div><div><h1>你好，${entry.char}！</h1><p>点词语听一听。它在词语里的读音标在下面。</p>${entry.words.map((w,i)=>`<button class="word-button" data-word="${i}">🔊 ${esc(w.text)}<small>${esc(w.pinyin)}</small><small>${entry.char}在这里读 ${esc(w.reading)}</small></button>`).join('')}${error()}<p class="reading-note">多音字可以在不同词语中读不同的音。</p><div class="stroke-actions"><button id="open-drawing">🖌️ 描一描这个字</button><button id="practice-character">🧩 和它拼词语</button></div></div></section>`);
    root.querySelector('#back').onclick=()=>returnTo?lesson(returnTo):home();
    root.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>playWord(entry.words[Number(b.dataset.word)]));
    root.querySelector('#open-drawing').onclick=()=>start(entry.lesson,'trace',[entry]);root.querySelector('#practice-character').onclick=()=>start(entry.lesson,'build',[entry]);
    playWord(entry.words[0]);
  }
  function start(id,mode,pool){
    if(!['listen','build','trace'].includes(mode))return;
    const unit=catalog.lessons.find(l=>l.id===id),entries=pool||unit.characters.map(c=>byChar.get(c));
    if(!entries.length)return home();
    const targets=core.shuffle(entries).sort((a,b)=>(prefs.stats[a.id]?.correct||0)-(prefs.stats[b.id]?.correct||0)).slice(0,5);
    round={id:`literacy-${Date.now()}-${Math.random()}`,lesson:id||`review-level-${prefs.level}`,mode,targets,index:0,locked:false,wordIndex:0,placed:0};draw();
  }
  function feedback(text){const el=root.querySelector('.feedback');if(el)el.textContent=text;announce(text);}
  function distractors(entry){
    const nearby=catalog.characters.filter(c=>c.level===entry.level&&c.id!==entry.id);
    const same=nearby.filter(c=>c.radical===entry.radical);
    const pool=core.shuffle([...same,...core.shuffle(nearby).slice(0,30)]);
    const unique=[...new Set(pool.map(c=>c.char))];return core.shuffle([entry.char,...unique.slice(0,prefs.options-1)]);
  }
  function draw(){
    const current=round;if(!current)return;if(current.index===current.targets.length)return finish();
    const entry=current.targets[current.index];current.wordIndex=(prefs.stats[entry.id]?.correct||0)>1?Math.floor(Math.random()*2):0;const word=entry.words[current.wordIndex];
    current.locked=false;current.placed=0;
    const captions={listen:'听一听，送字宝宝回家',build:'听一听，搭出这个词语',trace:'跟着小路，描一描'};
    const base=`<div class="game-head"><button id="leave">← 返回</button><div class="round-progress" aria-label="第 ${current.index+1} 题，共 ${current.targets.length} 题">${current.targets.map((_,i)=>`<span class="${i<current.index?'done':''}"></span>`).join('')}</div><span id="round-count">${current.index+1} / ${current.targets.length}</span></div>${notice()}<section class="literacy-game" data-entry="${entry.id}" data-word-index="${current.wordIndex}"><h1 tabindex="-1">${captions[current.mode]}</h1><p class="round-caption">${current.mode==='trace'?`${entry.char} · ${entry.pinyin} · ${entry.strokes} 笔`:'听词语，找到它的朋友。'}</p>`;
    let body='';
    if(current.mode==='listen'){
      current.options=distractors(entry);
      body=`<div class="word-clue" aria-label="词语里有一个字等待你来填">${[...word.text].map((c,i)=>i===word.targetIndex?'<span class="blank-letter">?</span>':`<span>${c}</span>`).join('')}</div><div class="question-control"><button id="repeat">🔊 再听一次</button></div>${error()}<div class="options">${current.options.map((c,i)=>`<button class="option" data-choice="${i}">${c}</button>`).join('')}</div>`;
    } else if(current.mode==='build'){
      const letters=[...word.text],extras=distractors(entry).filter(c=>!letters.includes(c));
      current.tiles=core.shuffle([...letters,...extras.slice(0,2)]).map((char,i)=>({char,id:i,used:false}));
      body=`<p class="story-note">🐸 小青蛙想收到这个词语。<br>点字块，或把它拖进第一个空位。</p><div class="word-slots" aria-label="词语拼搭空位">${letters.map((_,i)=>`<div class="word-slot" data-slot="${i}" aria-label="第 ${i+1} 个字的空位"></div>`).join('')}</div><div class="question-control"><button id="repeat">🔊 听词语</button><button id="hint" class="hint-button">💡 看一下词语</button></div><div id="word-reveal" class="word-reveal" aria-live="polite"></div>${error()}<div class="letter-tiles">${current.tiles.map(t=>`<button class="letter-tile" draggable="true" data-tile="${t.id}" aria-label="字块 ${t.char}">${t.char}</button>`).join('')}</div>`;
    } else {
      body=`<p class="story-note">🖌️ 用手指或鼠标，跟着亮起来的小路画。<br>也可以看看笔顺，轻松认识它。</p><div id="stroke-board" class="stroke-board" aria-label="${entry.char}的互动描字画板"></div><div class="stroke-actions"><button id="repeat">🔊 听组词</button><button id="animate" disabled>👀 看笔顺</button><button id="restart-trace" disabled>🖌️ 重新描</button><button id="observe" disabled>我看懂了，继续</button></div>${error()}`;
    }
    screen(base+body+'<p class="feedback" role="status"></p></section>');
    root.querySelector('#leave').onclick=()=>{round=null;current.lesson.startsWith('L')?lesson(current.lesson):home();};
    root.querySelector('#repeat').onclick=()=>playWord(word);
    root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.choice)));
    if(current.mode==='build'){
      root.querySelector('#hint').onclick=()=>{root.querySelector('#word-reveal').textContent=word.text+' · '+word.pinyin;playWord(word);};
      root.querySelectorAll('[data-tile]').forEach(b=>{
        b.onclick=()=>place(Number(b.dataset.tile));
        b.ondragstart=e=>{if(current.locked){e.preventDefault();return;}e.dataTransfer.setData('text/plain',b.dataset.tile);};
      });
      root.querySelectorAll('[data-slot]').forEach(el=>{el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();if(Number(el.dataset.slot)!==current.placed)return feedback('先放进前面的空位，慢慢来。');const value=e.dataTransfer.getData('text/plain');if(/^\d+$/.test(value))place(Number(value));};});
    }
    if(current.mode==='trace')loadWriter(entry,current);playPrompt(current,word,current.index===0);
    root.querySelector('h1').focus({preventScroll:true});
  }
  function choose(index){
    const current=round;if(!current||current.locked)return;
    const entry=current.targets[current.index];
    if(current.options[index]!==entry.char){store.answer(entry,false);recordNotice();feedback('没关系，再听一听，字宝宝在等你。');playWord(entry.words[current.wordIndex]);return;}
    store.answer(entry,true);next(entry.char+' 找到家啦！');
  }
  function place(id){
    const current=round;if(!current||current.locked)return;
    const tile=current.tiles.find(t=>t.id===id),entry=current.targets[current.index],word=entry.words[current.wordIndex];
    if(!tile||tile.used)return;
    if(tile.char!==word.text[current.placed]){store.answer(entry,false);recordNotice();feedback('还差一点，听听词语，或者点一下小灯泡。');playWord(word);return;}
    tile.used=true;const slot=root.querySelector(`[data-slot="${current.placed}"]`);slot.textContent=tile.char;slot.classList.add('filled');root.querySelector(`[data-tile="${id}"]`).disabled=true;current.placed++;
    if(current.placed===word.text.length){store.answer(entry,true);next(word.text+' 搭好啦！');}else feedback('搭好一个字，再找下一个朋友。');
  }
  async function loadWriter(entry,current){
    const token=screenToken;feedback('小画板正在准备……');
    try {
      const response=await fetch(`strokes/${entry.id}.json`);if(!response.ok)throw Error();const data=await response.json();
      if(round!==current||screenToken!==token)return;
      const board=root.querySelector('#stroke-board'),size=board.clientWidth;
      writer=HanziWriter.create(board,entry.char,{width:size,height:size,padding:18,showCharacter:false,showOutline:true,drawingColor:'rgba(22,117,104,0)',strokeColor:'#167568',radicalColor:'#bb6f31',highlightColor:'#e0aa33',outlineColor:'#dae3cf',strokeAnimationSpeed:0.7,delayBetweenStrokes:250,charDataLoader:(_,complete)=>complete(data),onLoadCharDataError:()=>feedback('小画板暂时没准备好，请返回后再试。')});
      const thisWriter=writer;
      await thisWriter.getCharacterData();if(round!==current||screenToken!==token||writer!==thisWriter)return;
      const dot=document.createElement('span');dot.className='stroke-start';dot.setAttribute('aria-hidden','true');board.append(dot);
      const fill=GardenStrokeFill.create(board,board.querySelector('svg'));
      let strokeIndex=0,tracing=false,dragging=false,progress=0;
      function clearFill(){dragging=false;progress=0;fill.clear();}
      function reveal(e){if(!dragging)return;const projected=GardenStrokeFill.projection(fill.localPoint(e),data.medians[strokeIndex]);if(projected.distance>85||projected.portion>progress+.45)return;progress=Math.max(progress,projected.portion);fill.paint(progress);}
      board.addEventListener('pointerdown',e=>{if(!tracing||current.locked||e.button!==0)return;const point=fill.localPoint(e),median=data.medians[strokeIndex];if(Math.hypot(point[0]-median[0][0],point[1]-median[0][1])>100)return;clearFill();fill.prepare(data.strokes[strokeIndex],median);dragging=true;});
      board.addEventListener('pointermove',reveal);board.addEventListener('pointerup',()=>{dragging=false;setTimeout(clearFill,0);});board.addEventListener('pointercancel',clearFill);board.addEventListener('pointerleave',clearFill);
      function hintStroke(index){
        if(round!==current||writer!==thisWriter||current.locked)return;
        strokeIndex=index;clearFill();const [x,y]=fill.boardPoint(data.medians[index][0]);dot.style.left=(x-dot.offsetWidth/2)+'px';dot.style.top=(y-dot.offsetHeight/2)+'px';
        board.setAttribute('aria-label',`${entry.char}的互动描字画板，第 ${index+1} 笔，共 ${entry.strokes} 笔`);
        thisWriter.highlightStroke(index);
      }
      function quiz(){if(round!==current||writer!==thisWriter||current.locked)return;tracing=true;strokeIndex=0;clearFill();thisWriter.quiz({leniency:1.6,showHintAfterMisses:1,highlightOnComplete:false,onCorrectStroke:stroke=>{clearFill();feedback('这一步走得很好，再描一笔。');if(stroke.strokesRemaining)hintStroke(stroke.strokeNum+1);},onMistake:()=>{clearFill();feedback('没关系，跟着亮起来的小路再试试。');},onComplete:()=>{if(round===current&&writer===thisWriter&&!current.locked){store.seen(entry);next(entry.char+' 描好啦！');}}});}
      root.querySelector('#animate').disabled=false;root.querySelector('#restart-trace').disabled=false;root.querySelector('#observe').disabled=false;
      root.querySelector('#animate').onclick=async()=>{tracing=false;clearFill();thisWriter.cancelQuiz();await thisWriter.animateCharacter();quiz();hintStroke(0);};
      root.querySelector('#restart-trace').onclick=()=>{quiz();hintStroke(0);};
      root.querySelector('#observe').onclick=()=>{tracing=false;clearFill();thisWriter.cancelQuiz();store.seen(entry);next('看到了 '+entry.char+' 的小路！');};
      feedback('从小圆点开始，跟着亮起的小路慢慢描。');quiz();hintStroke(0);
    } catch {if(round===current&&screenToken===token){feedback('小画板暂时无法加载，请点返回后再试。');root.querySelector('#observe').disabled=false;root.querySelector('#observe').textContent='先听词语，继续认识';root.querySelector('#observe').onclick=()=>{store.seen(entry);next('认识了 '+entry.char+'！');};}}
  }
  async function next(text){
    const current=round;if(!current||current.locked)return;current.locked=true;audio.stop();
    root.querySelectorAll('[data-choice],[data-tile],#observe,#animate,#restart-trace').forEach(b=>b.disabled=true);feedback(text);recordNotice();
    await audio.play('../shared/audio/'+(current.mode==='trace'?'practice-done':'great')+'.mp3',prefs.sound);
    if(round!==current||!current.locked)return;
    setTimeout(()=>{if(round!==current||!current.locked)return;current.index++;draw();},1200);
  }
  function finish(){
    const current=round;if(!current||current.finished)return;current.finished=true;
    store.complete(current.lesson,current.mode);
    const reward=GardenRewards.award('literacy',`${current.lesson}-${current.mode}`,current.id);
    const note=store.error||reward.error||(reward.amount?`⭐ 获得 ${reward.amount} 颗星星${reward.bonusAmount?' · 四科打卡完成，额外 +5 颗！':''}`:'这一关的星星已经记好啦。');
    const unit=catalog.lessons.find(l=>l.id===current.lesson),following=unit?catalog.lessons.find(l=>l.level===unit.level&&l.number===unit.number+1):null;
    screen(`<section class="finish"><div class="symbol" aria-hidden="true">🌟</div><h1>汉字小冒险，完成啦！</h1><p>小蜗牛收到了你的新发现。认真尝试，每一小步都算数。</p><div class="completion-book" aria-label="本轮认识的汉字">${current.targets.map(c=>`<span>${c.char}</span>`).join('')}</div><p class="feedback">${esc(note)}</p>${reward.rest?'<div class="rest-panel"><h2>休息一会儿吧</h2><p>离开屏幕，喝口水、看看远处。花园会等你回来。</p></div>':''}${unit&&!following?'<div class="level-done"><h2>这一层的小路走到尽头啦！</h2><p>可以回去浇水复习，也可以请家长选择下一层。</p></div>':''}<div class="finish-actions"><a class="reward-link" href="../../rewards.html">🌱 布置花园</a><button class="primary" id="next-round">下一关</button><button id="rest">休息一下</button><button id="go-home">回到识字花园</button></div></section>`);
    root.querySelector('#go-home').onclick=home;root.querySelector('#next-round').onclick=()=>{
      if(unit){const nextUnit=following||catalog.lessons.find(l=>l.level===unit.level);prefs.lesson=nextUnit.id;store.save();start(nextUnit.id,current.mode);}
      else{const previous=new Set(current.targets.map(c=>c.id));const pool=catalog.characters.filter(c=>c.level===prefs.level&&!previous.has(c.id));start(null,current.mode,pool);}
    };
    root.querySelector('#rest').onclick=()=>{round=null;screen('<section class="finish"><div class="symbol">🌳</div><h1>休息时间</h1><p>去走一走、看看远处，下次再一起探索。</p><button id="go-home">回到识字花园</button></section>');root.querySelector('#go-home').onclick=home;};
    announce('汉字小冒险完成啦');
    if(reward.amount===1){const finishToken=screenToken;audio.play('../shared/audio/star-earned.mp3',prefs.sound).then(()=>{if(screenToken===finishToken&&reward.bonusAmount)audio.play('../shared/audio/daily-checkin-bonus.mp3',prefs.sound);});}
  }
  window.addEventListener('pagehide',stop);home();
})();
