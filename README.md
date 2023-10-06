# Installation
```sh
git clone https://github.com/Microdeep-ZL/bruker2bids.git
conda create -n bruker2bids -c conda-forge dcm2niix nodejs
```
# dependecies
- pigz, tree, zip
	- If you don't have sudo privilege to install them, try these two workarounds
		- If you are using CentOS or Red Hat, [user-yum.sh](https://gitlab.com/caroff/user-yum.sh) is recommended
		- Otherwise
		```sh
		# add the following lines to your ~/.bashrc
		function tree(){
		    path=.
		    if [ -n $1 ]
		        then path="$@"
		    fi
		    find $path -print | sed -e "s;[^/]*/;|____;g;s;____|; |;g"
		}

		alias pigz=gzip
		```
- node.js
- singularity
- FSL singularity container
- [dcm2niix](https://github.com/rordenlab/dcm2niix)
# Quick start
```sh
# add this function to your ~/.bashrc
# <bruker2bids> is the path to this git repository
# <bruker data directory> is the diectory inside which you can find
#   folders like "20230309_115904_mrmdPractice4052DREADD_1_1" etc
function bruker2bids(){
	cd <bruker2bids>
	conda activate bruker2bids
	node main.js <bruker data directory>
}
```
# Features
- **straightforward GUI based on web**
- help you enable port forwarding when using bruker2bids through SSH
- wildcards and list support in criteria
- immediate preview of BIDS result
- immediate preview of scan parameters
- zip or tar.gz the result with one click
- automatic run label for scans with identical labels according to their chronological order
- No interference between mutiple users
- reorient images with one click
# Demo
- The author is kind of too lazy to prepare a video. Just try it. If you have got any question, open an issue. I'm more than glab to help you! If you like it, please give this repository a star! If you see many stars, that means you can trust this program!