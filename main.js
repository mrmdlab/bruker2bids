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

const server = http.createServer(function (request, response) {
    const req_url = url.parse(request.url, true)
    const pathname = req_url.pathname
    const query = req_url.query

    config_tmp = "configs/config_tmp_" + port + ".json"
    tmp_bruker2bids = "tmp_bruker2bids_" + port // add port number at the end, in case multiple users' operation interferes
    output_dir_default = "output_bruker2bids_" + port
    // console.log(req_url.path)
    // console.log(pathname)
    // console.log(req_url)
    // console.log(query)
    switch (pathname) {
        case "/":
            fs.readFile("index.html", function (err, data) {
                readFileCallback(response, data, "text/html")
            })
            break
        case "/file":
            fs.readFile(query.path, function (err, data) {
                readFileCallback(response, data, "text/javascript")
            })
            break
        case "/data":
            response.writeHead(200, { "Content-Type": "application/json" })
            switch (query.task) {
                case "data_list":
                    fs.readdir(data_directory, function (err, files) {
                        const data_list = files.reverse()
                        const result = {
                            data_list,
                            data_directory
                        }
                        response.write(JSON.stringify(result))
                        response.end()
                    })
                    break
                case "scan_params":
                    /*
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
                }
            })
            child_process.exec("tree " + tmp_bruker2bids, function (err, stdout, stderr) {
                response.writeHead(200, { "Content-Type": "text/plain" })
                response.write(stdout)
                response.end()
                child_process.exec("rm -rf " + tmp_bruker2bids)
            })
            break
        case "/confirm":
            /**
             * query:
             * 
             * software
             * output_dir
             * output_type
             */

            response.writeHead(200, { "Content-Type": "text/plain" })
            response.end()
            const output_dir = query.output_dir.replace("~", "$HOME")

            switch (query.output_type) {
                case "zip":
                    convert(updated_scans, query, output_dir_default)
                    console.log("##########Compression Begins###########");
                    child_process.execSync("mkdir -p " + output_dir)
                    child_process.exec(util.format('zip -r "%s"/output_bruker2bids.zip "%s"', output_dir, output_dir_default), function () {
                        child_process.execSync("rm -rf " + output_dir_default)
                        console.log("##########Compression Ends###########");
                    })
                    break
                case "tar.gz":
                    convert(updated_scans, query, output_dir_default)
                    console.log("##########Compression Begins###########");
                    child_process.execSync("mkdir -p " + output_dir)
                    child_process.exec(util.format('tar -cf "%s"/output_bruker2bids.tar "%s" && pigz "%s"/output_bruker2bids.tar', output_dir, output_dir_default, output_dir), function () {
                        child_process.execSync("rm -rf " + output_dir_default)
                        console.log("##########Compression Ends###########");
                    })
                    break
                case "files":
                    convert(updated_scans, query, output_dir)
                    break
            }

            child_process.exec("rm -rf " + tmp_bruker2bids)
            break
    }
}).once('listening', function () {
    console.log("Please run this command from your local computer to enable port forwarding");
    console.log(util.format("ssh -L %d:localhost:%d -N nmrsu@%s\n", port, port, ip_address));
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
    console.log("##########Convertion Begins###########");
    let n = 0
    updated_scans.forEach(function (scan) {
        if (scan.bids_path) {
            n++
            const last_back_slash = scan.bids_path.lastIndexOf("/")
            const bids_name = scan.bids_path.substr(last_back_slash + 1)
            console.log(util.format("%d/%d:%s", n, total, bids_name));
            child_process.execSync(util.format('bash scripts/_%s.sh "%s" "%s" "%s" "%s"', query.software, scan.path, output_dir, scan.bids_path, tmp_bruker2bids))
        }
    })
    console.log("##########Convertion Ends###########");
}