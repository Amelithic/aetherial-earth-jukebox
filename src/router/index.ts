import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutUsView from '@/views/AboutUsView.vue'
import JukeboxView from '@/views/JukeboxView.vue'
import BrowseView from '@/jukebox/views/BrowseView.vue'
import BrowseDetailView from '@/jukebox/views/BrowseDetailView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about-us',
    name: 'about-us',
    component: AboutUsView,
  },
  {
    path: '/jukebox',
    name: 'jukebox',
    component: JukeboxView,
  },
  {
    path: '/jukebox/browse',
    name: 'browse',
    component: BrowseView,
  },
  {
    path: '/jukebox/browse/:id',
    name: 'browse-detail',
    component: BrowseDetailView,
  },
  {
    path: '/jukebox/:id',
    name: 'jukebox-track',
    component: JukeboxView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
