import store from "/file?path=library/store.js"
export default {
    template:await axios.get("/file",{
        params:{
            path:"components/SelectScans.html",
            type:"text/plain"
        }
    }).then(res=>(res.data)),
    data() {
        return {
            store,
            scan_params: {}
        }
    },
    mounted() {
        axios.post("/data",{
            task:"scan_params",
            data_folders:JSON.stringify(this.store.data_folders)
        }).then(res => {
            const data = res.data
            // console.log(data);
            store.scans_all = data
        })
    },
    computed: {
        data_folders() {
            return this.store.data_folders.map(function (item) {
                return {
                    title: item,
                    value: item
                }
            })
        },
        scans() {
            if (this.store.selected_folder.length > 0) {
                return store.scans_all[store.selected_folder[0]]
            }
        }
    },
    methods: {
        displayScanParams(scan) {
            this.scan_params = JSON.parse(JSON.stringify(scan))
            delete this.scan_params["disabled"]
            delete this.scan_params["path"]
            delete this.scan_params["scan_name"]
            delete this.scan_params["protocol_name"]
            delete this.scan_params["E_number"]
            
        },
        emptyScanParams() {
            this.scan_params = {}
        },
        scan_name(scan) {
            if (scan.scan_name) {
                if (scan.E_number) {

                    return scan.scan_name + " (E" + scan.E_number + ")"
                } else {
                    return scan.scan_name
                }
            }
        }
    }
}