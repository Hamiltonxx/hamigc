import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/login'),
    },
    {
        path: '/coding',
        name: 'Coding',
        component: () => import('../views/coding')
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});


const publicPath = [
    '/login'
];
router.beforeEach((to, from, next) => {
    if (publicPath.includes(to.path)) {
        return next();
    }

    if (localStorage.getItem('python.user')) {
        return next();
    }

    next('/login');
});

export default router;