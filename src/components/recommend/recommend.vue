<template>
  <div class="recommend">
    <scroll class="recommend-content" ref="scroll" :data="list.playlist">
      <div>
        <div class="slider-wrapper" v-if="ads.banners">
          <slider>
            <div v-for="(item, index) in ads.banners" :key="index">
              <a :href="item.linkUrl">
                <img
                  @load="loadImage"
                  class="needsclick"
                  :src="item.imageUrl"
                  alt=""
                />
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              class="item"
              v-for="(item, index) in list.playlist"
              :key="index"
            >
              <div class="icon">
                <img width="60" height="60" v-lazy="item.coverImgUrl" />
              </div>
              <div class="text">
                <h2 class="name">{{ item.name }}</h2>
                <p class="desc">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loding-container" v-show="!list.lenght">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import Slider from "@/base/slider/slider";
import Scroll from "@/base/scroll/scroll";
import Loading from "@/base/loading/loading";
import { getRecommend } from "@/api/recommend";
// import { getRecommend, getDiscList } from "@/api/recommend";
import { ERR_OK } from "@/api/config";
export default {
  data() {
    return {
      // recommends: [],
      ads: {},
      // discList: [],
      list: [],
    };
  },
  created() {
    this._getRecommend();
    // this._getDiscList();
  },
  mounted() {
    this.bannerAd();
    this.playList();
  },
  methods: {
    async bannerAd() {
      this.ads = await this.$api.getBanner();
    },

    async playList() {
      this.list = await this.$api.getPlaList({ uid: 32953014 });
    },

    // _getDiscList() {
    //   getDiscList().then((res) => {
    //     if (res.code === ERR_OK) {
    //       this.discList = res.data.list;
    //     }
    //   });
    // },

    _getRecommend() {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider;
        }
      });
    },

    loadImage() {
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh();
        this.checkLoaded = true;
      }
    },
  },
  watch: {},
  components: {
    Slider,
    Scroll,
    Loading
  },
};
</script>

<style lang="stylus" scoped>
@import "~@/common/stylus/variable";
.recommend
  position: fixed
  width: 100%
  top: 88px
  bottom: 0
  .recommend-content
    height: 100%
    overflow: hidden
    .slider-wrapper
      position: relative
      width: 100%
      overflow: hidden
    .recommend-list
      .list-title
        height: 65px
        line-height: 65px
        text-align: center
        font-size: $font-size-medium
        color: $color-theme
      .item
        display: flex
        box-sizing: border-box
        align-items: center
        padding: 0 20px 20px 20px
        .icon
          flex: 0 0 60px
          width: 60px
          padding-right: 20px
        .text
          display: flex
          flex-direction: column
          justify-content: center
          flex: 1
          line-height: 20px
          overflow: hidden
          font-size: $font-size-medium
          .name
            margin-bottom: 10px
            color: $color-text
          .desc
            color: $color-text-d
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
