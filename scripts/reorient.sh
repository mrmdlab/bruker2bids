#! /bin/sh

# Usage: bash reorient.sh <file_path> <transformation_matrix>
# 
# Example
# ---
# bash reorient.sh sub-mrmdSajiWT01_ses-iv01_T2w.nii.gz "-1 0 0 0 0 0 1 0 0 1 0 0 0 0 0 1"

file=$1
transformation=$2

sform=$(fsl fslorient -getsform $file)
sform=$(python scripts/cal_sform.py "$sform" "$transformation")
fsl fslorient -setsform $sform $file
fsl fslorient -copysform2qform $file
