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
      next_step: "next"
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
      switch (this.next_step) {
        case "next":
          this.$router.push("/select_scans")
          this.prompt = "Please select scans"
          this.next_step = "preview"
          break
        case "preview":
          this.$router.push("/preview")
          this.prompt = ""
          this.next_step = "confirm"
          const request = "/preview?config=" + this.store.config + "&selected_scans=" + JSON.stringify(this.store.selected_scans)
          axios.get(request).then(res => {
            const data = res.data
            console.log(data);
            //TODO
          })
          break
        case "confirm":
          axios.get("/confirm", {
            params: {
              software: this.store.software,
              output_dir: this.store.output_dir,
              output_type: this.store.output_type,
              selected_scans: JSON.stringify(this.store.selected_scans),
              config: this.store.config
            }
          }).then(res => {
            const data = res.data
            alert("BIDS conversion begins! Progress is displayed in server console")
          })
          break
      }
    },
    back() {
      switch (this.next_step) {
        case "confirm":
          this.$router.push("/select_scans")
          this.prompt = "Please select scans"
          this.next_step = "preview"
          break
        case "preview":
          this.$router.push("/")
          this.prompt = "Please select data folders"
          this.next_step = "next"
          break
      }
    }
  }
}).use(vuetify).use(router).mount('#app')
