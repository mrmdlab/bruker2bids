## Todo
- fix dim_info, abandon fslorient
- SelectScan.vue to be async
- adapt to different screen size
- after deselecting a study folder, any relevant scans should also be removed
## changelog
- 0.2.0
    - automatic BISD conversion
        - run a macro as a post scan activity to send a GET request to bruker2bids server. When such a request is received, check for new DICOM folders and convert to BIDS as per the specified config and options
        - run1, run2 problem
        - delay time for DICOM conversion to finish
        - manual check
        - output type must be and is automatically "files"
        - disable confirm
    - save, load and delete config files
    - separate the template of Vue Component into an HTML file
    - abandon dicomifier
    - get to post
    - select all and deselect all for scans