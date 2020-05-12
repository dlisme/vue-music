import Vue from "vue";
import VueRouter from "vue-router";
import Recommend from "@/components/recommend/recommend";
import Singer from "@/components/singer/singer";
import Rank from "@/components/rank/rank";
import Search from "@/components/search/search";

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
    component: Singer
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
