#! /usr/bin/env python

import json
import sys
import os
import glob
import shutil
import pathlib
from fnmatch import fnmatch
# fnmatch is not sensitive to letter case
# fnmatchcase is sensitive to letter case

def meetCriteria(json_file, description):
    criteria=description["criteria"]
    with open(json_file,"r+") as ff:
        file_data = json.load(ff)
        for key in criteria.keys():
            if type(criteria[key])==str:
                if not fnmatch(file_data.get(key,[""])[0], criteria[key]):
                    return
            else:
                # criteria[key] is a list of str
                i=0
                while i<len(criteria[key]):
                    if fnmatch(file_data.get(key,[""])[0], criteria[key][i]):
                        break
                    i+=1
                if i==len(criteria[key]):
                    return
        postMeetCriteria(json_file, file_data, description)
        processJSON(file_data, ff)

def postMeetCriteria(json_file, file_data, description):
    sub=file_data["PatientID"][0]
    ses=file_data["StudyDescription"][0]
    datatype=description["dataType"]
    path=f"{output_dir}/sub-{sub}/ses-{ses}/{datatype}"
    os.makedirs(path, exist_ok=True)

    modalityLabel=description["modalityLabel"]
    customLabels=description.get("customLabels","")
    underscore="_" if customLabels else ""

    filename_first_half=f"{path}/sub-{sub}_ses-{ses}{underscore+customLabels}"
    filename=getFilename(file_data, filename_first_half, modalityLabel)

    json_path=f"{filename}.json"
    image_path=f"{filename}.nii.gz"
    image_file=f"{json_file[:-4]}nii.gz"
    
    if datatype=="dwi":
        os.system(f"dicomifier diff -i {image_file} {json_file} fsl {filename}.bvec {filename}.bval")
    shutil.move(json_file, json_path)
    shutil.move(image_file, image_path)

def getFilename(file_data, filename_first_half, modalityLabel):
    filename=f"{filename_first_half}_{modalityLabel}"
    if filename in run:
        run[filename]+=1
        acqtime2filename={int(file_data["AcquisitionDateTime"][0]):json_file[:-5]}
        for file in glob.glob(f"{filename_first_half}*_{modalityLabel}.json"):
            with open(file) as ff:
                json_data=json.load(ff)
                acqtime2filename.update({int(json_data["AcquisitionDateTime"][0]):file[:-5]})
        for i,key in enumerate(sorted(acqtime2filename.keys())): # ascending
            if acqtime2filename[key]==json_file[:-5]:
                filename=f"{filename_first_half}_run-{i+1}_{modalityLabel}"
            else: # rename files in BIDS folder
                for f in glob.glob(f"{acqtime2filename[key]}*"): # including .json .nii.gz .bval .bvec and so on
                    ext=''.join(pathlib.Path(f).suffixes)
                    filename_new=f"{filename_first_half}_run-{i+1}_{modalityLabel}{ext}"
                    shutil.move(f,filename_new)
    else:
        run[filename]=1

    return filename

def processJSON(file_data, ff):
    del file_data["EncapsulatedDocument"]
    for key in file_data.keys():
        if type(file_data[key])==list and len(file_data[key])==1:
            file_data[key]=file_data[key][0]
    ff.seek(0)     # Move to the beginning of the file
    ff.truncate()  # clear the old content,
                   # otherwise, new content would be appended to the end of the file
    json.dump(file_data,ff)

if __name__=="__main__":
    tmp_bruker2bids = sys.argv[1]
    output_dir = sys.argv[2]
    config = sys.argv[3]
    run={}
    
    with open(config) as ff:
        descriptions = json.load(ff)["descriptions"]
        for i in range(len(descriptions)):
            for json_file in glob.glob(f"{tmp_bruker2bids}/*/*/*/1.json"):
                meetCriteria(json_file, descriptions[i])
                