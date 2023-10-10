import store from "/file?path=library/store.js"
export default {
    template:await axios.get("/file",{
        params:{
            path:"components/OptionBtn.html",
            type:"text/plain"
        }
    }).then(res=>(res.data)),
    data() {
        return {
            dialog: false,
            reorientation_option: "none",
            disable_code_editing:true,
            store,
        }
    },
    watch: {
        reorientation_option(option) {
            switch(option){
                case "SIGMA,Allen,Dsurque":
                    this.disable_code_editing=true
                    this.store.reorientation_code="-1 0 0 0 0 0 1 0 0 1 0 0 0 0 0 1"
                    break
                case "none":
                    this.disable_code_editing=true
                    this.store.reorientation_code="NA"
                    break
                case "custom":
                    this.disable_code_editing=false
                    break
            }
        }
    }
}