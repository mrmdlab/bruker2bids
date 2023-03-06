#! /usr/bin/env bash -l
conda activate dicomifier

tmp_bruker2bids="$PWD/tmp_bruker2bids"
output_dir=$PWD
config=`dirname $(which bruker2bids)`/config_example.json
while getopts "d:c:o:" arg
do
	case $arg in
	d)
	input_dir=$(readlink -e $OPTARG)
	;;
	
	c)
	config=$(readlink -e $OPTARG)
	;;

    o)
	output_dir=$(readlink -m $OPTARG)
	;;
	esac
done

mkdir -p $tmp_bruker2bids
mkdir -p $output_dir
dicomifier nii -z $input_dir $tmp_bruker2bids
python scripts/bids_dicomifier.py $tmp_bruker2bids $output_dir $config && rm -r tmp_bruker2bids
