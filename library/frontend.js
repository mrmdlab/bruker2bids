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
      this.$router.push("/select_scans")
      this.prompt="Please select scans"
    },
    back() {
      this.$router.push("/")
    }
  }
}).use(vuetify).use(router).mount('#app')
