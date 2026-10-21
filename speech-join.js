/* Edge-trimmed derivatives and bounded look-ahead for existing narration queues.
   No timers, playback, scoring, speech events or record writes happen here. */
(()=>{
 const base=new URL('.',document.currentScript.src);
 function resolve(src){try{const url=new URL(src,document.baseURI);if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return src;const path=decodeURIComponent(url.pathname.slice(base.pathname.length)),replacement=globalThis.GardenNaturalVoiceMap?.[path]||globalThis.GardenConciseVoiceMap?.[path]||globalThis.GardenSpeechJoinMap?.[path];return replacement?new URL(replacement,base).href:src;}catch{return src;}}
 function prepare(paths){const list=Array.from(paths),cache=new Map(),native=!!globalThis.HTMLMediaElement&&Audio.prototype instanceof HTMLMediaElement;
  function create(i){if(i>=list.length)return null;if(!cache.has(i)){const clip=new Audio(native&&list.length>1?resolve(list[i]):list[i]);clip.preload='auto';cache.set(i,clip);try{clip.load?.();}catch{}}return cache.get(i);}
  return {get(i){const clip=create(i);create(i+1);create(i+2);cache.delete(i-1);return clip;}};
 }
 globalThis.GardenSpeechJoin=Object.freeze({resolve,prepare});
})();
