/* Display-only: never changes cooked counts, ingredients, medals or ledger tokens. */
(()=>{
 const root=document.getElementById('family-dishes'),room=root.closest('.dining-room');
 const pager=document.createElement('nav');pager.className='table-pages';pager.setAttribute('aria-label','查看其他餐桌');room.after(pager);
 const mobile=matchMedia('(max-width:680px)');let page=0,items=[],counts={},lastToken='';
 const slots6=[[22,23,.82,-3],[51,19,.78,2],[80,25,.84,-2],[19,73,1.04,2],[50,69,1,-2],[81,75,1.06,3]];
 const slots4=[[29,18,.79,-3],[73,20,.8,2],[27,78,1.03,2],[74,76,1.01,-2]];
 function draw(highlight){
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
   const plate=document.createElement('div');plate.className='table-plate';
   const img=document.createElement('img');img.src='assets/dishes/table/'+d.id+'.webp';img.alt=d.name;img.decoding='async';img.width=512;img.height=512;plate.append(img);plate.insertAdjacentHTML('beforeend',GardenCookingPlay.steam(d.method));
   const label=document.createElement('strong');label.textContent=d.name;const n=document.createElement('small');n.textContent='做过 '+counts[d.id]+' 次';el.append(plate,label,n);root.append(el);
  });
  pager.hidden=items.length===0;
  for(const [id,text,delta] of [['table-previous','← 上一桌',-1],['table-next','下一桌 →',1]]){
   const b=document.createElement('button');b.id=id;b.type='button';b.textContent=text;b.disabled=delta<0?page===0:page===pages-1;
   b.onclick=()=>{page+=delta;draw();document.getElementById(id)?.focus({preventScroll:true});};pager.append(b);
   if(delta<0){const label=document.createElement('span');label.id='table-page-count';label.setAttribute('role','status');label.textContent=`第 ${page+1} / ${pages} 桌 · 这桌 ${visible.length} 道`;pager.append(label);}
  }
 }
 function render(served,cooked,latest={}){items=served;counts=cooked;let highlight=null;if(latest.token&&latest.token!==lastToken){lastToken=latest.token;const index=items.findIndex(d=>d.id===latest.id);if(index>=0){page=Math.floor(index/(mobile.matches?4:6));highlight=latest.id;}}draw(highlight);}
 mobile.addEventListener('change',()=>{page=0;draw();});globalThis.GardenTableScene={render};
})();
