/* Separate literacy records; v1 shared records and English are read-only here. */
(() => {
  const KEY = 'learning-garden-literacy-v2';
  const shuffle = items => {
    const result = [...items];
    for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]; }
    return result;
  };
  function open(storage,catalog,legacyGroups) {
    const valid = new Set(catalog.characters.map(c=>c.id));
    const byChar = new Map(catalog.characters.map(c=>[c.char,c]));
    const blank = () => ({version:2,level:1,lesson:'L1-001',sound:true,options:2,seen:[],stats:{},completed:{},rounds:0,migrated:false});
    let state=blank(),error='',blocked=false;
    try {
      const raw=storage.getItem(KEY);
      if(raw) {
        const loaded=JSON.parse(raw);
        if(!loaded||loaded.version!==2||!Array.isArray(loaded.seen)||!loaded.seen.every(id=>typeof id==='string')||!Number.isSafeInteger(loaded.rounds)||loaded.rounds<0||!loaded.stats||typeof loaded.stats!=='object'||Array.isArray(loaded.stats)||!loaded.completed||typeof loaded.completed!=='object'||Array.isArray(loaded.completed)||!Object.values(loaded.completed).every(n=>Number.isSafeInteger(n)&&n>=0)||!Object.entries(loaded.stats).every(([id,s])=>valid.has(id)&&s&&Number.isSafeInteger(s.correct)&&s.correct>=0&&Number.isSafeInteger(s.attempts)&&s.attempts>=0&&Number.isFinite(s.due)))throw Error('invalid');
        state={...state,...loaded};
      }
      if(![1,2,3,4].includes(state.level))state.level=1;
      if(!catalog.lessons.some(l=>l.id===state.lesson))state.lesson='L1-001';
      if(![2,3].includes(state.options))state.options=2;
    } catch {error='识字记录暂时无法读取。请先下载备份，再请家长检查。';blocked=true;}
    function save() {
      if(blocked)return false;
      try {storage.setItem(KEY,JSON.stringify(state));error='';return true;}
      catch {error='识字记录没有保存成功，请家长检查浏览器存储空间。';return false;}
    }
    if(!blocked) {
      try {
        const shared=JSON.parse(storage.getItem('learning-garden-study-v1')||'{}');
        let changed=!state.migrated;
        if(!state.migrated&&typeof shared.sound==='boolean')state.sound=shared.sound;
        const previous=new Set(Array.isArray(shared.seen)?shared.seen:[]);
        for(const group of legacyGroups)group.words.forEach(([char],index)=>{
          const entry=byChar.get(char);
          if(entry&&previous.has(`literacy-${group.id}-${index}`)&&!state.seen.includes(entry.id)){state.seen.push(entry.id);changed=true;}
        });
        state.migrated=true;if(changed)save();
      } catch {error='旧识字记录暂时无法读取，原始数据已保留，请家长备份检查。';}
    }
    const orderApi=globalThis.GardenCourseOrder;
    const legacyPassed=catalog.lessons.filter(unit=>(state.completed[unit.id+':listen']||state.completed[unit.id+':build'])&&unit.characters.every(char=>(state.stats[byChar.get(char).id]?.correct||0)>0)).map(unit=>unit.id);
    const sequence=orderApi.open(catalog.lessons.map(unit=>unit.id),state.courseOrder,legacyPassed);
    const loadedCoverage=state.courseOrder?.coverage;
    const coverage={};
    if(loadedCoverage&&typeof loadedCoverage==='object')for(const unit of catalog.lessons){
      if(Array.isArray(loadedCoverage[unit.id]))coverage[unit.id]=[...new Set(loadedCoverage[unit.id].filter(id=>valid.has(id)&&catalog.characters.find(c=>c.id===id)?.lesson===unit.id))];
    }
    state.courseOrder={...sequence.state,coverage};
    // Keep the sequence and saved object shared, including its passed map.
    sequence.state=state.courseOrder;
    function courseAllowed(id){return sequence.allowed(id);}
    function currentCourse(){return catalog.lessons.find(unit=>unit.id===sequence.current());}
    function coursePassed(id){return sequence.done(id);}
    function covered(id){return state.courseOrder.coverage[id]||[];}
    function seen(entry) {if(!state.seen.includes(entry.id))state.seen.push(entry.id);save();}
    function answer(entry,correct) {
      const previous=state.stats[entry.id]||{correct:0,attempts:0,due:0};
      const stat={...previous,attempts:previous.attempts+1};
      if(correct){stat.correct++;stat.due=Date.now()+Math.min(7,2**Math.min(stat.correct-1,3))*86400000;seen(entry);}
      else stat.due=Date.now();
      state.stats[entry.id]=stat;save();
    }
    function complete(lesson,mode,entries=[]) {
      const unit=catalog.lessons.find(unit=>unit.id===lesson);
      if(unit&&!courseAllowed(lesson))return false;
      state.rounds++;const key=lesson+':'+mode;state.completed[key]=(state.completed[key]||0)+1;
      if(unit&&['listen','build'].includes(mode)){
        const ids=entries.filter(entry=>entry.lesson===lesson&&(state.stats[entry.id]?.correct||0)>0).map(entry=>entry.id);
        state.courseOrder.coverage[lesson]=[...new Set([...covered(lesson),...ids])];
        if(unit.characters.every(char=>covered(lesson).includes(byChar.get(char).id)))sequence.pass(lesson);
      }
      return save();
    }
    function review(level,limit=5) {
      const entries=catalog.characters.filter(c=>c.level===level&&state.seen.includes(c.id)&&courseAllowed(c.lesson));
      const overdue=entries.filter(c=>!state.stats[c.id]||state.stats[c.id].due<=Date.now());
      const pool=overdue.length?overdue:entries;
      return shuffle(pool).sort((a,b)=>(state.stats[a.id]?.due||0)-(state.stats[b.id]?.due||0)).slice(0,limit);
    }
    return {state,save,seen,answer,complete,review,courseAllowed,currentCourse,coursePassed,covered,get error(){return error;},get blocked(){return blocked;}};
  }
  globalThis.LiteracyCore={KEY,open,shuffle};
})();
