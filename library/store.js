const { reactive } = Vue

const store = reactive({
    data_list: [], // all data folders
    data_folders: [], // selected data folders
    data_directory: "",
})

export default store