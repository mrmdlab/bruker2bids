#!/usr/bin/env python

import numpy as np
import sys
    
def get_bdata(methodfile):
    """
    Read diffusion weighted gradient b-values (bval) directions (bvec)

    Parameters
    ----------
    methodfile : string
        full path to Bruker method file.

    Returns
    -------
    bvals : ndarray
        DWI b-values.
    bvecs : ndarray
        DWI diffusion gradients' directions.
    """

    f = open(methodfile,"r")
    ftxt = f.readlines()
    count = 0
    bvals_text = ''
    bvecs_text = ''
    for line in ftxt:
        if line.startswith('$$ @vis') or line.startswith('##$PVM_DwGradRead'):
            count = 0
        if count == 2:
            bvecs_text += line[0:len(line)-1]
        if line.startswith('##$PVM_DwGradVec'):
            count = 2
        if count == 1:
            bvals_text += line[0:len(line)-1]
        if line.startswith('##$PVM_DwEffBval'):
            count = 1
    bvecs_list = list(map(np.float64, bvecs_text.split()))
    bvecs =  np.asarray(bvecs_list)
    bvecs = np.reshape(bvecs,[int(bvecs.shape[0]/3),3])
    # normalizing b vectors
    magnitude = np.sqrt(np.sum(bvecs**2,1))
    magnitude[magnitude==0] = 1
    bvecs = bvecs/magnitude[:,None]

    bvals_list = list(map(np.float64, bvals_text.split()))
    bvals =  np.asarray(bvals_list)
    
    return bvals, bvecs

if __name__ == "__main__":
    methodfile=sys.argv[1]
    bids_path=sys.argv[2]

    bvals, bvecs=get_bdata(methodfile)
    nbval = bvals.shape[0]
    np.savetxt(bids_path+".bval", bvals.reshape((1,nbval)), fmt='%f')
    np.savetxt(bids_path+".bvec", bvecs.transpose(), fmt='%f')
