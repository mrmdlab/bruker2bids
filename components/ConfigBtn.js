import store from "/file?path=library/store.js"
export default {
  data() {
    return {
      store,
      dialog: false,
      config: "", // json string
      config_edited:""
    }
  },
  mounted() {
    axios.get("/file?path=configs/config_default.json", { responseType: 'text' }).then(res => {
      const data = res.data
      this.config = data
    })
  },
  methods:{
    save(){
      this.dialog = false
      this.config=this.config_edited    
    },
    openConfig(){
      this.config_edited=this.config
    }
    // saveAs(){

    // },
  },
  template:
`
<div class="text-center">
    <v-btn color="primary" size="small" @click="openConfig">
        config
        <v-dialog v-model="dialog" activator="parent" fullscreen>
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>config</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn variant="text" @click="dialog = false">
                            Cancel
                        </v-btn>

                        <!--
                        <v-btn variant="text" @click="saveAs">
                            Save As
                        </v-btn>
                        -->

                        <v-btn variant="text" @click="save">
                            Save
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-textarea auto-grow v-model="config_edited"></v-textarea>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-btn>
</div>
`
}