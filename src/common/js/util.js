// 工具方法

function getRandomInt(min,max){
  // 返回min和max之间的随机数，包括min或者max
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 洗牌函数
// export function shuffle(arr){
//   // 遍历arr
//   for(let i=0; i<arr.length; i++){
//     // 0 到 i取一个索引，把这个索引对应的arr i 交换，将数组打乱
//     let j = getRandomInt(0, j);
//     let t = arr[i];
//     arr[i] = arr[j];
//     arr[j] = t;
//   }
//     return arr
// }

// 洗牌函数
export function shuffle(arr){
  let _arr = arr.slice();
  // 遍历arr
  for(let i=0; i<_arr.length; i++){
    // 0 到 i取一个索引，把这个索引对应的_arr i 交换，将数组打乱
    let j = getRandomInt(0, j);
    let t = _arr[i];
    _arr[i] = _arr[j];
    _arr[j] = t;
  }
    return _arr
}




// function getRandomInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1) + min)
// }

// export function shuffle(arr) {
//   let _arr = arr.slice()
//   for (let i = 0; i < _arr.length; i++) {
//     let j = getRandomInt(0, i)
//     let t = _arr[i]
//     _arr[i] = _arr[j]
//     _arr[j] = t
//   }
//   return _arr
// }

// export function debounce(func, delay) {
//   let timer

//   return function (...args) {
//     if (timer) {
//       clearTimeout(timer)
//     }
//     timer = setTimeout(() => {
//       func.apply(this, args)
//     }, delay)
//   }
// }