#! /bin/sh

input_dir=$1
output_dir=$2
bids_path=$3
tmp_bruker2bids=$4

dicomifier nii -z $input_dir $tmp_bruker2bids
mkdir -p `dirname $output_dir/$bids_path`
mv $tmp_bruker2bids/*/*/*/1.json $output_dir/$bids_path.json
mv $tmp_bruker2bids/*/*/*/1.nii.gz $output_dir/$bids_path.nii.gz