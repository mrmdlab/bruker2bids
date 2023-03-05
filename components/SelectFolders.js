import store from "/file?path=library/store.js"
export default {
    data(){
        return {
            store
        }
    },
    template:`
<v-row>
    <v-col cols="6">
        <v-select v-model="store.data_folders" :items="store.data_list" label="data folders" multiple></v-select>
    </v-col>
</v-row>
`
}