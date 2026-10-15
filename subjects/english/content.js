globalThis.ABC_LESSONS = [
  ['A', [['apple','苹果'],['ant','蚂蚁'],['airplane','飞机']]],
  ['B', [['ball','皮球'],['banana','香蕉'],['butterfly','蝴蝶']]],
  ['C', [['cat','小猫'],['car','汽车'],['cake','蛋糕']]],
  ['D', [['dog','小狗'],['duck','鸭子'],['dinosaur','恐龙']]],
  ['E', [['elephant','大象'],['egg','鸡蛋'],['envelope','信封']]],
  ['F', [['fish','小鱼'],['frog','青蛙'],['flower','花朵']]],
  ['G', [['goat','山羊'],['grapes','葡萄'],['guitar','吉他']]],
  ['H', [['hat','帽子'],['horse','马'],['house','房子']]],
  ['I', [['ice cream','冰淇淋'],['igloo','冰屋'],['insect','昆虫']]],
  ['J', [['juice','果汁'],['jellyfish','水母'],['jacket','夹克']]],
  ['K', [['kite','风筝'],['key','钥匙'],['kangaroo','袋鼠']]],
  ['L', [['lion','狮子'],['lemon','柠檬'],['leaf','树叶']]],
  ['M', [['moon','月亮'],['monkey','猴子'],['milk','牛奶']]],
  ['N', [['nest','鸟巢'],['nose','鼻子'],['net','网兜']]],
  ['O', [['orange','橙子'],['owl','猫头鹰'],['octopus','章鱼']]],
  ['P', [['panda','熊猫'],['pear','梨'],['pencil','铅笔']]],
  ['Q', [['queen','女王'],['quilt','被子'],['quail','鹌鹑']]],
  ['R', [['rabbit','兔子'],['rainbow','彩虹'],['robot','机器人']]],
  ['S', [['sun','太阳'],['star','星星'],['strawberry','草莓']]],
  ['T', [['tiger','老虎'],['turtle','乌龟'],['train','火车']]],
  ['U', [['umbrella','雨伞'],['unicorn','独角兽'],['up','向上']]],
  ['V', [['van','厢式货车'],['vase','花瓶'],['violin','小提琴']]],
  ['W', [['whale','鲸鱼'],['watch','手表'],['watermelon','西瓜']]],
  ['X', [['x-ray','X 光片'],['xylophone','木琴'],['box','盒子']]],
  ['Y', [['yak','牦牛'],['yarn','毛线'],['yo-yo','悠悠球']]],
  ['Z', [['zebra','斑马'],['zipper','拉链'],['zucchini','西葫芦']]]
].map(([letter, entries], lessonIndex) => ({
  letter, lower:letter.toLowerCase(), index:lessonIndex,
  words:entries.map(([word, zh], index) => {
    const tile=lessonIndex*3+index;
    return {letter, lower:letter.toLowerCase(), word, zh, id:word.replaceAll(' ','-'),
      sheet:Math.floor(tile/16)+1, col:tile%4, row:Math.floor((tile%16)/4),
      position:word==='box'?'end':'start'};
  })
}));
