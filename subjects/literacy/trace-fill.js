/* Reveal the glyph itself by distance along its median, without an oversized pen cap. */
(() => {
 function projection(point,median){let best=Infinity,along=0,walk=0;for(let i=1;i<median.length;i++){const a=median[i-1],b=median[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),t=length?Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(length*length))):0;const distance=Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy);if(distance<best){best=distance;along=walk+t*length;}walk+=length;}return {distance:best,portion:walk?along/walk:0};}
 function create(board,svg){
  const canvas=document.createElement('canvas');canvas.className='stroke-fill-layer';canvas.setAttribute('aria-hidden','true');board.append(canvas);const ctx=canvas.getContext('2d');let pixels=[],cursor=0,ink=null;
  const matrix=()=>svg.querySelector('g').getScreenCTM();
  function localPoint(e){const m=matrix().inverse();return [m.a*e.clientX+m.c*e.clientY+m.e,m.b*e.clientX+m.d*e.clientY+m.f];}
  function boardPoint(point){const m=matrix(),rect=board.getBoundingClientRect();return [m.a*point[0]+m.c*point[1]+m.e-rect.left-board.clientLeft,m.b*point[0]+m.d*point[1]+m.f-rect.top-board.clientTop];}
  function clear(){ctx.clearRect(0,0,canvas.width,canvas.height);pixels=[];cursor=0;ink=null;board.dataset.strokeFill='0';}
  function prepare(path,median){
   clear();const rect=svg.getBoundingClientRect(),parent=board.getBoundingClientRect(),ratio=Math.min(2,window.devicePixelRatio||1),m=matrix(),inverse=m.inverse();
   canvas.style.left=(rect.left-parent.left-board.clientLeft)+'px';canvas.style.top=(rect.top-parent.top-board.clientTop)+'px';canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';canvas.style.right='auto';canvas.style.bottom='auto';canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);
   ctx.setTransform(m.a*ratio,m.b*ratio,m.c*ratio,m.d*ratio,(m.e-rect.left)*ratio,(m.f-rect.top)*ratio);ctx.fillStyle='#167568';ctx.fill(new Path2D(path));ctx.resetTransform();const coverage=ctx.getImageData(0,0,canvas.width,canvas.height);ctx.clearRect(0,0,canvas.width,canvas.height);ink=ctx.createImageData(canvas.width,canvas.height);
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const offset=(y*canvas.width+x)*4,alpha=coverage.data[offset+3];if(!alpha)continue;const sx=rect.left+(x+.5)/ratio,sy=rect.top+(y+.5)/ratio;const point=[inverse.a*sx+inverse.c*sy+inverse.e,inverse.b*sx+inverse.d*sy+inverse.f];pixels.push({offset,alpha,at:projection(point,median).portion});}
   pixels.sort((a,b)=>a.at-b.at);
  }
  function paint(portion){if(!ink||portion<=0)return;while(cursor<pixels.length&&pixels[cursor].at<=portion){const {offset,alpha}=pixels[cursor++];ink.data[offset]=22;ink.data[offset+1]=117;ink.data[offset+2]=104;ink.data[offset+3]=alpha;}ctx.putImageData(ink,0,0);board.dataset.strokeFill=String(portion);}
  return {prepare,paint,clear,localPoint,boardPoint};
 }
 window.GardenStrokeFill={create,projection};
})();
