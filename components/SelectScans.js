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
            console.log(data);
            this.scans_all = data
        })
    },
    computed: {
        data_folders() {
            return this.store.data_folders.map(function (item) {
                return {
                    title: item,
                    value: item
                }
            })
        },
        scans() {
            if (this.selected_folder.length > 0) {
                console.log(this.scans_all[this.selected_folder[0]][0].scan_name);
                console.log(this.scans_all[this.selected_folder[0]][0].value);
                console.log(this.scans_all[this.selected_folder[0]][0].disabled);
                return this.scans_all[this.selected_folder[0]]
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
        <v-list select-strategy="independent" active-color="primary">
            <v-list-item v-for="scan in scans" :key="scan.value" :value="scan.value" :disabled="scan.disabled">
                <v-list-item-title>{{scan.scan_name}}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
</v-col>
</v-row>
`
}