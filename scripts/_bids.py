#! /usr/bin/env python

import sys
import os
import json
from fnmatch import fnmatch
from datetime import datetime


def meetCriteria(scan, description):
    criteria = description["criteria"]
    for key in criteria.keys():
        if type(criteria[key]) == str:
            if not fnmatch(scan.get(key, ""), criteria[key]):
                return
        else:
            # criteria[key] is a list of str
            i = 0
            while i < len(criteria[key]):
                if fnmatch(scan.get(key, ""), criteria[key][i]):
                    break
                i += 1
            if i == len(criteria[key]):
                return
    postMeetCriteria(scan, description)


def postMeetCriteria(scan, description):
    sub = scan["subject"]
    ses = scan["session"]
    datatype = description["dataType"]
    path = f"sub-{sub}/ses-{ses}/{datatype}"

    modalityLabel = description["modalityLabel"]
    customLabels = description.get("customLabels", "")
    underscore = "_" if customLabels else ""

    bids_path_first_half = f"{path}/sub-{sub}_ses-{ses}{underscore+customLabels}"
    setRuns(scan, bids_path_first_half, modalityLabel)


def setRuns(scan, bids_path_first_half, modalityLabel):
    bids_path = f"{bids_path_first_half}_{modalityLabel}"
    if bids_path in runs:
        runs[bids_path].append(scan)
    else:
        runs[bids_path] = [scan]


if __name__ == "__main__":
    scans = json.loads(sys.argv[1])
    config_file = sys.argv[2]
    runs = {}

    with open(config_file) as f:
        descriptions = json.load(f)["descriptions"]
        for i in range(len(descriptions)):
            for scan in scans:
                meetCriteria(scan, descriptions[i])

    for (bids_path, scans) in runs.items():
        if len(scans) == 1:
            scans[0]["bids_path"] = bids_path
        else:
            underscore_index = bids_path.rindex("_")
            bids_path_first_half = bids_path[:underscore_index]
            modalityLabel = bids_path[underscore_index+1:]
            for i, scan in enumerate(sorted(scans, key=lambda scan: datetime.strptime(scan.get("date_time", "2000-01-01T00:00:00"), '%Y-%m-%dT%H:%M:%S'))):
                scan["bids_path"] = f"{bids_path_first_half}_run-{i+1}_{modalityLabel}"
    print(json.dumps(scans))
