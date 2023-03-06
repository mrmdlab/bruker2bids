const { reactive } = Vue

const store = reactive({
    data_list: [], // all data folders
    data_folders: [], // selected data folders
    data_directory: "",
    selected_scans:[], // list of scans, each scan is an object derived from `getScanParams.py`

    software: "dicomifier",
    output_dir:"",
    output_type:"files",
    config:"" // json string
})

export default store