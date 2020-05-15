import axios from 'axios'
import qs from 'qs'

axios.defaults.withCredentials = true

const URL = 'http://localhost:3000'

const API = {
  //根据轮播图
  getBanner: '/banner',
  
  // 获取用户歌单
  getPlaList: '/user/playlist'
  
}

// 可选的错误
const ERROR = {
//   orderList: 'orderList'
}

// 同步到 vuex
const SYNCING = {
//   getAddressList: 'addressList',
//   load: 'userInfo'
}

export default function (Vue) {
  Vue.prototype.$api = new Proxy(API, {
    get: function (target, property) {
      if (property.startsWith('$')) {
        return target[property]
      }

      let uri = target[property]

      if (!uri) {
        return
      }

      return function (data, path, json = false) {
        let isGetType = property.startsWith('get')

        let options = {
          url: `${URL}${uri}${path ? `/${path}` : ''}`,
          ...(isGetType
            ? { method: 'get', params: data }
            : {
                method: 'post',
                ...(json
                  ? { data }
                  : {
                      data: qs.stringify(data),
                      headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                      }
                    })
              })
        }

        return axios(options)
          .then(res => {
            let message

            if (res.status === 200) {
              res = res.data

              if (res.code === 200) {
                let value = res

                let key = SYNCING[property]

                if (key) {
                  let vue = target['$vue']

                  if (vue) {
                    vue.$store.commit('apiSync', { key, value })
                  }
                }

                return value
              } else if (res.code === 401) {

                location.href = res.loginUrl;
                return
              }

              message = res.message
            }

            throw Error(ERROR[property] || message || '请求失败') // 错误信息
          })
          .catch(error => {
            let errorCallback = target['$error']

            if (errorCallback) {
              errorCallback(error.message)
            }

            return error
          })
      }
    },
    set: function (target, property, value) {
      switch (property) {
        case '$error':
          if (typeof value === 'function') {
            target[property] = value
          }
          break
        case '$vue':
          target[property] = value
          break
      }

      return true
    }
  })
}
