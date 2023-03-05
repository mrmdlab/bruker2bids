import SelectFolders from "/file?path=components/SelectFolders.js"
import SelectScans from "/file?path=components/SelectScans.js"

const routes = [
    { path: '/', component: SelectFolders },
    { path: '/select_scans', component: SelectScans },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

export default router