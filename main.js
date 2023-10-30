const http = require("http")
const url = require("url")
const fs = require('fs')
const util = require("util")
const child_process = require('child_process')

const ip_address = getIPAdress()
let port = 55903
const data_directory = process.argv.splice(2)[0]

let updated_scans = [] // each element is a scan object, only those with bids_path property can be converted
let total = 0 // for progress display
let config_tmp = ""
let tmp_bruker2bids = ""
let output_dir_default = ""
let delay
let is_auto_bids_running = false
let auto_bids_begin=0
let auto_bids_record={}
let auto_bids_query={}

const server = http.createServer(function (request, response) {
    const req_url = url.parse(request.url, true)
    const pathname = req_url.pathname
    // console.log(req_url.path)
    // console.log(pathname)
    if (request.method === 'GET') {
        const query = req_url.query
        switch (pathname) {
            case "/":
                fs.readFile("index.html", function (err, data) {
                    readFileCallback(response, data, "text/html")
                })
                break
            case "/file":
                let type = "text/javascript"
                if (query.type) {
                    type = query.type
                }
                fs.readFile(query.path, function (err, data) {
                    readFileCallback(response, data, type)
                })
                break
            case "/auto_bids":
                /**
                 * query:
                 * 
                 * delay
                 * config
                 * software
                 * output_dir
                 * output_type
                 * reorientation_code
                 */
                switch (query.task) {
                    case "start":
                        delay = Number(query.delay) * 1000
                        auto_bids_begin = new Date().getTime()
                        // test
                        // auto_bids_begin = new Date("2023-10-30T06:36:25.138Z").getTime()

                        auto_bids_query = query
                        auto_bids_record = {}
                        is_auto_bids_running = true
                        console.log("########Automated BIDS conversion begins########");
                        break
                    case "stop":
                        is_auto_bids_running = false
                        console.log("########Automated BIDS conversion ends########");
                        break
                    default:
                        if (is_auto_bids_running) {
                            console.log("###Checking###");
                            setTimeout(function () {
                                check_scans()
                            }, delay)
                        }
                }
                response.writeHead(200, { "Content-Type": "text/plain" });
                response.end();
                break
        }
    } else if (request.method === 'POST') {
        let query = '';
        request.on('data', chunk => {
            query += chunk;
        });
        request.on('end', () => {
            query = JSON.parse(query)
            config_tmp = "configs/config_tmp_" + port + ".json"
            tmp_bruker2bids = "tmp_bruker2bids_" + port // add port number at the end, in case multiple users' operation interferes
            output_dir_default = "output_bruker2bids_" + port
            switch (pathname) {
                case "/data":
                    response.writeHead(200, { "Content-Type": "application/json" })
                    switch (query.task) {
                        case "config_list":
                            fs.readdir("configs", function (err, files) {
                                const result = {
                                    config_list:files
                                }
                                response.write(JSON.stringify(result))
                                response.end()
                            })
                            break
                        case "data_list":
                            fs.readdir(data_directory, function (err, files) {
                                const data_list = files.reverse()
                                const result = {
                                    data_list,
                                    data_directory,
                                    port,
                                    is_auto_bids_running
                                }
                                response.write(JSON.stringify(result))
                                response.end()
                            })
                            break
                        case "scan_params":
                            /**
                            * data_folders: list of data folder names
                            */
                            const result = {}
                            const data_folders = JSON.parse(query.data_folders)
                            data_folders.forEach(folder => {
                                const data_folder = data_directory + "/" + folder
                                const stdout = child_process.execSync("python library/getScanParams.py " + data_folder)
                                result[folder] = JSON.parse(stdout)
                            });
                            response.write(JSON.stringify(result))
                            response.end()
                            break
                    }
                    break
                case "/write":
                    /**
                     * body:
                     * config
                     * name
                     */
                    fs.writeFileSync("configs/" + query.name + ".json", query.config)
                    response.writeHead(200, { "Content-Type": "text/plain" })
                    response.end()
                    break
                case "/delete":
                    fs.unlinkSync(query.path)
                    response.writeHead(200, { "Content-Type": "text/plain" })
                    response.end()
                    break
                case "/preview":
                    /**
                     * query:
                     * 
                     * selected_scans
                     * config
                     */

                    /**
                     * selected_scans: eg.
                     * 
                     * [ { path: '/opt/mridata/data/nmrsu/20230303_110418_mrmdPractice4405DREADD_1_2/3',
                         
                            slice_thickness: '0.352',
                            subject: 'mrmdPractice4405DREADD',
                            session: 'iv02',
                            scan_name: 'test_rsfMRI_0p300 (E3)',
                            protocol_name: 'rsfMRI' 
                        },
                        ...
                    ]
                    */

                    // save `config_tmp_{port}.json`
                    fs.writeFileSync(config_tmp, query.config)

                    // add bids_path property  eg.
                    // bids_path: 'sub-mrmdPractice5902DREADD/ses-iv01/func/sub-mrmdPractice5902DREADD_ses-iv01_task-rest_acq-geEPI_bold'
                    updated_scans = child_process.execSync(util.format("python scripts/_bids.py '%s' %s", query.selected_scans, config_tmp))
                    updated_scans = JSON.parse(updated_scans)

                    total = 0
                    updated_scans.forEach(function (scan) {
                        // create empty folders
                        // console.log(scan.bids_path);
                        if (scan.bids_path) {
                            total++
                            child_process.execSync("mkdir -p " + tmp_bruker2bids + "/" + scan.bids_path + ".json")
                            child_process.execSync("mkdir -p " + tmp_bruker2bids + "/" + scan.bids_path + ".nii.gz")
                            if (scan.bids_path.endsWith("dwi")) {
                                child_process.execSync("mkdir -p " + tmp_bruker2bids + "/" + scan.bids_path + ".bvec")
                                child_process.execSync("mkdir -p " + tmp_bruker2bids + "/" + scan.bids_path + ".bval")
                            }

                            // for automated bids conversion
                            if(is_auto_bids_running){
                                if(auto_bids_record[scan.path]==scan.bids_path){
                                    //skip
                                    total--
                                    scan.bids_path=undefined
                                }else if(auto_bids_record[scan.path]==undefined){
                                    //convert                                    
                                    auto_bids_record[scan.path]=scan.bids_path
                                }else{
                                    //solve run_1, run_2 problem
                                    //rename and skip
                                    //FIXME what if it has been opened in ITK-SNAP?
                                    const old_bids_path=auto_bids_query.output_dir+"/"+auto_bids_record[scan.path]
                                    const new_bids_path=auto_bids_query.output_dir+"/"+scan.bids_path
                                    rename(old_bids_path,new_bids_path)
                                    
                                    auto_bids_record[scan.path]=scan.bids_path
                                    total--
                                    scan.bids_path=undefined
                                }
                            }

                        }
                    })
                    child_process.exec("tree " + tmp_bruker2bids, function (err, stdout, stderr) {
                        response.writeHead(200, { "Content-Type": "text/plain" })
                        response.write(stdout)
                        response.end()
                        child_process.execSync("rm -rf " + tmp_bruker2bids)
                    })
                    break
                case "/confirm":
                    /**
                     * query:
                     * 
                     * software
                     * output_dir
                     * output_type
                     * reorientation_code
                     */

                    response.writeHead(200, { "Content-Type": "text/plain" })
                    response.end()
                    if(total==0){
                        console.log("###Found nothing to convert###");
                        break
                    }
                    const output_dir = query.output_dir.replace("~",process.env.HOME)

                    switch (query.output_type) {
                        case "zip":
                            convert(updated_scans, query, output_dir_default)
                            compress(output_dir, ".zip")
                            break
                        case "tar.gz":
                            convert(updated_scans, query, output_dir_default)
                            compress(output_dir, ".tar")
                            break
                        case "files":
                            convert(updated_scans, query, output_dir)
                            break
                    }
                    child_process.execSync("rm -rf " + tmp_bruker2bids)
                    console.log("############# BIDS convertion done ###########");
                    break
            }
        });
    }
}).once('listening', function () {
    const username = (child_process.execSync("whoami") + "").trim()
    console.log("If you are using bruker2bids through SSH");
    console.log("Please run this command on your local computer to enable port forwarding");
    console.log(util.format("ssh -L %d:localhost:%d -N %s@%s\n", port, port, username, ip_address));
    console.log(util.format("bruker2bids is running at: http://localhost:%d", port))
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        port++
        server.listen(port)
    }
})
    .listen(port)

// utils
function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

function readFileCallback(response, data, content_type) {
    response.writeHead(200, { "Content-Type": content_type });
    response.write(data.toString());
    response.end();
}

function convert(updated_scans, query, output_dir) {
    let reorientation_info = ""
    if (query.reorientation_code != "NA") {
        reorientation_info = "(with reorientation)"
    }
    console.log("##########Convertion Begins" + reorientation_info + "###########");
    let n = 0
    updated_scans.forEach(function (scan) {
        if (scan.bids_path) {
            n++
            const last_back_slash = scan.bids_path.lastIndexOf("/")
            const bids_name = scan.bids_path.substr(last_back_slash + 1)
            console.log(util.format("%d/%d:%s", n, total, bids_name));
            child_process.execSync(util.format('bash scripts/_%s.sh "%s" "%s" "%s" "%s"', query.software, scan.path, output_dir, scan.bids_path, tmp_bruker2bids))
            if (query.reorientation_code != "NA") {
                child_process.execSync(util.format('bash scripts/reorient.sh "%s/%s.nii.gz" "%s"', output_dir, scan.bids_path, query.reorientation_code))
            }
        }
    })
    console.log("##########Convertion Ends" + reorientation_info + "###########");
}

function compress(output_dir, format) {
    // format: .tar or .zip
    console.log("##########Compression Begins###########");
    child_process.execSync("mkdir -p " + output_dir)
    const compressed_file = output_dir + "/output_bruker2bids_" + new Date().getTime() + format
    switch (format) {
        case ".zip":
            child_process.execSync(util.format('zip -r "%s" "%s"', compressed_file, output_dir_default))
            break
        case ".tar":
            child_process.execSync(util.format('tar -cf "%s" "%s" && pigz "%s"', compressed_file, output_dir_default, compressed_file))
            break
    }
    child_process.execSync("rm -rf " + output_dir_default)
    console.log("##########Compression Ends###########");
}

function check_scans(){
    const selected_scans=[]
    fs.readdir(data_directory, function (err, folders) {
        for (const folder of folders) {
            const stats = fs.statSync(data_directory+"/"+folder)
            const lastModified = stats.mtime.getTime()
            // select studies whose last modification time is later than the begin time of AutoBIDS
            if(lastModified>auto_bids_begin){
                const data_folder = data_directory + "/" + folder
                const stdout = child_process.execSync("python library/getScanParams.py " + data_folder)
                const scans = JSON.parse(stdout)

                for (const scan of scans) {
                    if (!scan.disabled) {
                        selected_scans.push(scan)
                    }
                }
            }
        }

        // Most operations in the server side are Sync hence no need to worry about callback
        postRequest("/preview",{
            config: auto_bids_query.config,
            selected_scans:JSON.stringify(selected_scans)
        })

        postRequest("/confirm", {
            software: auto_bids_query.software,
            output_dir: auto_bids_query.output_dir,
            output_type: auto_bids_query.output_type,
            reorientation_code: auto_bids_query.reorientation_code
        })
    })
}

function postRequest(path, data){
    data = JSON.stringify(data);
    
    const options = {
        hostname: 'localhost',
        port,
        path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
    
    const req = http.request(options);
    req.write(data);
    req.end();
}

function rename(oldpath, newpath) {
    const ext=[]

    oldpath=oldpath.replace("~",process.env.HOME)
    newpath=newpath.replace("~",process.env.HOME)
    const last_back_slash = oldpath.lastIndexOf("/")
    const folder=oldpath.substr(0,last_back_slash)
    const oldname = oldpath.substr(last_back_slash + 1)
    fs.readdir(folder, function (err, files) {
        files.forEach(file => {
            if(file.startsWith(oldname)){
                ext.push(file.substr(oldname.length)) // .nii.gz .nii .bval .bvec .json
            }
        });
    })

    ext.forEach(e=>{
        fs.rename(oldpath+e,newpath+e)
    })
}