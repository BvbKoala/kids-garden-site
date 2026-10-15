/* Sequential, audio-first poetry learning. No old learning key is rewritten. */
(()=>{
 const KEY='learning-garden-poetry-v1',DAY=86400000,clone=x=>JSON.parse(JSON.stringify(x));
 function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function createRound(poem,random=Math.random){let phase='meaning',part=0,queue=[0,1],index=0,attempts=0,failed=new Set(),hadMistake=false,clean=false,done=false;const evidence={meaning:new Set(),lines:new Set()};
  function current(){return done?null:{phase,part,target:queue[index],attempts,clean};}
  function next(){index++;attempts=0;if(index<queue.length)return;if(failed.size){queue=phase==='line'&&clean?shuffle(poem.parts[part],random):shuffle([...failed],random);failed.clear();index=0;return;}
   if(phase==='meaning'){phase='line';queue=shuffle(poem.parts[0],random);index=0;clean=false;return;}
   if(!clean){clean=true;queue=shuffle(poem.parts[part],random);index=0;return;}
   part++;if(part<poem.parts.length){clean=false;queue=shuffle(poem.parts[part],random);index=0;}else done=true;
  }
  function answer(correct){if(done)return {ignored:true};const q=current();if(!correct){hadMistake=true;failed.add(q.target);attempts++;if(attempts>=2){next();return {correct:false,teach:true,advanced:true};}return {correct:false,teach:false,advanced:false};}
   if(attempts)failed.add(q.target);else (phase==='meaning'?evidence.meaning:evidence.lines).add(q.target);next();return {correct:true,advanced:true};
  }
  return {current,answer,get done(){return done;},get hadMistake(){return hadMistake;},get proof(){return done&&evidence.meaning.size===2&&evidence.lines.size===poem.lines.length;}};
 }
 function open(storage,catalog,awarder,now=()=>Date.now()){
  const ids=catalog.poems.map(p=>p.id),valid=new Set(ids),fresh=()=>({version:1,passed:{},reviews:{},mistakes:{},rounds:0,tokens:[],pending:[]});let state=fresh(),error='',blocked=false;
  const integer=n=>Number.isSafeInteger(n)&&n>=0;
  try{const raw=storage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(!s||s.version!==1||!integer(s.rounds)||!s.passed||!s.reviews||!s.mistakes||!Array.isArray(s.tokens)||s.tokens.length>100||!s.tokens.every(x=>typeof x==='string')||!Array.isArray(s.pending)||s.pending.length>100||!s.pending.every(x=>x&&typeof x.token==='string'&&valid.has(x.id))||!Object.entries(s.passed).every(([id,b])=>valid.has(id)&&b===true)||!Object.entries(s.mistakes).every(([id,n])=>valid.has(id)&&integer(n))||!Object.entries(s.reviews).every(([id,r])=>valid.has(id)&&s.passed[id]&&r&&integer(r.stage)&&r.stage<=5&&['nextDue','lastReviewed','lastMistake','masteredAt','mistakes'].every(k=>Number.isFinite(r[k])&&r[k]>=0)))throw Error();state=s;}}
  catch{blocked=true;error='古诗记录暂时无法读取，请家长先备份记录。';}
  const order=()=>GardenCourseOrder.open(ids,{version:1,passed:state.passed});
  const due=()=>GardenWordReview.due(state.reviews,now());
  const active=()=>[...GardenWordReview.active(state.reviews),...Object.keys(state.mistakes).filter(id=>!state.passed[id])];
  function commit(next){if(blocked)return false;try{storage.setItem(KEY,JSON.stringify(next));state=next;error='';return true;}catch{error='古诗记录没有保存成功，请检查存储空间后重试。';return false;}}
  function allowed(id,kind='learn'){return !blocked&&valid.has(id)&&order().allowed(id)&&(kind==='review'?!!state.passed[id]:due().length===0);}
  function miss(id){if(blocked||!valid.has(id))return false;const next=clone(state);next.mistakes[id]=(next.mistakes[id]||0)+1;if(next.reviews[id])GardenWordReview.mistake(next.reviews,id,now());return commit(next);}
  function claim(){let amount=0,bonusAmount=0;if(blocked)return {ok:false,error};for(const pending of [...state.pending]){const reward=awarder('poetry',pending.id,pending.token);if(reward.error)return {ok:false,error:reward.error};if(!reward.amount&&!reward.duplicate)return {ok:false,error:'星星暂时未保存，请重试领取。'};amount+=reward.amount||0;bonusAmount+=reward.bonusAmount||0;const next=clone(state);next.pending=next.pending.filter(x=>x.token!==pending.token);if(!commit(next))return {ok:false,error};}return {ok:true,amount,bonusAmount};}
  function complete(id,round,token,kind='learn'){
   if(blocked||!valid.has(id)||!round?.proof||typeof token!=='string'||!token||token.length>100)return {ok:false,error:error||'完成全部听图和独立接句练习，才算过关。'};
   if(state.tokens.includes(token))return claim();if(!allowed(id,kind))return {ok:false,error:'请先复习错题或完成前一首。'};
   const next=clone(state),time=now();next.passed[id]=true;next.rounds++;next.tokens.push(token);next.tokens=next.tokens.slice(-100);
   if(!next.reviews[id])next.reviews[id]={stage:0,nextDue:time+DAY,lastReviewed:time,lastMistake:round.hadMistake?time:0,masteredAt:0,mistakes:next.mistakes[id]||0};
   else GardenWordReview.settle(next.reviews,[id],new Set(round.hadMistake?[id]:[]),time);
   next.pending.push({id,token});if(!commit(next))return {ok:false,error};return claim();
  }
  return {get state(){return state;},get error(){return error;},get blocked(){return blocked;},due,active,allowed,miss,complete,claim,current:()=>order().current(),passed:id=>!!state.passed[id],frontier:()=>order().frontier()};
 }
 globalThis.PoetryCore=Object.freeze({KEY,shuffle,createRound,open});
})();
