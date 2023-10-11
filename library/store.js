const { reactive } = Vue

const store = reactive({
    data_list: [], // all data folders
    data_folders: [], // selected data folders
    data_directory: "",
    next_step: "next",
    
    scans_all:{},
    selected_folder: [], // only one element

    selected_scans:[], // list of scans, each scan is an object derived from `getScanParams.py`
    software: "dcm2niix", // used to support dcm2niix and dicomifier. Now only dcm2niix is supported
    output_dir:"",
    output_type:"zip",
    reorientation_code:"NA",
    config:"", // json string

    bids_tree:"",
    delay: 3, // delay (seconds) for DICOM conversion to finish
    is_auto_bids_running:false
})

export default store