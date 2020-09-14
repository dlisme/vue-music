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
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <!-- cd旋转效果 -->
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image" />
              </div>
            </div>
            <!-- cd页歌词滚动部分 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <!-- 歌词 -->
          <scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  :class="{ current: currentLineNum === index }"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                >
                  {{ line.txt }}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <!-- cd 歌词切换小圆点 -->
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span
              class="dot"
              :class="{ active: currentShow === 'lyric' }"
            ></span>
          </div>
          <div class="progress-wrapper">
            <!-- 歌曲当前播放的时间 -->
            <span class="time time-l">{{ format(currentTime) }}</span>
            <!-- 歌曲进度条 -->
            <div class="progress-bar-wrapper">
              <progress-bar
                :percent="percent"
                @percentChange="onProgressBarChange"
              ></progress-bar>
            </div>
            <!-- 歌曲播放总时间 -->
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <!-- 播放模式改变 -->
            <div class="icon i-left" @click="changeMode">
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
          <img width="40" height="40" :src="currentSong.image" :class="cdCls" />
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i
              :class="miniIcon"
              @click.stop="togglePlaying"
              class="icon-mini"
            ></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!-- 通过html中的audio标签实现播放 -->
    <!-- canplay 歌曲加载到播放会派发一个事件canplay  -->
    <!-- 当歌曲发生错误或请求不到会派发一个事件error -->
    <!-- 歌曲播放的时候，audio标签会派发一个事件timeupdate -->
    <audio
      :src="currentSong.url"
      ref="audio"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import {mapActions, mapGetters, mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from '@/common/js/dom'
import ProgressBar from '@/base/progress-bar/progress-bar'   //  progress-bar 进度条
import ProgressCircle from '@/base/progress-circle/progress-circle'
import {playMode} from '@/common/js/config'
// import {shuffle} from '@/common/js/util'  // 后封装到mixin里面
// 解析歌词用lyric-parser这个库
import Lyric from 'lyric-parser'
import Scroll from '@/base/scroll/scroll'
import {playerMixin} from '@/common/js/mixin'
import Playlist from '@/components/playlist/playlist'

const transform = prefixStyle('transform');
const transitionDuration = prefixStyle('transitionDuration');


export default {
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,   // 当前时间
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''

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
      'currentIndex',
      'mode',
      'sequenceList'
    ]),

    // 如果产生错误，禁止用户点击
    disableCls() {
      return this.songReady ? '' : 'disable'
    },

    // 进度条
    percent(){
      // 歌曲播放的比例 = 当前播放的时间 / 歌曲总时长
      return this.currentTime / this.currentSong.duration
    },

    // 播放模式
    iconMode(){
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    }
  },
  created() {
    // 实现左右滑动效果
    this.touch = {};
  },
  watch: {
    currentSong(newSong, oldSong) {
      if(!newSong.id){
        return
      }
      if(newSong.id === oldSong.id){
        return
      }
      // audio标签有一个play方法
      if(this.currentLyric){
        this.currentLyric.stop();
      }
      setTimeout(() => {
        this.$refs.audio.play();
        this.getLyric();
      }, 1000)
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
      // 后封装到mixin里面
      // setPlayingState: 'SET_PLAYING_STATE',
      // setCurrentIndex: 'SET_CURRENT_INDEX',
      // setPlayMode: 'SET_PLAY_MODE',
      // setPlaylist: 'SET_PLAYLIST',
    }),

    ...mapActions([
      'savePlayHistory'
    ]),

    // 控制是否暂停播放  图标
    togglePlaying(){
      // 阻止快速点击报错，在歌曲还没ready，不允许点击
      if(!this.songReady){
        return
      }
      this.setPlayingState(!this.playing);
      if(this.currentLyric){
        this.currentLyric.togglePlay();
      }
    },

    // 上一首
    prev(){
      // 阻止快速点击报错，在歌曲还没ready，不允许点击
      if(!this.songReady){
        return
      }
      if(this.playlist.length === 1){
        this.loop();
      } else {
        let index = this.currentIndex - 1;
        if(index === -1){
          index = this.playlist.length - 1;
        }
        this.setCurrentIndex(index);
        if(!this.playing){
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },

    // 下一首
    next(){
      // 阻止快速点击报错，在歌曲还没ready，不允许点击
      if(!this.songReady){
        return
      }
      if(this.playlist.length === 1){
        this.loop();
      } else {
        let index = this.currentIndex + 1;
        if(index === this.playlist.length){
          //  顺序播放
          index = 0;
        }
        this.setCurrentIndex(index);
        if(!this.playing){
          this.togglePlaying();
        }
      }

      this.songReady = false;
    },

    // 歌曲播放完了
    end(){
      // 如果是单曲循环的话
      if(this.mode === playMode.loop){
        this.loop();
      } else {
      this.next();
      }
    },

    loop(){
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      if(this.currentLyric){
        this.currentLyric.seek(0);
      }
    },

    //
    ready(){
      this.songReady = true;
      this.savePlayHistory(this.currentSong);
    },

    // 如果用户切换遇到网络错误，url报错等问题。后续操作没法执行 error
    // 既保证了正常使用，又防止用户快速点击，造成dom报错
    error(){
      this.songReady = true;
    },

    updateTime(e){
      // e.target.currentTime表示了一个audio当前播放的时间，可读写
      // console.log(e.target.currentTime,"ck");
      this.currentTime = e.target.currentTime;
    },

    // 转时间戳为日期格式
    format(interval){
      interval = interval | 0;   // ｜ 0 操作符一个正数向下取整 相当于 Math.floor()
      // 获取分的部分
      const minute = interval / 60 | 0;
      // 获取秒的部分
      const second = this._pad(interval % 60);
      return `${minute}:${second}`
    },

    // 格式转化，让时间0:1变成0:01;
    // 很多语言有padLfet，在字符串后面补0
    _pad(num, n = 2){
      let len = num.toString().length;
      while(len < n){
        num = '0' + num;
        len++;
      }
       return num
    },

    // 拖动释放 跳转到相应位置
    onProgressBarChange(percent){
      const currentTime = this.currentSong.duration * percent;
      this.$refs.audio.currentTime = currentTime;
      if(!this.playing){
        this.togglePlaying();
      }
      // 歌词和歌曲保持一致
      if(this.currentLyric){
        this.currentLyric.seek(currentTime * 1000);
      }
   },

    //  改变播放模式 后封装到mixin里面
    // changeMode(){
    //   const mode = (this.mode + 1) % 3;
    //   // 函数映射，改变 mode
    //   this.setPlayMode(mode);

    //   let list = null;
    //   if(mode === playMode.random){
    //     // 随机列表
    //     list = shuffle(this.sequenceList);
    //   } else {
    //     // 顺序播放或者循环播放的时候
    //     list = this.sequenceList;
    //   }
    //   this.resetCurrentIndex(list);
    //   this.setPlaylist(list);
    // },

    // 重新定义方法
    resetCurrentIndex(list){
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index);
    },


    // 封装一个getLyric的逻辑
    getLyric(){
      this.currentSong.getLyric().then((lyric)=>{
        this.currentLyric = new Lyric(lyric, this.handleLyric);
        if(this.playing){
          this.currentLyric.play();
        }
      }).catch(() => {
        // 获取不到歌词的时候
        this.currentLyric = null;
        this.playingLyric = '';
        this.currentLineNum = 0;
      })
    },

    // 当歌词每一行发生改变的时候，调一下这个回调函数
    handleLyric({lineNum,txt}){
      this.currentLineNum = lineNum;
      if(lineNum > 5){
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      // 展示当前播放的歌词
      this.playingLyric = txt;
    },

    // 实现左右移动效果
    // 移动开始
    middleTouchStart(e){
      // 设置标识位，证明已经初始化完成
      this.touch.initiated = true;
      const touch = e.touches[0];
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
    },

    // 移动中
    middleTouchMove(e){
      if(!this.touch.initiated){
        return
      }
      const touch = e.touches[0];
      const deltaX = touch.pageX - this.touch.startX;
      const deltaY = touch.pageY - this.touch.startY;
      // 纵轴方向滚动的偏差绝对值大于横轴方向滚动的偏差绝对值，因为只支持横向滚动
      if(Math.abs(deltaY) > Math.abs(deltaX)){
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
      // 左滑10%
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = 0;
      // percent越大，透明度越小
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
      this.$refs.middleL.style[transitionDuration] = 0;
    },

    // 移动结束
    middleTouchEnd(){
      let offsetWidth;
      let opacity;
      if(this.currentShow === 'cd'){
        if(this.touch.percent > 0.1){
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = 'lyric';
        } else {
          offsetWidth = 0;
          opacity = 1;
        }
      } else {
        if(this.touch.percent < 0.9){
          offsetWidth = 0;
          this.currentShow = 'cd';
          opacity = 1;
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      const time = 300;
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
      // percent越大，透明度越小
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style[transitionDuration] = `${time}ms`;
    },

    showPlaylist(){
      this.$refs.playlist.show();
    }

  },
  components: {
    Playlist,
    Scroll,
    ProgressBar,
    ProgressCircle
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
