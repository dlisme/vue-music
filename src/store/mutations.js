// 定义修改的操作
import * as types from './mutation-types'

const mutations = {
    // 第二个为传的参数
    [types.SET_SINGER](state, singer) {
        state.singer = singer
    }
}

export default mutations