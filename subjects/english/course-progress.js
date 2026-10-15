/* Sequential five-word courses, independent from the spaced-review mastery stages. */
(() => {
  function catalog(lessons, size=5) {
    return lessons.flatMap(lesson => Array.from({length:Math.ceil(lesson.words.length/size)},(_,page)=>({
      id:`${lesson.letter}-${page}`, letter:lesson.letter, page,
      wordIds:lesson.words.slice(page*size,(page+1)*size).map(word=>word.id)
    })));
  }
  function normalize(value, courses, prefs={}) {
    const passed={};
    if(value?.version===1 && value.passed && typeof value.passed==='object'){
      for(const course of courses)if(value.passed[course.id]===true)passed[course.id]=true;
    }else{
      // Legacy counters did not identify the group. Require evidence for all five words.
      for(const course of courses)if(Number(prefs.completed?.[`${course.letter}-listen`])>0 &&
        course.wordIds.every(id=>Number(prefs.correct?.[id])>0))passed[course.id]=true;
    }
    return {version:1,passed};
  }
  function frontier(progress,courses) {
    const index=courses.findIndex(course=>progress.passed[course.id]!==true);
    return index<0?courses.length:index;
  }
  function accessible(progress,courses,index) {
    return Number.isInteger(index)&&index>=0&&index<courses.length&&index<=frontier(progress,courses);
  }
  function pass(progress,courses,index) {
    if(!accessible(progress,courses,index))return false;
    progress.passed[courses[index].id]=true;return true;
  }
  function current(progress,courses) {return Math.min(frontier(progress,courses),courses.length-1);}
  globalThis.GardenCourseProgress=Object.freeze({catalog,normalize,frontier,accessible,pass,current});
})();
