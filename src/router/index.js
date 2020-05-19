import Vue from "vue";
import VueRouter from "vue-router";
import Recommend from "@/components/recommend/recommend";
import Singer from "@/components/singer/singer";
import Rank from "@/components/rank/rank";
import Search from "@/components/search/search";
import SingerDetail from "@/components/singer-detail/singer-detail";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: '/recommend'  // 默认选中
  },
  {
    path: "/recommend",
    component: Recommend
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
    component: Rank
  },
  {
    path: "/search",
    component: Search
  },
];

const router = new VueRouter({
  routes,
});

export default router;
