<template>
  <div class="player" v-show="playlist.length > 0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <!-- cd旋转效果 -->
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric"></div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList">
            <div class="lyric-wrapper">
              <div>
                <p ref="lyricLine"></p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l"></span>
            <div class="progress-bar-wrapper">
              <progress-bar></progress-bar>
            </div>
            <span class="time time-r"></span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <!-- 控制是否暂停播放的 -->
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdCls"/>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle>
            <i :class="miniIcon" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- <playlist ref="playlist"></playlist> -->
    <!-- 通过html中的audio标签实现播放 -->
    <!-- canplay 歌曲加载到播放会派发一个事件canplay  -->
    <!-- 当歌曲发生错误或请求不到会派发一个事件error -->
    <audio :src="currentSong.url" ref="audio" @canplay="ready" @error="error"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from '@/common/js/dom'
// import ProgressBar from '@/base/progress-bar/progress-bar'
// import ProgressCircle from '@/base/progress-circle/progress-circle'
// import {playMode} from '@/common/js/config'
// import Lyric from '@/lyric-parser'
// import Scroll from '@/base/scroll/scroll'
// import {playerMixin} from '@/common/js/mixin'
// import Playlist from '@/components/playlist/playlist'

const transform = prefixStyle('transform');

export default {
  data() {
    return {
      songReady: false
    }
  },
  computed: {
    // 播放状态按钮
    playIcon(){
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    // 迷你播放器状态按钮
    miniIcon(){
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },

    // cd旋转效果
    cdCls(){
      return this.playing ? 'play' : 'play pause'
    },
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex'
    ]),

    // 如果产生错误，禁止用户点击
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
  },
  created() {
  },
  watch: {
    currentSong() {
      // audio标签有一个play方法
      this.$nextTick(() => {
        this.$refs.audio.play();
      })
    },

    // 真正控制音乐播放器暂停
    // play(播放)和pause(暂停)都是audio dom实例的方法
    playing(newPlaying){
      const audio = this.$refs.audio;
      this.$nextTick(() => {  // 延时  回调里面执行
        newPlaying ? audio.play() : audio.pause();
      })
    }
  },
  methods: {
    back(){
      this.setFullScroll(false);
    },

    open(){
      this.setFullScroll(true);
    },

    // cd飞入动画效果
    // enter和leave支持两个参数，第一个参数是dom, 第二个参数是一个回调函数（当这个函数执行会跳到下一个钩子函数）
    // 利用js创建cs3动画，用一个开源库create-keyframe-animation
    enter(el, done){
      const {x, y, scale} = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation( {
        name: 'move',  // 动画名称
        animation,    // 动画
        presets: {    // 预设 动画
          duration: 400,  // 动画间隔
          easing: 'linear',   // 缓动  线性
        }
      })

      // 运行动画
      animations.runAnimation(this.$refs.cdWrapper, 'move', done);
    },

    afterEnter(){
      animations.unregisterAnimation('move');
      this.$refs.cdWrapper.style.animation = '';
    },

    leave(el, done){
      this.$refs.cdWrapper.style.transition = 'all 0.4s';
      const {x, y, scale} = this._getPosAndScale();
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      this.$refs.cdWrapper.addEventListener('transitionend', done);
    },

    afterLeave(){
      this.$refs.cdWrapper.style.transition = '';
      this.$refs.cdWrapper.style[transform] = '';
    },

    // 获取位置及其缩放尺寸
    _getPosAndScale(){
      const targetWidth = 40;
      const paddingLeft = 40;
      const paddingBottom = 30;
      const paddingTop = 80;
      const width = window.innerWidth * 0.8;
      const scale =  targetWidth / width;   // 初始的缩放比例
      const x = -(window.innerWidth / 2 - paddingLeft);   // 初始的x坐标
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;  //初始的y坐标
      return {
        x,
        y,
        scale
      }
   },

    ...mapMutations({
      setFullScroll: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    }),

    // 控制是否暂停播放  图标
    togglePlaying(){
      // 阻止快速点击报错，在歌曲还没ready，不允许点击
      if(!this.songReady){
        return
      }
      this.setPlayingState(!this.playing);
    },

    // 上一首
    prev(){
      // 阻止快速点击报错，在歌曲还没ready，不允许点击
      if(!this.songReady){
        return
      }
      let index = this.currentIndex - 1;
      if(index === -1){
        index = this.playlist.length - 1;
      }
      this.setCurrentIndex(index);
      if(!this.playing){
        this.togglePlaying();
      }
      this.songReady = false;
    },

    // 下一首
    next(){
      // 阻止快速点击报错，在歌曲还没ready，不允许点击
      if(!this.songReady){
        return
      }
      let index = this.currentIndex + 1;
      if(index === this.playlist.length){
        //  顺序播放
        index = 0;
      }
      this.setCurrentIndex(index);
      if(!this.playing){
        this.togglePlaying();
      }
      this.songReady = false;
    },

    // 
    ready(){
      this.songReady = true;
    },

    // 如果用户切换遇到网络错误，url报错等问题。后续操作没法执行 error
    // 既保证了正常使用，又防止用户快速点击，造成dom报错
    error(){
      this.songReady = true;
    }
  },
  components: {
    // Playlist
  }
}
</script>

<style scoped lang="stylus">
@import "~@/common/stylus/variable";
@import "~@/common/stylus/mixin";

.player
  .normal-player
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 150
    background: $color-background
    .background
      position: absolute
      left: 0
      top: 0
      width: 100%
      height: 100%
      z-index: -1
      opacity: 0.6
      filter: blur(20px)
    .top
      position: relative
      margin-bottom: 25px
      .back
        position absolute
        top: 0
        left: 6px
        z-index: 50
        .icon-back
          display: block
          padding: 9px
          font-size: $font-size-large-x
          color: $color-theme
          transform: rotate(-90deg)
      .title
        width: 70%
        margin: 0 auto
        line-height: 40px
        text-align: center
        no-wrap()
        font-size: $font-size-large
        color: $color-text
      .subtitle
        line-height: 20px
        text-align: center
        font-size: $font-size-medium
        color: $color-text
    .middle
      position: fixed
      width: 100%
      top: 80px
      bottom: 170px
      white-space: nowrap
      font-size: 0
      .middle-l
        display: inline-block
        vertical-align: top
        position: relative
        width: 100%
        height: 0
        padding-top: 80%
        .cd-wrapper
          position: absolute
          left: 10%
          top: 0
          width: 80%
          height: 100%
          .cd
            width: 100%
            height: 100%
            box-sizing: border-box
            border: 10px solid rgba(255, 255, 255, 0.1)
            border-radius: 50%
            &.play               // cd旋转效果
              animation: rotate 20s linear infinite
            &.pause
              animation-play-state: paused
            .image
              position: absolute
              left: 0
              top: 0
              width: 100%
              height: 100%
              border-radius: 50%

        .playing-lyric-wrapper
          width: 80%
          margin: 30px auto 0 auto
          overflow: hidden
          text-align: center
          .playing-lyric
            height: 20px
            line-height: 20px
            font-size: $font-size-medium
            color: $color-text-l
      .middle-r
        display: inline-block
        vertical-align: top
        width: 100%
        height: 100%
        overflow: hidden
        .lyric-wrapper
          width: 80%
          margin: 0 auto
          overflow: hidden
          text-align: center
          .text
            line-height: 32px
            color: $color-text-l
            font-size: $font-size-medium
            &.current
              color: $color-text
    .bottom
      position: absolute
      bottom: 50px
      width: 100%
      .dot-wrapper
        text-align: center
        font-size: 0
        .dot
          display: inline-block
          vertical-align: middle
          margin: 0 4px
          width: 8px
          height: 8px
          border-radius: 50%
          background: $color-text-l
          &.active
            width: 20px
            border-radius: 5px
            background: $color-text-ll
      .progress-wrapper
        display: flex
        align-items: center
        width: 80%
        margin: 0px auto
        padding: 10px 0
        .time
          color: $color-text
          font-size: $font-size-small
          flex: 0 0 30px
          line-height: 30px
          width: 30px
          &.time-l
            text-align: left
          &.time-r
            text-align: right
        .progress-bar-wrapper
          flex: 1
      .operators
        display: flex
        align-items: center
        .icon
          flex: 1
          color: $color-theme
          &.disable
            color: $color-theme-d
          i
            font-size: 30px
        .i-left
          text-align: right
        .i-center
          padding: 0 20px
          text-align: center
          i
            font-size: 40px
        .i-right
          text-align: left
        .icon-favorite
          color: $color-sub-theme
    &.normal-enter-active, &.normal-leave-active   // 进入播放器的动画效果
      transition: all 0.4s
      .top, .bottom
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
    &.normal-enter, &.normal-leave-to
      opacity: 0
      .top
        transform: translate3d(0, -100px, 0)
      .bottom
        transform: translate3d(0, 100px, 0)
  .mini-player
    display: flex
    align-items: center
    position: fixed
    left: 0
    bottom: 0
    z-index: 180
    width: 100%
    height: 60px
    background: $color-highlight-background
    &.mini-enter-active, &.mini-leave-active  // 小型播放器动画渐隐渐显的效果
      transition: all 0.4s
    &.mini-enter, &.mini-leave-to
      opacity: 0
    .icon
      flex: 0 0 40px
      width: 40px
      padding: 0 10px 0 20px
      img
        border-radius: 50%
        &.play
          animation: rotate 10s linear infinite
        &.pause
          animation-play-state: paused
    .text
      display: flex
      flex-direction: column
      justify-content: center
      flex: 1
      line-height: 20px
      overflow: hidden
      .name
        margin-bottom: 2px
        no-wrap()
        font-size: $font-size-medium
        color: $color-text
      .desc
        no-wrap()
        font-size: $font-size-small
        color: $color-text-d
    .control
      flex: 0 0 30px
      width: 30px
      padding: 0 10px
      .icon-play-mini, .icon-pause-mini, .icon-playlist
        font-size: 30px
        color: $color-theme-d
      .icon-mini
        font-size: 32px
        position: absolute
        left: 0
        top: 0

@keyframes rotate     // cd旋转动画效果
  0%
    transform: rotate(0)
  100%
    transform: rotate(360deg)
</style>
