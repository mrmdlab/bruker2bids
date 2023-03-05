import store from "/file?path=library/store.js"
export default {
    data() {
        return {
            store,
            scans_all: {},
            selected_folder: [], // only one element
        }
    },
    mounted() {
        axios.get("/data?task=scan_names&data_folders=" + JSON.stringify(this.store.data_folders)).then(res => {
            const data = res.data
            this.scans_all = data
        })
    },
    computed: {
        data_folders() {
            return this.store.data_folders.map(this.toItems)
        },
        scans() {
            if (this.selected_folder.length > 0) {
                return this.scans_all[this.selected_folder[0]].map(function (scan) {
                    return scan.scan_name
                }).map(this.toItems)
            }
        }
    },
    methods:{
        toItems(item) {
            return {
                title: item,
                value: item
            }
        }
    },
    template: `
<v-row>
    <!-- data folders -->
    <v-col cols="6">
        <v-card title="data folders">
            <v-list :items="data_folders" v-model:selected="selected_folder" active-color="primary">
            </v-list>
        </v-card>
    </v-col>

    <!-- scans -->
    <v-col cols="6">
        <v-card title="scans">
            <v-list :items="scans" select-strategy="independent" active-color="primary">
            </v-list>
        </v-card>
    </v-col>
</v-row>
`
}