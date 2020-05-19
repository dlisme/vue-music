export function addClass(el, className) {
  if (hasClass(el, className)) {
    return;
  }
  let newClass = el.className.split(" ");
  newClass.push(className);
  el.className = newClass.join(" ");
}

export function hasClass(el, className) {
  let reg = new RegExp("(^|\\s)" + className + "(\\s|$)");
  return reg.test(el.className);
}
// el表示dom对象
export function getData(el, name, val) {
  const prefix = "data-";
  // name = prefix + name;
  if (val) {
    return el.setAttribute(prefix + name, val);
  } else {
    // getAttribute返回元素上的一个指定的属性值 如 <a href="xxx"></a> href里面的的地址
    return el.getAttribute(prefix + name);
  }
}

// 浏览器的一致性，是否添加webkit...
let elementStyle = document.createElement('div').style;
// vendor立即执行函数
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  for(let key in transformNames){
    if(elementStyle[transformNames[key]] !== undefined){
      return key
    }
  }
  return false
})()

export function prefixStyle(style){
  if(vendor === false){
    return
  }
  if(vendor === 'standard'){
    return style
  }
  return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}