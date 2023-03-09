const { reactive } = Vue

const store = reactive({
    data_list: [], // all data folders
    data_folders: [], // selected data folders
    data_directory: "",
    next_step: "next",
    
    selected_folder: [], // only one element

    selected_scans:[], // list of scans, each scan is an object derived from `getScanParams.py`
    software: "dcm2niix",
    output_dir:"",
    output_type:"zip",
    config:"", // json string

    bids_tree:"",    
})

export default store