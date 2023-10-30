const { createApp } = Vue
const { createVuetify } = Vuetify
const vuetify = createVuetify()
import router from "/file?path=library/router.js"
import store from "/file?path=library/store.js"

import OptionBtn from "/file?path=components/OptionBtn.js"
import ConfigBtn from "/file?path=components/ConfigBtn.js"
import AutoBtn from "/file?path=components/AutoBtn.js"

Date.prototype.Format = function (fmt) { // author: meizz
  var o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    "S": this.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

createApp({
  components: {
    OptionBtn,
    ConfigBtn,
    AutoBtn
  },
  data() {
    return {
      store,
      prompt: "Please select data folders",
      all:false // true if all available scans are selected

    }
  },
  mounted() {
    axios.post("/data",{
      task:"data_list"
    }).then((res) => {
      const data = res.data
      // console.log(data);
      this.store.data_directory = data.data_directory
      this.store.data_list = data.data_list
      store.port = data.port
      store.is_auto_bids_running=data.is_auto_bids_running

      const time = new Date()
      this.store.output_dir = "~/Downloads/output_bruker2bids_" + time.Format("yyyyMMddhhmmss")
    })
  },
  methods:
  {
    next() {
      switch (this.store.next_step) {
        case "next":
          this.$router.push("/select_scans")
          this.prompt = "Please select scans"
          this.store.next_step = "preview"
          break
        case "preview":
          this.$router.push("/preview")
          this.prompt = ""
          this.store.next_step = "confirm"
          axios.post("/preview",{
            config:this.store.config,
            selected_scans:this.resolveSelectedScans(store.selected_scans)
          }).then(res => {
            const data = res.data
            this.store.bids_tree = data
            // console.log(data);
          })
          break
        case "confirm":
          axios.post("/confirm", {
            software: this.store.software,
            output_dir: this.store.output_dir,
            output_type: this.store.output_type,
            reorientation_code:this.store.reorientation_code
          }).then(res => {
            alert("BIDS conversion begins! Progress is displayed in server console")
          })
          break
      }
    },
    back() {
      switch (this.store.next_step) {
        case "confirm":
          this.$router.push("/select_scans")
          this.prompt = "Please select scans"
          this.store.next_step = "preview"
          break
        case "preview":
          this.$router.push("/")
          this.prompt = "Please select data folders"
          this.store.next_step = "next"
          break
      }
    },    
    resolveSelectedScans(select_scans) {
      return JSON.stringify(select_scans.map(function (scan) {
        return JSON.parse(scan)
      }))
    },
    select_all(){
      if(this.all){
        store.selected_scans=[]
      }
      else{
        //select all
        store.selected_scans=[]
        for (const folder in store.scans_all) {
          for (const scan of store.scans_all[folder]) {
            if (!scan.disabled) {
              store.selected_scans.push(JSON.stringify(scan))
            }
          }
        }
      }
      this.all=!this.all
    }
  }
}).use(vuetify).use(router).mount('#app')
