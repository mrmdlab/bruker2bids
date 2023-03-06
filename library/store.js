const { reactive } = Vue

const store = reactive({
    data_list: [], // all data folders
    data_folders: [], // selected data folders
    data_directory: "",
    selected_scans:[],

    software: "dicomifier",
    output_dir:"",
    output_type:"files"
})

export default store