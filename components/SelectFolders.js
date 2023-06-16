import store from "/file?path=library/store.js"
export default {
    data() {
        return {
            store
        }
    },
    computed: {
        data_list() {
            return this.store.data_list.map(function (item) {
                return {
                    title: item,
                    value: item
                }
            })
        }
    },
    template: `
        <v-card title="data list">
            <v-list density="compact" select-strategy="independent" :items="data_list" v-model:selected="store.data_folders" active-color="primary">
            </v-list>
        </v-card>
`
}