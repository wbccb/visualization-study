export function throttle(fn, wait = 10) {
  // wait限制过大会导致画rect时显得很卡顿
  let time = new Date().getTime();
  const that = this;
  return function (...args) {
    // return (...args) => {  // 箭头函数的this依赖于上一层，因此这里的fn.call(this, ...args)就是throttle的this
    const currentTime = new Date().getTime();
    if (currentTime - time > wait) {
      fn.call(this, ...args);
      time = currentTime;
    }
  };
}
