import sys
import os
import json

def getScanName(acqp_path):
    with open(acqp_path) as f:
        line = f.readline()
        while line:
            if line.startswith("##$ACQ_scan_name="):
                return f.readline()[1:-2]  # remove the angle brackets
            line = f.readline()

# path to data folder
# eg. /opt/mridata/data/nmrsu/20230303_145030_mrmdPractice2910DREADD_1_1
data_folder = sys.argv[1]
scan_names = []
for E_number in os.listdir(data_folder):
    # 1.make sure it's a folder
    # 2.make sure it has fid file. otherwise, the scan is uncompleted or not started
    # 3.read scan name from the acqp file
    if os.path.isdir(data_folder+"/"+E_number) and E_number != "AdjResult":
        result={"E_number": E_number}
        if os.path.isfile(data_folder+"/"+E_number+"/fid"):
            result["status"]=1 # normal
        else:
            result["status"]=0 # uncompleted or not started
        acqp_path = data_folder+"/"+E_number+"/acqp"
        result["scan_name"]=getScanName(acqp_path)
        scan_names.append(result)

# scan names, statuses and E numbers of one data folder
print(json.dumps(scan_names))