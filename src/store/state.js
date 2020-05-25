import { playMode } from "@/common/js/config.js";
const state = {
  singer: {},
  playing: false, // 播放的状态
  fullScreen: false, // 播放器展开收起的状态
  playlist: [], // 前进后退的播放列表
  sequenceList: [], // 顺序列表(原始列表)
  mode: playMode.sequence,  // 默认什么播放模式
  currentIndex: -1,  //  当前播放的索引
  
};

export default state;
