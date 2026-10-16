/* Shared, local-only reward ledger. English records remain untouched. */
(() => {
  const KEY = 'learning-garden-rewards-v1';
  const catalog = [
    {id:'daisy',name:'小雏菊',symbol:'🌼',cost:10},
    {id:'tulip',name:'郁金香',symbol:'🌷',cost:15},
    {id:'butterfly',name:'蝴蝶',symbol:'🦋',cost:20},
    {id:'rabbit',name:'小兔子',symbol:'🐇',cost:25},
    {id:'tree',name:'苹果树',symbol:'🌳',cost:30},
    {id:'house',name:'花园小屋',symbol:'🏡',cost:40}
  ];
  const crops = [
    {id:'carrot',name:'胡萝卜',symbol:'🥕',cost:3,story:'小兔子最爱的脆脆午餐'},
    {id:'strawberry',name:'草莓',symbol:'🍓',cost:5,story:'把春天装进红色小口袋'},
    {id:'tomato',name:'番茄',symbol:'🍅',cost:4,story:'圆圆红脸蛋，长在绿枝上'},
    {id:'sunflower',name:'向日葵',symbol:'🌻',cost:6,story:'跟着太阳，开一朵笑脸'},
    {id:'pumpkin',name:'南瓜',symbol:'🎃',cost:8,story:'秋天的金色大肚子'},
    {id:'corn',name:'玉米',symbol:'🌽',cost:7,story:'一排排金牙齿，躲在绿衣裳里'}
  ];
  const legacyCropIds=crops.map(c=>c.id);
  const extraCrops=[
  {
    "id": "cabbage",
    "name": "大白菜",
    "symbol": "🥬",
    "cost": 3,
    "group": "叶菜",
    "story": "一层层叶子，抱成大白菜"
  },
  {
    "id": "bokchoy",
    "name": "小青菜",
    "symbol": "🥬",
    "cost": 2,
    "group": "叶菜",
    "story": "小小青菜，绿叶白梗"
  },
  {
    "id": "spinach",
    "name": "菠菜",
    "symbol": "🥬",
    "cost": 3,
    "group": "叶菜",
    "story": "绿叶舒展开，像一把小扇子"
  },
  {
    "id": "lettuce",
    "name": "生菜",
    "symbol": "🥬",
    "cost": 3,
    "group": "叶菜",
    "story": "脆脆叶片，沙拉好伙伴"
  },
  {
    "id": "celery",
    "name": "芹菜",
    "symbol": "🌿",
    "cost": 3,
    "group": "叶菜",
    "story": "细长的梗，带着清清香气"
  },
  {
    "id": "chives",
    "name": "韭菜",
    "symbol": "🌿",
    "cost": 3,
    "group": "叶菜",
    "story": "细细长长，排成绿色小队"
  },
  {
    "id": "water-spinach",
    "name": "空心菜",
    "symbol": "🥬",
    "cost": 3,
    "group": "叶菜",
    "story": "空心的菜梗，长着绿叶子"
  },
  {
    "id": "amaranth",
    "name": "苋菜",
    "symbol": "🥬",
    "cost": 3,
    "group": "叶菜",
    "story": "红绿相间的叶子真漂亮"
  },
  {
    "id": "potato",
    "name": "土豆",
    "symbol": "🥔",
    "cost": 3,
    "group": "根茎",
    "story": "躲在土里的圆圆小宝藏"
  },
  {
    "id": "radish",
    "name": "白萝卜",
    "symbol": "🥕",
    "cost": 3,
    "group": "根茎",
    "story": "白白胖胖，绿叶小帽子"
  },
  {
    "id": "sweet-potato",
    "name": "红薯",
    "symbol": "🍠",
    "cost": 4,
    "group": "根茎",
    "story": "泥土里的香甜小伙伴"
  },
  {
    "id": "yam",
    "name": "山药",
    "symbol": "🥔",
    "cost": 4,
    "group": "根茎",
    "story": "长长的根，躲在土里长大"
  },
  {
    "id": "taro",
    "name": "芋头",
    "symbol": "🥔",
    "cost": 4,
    "group": "根茎",
    "story": "圆圆小芋头，穿着棕色外衣"
  },
  {
    "id": "lotus-root",
    "name": "莲藕",
    "symbol": "🪷",
    "cost": 5,
    "group": "根茎",
    "story": "莲叶底下，藏着带孔的藕"
  },
  {
    "id": "cucumber",
    "name": "黄瓜",
    "symbol": "🥒",
    "cost": 3,
    "group": "瓜果",
    "story": "长长绿瓜，穿着小刺外衣"
  },
  {
    "id": "eggplant",
    "name": "茄子",
    "symbol": "🍆",
    "cost": 4,
    "group": "瓜果",
    "story": "紫色小茄子，戴着绿帽子"
  },
  {
    "id": "pepper",
    "name": "青椒",
    "symbol": "🫑",
    "cost": 3,
    "group": "瓜果",
    "story": "绿绿小灯笼，肚子空空的"
  },
  {
    "id": "bell-pepper",
    "name": "彩椒",
    "symbol": "🫑",
    "cost": 4,
    "group": "瓜果",
    "story": "红黄彩椒，像一串小灯笼"
  },
  {
    "id": "chili",
    "name": "辣椒",
    "symbol": "🌶️",
    "cost": 3,
    "group": "瓜果",
    "story": "细细尖尖，红色小弯钩"
  },
  {
    "id": "zucchini",
    "name": "西葫芦",
    "symbol": "🥒",
    "cost": 4,
    "group": "瓜果",
    "story": "浅绿小瓜，肚子圆滚滚"
  },
  {
    "id": "winter-melon",
    "name": "冬瓜",
    "symbol": "🍈",
    "cost": 4,
    "group": "瓜果",
    "story": "大大冬瓜，穿着绿色外衣"
  },
  {
    "id": "bitter-melon",
    "name": "苦瓜",
    "symbol": "🥒",
    "cost": 4,
    "group": "瓜果",
    "story": "弯弯绿瓜，表皮像小山丘"
  },
  {
    "id": "luffa",
    "name": "丝瓜",
    "symbol": "🥒",
    "cost": 4,
    "group": "瓜果",
    "story": "爬着藤蔓，挂起长长绿瓜"
  },
  {
    "id": "okra",
    "name": "秋葵",
    "symbol": "🌿",
    "cost": 4,
    "group": "瓜果",
    "story": "切开像星星，绿色小尖角"
  },
  {
    "id": "green-bean",
    "name": "豆角",
    "symbol": "🫛",
    "cost": 3,
    "group": "豆类",
    "story": "长长豆荚，挂在藤架上"
  },
  {
    "id": "pea",
    "name": "豌豆",
    "symbol": "🫛",
    "cost": 3,
    "group": "豆类",
    "story": "打开豆荚，圆豆排排坐"
  },
  {
    "id": "broccoli",
    "name": "西兰花",
    "symbol": "🥦",
    "cost": 4,
    "group": "花菜",
    "story": "绿色小树，长在菜地里"
  },
  {
    "id": "cauliflower",
    "name": "花菜",
    "symbol": "🥦",
    "cost": 4,
    "group": "花菜",
    "story": "白色小花团，绿叶围着它"
  },
  {
    "id": "onion",
    "name": "洋葱",
    "symbol": "🧅",
    "cost": 3,
    "group": "葱姜蒜",
    "story": "一层层外衣，圆圆小洋葱"
  },
  {
    "id": "scallion",
    "name": "小葱",
    "symbol": "🌿",
    "cost": 2,
    "group": "葱姜蒜",
    "story": "细长绿色管，下面白白根"
  }
];
  extraCrops.push({id:'ginger',name:'生姜',symbol:'🫚',cost:3,group:'葱姜蒜',story:'地下的姜块，伸出绿色小芽'},{id:'garlic',name:'大蒜',symbol:'🧄',cost:3,group:'葱姜蒜',story:'一瓣瓣蒜，围成白色小球'});
  extraCrops.push({id:'cilantro',name:'香菜',symbol:'🌿',cost:2,group:'葱姜蒜',story:'小小香菜，长出清香绿叶'},...['香菇','平菇','金针菇'].map((name,i)=>({id:['shiitake','oyster-mushroom','enoki'][i],name,symbol:'🍄',cost:4,group:'菌菇',story:'菌种放好，照顾小菇慢慢长大',stages:['刚放菌种','菌丝长啦','小菇朵','成熟啦']})));
  for(const c of crops)c.group=['strawberry','sunflower'].includes(c.id)?'水果与花卉':c.id==='carrot'?'根茎':c.id==='corn'?'谷物':'瓜果';
  crops.push(...extraCrops);
  const previousCropIds=crops.map(c=>c.id);
  crops.push({id:'wheat',name:'小麦',symbol:'🌾',cost:2,group:'谷物',story:'金黄麦穗收回家，磨成面粉做蛋糕',stages:['刚播下麦粒','嫩绿麦苗','青麦抽穗','金黄麦穗']});
  const cropGroups=['全部','叶菜','根茎','瓜果','豆类','谷物','花菜','葱姜蒜','菌菇','水果与花卉'];
  const animals=[
    {id:'chicken',name:'鸡',symbol:'🐔',cost:5,meat:'chickenMeat',extra:'egg'},
    {id:'duck',name:'鸭',symbol:'🦆',cost:6,meat:'duckMeat',extra:'duckEgg'},
    {id:'goose',name:'鹅',symbol:'🪿',cost:7,meat:'gooseMeat',extra:'gooseEgg'},
    {id:'fish',name:'鱼',symbol:'🐟',cost:5,meat:'fishMeat'},
    {id:'pig',name:'猪',symbol:'🐷',cost:8,meat:'pork'},
    {id:'cow',name:'牛',symbol:'🐮',cost:10,meat:'beef',extra:'milk'},
    {id:'sheep',name:'羊',symbol:'🐑',cost:8,meat:'lamb',extra:'sheepMilk'}
  ];
  const babyNames={chicken:'小鸡',duck:'小鸭',goose:'小鹅',fish:'小鱼苗',pig:'小猪',cow:'小牛犊',sheep:'小羊羔'};
  for(const a of animals)a.babyName=babyNames[a.id];
  const ingredients=[...crops.map(c=>({id:c.id,name:c.id==='sunflower'?'葵花籽':c.name,symbol:c.symbol,source:'crop'})),
    ...[['chickenMeat','鸡肉','🍗'],['duckMeat','鸭肉','🍖'],['gooseMeat','鹅肉','🍖'],['fishMeat','鱼肉','🐟'],['pork','猪肉','🥩'],['beef','牛肉','🥩'],['lamb','羊肉','🥩'],['egg','鸡蛋','🥚'],['duckEgg','鸭蛋','🥚'],['gooseEgg','鹅蛋','🥚'],['milk','牛奶','🥛'],['sheepMilk','羊奶','🥛']].map(([id,name,symbol])=>({id,name,symbol,source:'animal'})),{id:'flour',name:'面粉',symbol:'🥣',source:'processed'}];
  // Rice, oil and seasoning are the kitchen's free everyday cupboard.
  const recipes=[
    ['胡萝卜浓汤','蔬菜','煮','carrot','清水'],
    ['香甜玉米杯','蔬菜','蒸','corn',''],
    ['南瓜小米粥','蔬菜','煮','pumpkin','小米'],
    ['番茄米饭','蔬菜','煮','tomato','大米'],
    ['胡萝卜玉米汤','蔬菜','煮','carrot corn','清水'],
    ['田园南瓜饭','蔬菜','蒸','pumpkin corn','大米'],
    ['番茄胡萝卜汤','蔬菜','煮','tomato carrot','清水'],
    ['烤南瓜小船','蔬菜','烤','pumpkin sunflower',''],
    ['五彩田园沙拉','蔬菜','拌','tomato carrot corn','沙拉酱'],
    ['草莓葵花籽沙拉','蔬菜','拌','strawberry sunflower',''],
    ['番茄炒鸡蛋','蛋奶','炒','tomato egg','食用油'],
    ['玉米鸡蛋羹','蛋奶','蒸','corn egg','清水'],
    ['南瓜牛奶浓汤','蛋奶','煮','pumpkin milk',''],
    ['草莓牛奶杯','蛋奶','拌','strawberry milk',''],
    ['胡萝卜鸡蛋饼','蛋奶','煎','carrot egg','面粉'],
    ['玉米牛奶布丁','蛋奶','蒸','corn milk egg',''],
    ['番茄鸭蛋面','蛋奶','煮','tomato duckEgg','面条'],
    ['南瓜鹅蛋饼','蛋奶','煎','pumpkin gooseEgg','面粉'],
    ['草莓羊奶杯','蛋奶','拌','strawberry sheepMilk',''],
    ['葵花籽牛奶燕麦','蛋奶','拌','sunflower milk','燕麦'],
    ['玉米鸡肉汤','禽肉','煮','corn chickenMeat','清水'],
    ['胡萝卜炖鸡','禽肉','炖','carrot chickenMeat',''],
    ['番茄鸡肉面','禽肉','煮','tomato chickenMeat','面条'],
    ['南瓜蒸鸡','禽肉','蒸','pumpkin chickenMeat',''],
    ['葵花籽鸡肉饼','禽肉','煎','sunflower chickenMeat egg','面粉'],
    ['胡萝卜炖鸭','禽肉','炖','carrot duckMeat',''],
    ['南瓜烤鸭','禽肉','烤','pumpkin duckMeat',''],
    ['玉米鸭肉汤','禽肉','煮','corn duckMeat','清水'],
    ['番茄炖鹅','禽肉','炖','tomato gooseMeat',''],
    ['胡萝卜玉米鹅肉汤','禽肉','煮','carrot corn gooseMeat','清水'],
    ['番茄鱼汤','鱼鲜','煮','tomato fishMeat','清水'],
    ['玉米蒸鱼','鱼鲜','蒸','corn fishMeat',''],
    ['南瓜鱼肉粥','鱼鲜','煮','pumpkin fishMeat','大米'],
    ['胡萝卜鱼肉饼','鱼鲜','煎','carrot fishMeat egg','面粉'],
    ['番茄玉米烤鱼','鱼鲜','烤','tomato corn fishMeat',''],
    ['胡萝卜炖猪肉','肉香','炖','carrot pork',''],
    ['玉米猪肉丸','肉香','蒸','corn pork egg',''],
    ['南瓜蒸肉','肉香','蒸','pumpkin pork',''],
    ['番茄猪肉面','肉香','煮','tomato pork','面条'],
    ['胡萝卜猪肉饺子','肉香','煮','carrot pork','饺子皮'],
    ['番茄炖牛肉','肉香','炖','tomato beef',''],
    ['胡萝卜牛肉饭','肉香','煮','carrot beef','大米'],
    ['南瓜牛肉汤','肉香','煮','pumpkin beef','清水'],
    ['玉米牛肉饼','肉香','煎','corn beef egg','面粉'],
    ['番茄玉米牛肉锅','肉香','炖','tomato corn beef',''],
    ['胡萝卜炖羊肉','肉香','炖','carrot lamb',''],
    ['南瓜羊肉饭','肉香','蒸','pumpkin lamb','大米'],
    ['玉米羊肉汤','肉香','煮','corn lamb','清水'],
    ['番茄羊肉面','肉香','煮','tomato lamb','面条'],
    ['田园羊肉小锅','肉香','炖','carrot pumpkin corn lamb',''],
    ['草莓蛋糕','蛋奶','烤','strawberry egg milk','面粉、糖、黄油和淡奶油'],
    ["白菜香菇炖肉", "肉香", "炖", "cabbage shiitake pork", ""],
    ["蒜香小青菜", "蔬菜", "炒", "bokchoy garlic", "食用油"],
    ["菠菜鸡蛋面", "蛋奶", "煮", "spinach egg", "面条"],
    ["生菜黄瓜沙拉", "蔬菜", "拌", "lettuce cucumber tomato", "沙拉酱"],
    ["芹菜牛肉丝", "肉香", "炒", "celery beef onion", "食用油"],
    ["韭菜鸡蛋饼", "蛋奶", "煎", "chives egg", "面粉"],
    ["蒜蓉空心菜", "蔬菜", "炒", "water-spinach garlic", "食用油"],
    ["苋菜蘑菇汤", "蔬菜", "煮", "amaranth oyster-mushroom", "清水"],
    ["土豆彩椒鸡丁", "禽肉", "炒", "potato bell-pepper chickenMeat", "食用油"],
    ["萝卜莲藕排骨汤", "肉香", "炖", "radish lotus-root pork", "清水"],
    ["茄子青椒焖肉", "肉香", "炖", "eggplant pepper pork", "酱油"],
    ["西葫芦鸭蛋饼", "蛋奶", "煎", "zucchini duckEgg", "面粉"],
    ["冬瓜鱼片汤", "鱼鲜", "煮", "winter-melon fishMeat ginger", "清水"],
    ["苦瓜煎蛋", "蛋奶", "煎", "bitter-melon egg", "食用油"],
    ["丝瓜平菇汤", "蔬菜", "煮", "luffa oyster-mushroom", "清水"],
    ["秋葵豌豆炒蛋", "蛋奶", "炒", "okra pea egg", "食用油"],
    ["豆角炒肉", "肉香", "炒", "green-bean pork garlic", "食用油"],
    ["双花烩牛肉", "肉香", "炖", "broccoli cauliflower beef", "清水"],
    ["葱香香菜蒸鱼", "鱼鲜", "蒸", "cilantro scallion ginger fishMeat", "酱油"],
    ["微辣金针菇鸭煲", "禽肉", "炖", "enoki chili duckMeat", "酱油"],
    ["草莓奶冻杯", "甜品", "拌", "strawberry milk", "预调凝胶基底、糖"],
    ["红薯奶香布丁", "甜品", "蒸", "sweet-potato milk egg", "糖"],
    ["芋泥小蛋糕", "甜品", "烤", "taro egg milk", "面粉、黄油、糖"],
    ["山药草莓小方", "甜品", "蒸", "yam strawberry milk", "米粉、糖"],
    ["南瓜芝麻汤圆", "甜品", "煮", "pumpkin milk", "糯米粉、黑芝麻、糖"],
    ["玉米奶香松饼", "甜品", "煎", "corn egg milk", "面粉、糖"],
    ["葵花籽香脆饼", "甜品", "烤", "sunflower egg", "面粉、黄油、糖"],
    ["草莓山药慕斯", "甜品", "拌", "yam strawberry sheepMilk", "预调凝胶基底、淡奶油、糖"],
    ["甜薯芋圆", "甜品", "煮", "sweet-potato taro milk", "木薯淀粉、糖"],
    ["焦香羊奶蛋挞", "甜品", "烤", "egg sheepMilk", "蛋挞皮、糖"]
  ].map(([name,group,method,items,pantry],i)=>({id:'dish-'+String(i+1).padStart(2,'0'),name,group,method,pantry,needs:Object.fromEntries(items.split(' ').map(id=>[id,1])),sides:group==='甜品'?[]:([1,4,5,6,7,9,11,12,15,17,18].includes(i+1)||i+1>=21)?extraCrops.map(c=>c.id):[],image:'assets/dishes/dish-'+String(i+1).padStart(2,'0')+'.jpg',symbol:({蔬菜:'🥗',蛋奶:'🍮',禽肉:'🍗',鱼鲜:'🐟',肉香:'🍲',甜品:'🧁'})[group]}));
  for(const dish of recipes){if(dish.pantry.includes('面粉')){dish.needs.flour=1;dish.pantry=dish.pantry.replace(/面粉[、，]?/g,'');}}
  const freshHome=f=>({version:1,millingVersion:1,animals:Object.fromEntries(animals.map(a=>[a.id,a.id==='chicken'?1:0])),feed:6,pens:Array(6).fill(null),ingredients:Object.fromEntries(ingredients.filter(i=>i.source!=='crop').map(i=>[i.id,0])),cooked:{},cropTotal:{...f.harvest},tokens:[]});
  const validClock=p=>['growthAt','productionAt'].every(k=>p[k]===undefined||(Number.isSafeInteger(p[k])&&p[k]>=0));
  const validPen=p=>p===null||(p&&validClock(p)&&animals.some(a=>a.id===p.animal)&&count(p.stage)&&p.stage<=3&&(p.productionFeeds===undefined||(p.stage===3&&count(p.productionFeeds)&&p.productionFeeds<=3)));
  // Old four-slot layouts are mapped in memory; reading never overwrites records.
  function upgradeRanch(h){
    if(h.pens.length!==4)return;
    const fish=h.pens.filter(p=>p?.animal==='fish');
    h.pens=h.pens.map(p=>p?.animal==='fish'?null:p).concat([fish[0]||null,fish[1]||null]);
    if(fish.length>2)h.waitingFish=[...(h.waitingFish||[]),...fish.slice(2)];
  }
  function validHome(h){return h&&h.version===1&&h.millingVersion===1&&count(h.feed)&&h.animals&&h.ingredients&&h.cropTotal&&h.cooked&&typeof h.cooked==='object'&&!Array.isArray(h.cooked)&&animals.every(a=>count(h.animals[a.id]))&&ingredients.filter(i=>i.source!=='crop').every(i=>count(h.ingredients[i.id]))&&crops.every(c=>count(h.cropTotal[c.id]))&&Object.entries(h.cooked).every(([id,n])=>recipes.some(r=>r.id===id)&&count(n))&&Array.isArray(h.tokens)&&h.tokens.length<=100&&h.tokens.every(t=>typeof t==='string')&&Array.isArray(h.pens)&&[4,6].includes(h.pens.length)&&h.pens.every(validPen)&&(h.waitingFish===undefined||(Array.isArray(h.waitingFish)&&h.waitingFish.length<=4&&h.waitingFish.every(p=>validPen(p)&&p?.animal==='fish')))&&(h.pens.length===4||h.pens.every((p,i)=>!p||(p.animal==='fish')===(i>=4)));}
  const supplies=[...crops.map(c=>({...c,kind:'seed',quantity:1})),
    {id:'water',name:'清水 × 10',symbol:'💧',cost:1,quantity:10,story:'每浇一次，长大一步'},
    {id:'fertilizer',name:'肥料 × 10',symbol:'🪴',cost:1,quantity:10,story:'每块地可用一次，长大两步'}];
  const feedSupply={id:'feed',name:'饲料 × 10',cost:1,quantity:10};
  const freshFarm=()=>({version:1,catalogVersion:3,seeds:Object.fromEntries(crops.map(c=>[c.id,c.id==='carrot'?2:0])),water:6,fertilizer:1,plots:Array(6).fill(null),harvest:Object.fromEntries(crops.map(c=>[c.id,0]))});
  const count=n=>Number.isSafeInteger(n)&&n>=0;
  function validFarm(f){return f&&f.version===1&&f.catalogVersion===3&&count(f.water)&&count(f.fertilizer)&&f.seeds&&f.harvest&&crops.every(c=>count(f.seeds[c.id])&&count(f.harvest[c.id]))&&Array.isArray(f.plots)&&f.plots.length===6&&f.plots.every(p=>p===null||(p&&validClock(p)&&crops.some(c=>c.id===p.crop)&&count(p.stage)&&p.stage<=3&&(p.productionFeeds===undefined||(p.stage===3&&count(p.productionFeeds)&&p.productionFeeds<=3))&&typeof p.fertilized==='boolean'));}
  // Add only new catalog counters in memory. Never repair/reset legacy counters.
  function upgradeCropCatalog(s){
    const f=s.farm;if(!f||f.catalogVersion!==undefined)return;
    if(!f.seeds||!f.harvest||Array.isArray(f.seeds)||Array.isArray(f.harvest)||!legacyCropIds.every(id=>count(f.seeds[id])&&count(f.harvest[id])))throw Error();
    if(s.homestead&&(!s.homestead.cropTotal||Array.isArray(s.homestead.cropTotal)||!legacyCropIds.every(id=>count(s.homestead.cropTotal[id]))))throw Error();
    for(const c of extraCrops){
      if(!Object.hasOwn(f.seeds,c.id))f.seeds[c.id]=0;
      if(!Object.hasOwn(f.harvest,c.id))f.harvest[c.id]=0;
      if(s.homestead&&!Object.hasOwn(s.homestead.cropTotal,c.id))s.homestead.cropTotal[c.id]=0;
    }
    f.catalogVersion=2;
  }
  const blank = () => ({version:1,earned:0,spent:0,owned:[],placed:[],discoveries:[],days:{},events:[],legacyImported:false});
  let error = '';
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const s = JSON.parse(raw);
      if (s.version!==1 || !Number.isSafeInteger(s.earned) || !Number.isSafeInteger(s.spent) || s.spent<0 || s.earned<s.spent || !['owned','placed','discoveries','events'].every(k=>Array.isArray(s[k])) || !s.days || typeof s.days!=='object') throw Error();
      if (typeof s.legacyImported!=='boolean' || !s.owned.every(id=>catalog.some(i=>i.id===id)) || !s.placed.every(id=>s.owned.includes(id)) || !s.discoveries.every(id=>typeof id==='string') || !s.events.every(e=>e && typeof e.type==='string' && typeof e.detail==='string' && Number.isSafeInteger(e.amount) && typeof e.date==='string') || !Object.values(s.days).every(d=>d && Number.isSafeInteger(d.points) && d.points>=0 && Number.isSafeInteger(d.rounds) && d.rounds>=0 && Array.isArray(d.subjects) && (d.checkInBonusClaimed===undefined||typeof d.checkInBonusClaimed==='boolean'))) throw Error();
      if(s.settled!==undefined&&(!Array.isArray(s.settled)||!s.settled.every(id=>typeof id==='string')))throw Error();
      upgradeCropCatalog(s);
      if(s.farm?.catalogVersion===2){const f=s.farm;if(!previousCropIds.every(id=>count(f.seeds?.[id])&&count(f.harvest?.[id])))throw Error();
        if(s.homestead&&!previousCropIds.every(id=>count(s.homestead.cropTotal?.[id])))throw Error();
        for(const map of [f.seeds,f.harvest,s.homestead?.cropTotal].filter(Boolean)){if(!Object.hasOwn(map,'wheat'))map.wheat=0;}f.catalogVersion=3;
      }
      if(s.homestead&&s.homestead.millingVersion===undefined){const h=s.homestead;if(!h.ingredients||Array.isArray(h.ingredients))throw Error();if(!Object.hasOwn(h.ingredients,'flour'))h.ingredients.flour=0;h.millingVersion=1;}
      if(s.farm!==undefined&&!validFarm(s.farm))throw Error();
      if(s.homestead!==undefined&&(!s.farm||!validHome(s.homestead)))throw Error();
      if(s.homestead)upgradeRanch(s.homestead);
      error='';return s;
    } catch { error='学习奖励暂时无法读取，请家长先备份记录。'; return null; }
  }
  function save(s) {
    try { localStorage.setItem(KEY,JSON.stringify(s));error='';if(typeof globalThis.dispatchEvent==='function'&&typeof Event==='function')globalThis.dispatchEvent(new Event('garden-rewards-changed'));return true; }
    catch { error='奖励没有保存成功，请家长检查浏览器存储空间。';return false; }
  }
  const dayKey = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function record(s,type,amount,detail) {s.events.push({type,amount,detail,date:new Date().toISOString()});s.events=s.events.slice(-200);}
  const GROWTH_MS=6*60*60*1000;
  function advanceGrowth(s,initialize=false,now=Date.now()){
    let changed=false;
    function advance(p,key,field){
      if(p[key]===undefined){if(initialize){p[key]=now;changed=true;}return;}
      const steps=Math.min(3-p[field],Math.floor(Math.max(0,now-p[key])/GROWTH_MS));
      if(steps>0){p[field]+=steps;p[key]+=steps*GROWTH_MS;changed=true;}
    }
    for(const p of s.farm?.plots||[])if(p&&p.stage<3)advance(p,'growthAt','stage');
    for(const p of [...(s.homestead?.pens||[]),...(s.homestead?.waitingFish||[])])if(p){
      if(p.stage<3)advance(p,'growthAt','stage');
      // Adult egg/milk animals start their next cycle only after collection.
      if(p.stage===3&&p.productionFeeds!==undefined&&p.productionFeeds<3)advance(p,'productionAt','productionFeeds');
    }
    return changed;
  }
  function syncGrowth(){const s=read();if(!s)return {ok:false,error};return advanceGrowth(s,true)?{ok:save(s),error}:{ok:true};}
  function growthInfo(p){
    if(!p)return null;
    const producing=p.stage===3&&p.productionFeeds!==undefined&&p.productionFeeds<3;
    const ready=p.stage===3&&!producing,at=p[producing?'productionAt':'growthAt'];
    const elapsed=at===undefined?0:Math.max(0,Date.now()-at),remaining=Math.max(0,GROWTH_MS-elapsed);
    const minutes=Math.ceil(remaining/60000),time=(Math.floor(minutes/60)?Math.floor(minutes/60)+'小时':'')+(minutes%60?minutes%60+'分钟':'');
    return {ready,producing,percent:ready?100:Math.min(100,elapsed/GROWTH_MS*100),label:ready?'已长成 · 可以收获':(producing?'产出':'成长')+' '+Math.round(Math.min(1,elapsed/GROWTH_MS)*100)+'% · '+(time||'即将')+'后'+(producing?'推进产出':'升一级')};
  }
  function snapshot() {const s=read();if(s)advanceGrowth(s);return s ? {...s,balance:s.earned-s.spent,error} : {...blank(),balance:0,error};}
  const dailySubjects=['english','literacy','math','knowledge','poetry'];
  function dailyCheckIn(){const s=read(),day=dayKey(),d=s?.days[day];const subjects=d?dailySubjects.filter(id=>d.subjects.includes(id)):[];return {day,subjects,complete:subjects.length===dailySubjects.length,claimed:!!d?.checkInBonusClaimed,bonus:5,error};}
  function addCheckInBonus(s,day,daily){daily.checkInBonusClaimed=true;daily.points+=5;s.earned+=5;record(s,'daily-checkin',5,day);}
  function claimDailyCheckIn(){const s=read();if(!s)return {amount:0,error};const day=dayKey(),daily=s.days[day];if(!daily||!dailySubjects.every(id=>daily.subjects.includes(id)))return {amount:0,error:'今天的五科还没全部完成哦。'};if(daily.checkInBonusClaimed)return {amount:0,duplicate:true};if(!Number.isSafeInteger(s.earned+5)||!Number.isSafeInteger(daily.points+5))return {amount:0,error:'星星记录暂时无法保存。'};addCheckInBonus(s,day,daily);return save(s)?{amount:5,balance:s.earned-s.spent}:{amount:0,error};}
  function award(subject,topic,eventId) {
    const s=read();if(!s)return {amount:0,error};
    if(typeof eventId!=='string'||!eventId||s.events.some(e=>e.id===eventId)||s.settled?.includes(eventId))return {amount:0,duplicate:true};
    const day=dayKey(), daily=s.days[day]||{points:0,rounds:0,subjects:[]};
    const discovery=`${subject}:${topic}`;
    const fresh=!s.discoveries.includes(discovery);
    const amount=1,bonusAmount=!daily.checkInBonusClaimed&&dailySubjects.every(id=>id===subject||daily.subjects.includes(id))?5:0;
    if(!Number.isSafeInteger(s.earned+1+bonusAmount)||!Number.isSafeInteger(daily.points+1+bonusAmount)||!Number.isSafeInteger(daily.rounds+1))return {amount:0,error:'星星记录暂时无法保存，请家长检查记录。'};
    s.settled=s.settled||s.events.filter(e=>typeof e.id==='string').map(e=>e.id);s.settled.push(eventId);
    daily.points+=amount;daily.rounds++;if(!daily.subjects.includes(subject))daily.subjects.push(subject);
    s.days[day]=daily;if(fresh)s.discoveries.push(discovery);s.earned+=amount;
    record(s,'round',amount,`${subject}:${topic}`);s.events.at(-1).id=eventId;
    if(bonusAmount)addCheckInBonus(s,day,daily);
    if(!save(s))return {amount:0,error};
    return {amount,bonusAmount,totalAmount:amount+bonusAmount,balance:s.earned-s.spent,rest:daily.rounds>=3,capped:false};
  }
  function buy(id) {
    const item=catalog.find(i=>i.id===id),s=read();
    if(!item||!s)return {ok:false,error:error||'找不到这件装饰'};
    if(s.owned.includes(id))return {ok:false,error:'已经拥有啦'};
    if(s.earned-s.spent<item.cost)return {ok:false,error:'星星还不够，慢慢来。'};
    s.spent+=item.cost;s.owned.push(id);s.placed.push(id);record(s,'decorate',-item.cost,id);
    return {ok:save(s),error};
  }
  function toggle(id) {const s=read();if(!s||!s.owned.includes(id))return false;s.placed=s.placed.includes(id)?s.placed.filter(x=>x!==id):[...s.placed,id];return save(s);}
  function farmState(){const s=snapshot();return {...s,farm:s.farm||freshFarm()};}
  // Farm purchases and inventory share the existing ledger: a single atomic write.
  function farmAction(action,index,cropId,purchaseCount=1){
    const s=read();if(!s)return {ok:false,error};advanceGrowth(s,true);
    const f=s.farm||freshFarm();s.farm=f;
    const reject=message=>({ok:false,error:message});
    let message='';
    if(action==='buy'){
      const item=supplies.find(i=>i.id===cropId);if(!item)return reject('找不到这件物品。');
      if(!Number.isSafeInteger(purchaseCount)||purchaseCount<1)return reject('请选择正确的兑换数量。');
      const total=item.cost*purchaseCount,quantity=item.quantity*purchaseCount;
      if(!Number.isSafeInteger(total)||!Number.isSafeInteger(quantity)||!Number.isSafeInteger(s.spent+total))return reject('兑换数量太多啦。');
      if(s.earned-s.spent<total)return reject('星星还不够，先去完成一次学习小冒险吧。');
      const old=item.kind==='seed'?f.seeds[item.id]:f[item.id];
      if(!Number.isSafeInteger(old+quantity))return reject('仓库已经装满啦。');
      s.spent+=total;if(item.kind==='seed')f.seeds[item.id]+=quantity;else f[item.id]+=quantity;
      record(s,'farm-buy',-total,item.id);message=`${item.name} × ${purchaseCount}，放进仓库啦！`;
    }else{
      if(!Number.isInteger(index)||index<0||index>=6)return reject('请选一块菜地。');
      const plot=f.plots[index];
      if(action==='plant'){
        const crop=crops.find(c=>c.id===cropId);if(!crop)return reject('先选一种种子吧。');
        if(plot)return reject('这块地已经种好啦。');if(!f.seeds[cropId])return reject('这种种子用完啦，可以去种子铺兑换。');
        f.seeds[cropId]--;f.plots[index]={crop:cropId,stage:0,fertilized:false,growthAt:Date.now()};message=`种下${crop.name}啦！给它浇点水吧。`;
      }else{
        if(!plot)return reject('这块地还没播种呢。');
        const crop=crops.find(c=>c.id===plot.crop);
        if(action==='harvest'){
          if(plot.stage!==3)return reject('还没成熟，再照顾一下吧。');
          if(!Number.isSafeInteger(f.harvest[plot.crop]+1))return reject('收获篮已经装满啦。');
          if(s.homestead){if(!Number.isSafeInteger(s.homestead.cropTotal[plot.crop]+1))return reject('植物图鉴已经装满啦。');s.homestead.cropTotal[plot.crop]++;}
          f.harvest[plot.crop]++;f.plots[index]=null;record(s,'farm-harvest',0,plot.crop);message=`收获一份${crop.name}！收获篮又丰富啦！`;
        }else{
          if(plot.stage===3)return reject('已经成熟啦，用收获篮采下来吧。');
          if(action==='water'){if(!f.water)return reject('清水用完啦，去补给兑换站兑换吧。');f.water--;plot.stage++;message='咕嘟咕嘟，喝饱水又长大一步！';}
          else if(action==='fertilize'){if(plot.fertilized)return reject('这块地已经施过肥啦，再浇点水吧。');if(!f.fertilizer)return reject('肥料用完啦，去补给兑换站兑换吧。');f.fertilizer--;plot.fertilized=true;plot.stage=Math.min(3,plot.stage+2);message='营养加油站！一下长大两步。';}
          else return reject('请先选一个工具。');
          plot.growthAt=Date.now();
          if(plot.stage===3)message=`${crop.name}成熟啦！换收获篮来采摘吧。`;
        }
      }
    }
    return save(s)?{ok:true,message}:{ok:false,error};
  }
  function kitchenState(){const s=farmState();return {...s,homestead:s.homestead||freshHome(s.farm)};}
  function available(s,id){return crops.some(c=>c.id===id)?s.farm.harvest[id]:s.homestead.ingredients[id];}
  function missing(s,recipe){return Object.entries(recipe.needs).filter(([id,n])=>available(s,id)<n).map(([id,n])=>({...ingredients.find(i=>i.id===id),quantity:n-available(s,id)}));}
  function homeAction(action,index,id,token,side,purchaseCount=1){
    const s=read();if(!s)return {ok:false,error};advanceGrowth(s,true);
    s.farm=s.farm||freshFarm();s.homestead=s.homestead||freshHome(s.farm);
    const f=s.farm,h=s.homestead,reject=error=>({ok:false,error});let message='';
    if(action==='grind'){
      if(typeof token!=='string'||!token||token.length>100)return reject('请重新打开小磨坊。');
      if(h.tokens.includes(token))return reject('这份面粉已经收好啦。');
      if(!f.harvest.wheat)return reject('还没有小麦，先去农场收获吧。');
      if(!Number.isSafeInteger(h.ingredients.flour+1))return reject('面粉仓库装满啦。');
      f.harvest.wheat--;h.ingredients.flour++;h.tokens.push(token);h.tokens=h.tokens.slice(-100);record(s,'mill',0,'wheat:flour');message='一份小麦磨成一份面粉啦，可以做蛋糕了！';
    }else if(action==='buy'){
      const a=animals.find(a=>a.id===id),cost=a?a.cost:id===feedSupply.id?feedSupply.cost:0;
      if(!cost)return reject('找不到这件牧场物品。');
      if(!Number.isSafeInteger(purchaseCount)||purchaseCount<1)return reject('请选择正确的兑换数量。');
      const total=cost*purchaseCount,quantity=(a?1:feedSupply.quantity)*purchaseCount;
      if(!Number.isSafeInteger(total)||!Number.isSafeInteger(quantity)||!Number.isSafeInteger(s.spent+total))return reject('兑换数量太多啦。');
      if(s.earned-s.spent<total)return reject('星星还不够，慢慢学习再来吧。');
      const old=a?h.animals[id]:h.feed;if(!Number.isSafeInteger(old+quantity))return reject('仓库装满啦。');
      s.spent+=total;if(a)h.animals[id]+=quantity;else h.feed+=quantity;record(s,'ranch-buy',-total,id);message=a?`${a.babyName} × ${quantity} 来到牧场啦！`:`${quantity} 份饲料装好啦！`;
    }else if(action==='cook'){
      const recipe=recipes.find(r=>r.id===id);if(!recipe)return reject('找不到这道菜。');
      if(typeof token!=='string'||!token||token.length>100)return reject('请重新打开这道菜。');
      if(h.tokens.includes(token))return reject('这一份已经装盘啦。');
      if(side!==undefined&&side!==''&&(!recipe.sides.includes(side)||!count(f.harvest[side])||f.harvest[side]<1))return reject('选中的农场配料还没收获，或不适合这道菜。');
      const lack=missing(s,recipe);if(lack.length)return reject('还缺：'+lack.map(i=>i.name+' × '+i.quantity).join('、'));
      if(!Number.isSafeInteger((h.cooked[id]||0)+1))return reject('菜品记录已经装满啦。');
      for(const [key,n] of Object.entries(recipe.needs)){if(crops.some(c=>c.id===key))f.harvest[key]-=n;else h.ingredients[key]-=n;}
      if(side)f.harvest[side]--;
      const first=!h.cooked[id];h.cooked[id]=(h.cooked[id]||0)+1;h.tokens.push(token);h.tokens=h.tokens.slice(-100);record(s,'cook',0,id);
      message=first?`🏅 ${recipe.name}做好啦！新勋章点亮！`:`${recipe.name}又做好一份啦！`;
    }else{
      if(!Number.isInteger(index)||index<0||index>=6)return reject('请选择一个小窝。');
      const pen=h.pens[index];
      if(action==='adopt'){
        const a=animals.find(a=>a.id===id);if(!a)return reject('先选一种动物。');if(pen)return reject('这个小窝已经有伙伴啦。');if((id==='fish')!==(index>=4))return reject(index>=4?'池塘只住小鱼，请选择小鱼苗。':'陆地伙伴住草地，小鱼要住池塘。');if(id==='fish'&&h.waitingFish?.length){h.pens[index]=h.waitingFish.shift();return save(s)?{ok:true,message:'原来的小鱼搬进池塘啦，成长进度保留。'}:{ok:false,error};}if(!h.animals[id])return reject('先到牧场商店兑换动物宝宝吧。');
        h.animals[id]--;h.pens[index]={animal:id,stage:0,growthAt:Date.now()};message=`${a.babyName}住进小窝啦！先喂一顿饭。`;
      }else{
        if(!pen)return reject('这个小窝还是空的。');const a=animals.find(a=>a.id===pen.animal);
        if(action==='collect-meat'||action==='collect-extra'){
          if(pen.stage!==3)return reject('还没长大，先照顾它吧。');const food=action==='collect-meat'?a.meat:a.extra;
          if(!food)return reject('这位伙伴没有蛋奶产出。');
          if(action==='collect-extra'&&pen.productionFeeds!==undefined&&pen.productionFeeds<3)return reject('蛋奶还没准备好，再喂养 '+(3-pen.productionFeeds)+' 次吧。');
          const quantity=action==='collect-meat'?meatYield:1;if(!Number.isSafeInteger(h.ingredients[food]+quantity))return reject('食材仓库装满啦。');
          h.ingredients[food]+=quantity;if(action==='collect-meat')h.pens[index]=null;else {pen.productionFeeds=0;pen.productionAt=Date.now();}
          record(s,'ranch-collect',0,food);message=`获得${ingredients.find(i=>i.id===food).name} × ${quantity}，可以去厨房啦！${action==='collect-meat'?'小窝空出来，可以养下一只。':'伙伴保持成年，再喂养 3 次就能收下一份蛋奶。'}`;
        }else{
          const producing=pen.stage===3&&a.extra&&pen.productionFeeds!==undefined&&pen.productionFeeds<3;
          if(pen.stage===3&&!producing)return reject('已经准备好啦，领取食材吧。');
          if(!producing&&pen.stage===1){if(action!=='water')return reject('这一阶段需要添水。');if(!f.water)return reject('清水不够，到补给兑换站兑换吧。');f.water--;}
          else{if(action!=='feed')return reject('这一阶段需要喂食。');if(id==='feed'){if(!h.feed)return reject('饲料用完啦，可以兑换或用收获的作物喂食。');h.feed--;}
            else{if(!['corn','carrot','pumpkin'].includes(id))return reject('请选择饲料、玉米、胡萝卜或南瓜。');if(!f.harvest[id])return reject('这种作物还没收获呢。');f.harvest[id]--;}}
          if(producing){pen.productionAt=Date.now();pen.productionFeeds++;message=pen.productionFeeds===3?'新一份蛋奶准备好啦！点围栏里的产出收获。':`喂养进度 ${pen.productionFeeds}/3，再喂 ${3-pen.productionFeeds} 次就有新产出。`;}else{pen.growthAt=Date.now();pen.stage++;message=pen.stage===3?`${a.name}长大啦！可以领取食材。`:pen.stage===1?'吃饱啦！下一步添水。':'喝饱啦！再喂一次就长大。';}
        }
      }
    }
    if(action==='cook'&&side)message+=' 搭配了'+crops.find(c=>c.id===side).name+'！';
    return save(s)?{ok:true,message}:{ok:false,error};
  }

  const meatYield=5;
  function purchase(kind,id,quantity=1){if(kind==='farm')return farmAction('buy',null,id,quantity);if(kind==='ranch')return homeAction('buy',null,id,undefined,undefined,quantity);return {ok:false,error:'找不到这个商店。'};}
  globalThis.GardenRewards={meatYield,syncGrowth,growthInfo,GROWTH_MS,purchase,snapshot,award,dailyCheckIn,claimDailyCheckIn,buy,toggle,catalog,dayKey,crops,supplies,farmState,farmAction,animals,feedSupply,ingredients,recipes,kitchenState,missing,homeAction,cropGroups,extraCrops};
})();
