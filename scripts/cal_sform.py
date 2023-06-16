#! /usr/bin/env python

# Usage: python cal_sform.py "<sform>" "<transformation_matrix_flatten>"
# IMPORTANT: Remember to use quotes for the parameters
#
# Example
# ---
# python cal_sform.py "-0.3 -0 0 15.6303 0 0 -0.3 7.7884 0 0.3 0 -15.1202 0 0 0 1" "-1 0 0 0 0 0 1 0 0 1 0 0 0 0 0 1"

import numpy as np
import sys

sform=sys.argv[1].split()
transformation=sys.argv[2].split()
sform=np.array(sform).reshape((4,4)).astype(float)
transformation=np.array(transformation).reshape((4,4)).astype(float)
print(np.array2string(np.matmul(transformation,sform).flatten())[1:-1])
