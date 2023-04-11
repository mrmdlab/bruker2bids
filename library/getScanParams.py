import sys
import os
import json


def getScanParams(file_path, params, result):
    with open(file_path) as f:
        line = f.readline()
        while line:
            for (key, value) in params.items():
                if line.startswith(value):
                    if line.endswith(")\n"):
                        # the next line is the parameter
                        result[key] = f.readline().replace(
                            "<", "").replace(">", "").replace("\n", "")
                    else:
                        # the current line is the parameter
                        result[key] = line[len(value):].replace("\n", "")
            line = f.readline()
    for key in result.keys():
        if key in ["TE","TR"]:
            try:
                result[key]=f'{round(float(result[key]))} ms'
            except Exception:
                pass
        elif key == "date_time":
            result["date_time"] = result["date_time"][1:20] # from "<2023-03-03T15:39:40,659+0800>" to "2023-03-03T15:39:40"
        elif key == "scan_duration":
            try:
                result["scan_duration"] = f'{round(float(result["scan_duration"])/60000,1)} min'
            except Exception:
                pass
        elif key == "slice_thickness":
            result["slice_thickness"]+=" mm"


# path to data folder
# eg. /opt/mridata/data/nmrsu/20230303_145030_mrmdPractice2910DREADD_1_1
data_folder = sys.argv[1]
scans = []

# TODO add more parameters
# for visu_pars
params = {
    "scan_name": "##$VisuSeriesComment=",
    "protocol_name": "##$VisuAcquisitionProtocol=",
    "sequence_name": "##$VisuAcqSequenceName=",
    "subject": "##$VisuSubjectId=",
    "session": "##$VisuStudyId=",
    "slice_thickness": "##$VisuCoreFrameThickness=",  # mm
    "ETL": "##$VisuAcqEchoTrainLength=",
    "TR": "##$VisuAcqRepetitionTime=",  # ms
    "TE": "##$VisuAcqEchoTime=",  # ms
    "flip_angle": "##$VisuAcqFlipAngle=",
    "scan_duration": "##$VisuAcqScanTime=", # milliseconds, need dividing by 60000, to be minutes
    "date_time": "##$VisuAcqDate=",  # need converting to time object
    "averages": "##$VisuAcqNumberOfAverages=",
    "E_number":"##$VisuExperimentNumber=",
    # "image_size": "##$VisuAcqSize="
}

# for acqp
uncomplete_params = {
    "scan_name": "##$ACQ_scan_name="
}
for E_number in os.listdir(data_folder):
    # 1.make sure it's a folder
    # 2.make sure it has fid file. otherwise, the scan is uncompleted or not started
    # 3.read scan name from the acqp file
    scan_folder = data_folder+"/"+E_number  # absolute path to an E number folder
    if os.path.isdir(scan_folder) and E_number != "AdjResult":
        result = {"path": scan_folder}
        if os.path.isfile(data_folder+"/"+E_number+"/fid") \
         and os.path.isfile(data_folder+"/"+E_number+"/visu_pars") \
         and os.path.isdir(data_folder+"/"+E_number+"/pdata/1/dicom"):
            result["disabled"] = False  # normal
            visu_pars_path = data_folder+"/"+E_number+"/visu_pars"
            # there are two slightly different visu_pars files, but this one doesn't always exist
            # visu_pars_path = data_folder+"/"+E_number+"/pdata/1/visu_pars" 
            getScanParams(visu_pars_path, params, result)
            # if "scan_name" in result.keys():
            #     # scan name from visu_pars doesn't contain E number
            #     result["scan_name"] += f" (E{E_number})"
        else:
            result["disabled"] = True  # uncompleted or not started
            acqp_path = data_folder+"/"+E_number+"/acqp"
            getScanParams(acqp_path, uncomplete_params, result)
        scans.append(result)

# paths, parameters, and statuses of scans in one data folder
print(json.dumps(scans))
