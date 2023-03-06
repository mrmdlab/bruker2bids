import sys
import os
import json

def getScanParams(acqp_path,result):
    with open(acqp_path) as f:
        line = f.readline()
        while line:
            for (key,value) in params.items():
                if line.startswith(value):
                    if line.endswith(")\n"):
                        # the next line is the parameter
                        result[key]=f.readline().replace("<","").replace(">","")
                    else:
                        # the current line is the parameter
                        result[key]=line[line.index("=")+1:]
            line = f.readline()

# path to data folder
# eg. /opt/mridata/data/nmrsu/20230303_145030_mrmdPractice2910DREADD_1_1
data_folder = sys.argv[1]
scans = []

# TODO add more parameters
params={
    "slice_thick":"##$ACQ_slice_thick=",
    "scan_name":"##$ACQ_scan_name=",
    "protocol_name":"##$ACQ_protocol_name="
}
for E_number in os.listdir(data_folder):
    # 1.make sure it's a folder
    # 2.make sure it has fid file. otherwise, the scan is uncompleted or not started
    # 3.read scan name from the acqp file
    scan_folder=data_folder+"/"+E_number # absolute path to an E number folder
    if os.path.isdir(scan_folder) and E_number != "AdjResult":
        result={"value": scan_folder}
        if os.path.isfile(data_folder+"/"+E_number+"/fid"):
            result["disabled"]=False # normal
        else:
            result["disabled"]=True # uncompleted or not started
        acqp_path = data_folder+"/"+E_number+"/acqp"
        getScanParams(acqp_path,result)
        scans.append(result)

# paths, parameters, and statuses of scans in one data folder
print(json.dumps(scans))