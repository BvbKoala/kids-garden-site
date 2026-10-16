/* Display-only: never changes cooked counts, ingredients, medals or ledger tokens. */
(()=>{
 const root=document.getElementById('family-dishes'),room=root.closest('.dining-room');
 const pager=document.createElement('nav');pager.className='table-pages';pager.setAttribute('aria-label','查看其他餐桌');room.after(pager);
 const mobile=matchMedia('(max-width:680px)');let page=0,items=[],counts={},lastToken='',cancelDrag=null;
 const KEY='learning-garden-table-layout-v1',validIds=new Set(GardenRewards.recipes.map(d=>d.id));
 const blank=()=>({version:1,desktop:{},mobile:{}});let layout=blank(),pending={desktop:{},mobile:{}},blocked=false;
 const controls=document.createElement('div');controls.className='table-arrange-tools';controls.innerHTML='<p id="table-arrange-hint">🖐️ 拖动盘子，摆出喜欢的餐桌 · 也可选中盘子后按方向键移动</p><button id="table-reset" type="button">↺ 恢复这桌摆放</button><p id="table-layout-status" role="status" aria-live="polite"></p>';pager.after(controls);
 const message=text=>document.getElementById('table-layout-status').textContent=text;
 function readLayout(){const raw=localStorage.getItem(KEY);if(!raw)return blank();const data=JSON.parse(raw);if(data.version!==1||!['desktop','mobile'].every(mode=>data[mode]&&typeof data[mode]==='object'&&!Array.isArray(data[mode])&&Object.entries(data[mode]).every(([id,pos])=>validIds.has(id)&&pos&&['x','y'].every(k=>Number.isFinite(pos[k])&&pos[k]>=0&&pos[k]<=100))))throw Error('invalid layout');return data;}
 try{layout=readLayout();}catch{blocked=true;message('摆盘记录暂时无法读取。可以移动盘子，原记录会保留。');}
 const mode=()=>mobile.matches?'mobile':'desktop';
 function persist(){if(blocked)return false;try{const latest=readLayout();for(const key of ['desktop','mobile'])for(const [id,pos] of Object.entries(pending[key])){if(pos===null)delete latest[key][id];else latest[key][id]=pos;}localStorage.setItem(KEY,JSON.stringify(latest));layout=latest;pending={desktop:{},mobile:{}};message('摆好啦！下次回来还在这里。');return true;}catch{message('这次摆放暂时没有保存成功，盘子可以继续移动；学习和食材记录不会受影响。');return false;}}
 function remember(id,pos){layout[mode()][id]=pos;pending[mode()][id]=pos;persist();updateReset();}
 function updateReset(){document.getElementById('table-reset').disabled=blocked||![...root.children].some(el=>layout[mode()][el.dataset.dish]);}
 function place(el,pos,base){const scale=Math.max(.7,Math.min(1.2,base.scale+(pos.y-base.y)*.003));el.style.setProperty('--dish-x',pos.x+'%');el.style.setProperty('--dish-y',pos.y+'%');el.style.setProperty('--dish-scale',scale);el.style.zIndex=String(Math.round(pos.y));}
 // Bound the complete vessel and its labels to the wooden surface, including after resizing.
 function bounded(el,pos,base){place(el,pos,base);const box=el.getBoundingClientRect(),surface=room.getBoundingClientRect(),plane=root.getBoundingClientRect();const left=surface.left+surface.width*.025,right=surface.right-surface.width*.025,top=surface.top+surface.height*.33,bottom=surface.top+surface.height*.90;
  const dx=box.left<left?left-box.left:box.right>right?right-box.right:0,dy=box.top<top?top-box.top:box.bottom>bottom?bottom-box.bottom:0;
  const result={x:Math.max(0,Math.min(100,pos.x+dx/plane.width*100)),y:Math.max(0,Math.min(100,pos.y+dy/plane.height*100))};place(el,result,base);return result;
 }
 function draggable(el,plate,d,base){let pos={...(layout[mode()][d.id]||{x:base.x,y:base.y})};if(layout[mode()][d.id])pos=bounded(el,pos,base);
  plate.setAttribute('aria-label','摆放'+d.name+'，按方向键移动');plate.setAttribute('aria-describedby','table-arrange-hint');
  plate.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;cancelDrag?.();el.classList.remove('just-served');const origin={...pos},start={x:e.clientX,y:e.clientY},pointer=e.pointerId,plane=root.getBoundingClientRect();let moved=false;
   const cancel=()=>{el.classList.remove('is-dragging');pos=origin;place(el,pos,base);clean();};
   const move=e=>{if(e.pointerId!==pointer)return;if(!moved&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<4)return;moved=true;el.classList.add('is-dragging');pos=bounded(el,{x:origin.x+(e.clientX-start.x)/plane.width*100,y:origin.y+(e.clientY-start.y)/plane.height*100},base);el.style.zIndex='1000';e.preventDefault();};
   const up=e=>{if(e.pointerId!==pointer)return;el.classList.remove('is-dragging');place(el,pos,base);clean();if(moved)remember(d.id,pos);};
   function clean(){plate.removeEventListener('pointermove',move);plate.removeEventListener('pointerup',up);plate.removeEventListener('pointercancel',cancel);plate.removeEventListener('lostpointercapture',cancel);cancelDrag=null;if(plate.hasPointerCapture(pointer))plate.releasePointerCapture(pointer);}
   cancelDrag=cancel;plate.addEventListener('pointermove',move);plate.addEventListener('pointerup',up);plate.addEventListener('pointercancel',cancel);plate.addEventListener('lostpointercapture',cancel);plate.setPointerCapture(pointer);plate.focus({preventScroll:true});
  });
  plate.addEventListener('keydown',e=>{const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},direction=arrows[e.key];if(!direction)return;e.preventDefault();cancelDrag?.();el.classList.remove('just-served');const step=e.shiftKey?5:2;pos=bounded(el,{x:pos.x+direction[0]*step,y:pos.y+direction[1]*step},base);remember(d.id,pos);});
 }
 document.getElementById('table-reset').onclick=()=>{cancelDrag?.();for(const el of root.children){delete layout[mode()][el.dataset.dish];pending[mode()][el.dataset.dish]=null;}const saved=persist();draw();if(saved)message('这桌已经恢复整齐摆放，其他餐桌保持原样。');};
 let resizeFrame=0;window.addEventListener('resize',()=>{cancelDrag?.();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>draw());});window.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrag?.();});window.addEventListener('pagehide',()=>cancelDrag?.());document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelDrag?.();});
 window.addEventListener('storage',e=>{if(e.key!==KEY)return;cancelDrag?.();try{layout=readLayout();for(const m of ['desktop','mobile'])for(const [id,pos] of Object.entries(pending[m])){if(pos===null)delete layout[m][id];else layout[m][id]=pos;}blocked=false;draw();}catch{blocked=true;message('摆盘记录已变更，暂时无法读取；原记录会保留。');updateReset();}});
 const slots6=[[22,23,.82,-3],[51,19,.78,2],[80,25,.84,-2],[19,73,1.04,2],[50,69,1,-2],[81,75,1.06,3]];
 const slots4=[[29,18,.79,-3],[73,20,.8,2],[27,78,1.03,2],[74,76,1.01,-2]];
 function draw(highlight){
  cancelDrag?.();
  const size=mobile.matches?4:6,pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);
  const visible=items.slice(page*size,(page+1)*size);root.replaceChildren();pager.replaceChildren();document.getElementById('table-empty').hidden=items.length>0;
  room.classList.toggle('table-has-dishes',items.length>0);root.dataset.table=String(page+1);
  let slots=mobile.matches?slots4:slots6;
  if(visible.length===1)slots=[[50,49,1.18,-2]];
  else if(visible.length===2)slots=[[29,47,1,-3],[72,50,1.06,3]];
  else if(visible.length===3)slots=[[26,22,.83,-3],[74,24,.85,2],[50,76,1.05,-2]];
  visible.forEach((d,i)=>{
   const [x,y,scale,angle]=slots[i],el=document.createElement('article');el.className='table-dish'+(d.id===highlight?' just-served':'');el.dataset.dish=d.id;
   el.style.cssText=`--dish-x:${x}%;--dish-y:${y}%;--dish-scale:${scale};--dish-angle:${angle}deg;z-index:${Math.round(y)}`;
   const plate=document.createElement('button');plate.type='button';plate.className='table-plate';
   const img=document.createElement('img');img.src='assets/dishes/table/'+d.id+'.webp';img.alt=d.name;img.draggable=false;img.decoding='async';img.width=512;img.height=512;plate.append(img);plate.insertAdjacentHTML('beforeend',GardenCookingPlay.steam(d.method));
   const label=document.createElement('strong');label.textContent=d.name;const n=document.createElement('small');n.textContent='做过 '+counts[d.id]+' 次';el.append(plate,label,n);root.append(el);draggable(el,plate,d,{x,y,scale});
  });
  pager.hidden=items.length===0;controls.hidden=items.length===0;updateReset();
  for(const [id,text,delta] of [['table-previous','← 上一桌',-1],['table-next','下一桌 →',1]]){
   const b=document.createElement('button');b.id=id;b.type='button';b.textContent=text;b.disabled=delta<0?page===0:page===pages-1;
   b.onclick=()=>{page+=delta;draw();document.getElementById(id)?.focus({preventScroll:true});};pager.append(b);
   if(delta<0){const label=document.createElement('span');label.id='table-page-count';label.setAttribute('role','status');label.textContent=`第 ${page+1} / ${pages} 桌 · 这桌 ${visible.length} 道`;pager.append(label);}
  }
 }
 function render(served,cooked,latest={}){items=served;counts=cooked;let highlight=null;if(latest.token&&latest.token!==lastToken){lastToken=latest.token;const index=items.findIndex(d=>d.id===latest.id);if(index>=0){page=Math.floor(index/(mobile.matches?4:6));highlight=latest.id;}}draw(highlight);}
 mobile.addEventListener('change',()=>{page=0;draw();});globalThis.GardenTableScene={render};
})();
