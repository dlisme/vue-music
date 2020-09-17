import Vue from "vue";
import VueRouter from "vue-router";
import Recommend from "@/components/recommend/recommend";
import Singer from "@/components/singer/singer";
import Rank from "@/components/rank/rank";
import Search from "@/components/search/search";
import SingerDetail from "@/components/singer-detail/singer-detail";
import Disc from '@/components/disc/disc'
import TopList from '@/components/top-list/top-list'
import UserCenter from '@/components/user-center/user-center'

Vue.use(VueRouter);

// const Recommend = ((resolve) => {
//   import('components/recommend/recommend').then((recommend) => {
//     resolve(recommend)
//   })
// })
// 组件按需异步加载，文件变小

const routes = [
  {
    path: "/",
    redirect: '/recommend'  // 默认选中
  },
  {
    path: "/recommend",
    component: Recommend,
    children: [{
      path: ':id',
      component: Disc
    }]
  },
  {
    path: "/singer",
    component: Singer,
    children: [{
      path: ':id',  // :id以id为变量，可以传入不同的id值，可以跳到不同的子路由，渲染不同的歌手详情页
      component: SingerDetail
    }]
  },
  {
    path: "/rank",
    component: Rank,
    children: [{
      path: ':id',
      component: TopList
    }]
  },
  {
    path: "/search",
    component: Search,
    children: [{
      path: ':id',  // :id以id为变量，可以传入不同的id值，可以跳到不同的子路由，渲染不同的歌手详情页
      component: SingerDetail
    }]
  },
  {
    path: "/user",
    component: UserCenter
  }
];

const router = new VueRouter({
  routes,
});

export default router;
