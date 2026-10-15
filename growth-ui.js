/* Time progresses offline; persist before rendering, never spend inventory. */
(()=>{const r=GardenRewards;
function markup(p){const x=r.growthInfo(p);return x?`<span class="growth-meter ${x.ready?'complete':''}"><progress value="${x.percent}" max="100" aria-label="${x.label}"></progress><small>${x.label}</small></span>`:'';}
globalThis.GardenGrowthUI={markup};
r.syncGrowth();
const refresh=()=>{if(!document.hidden)r.syncGrowth();};
setInterval(()=>{refresh();document.querySelectorAll('[data-growth-clock]').forEach(el=>{const p=JSON.parse(el.dataset.growthClock);el.innerHTML=markup(p);});},30000);
window.addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',refresh);
})();
