import SelectFolders from "/file?path=components/SelectFolders.js"
import SelectScans from "/file?path=components/SelectScans.js"
import ResultPreview from "/file?path=components/ResultPreview.js"
const routes = [
    { path: '/', component: SelectFolders },
    { path: '/select_scans', component: SelectScans },
    { path: '/preview', component: ResultPreview },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

export default router