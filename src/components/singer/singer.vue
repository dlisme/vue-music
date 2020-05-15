<template>
  <div class="singer">歌手</div>
</template>

<script>
import { getSingerList } from "@/api/singer";

export default {
  data() {
    return {
      singers: []
    };
  },
  mounted(){
    this._getSingerList();
  },
  methods: {
    _getSingerList(){
      getSingerList().then(console.log);
    }
  },
  watch: {},
  components: {},
};
</script>

<style lang="stylus" scoped>
.singer
  position fixed
  top 88px
  bottom 0
  width 100%
</style>
