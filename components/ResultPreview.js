import store from "/file?path=library/store.js"
export default {
    data() {
        return {
            store
        }
    },
    template:
        `
        <v-card title="BIDS tree preview">
        <v-container>
            <pre v-text="store.bids_tree"></pre>
        </v-container>
    </v-card>
    
`
}