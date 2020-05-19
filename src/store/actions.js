// action的作用；
// 1、异步操作
// 2、对mutation的封装
// 3、在一个动作中提交多个mutation（多次改变mutation），就可以将此封装，如点开歌曲列表，歌曲开始播放且歌词滚动且中间的唱片图开始滚动等等等
// 4、actions调用也是在组件中调用

import * as types from './mutation-types'
// 定义一个动作
export const selectPlay = function({commit,state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list);
  commit(types.SET_PLAYLIST, list);
  commit(types.SET_CURRENT_INDEX, index);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
}