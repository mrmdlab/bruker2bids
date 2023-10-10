import store from "/file?path=library/store.js"
export default {
  template: await axios.get("/file",{
    params:{
        path:"components/ConfigBtn.html",
        type:"text/plain"
    }
}).then(res=>(res.data)),
  data() {
    return {
      store,
      dialog: false,
      SL_dialog:false,
      config_edited:"",
      config_list:[], // eg ["config_default","custom_config"]
      selected_config:["config_default"] // only one element
    }
  },
  mounted() {
    axios.get("/file?path=configs/config_default.json", { responseType: 'text' }).then(res => {
      store.config = res.data
  })
  },
  computed:{
    configs(){
      return this.config_list.map(function(filename){
        return {
          title: filename,
          value: filename
        }
      })
    },
    disableDelete(){
      if(this.selected_config[0]=="config_default"||!this.config_list.includes(this.selected_config[0])){
        return true
      }
      return false
    },
    disableSave(){
      if(this.selected_config[0]==""){
        return true
      }
      return false
    },
    disableLoad(){
      if(!this.config_list.includes(this.selected_config[0])){
        return true
      }
      return false
    }
  },
  methods:{
    done(){
      this.dialog = false
      this.store.config=this.config_edited
      if (this.store.next_step=="confirm"){
        this.store.next_step="preview"
      }
    },
    openConfig(){
      this.config_edited=this.store.config
    },
    refreshConfigList(){
      axios.post("/data",{
        task:"config_list"
      }).then(res=>{
        this.config_list=res.data.config_list.map(function(filename){
          return filename.replace(".json","")
        })
        for (let i = 0; i < this.config_list.length; i++) {
          if(this.config_list[i].startsWith("config_tmp")){
            this.config_list.splice(i,1)
          }          
        }
      })
    },
    deleteConfig(){
      axios.post("/delete",{
        path:"configs/"+this.selected_config[0]+".json"
      }).then(()=>{
        this.refreshConfigList()
      })
    },
    save(){
      axios.post("/write",{
        config:this.config_edited,
        name:this.selected_config[0]
      }).then(()=>{
        this.refreshConfigList()
      })
    },
    load(){
      this.SL_dialog = false
      axios.get("/file?path=configs/"+this.selected_config[0]+".json", { responseType: 'text' }).then(res => {
        this.config_edited = res.data
      })
    }
  }
}