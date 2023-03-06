const { createApp } = Vue
const { createVuetify } = Vuetify
const vuetify = createVuetify()
import router from "/file?path=library/router.js"
import store from "/file?path=library/store.js"

createApp({
  data() {
    return {
      store,
      prompt: "Please select data folders",
      software: "dicomifier",
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
          // console.log(this.store.selected_scans)
          break
      }
    },
    back() {
      this.$router.push("/")
      this.prompt = "Please select data folders"
      this.next_step = "next"
    },
    cancel(){

    },
    confirm(){
      axios.get("/confirm?software="+this.software)
    }
  }
}).use(vuetify).use(router).mount('#app')
