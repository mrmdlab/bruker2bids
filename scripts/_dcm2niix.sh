#! /bin/sh

input_dir=$1/pdata/1/dicom
output_dir=$2
bids_path=$3
tmp_bruker2bids=$4

dcm2niix -z y -f 1 -o $tmp_bruker2bids $input_dir
mkdir -p `dirname $output_dir/$bids_path`
mv $tmp_bruker2bids/1.json $output_dir/$bids_path.json
mv $tmp_bruker2bids/1.nii.gz $output_dir/$bids_path.nii.gz