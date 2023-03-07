const { createApp } = Vue
const { createVuetify } = Vuetify
const vuetify = createVuetify()
import router from "/file?path=library/router.js"
import store from "/file?path=library/store.js"

import OptionBtn from "/file?path=components/OptionBtn.js"
import ConfigBtn from "/file?path=components/ConfigBtn.js"

createApp({
  components: {
    OptionBtn,
    ConfigBtn
  },
  data() {
    return {
      store,
      prompt: "Please select data folders",
      
    }
  },
  mounted() {
    axios.get("/data?task=data_list").then((res) => {
      const data = res.data
      // console.log(data);
      this.store.data_directory = data.data_directory
      this.store.data_list = data.data_list
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
          const request = "/preview?config=" + this.store.config + "&selected_scans=" + this.resolveSelectedScans(this.store.selected_scans)
          axios.get(request).then(res => {
            const data = res.data
            this.store.bids_tree = data
            // console.log(data);
          })
          break
        case "confirm":
          axios.get("/confirm", {
            params: {
              software: this.store.software,
              output_dir: this.store.output_dir,
              output_type: this.store.output_type
            }
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
    }
  }
}).use(vuetify).use(router).mount('#app')
