<template>
  <div class="scroll" ref="wrapper">
    <!-- 排行 -->
    <slot></slot>
  </div>
</template>

<script>
import BScroll from "@better-scroll/core";
export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    // 让scroll监听滚动事件与否
    listenScroll: {
      type: Boolean,
      default: false
    },

    // 上拉加载
    pullup: {
      type: Boolean,
      default: false
    },

    // 失焦收起键盘
    beforeScroll: {
      type: Boolean,
      default: false
    },

    refreshDelay:{
      type: Number,
      default: 20
    }

  },
  data() {
    return {};
  },
  created() {},
  mounted() {
    setTimeout(() => {
      this._initScroll();
    }, 20);
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return;
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      });

      if (this.listenScroll) {
        let me = this;
        this.scroll.on("scroll", pos => {
          me.$emit("scroll", pos);
        });
      }

      if (this.pullup) {
        this.scroll.on('scrollEnd', ()=>{
          if(this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            this.$emit('scrollToEnd');
          }
        })
      }
      if(this.beforeScroll){
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    enable() {
      this.scroll && this.scroll.enable();
    },
    disable() {
      this.scroll && this.scroll.disable();
    },
    refresh() {
      this.scroll && this.scroll.refresh();
    },

    // 歌手页 滚动到某处
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this.refresh();
      }, this.refreshDelay);
    }
  },
  components: {}
};
</script>

<style lang="stylus" scoped></style>
