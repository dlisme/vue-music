<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
  <!-- <transition name="slide">
    <div class="singer-detail"></div>
  </transition> -->
</template>

<script type="text/ecmascript-6">
import MusicList from '@/components/music-list/music-list'
import {getSingerDetail} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import {createSong} from '@/common/js/song'
import {mapGetters} from 'vuex' // 取数据

export default {
  data() {
    return {
      songs: []
    }
  },
  created() {
     this._getDetail();
  },
  computed: {
    title(){
      return this.singer.name
    },
    bgImage(){
      return this.singer.avatar
    },
    ...mapGetters([
      'singer'
    ])
  },
  methods: {
    _getDetail(){
      if(!this.singer.id) {
        this.$router.push('/singer');
        return
      }
      getSingerDetail(this.singer.id).then((res) => {
        if(res.code === ERR_OK){
          this.songs = this._nomalizeSongs(res.data.list);
          console.log(this.songs,"lp");
        }
      })
    },

    _nomalizeSongs(list) {
      let ret = [];
      list.forEach((item) => {
        let { musicData } = item;
        if(musicData.songid && musicData.albummid){
          ret.push(createSong(musicData));
        }
      });
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus">

.slide-enter-active, .slide-leave-active
  transition: all 0.3s

.slide-enter, .slide-leave-to
  transform: translate3d(100%, 0, 0)
</style>
