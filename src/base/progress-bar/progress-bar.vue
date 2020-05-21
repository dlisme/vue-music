<template>
  <div class="progress-bar" ref="progressBar">
    <div class="bar-inner">
      <!-- 走过的进度 -->
      <div class="progress" ref="progress"></div>
      <!-- 当前的位置 -->
      <div class="progress-btn-wrapper" ref="progressBtn">
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

    },
    methods: {

    },
    watch: {
      // 算百分比  当前进度 / 百分比
      percent(newPercent){
        if(newPercent >= 0){
          // 外面整个bar的宽度 - 小球的宽度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
          // 偏移量 歌曲播放的比例 * 总共的宽度
          const offsetWidth = newPercent * barWidth;
          this.$refs.progress.style.width = `${offsetWidth}`

          // 小球的偏移 用transform
          this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        }
      }
    }
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