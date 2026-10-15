/* Shared sequential gates; evidence remains in each subject's original record. */
(() => {
  function open(ids, value, legacyPassed=[]) {
    const valid=new Set(ids), passed={};
    if(value?.version===1&&value.passed&&typeof value.passed==='object'){
      for(const id of ids)if(value.passed[id]===true)passed[id]=true;
    }else for(const id of legacyPassed)if(valid.has(id))passed[id]=true;
    const state={...value,version:1,passed};
    const frontier=()=>{const index=ids.findIndex(id=>passed[id]!==true);return index<0?ids.length:index;};
    const allowed=id=>{const index=ids.indexOf(id);return index>=0&&index<=frontier();};
    return {state,frontier,allowed,current:()=>ids[Math.min(frontier(),ids.length-1)],
      done:id=>passed[id]===true, pass(id){if(!allowed(id))return false;passed[id]=true;return true;}};
  }
  globalThis.GardenCourseOrder=Object.freeze({open});
})();
