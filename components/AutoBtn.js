import store from "/file?path=library/store.js"
export default {
    template: await axios.get("/file", {
        params: {
            path: "components/AutoBtn.html",
            type: "text/plain"
        }
    }).then(res => (res.data)),
    data() {
        return {
            dialog: false,
            store,
        }
    },
    computed:{
        start_stop(){
            if(store.is_auto_bids_running){
                return "Stop"
            }else{
                return "Start"
            }
        }
    },
    methods: {
        check(){
            axios.get("/auto_bids")
        },
        startAuto() {
            switch (this.start_stop) {
                case "Start":
                    store.is_auto_bids_running=true
                    axios.get("/auto_bids", {
                        params: {
                            task: "start",
                            delay: store.delay,
                            config:store.config,
                            software: store.software,
                            output_dir: store.output_dir,
                            output_type: "files",
                            reorientation_code:store.reorientation_code
                        }
                    })
                    alert("Automated BIDS conversion begins! Progress is displayed in server console")
                    break
                case "Stop":
                    store.is_auto_bids_running=false
                    axios.get("/auto_bids", {
                        params: {
                            task: "stop",
                        }
                    })
                    break
            }
        }
    }
}