<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <!-- 走过的进度 -->
      <div class="progress" ref="progress"></div>
      <!-- 当前的位置 -->
      <div class="progress-btn-wrapper" 
        ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <!-- 按钮 -->
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from '@/common/js/dom'  // 小球偏移量

  const progressBtnWidth = 16;
  // 小球偏移量
  const transform = prefixStyle('transform');
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },

    created() {
      // 用于不同的回调函数共享一些数据，把共享数据挂载到这个对象上
      this.touch = {};
    },

    watch: {
      // 算百分比  当前进度 / 百分比
      percent(newPercent){
        if(newPercent >= 0 && !this.touch.initiated){
          // 外面整个bar的宽度 - 小球的宽度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
          // 偏移量 歌曲播放的比例 * 总共的宽度
          const offsetWidth = newPercent * barWidth;
          this._offset(offsetWidth);
          // this.$refs.progress.style.width = `${offsetWidth}`

          // // 小球的偏移 用transform
          // this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        }
      }
    },

    methods: {
      progressTouchStart(e){
        // 初始化
        this.touch.initiated = true;
        // touch点击的位置，touches[0]表示第一个手指, pageX横向坐标
        this.touch.startX = e.touches[0].pageX;
        // 已经滚动的进度条的宽度
        this.touch.left = this.$refs.progress.clientWidth;
      },

      progressTouchMove(e){
        // 如果没有经过progressTouchStart，直接进入progressTouchMove事件的话
        if(!this.touch.initiated){
          return
        }
        // 在move的时候实时获取当前e.touches[0].pageX的位置 - start记录的位置，算出纵向偏移量
        // 已知纵向偏移量和已经滚动的进度条的宽度this.touch.left值，就可以算出移动了多少距离
        const deltaX = e.touches[0].pageX - this.touch.startX;
        // 手指拖动很远的时候肯定会超过progress-bar的宽度，所以offsetWidth必须小于progress-bar的宽度
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX));
        this._offset(offsetWidth);
      },

      progressTouchEnd(e){
        this.touch.initiated = false;
        this._triggerPercent();
      },

      _offset(offsetWidth){
        this.$refs.progress.style.width = `${offsetWidth}px`
        // 小球的偏移 用transform
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },

      _triggerPercent(){
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        const percent = this.$refs.progress.clientWidth / barWidth;
        this.$emit('percentChange', percent);
      },

      // 点击跳转到相应位置
      progressClick(e){
        // 设置偏移量
        this._offset(e.offsetX);
        this._triggerPercent();
      }

    },
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable";  
  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>