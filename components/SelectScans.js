import store from "/file?path=library/store.js"
export default {
    data() {
        return {
            store,
            scan_params: {}
        }
    },
    mounted() {
        axios.post("/data",{
            task:"scan_params",
            data_folders:JSON.stringify(this.store.data_folders)
        }).then(res => {
            const data = res.data
            // console.log(data);
            store.scans_all = data
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
            if (this.store.selected_folder.length > 0) {
                return store.scans_all[store.selected_folder[0]]
            }
        }
    },
    methods: {
        displayScanParams(scan) {
            this.scan_params = JSON.parse(JSON.stringify(scan))
            delete this.scan_params["disabled"]
            delete this.scan_params["path"]
            delete this.scan_params["scan_name"]
            delete this.scan_params["protocol_name"]
            delete this.scan_params["E_number"]
            
        },
        emptyScanParams() {
            this.scan_params = {}
        },
        scan_name(scan) {
            if (scan.scan_name) {
                if (scan.E_number) {

                    return scan.scan_name + " (E" + scan.E_number + ")"
                } else {
                    return scan.scan_name
                }
            }
        }
    },
    template:
        `
<v-row>
    <!-- data folders -->
    <v-col cols="6">
        <v-card title="data folders" class="overflow-auto" height="200">
            <v-list density="compact" :items="data_folders" v-model:selected="store.selected_folder" active-color="primary">
            </v-list>
        </v-card>
    </v-col>

    <!-- scans -->
    <v-col cols="6">
        <v-card title="scans" class="overflow-auto" height="200">
            <v-list density="compact" select-strategy="independent" v-model:selected="store.selected_scans"
                active-color="primary">
                <v-list-item @mouseover="displayScanParams(scan)" @mouseleave="emptyScanParams" v-for="scan in scans" :key="scan.path" :value="JSON.stringify(scan)"
                    :disabled="scan.disabled">
                    <v-list-item-title>{{scan_name(scan)}}</v-list-item-title>
                    <v-list-item-subtitle>{{scan.protocol_name}}</v-list-item-subtitle>
                </v-list-item>
            </v-list>
        </v-card>
    </v-col>

    <!-- scan parameters -->
    <v-col>
        <v-card title="scan parameters" height="250">
            <v-container>
                <v-row class="d-flex justify-left">
                    <v-col cols="3" v-for="(value, key) in scan_params" class="py-0">
                        {{key}}: {{value}}
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-col>
</v-row>
`
}