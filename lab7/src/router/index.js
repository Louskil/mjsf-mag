import { createRouter, createWebHistory } from 'vue-router'
import ProductsLayout from '@/layouts/ProductsLayout.vue'
import ProductLayout from '@/layouts/ProductLayout.vue'
import ManageLayout from '@/layouts/ManageLayout.vue'
import ProductCatalogView from '@/views/ProductCatalogView.vue'
import ProductOverviewView from '@/views/ProductOverviewView.vue'
import ProductReviewsView from '@/views/ProductReviewsView.vue'
import AboutView from '@/views/AboutView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import LoginView from '@/views/LoginView.vue'
import ManageProductsView from '@/views/ManageProductsView.vue'
import ProductEditView from '@/views/ProductEditView.vue'
import { createRouteGuards, setupSessionLostHandler } from '@/router/guards.js'

const routes = [
  {
    path: '/',
    redirect: { name: 'products' },
  },
  {
    path: '/products',
    component: ProductsLayout,
    children: [
      {
        path: '',
        name: 'products',
        component: ProductCatalogView,
        meta: {
          breadcrumb: { label: 'Каталог', name: 'products' },
        },
      },
      {
        path: ':id',
        component: ProductLayout,
        children: [
          {
            path: '',
            name: 'product-overview',
            component: ProductOverviewView,
            meta: {
              breadcrumb: { dynamic: 'product', name: 'product-overview' },
            },
          },
          {
            path: 'reviews',
            name: 'product-reviews',
            component: ProductReviewsView,
            meta: {
              breadcrumb: { label: 'Відгуки', name: 'product-reviews' },
            },
          },
        ],
      },
    ],
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      breadcrumb: { label: 'Про застосунок', name: 'about' },
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      breadcrumb: { label: 'Вхід', name: 'login' },
    },
  },
  {
    path: '/manage/products',
    component: ManageLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'manage-products',
        component: ManageProductsView,
        meta: {
          breadcrumb: { label: 'Список товарів', name: 'manage-products' },
        },
      },
      {
        path: ':id/edit',
        name: 'manage-edit',
        component: ProductEditView,
        meta: {
          breadcrumb: { dynamic: 'product', name: 'manage-edit' },
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      breadcrumb: { label: 'Сторінку не знайдено', name: 'not-found' },
    },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

createRouteGuards(router)
const { attach } = setupSessionLostHandler(router)

export function setupSessionLostHandlerAfterPinia() {
  attach()
}

export default router