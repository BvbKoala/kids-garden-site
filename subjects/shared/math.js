(() => {
const pick=a=>a[Math.floor(Math.random()*a.length)];
function arithmetic(max,operation,carry=false) {
 let a,b,sign=operation==='mixed'?pick(['+','−']):operation==='subtract'?'−':'+';
 if(max===10) {
   a=Math.floor(Math.random()*11);b=Math.floor(Math.random()*(sign==='+'?11-a:a+1));
 } else {
   // Filter by column arithmetic so the family can deliberately choose
   // practice with or without crossing a ten or hundred boundary.
   let valid=false;
   for(let attempt=0;attempt<2000&&!valid;attempt++){
     a=Math.floor(Math.random()*(max+1));b=Math.floor(Math.random()*(sign==='+'?max-a+1:a+1));
     let crossing=false;
     for(let place=10;place<=max;place*=10){
       if(sign==='+'?a%place+b%place>=place:a%place<b%place)crossing=true;
     }
     valid=crossing===carry;
   }
 }
 const answer=sign==='+'?a+b:a-b;
 const candidates=new Set([answer]);
 for(const delta of [1,-1,10,-10,2,-2]){const n=answer+delta;if(n>=0&&n<=max)candidates.add(n);if(candidates.size===3)break;}
 const prompt=`${a} ${sign} ${b} = ?`, speech=`${a}${sign==='+'?'加':'减'}${b}等于多少？`;
 return {id:`${a}${sign}${b}`,prompt,speech,answer:String(answer),options:[...candidates].map(String),explanation:`${a} ${sign} ${b} = ${answer}`,a,b,sign,visual:max<=20?'quantity':'place'};
}
function questions(topic,settings) {
 if(topic==='count')return Array.from({length:10},(_,i)=>({id:'count-'+(i+1),prompt:'数一数，有几个苹果？',speech:'数一数，有几个苹果？',symbol:'🍎',count:i+1,answer:String(i+1),options:[i+1,i===0?2:i,i===0?3:i===9?8:i+2].map(String),explanation:`一共有 ${i+1} 个苹果。`}));
 if(topic==='compare')return Array.from({length:9},(_,i)=>{
   const reverse=Math.random()<0.5,a=reverse?i+2:i+1,b=reverse?i+1:i+2,answer=a>b?'左边':'右边';
   return {id:'compare-'+i,prompt:'哪一边更多？',speech:'数一数，哪一边的苹果更多？',a,b,symbol:'🍎',visual:'compare',answer,options:['左边','右边'],explanation:`${answer}更多，${Math.max(a,b)} 个比 ${Math.min(a,b)} 个多。`};
 });
 if(topic==='shape')return [['圆形','●'],['正方形','■'],['三角形','▲'],['长方形','▬'],['椭圆形','⬭']].map(([answer,symbol],i)=>({id:'shape-'+i,prompt:'这是什么形状？',speech:'这是什么形状？',symbol,answer,options:['圆形','正方形','三角形','长方形','椭圆形'].filter(x=>x===answer||['圆形','正方形','三角形','长方形','椭圆形'].filter(y=>y!==answer).slice(0,2).includes(x)),explanation:`这是${answer}。`}));
 const pool=[],ids=new Set();let attempts=0;
 while(pool.length<5&&attempts++<300){const q=arithmetic(settings.range,topic,settings.carry);if(!ids.has(q.id)){ids.add(q.id);pool.push(q);}}
 return pool;
}
globalThis.GardenMath={questions,arithmetic};
})();
