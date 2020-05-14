import jsonp from "../common/js/jsonp";

// export 一些公共参数
export const commonParams = {
  g_tk: 5381,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: jsonp     
}

export const options = {
    param: 'jsonpCallBack'
}

export const ERR_OK = 0