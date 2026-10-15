/* Shared wrong-answer book, stored separately from all historical progress. */
(()=>{const KEY='learning-garden-mistakes-v1',copy=x=>JSON.parse(JSON.stringify(x)),DAY=86400000;
 function open(storage,subject,now=()=>Date.now()){
  let state={version:1,subjects:{}},error='',blocked=false;try{const raw=storage.getItem(KEY);if(raw){state=JSON.parse(raw);if(!state||state.version!==1||!state.subjects||Array.isArray(state.subjects)||!Object.values(state.subjects).every(items=>items&&typeof items==='object'&&!Array.isArray(items)&&Object.entries(items).every(([id,r])=>id&&r&&r.payload&&typeof r.payload==='object'&&Number.isSafeInteger(r.stage)&&r.stage>=0&&r.stage<=5&&Number.isSafeInteger(r.mistakes)&&r.mistakes>0&&['nextDue','lastMistake','lastReviewed','masteredAt'].every(k=>Number.isFinite(r[k])&&r[k]>=0))))throw Error();}}
  catch{blocked=true;error='错题本暂时无法读取，请先备份记录。';}
  const records=()=>state.subjects[subject]||{};
  function save(){if(blocked)return false;try{const current=JSON.parse(storage.getItem(KEY)||'{"version":1,"subjects":{}}');if(current.version!==1||!current.subjects||Array.isArray(current.subjects))throw Error();state.subjects={...current.subjects,[subject]:records()};storage.setItem(KEY,JSON.stringify(state));error='';return true;}catch{error='错题本未保存，请家长检查浏览器存储空间。';return false;}}
  function miss(id,payload){if(blocked||!id)return false;state.subjects[subject]=records();const old=records()[id];records()[id]={...old,payload:copy(payload),stage:0,mistakes:(old?.mistakes||0)+1,nextDue:now(),lastMistake:now(),lastReviewed:old?.lastReviewed||0,masteredAt:0};return save();}
  function settle(ids,failed=[]){if(blocked)return false;GardenWordReview.settle(records(),ids,new Set(failed),now());return save();}
  function items(){return Object.entries(records()).filter(([,r])=>r.stage<5).sort((a,b)=>a[1].nextDue-b[1].nextDue).map(([id,r])=>({id,...r}));}
  return {items,miss,settle,flush:save,get error(){return error;},get blocked(){return blocked;},get state(){return state;}};
 }
 globalThis.GardenMistakeBook={KEY,open};
})();
