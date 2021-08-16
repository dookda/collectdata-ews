const express = require('express');
const app = express.Router();
const con = require("./db");
const dat = con.dat;


require('events').EventEmitter.defaultMaxListeners = Infinity;

const fs = require('fs')
const http = require('http');
const { default: axios } = require('axios');

const ews_data = "./service/ews_data.txt";
const promis = new Promise((resolve, reject) => {
    http.get('http://ews.dwr.go.th/ews/stnlist_user_new.php', (r) => {
        let data = '';
        r.on('data', (chunk) => {
            data += chunk
        });
        r.on('end', () => {
            try {
                fs.unlinkSync(ews_data)
            } catch (err) {
                console.error(err)
            }
            resolve(fs.writeFile('./service/ews_data.txt', data, { flag: 'a+' }, err => { }));
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}, err => reject(err))

let createJson = () => {
    fs.readFile(ews_data, 'utf8', async (err, res) => {
        if (err) return console.log(err);

        var result;
        result = res.toString().replace("var arrStn = ", "");
        result = result.toString().replace(/stn:/g, "\"stn\":");
        result = result.toString().replace(/name:/g, "\"name\":");
        result = result.toString().replace(/latitude:/g, "\"latitude\":");
        result = result.toString().replace(/longtitude:/g, "\"longtitude\":");
        result = result.toString().replace(/stn_date:/g, "\"stn_date\":");
        result = result.toString().replace(/gd_id:/g, "\"gd_id\":");
        result = result.toString().replace(/temp:/g, "\"temp\":");
        result = result.toString().replace(/soil1:/g, "\"soil1\":");
        result = result.toString().replace(/wl_txt:/g, "\"wl_txt\":");
        result = result.toString().replace(/warning:/g, "\"warning\":");
        result = result.toString().replace(/name_e:/g, "\"name_e\":");
        result = result.toString().replace(/tambon_e:/g, "\"tambon_e\":");
        result = result.toString().replace(/amphoe_e:/g, "\"amphoe_e\":");
        result = result.toString().replace(/province_e:/g, "\"province_e\":");
        result = result.toString().replace(/dept_e:/g, "\"dept_e\":");

        result = result.toString().replace(/rain:/g, "\"rain\":");
        result = result.toString().replace(/rain12h:/g, "\"rain12h\":");
        result = result.toString().replace(/wl:/g, "\"wl\":");
        result = result.toString().replace(/status:/g, "\"status\":");
        result = result.toString().replace(/tambon:/g, "\"tambon\":");
        result = result.toString().replace(/amphoe:/g, "\"amphoe\":");
        result = result.toString().replace(/province:/g, "\"province\":");
        result = result.toString().replace(/dept:/g, "\"dept\":");
        result = result.toString().replace(/stn_date:/g, "\"stn_date\":");
        result = result.toString().replace(/sub_basin_e:/g, "\"sub_basin_e\":");
        result = result.toString().replace(/main_basin_e:/g, "\"main_basin_e\":");
        result = result.toString().replace(/target_point1_e:/g, "\"target_point1_e\":");
        result = result.toString().replace(/target_point2_e:/g, "\"target_point2_e\":");
        result = result.toString().replace(/warning_network_e:/g, "\"warning_network_e\":");
        result = result.toString().replace(/stn_desc_e:/g, "\"stn_desc_e\":");
        result = result.toString().replace(/'/g, "\"");
        result = result.toString().replace(/\\/g, "");
        result = result.toString().replace(/;/g, "");

        let jsondata = await JSON.parse(result);

        var promisInsert = jsondata.map(async (i, idx) => {
            let sql = `INSERT INTO ews_3hr(
                        stn,
                        name,
                        latitude,
                        longtitude,
                        stn_date,
                        gd_id,
                        temp,
                        rain,
                        rain12h,
                        wl,
                        status,
                        tambon,
                        amphoe,
                        province,
                        dept,
                        soil1,
                        name_e,
                        tambon_e,
                        amphoe_e,
                        province_e,
                        dept_e,
                        dt
                    )VALUES(
                        '${i.stn}',
                        '${i.name}',
                        ${i.latitude},
                        ${i.longtitude},
                        '${i.stn_date}',
                        '${i.gd_id}',
                        ${i.temp},
                        ${i.rain},
                        ${i.rain12h},
                        ${i.wl > 0 ? i.wl : 0},
                        ${i.status},
                        '${i.tambon}',
                        '${i.amphoe}',
                        '${i.province}',
                        '${i.dept}',
                        ${Number(i.soil1) >= 0 ? Number(i.soil1) : 0},
                        '${i.name_e}',
                        '${i.tambon_e}',
                        '${i.amphoe_e}',
                        '${i.province_e}',
                        '${i.dept_e}',
                        now()
                    )`
            console.log(sql);
            dat.query(sql)
            // return "success"
        })

        Promise.all(promisInsert).then((r) => {
            console.log(r);
        })
    });
}

// app.get("/api-ews", (req, res) => {
//     fs.readFile('./service/data2.txt', 'utf8', (err, dat) => {
//         console.log(JSON.parse(dat));
//     })
// })


let loadRain24Hr = () => {
    axios.get('http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/rain_24h').then(r => {
        let d = r.data;
        // console.log(dat);
        let promisInsert = d.data.map(i => {
            let sql = `INSERT INTO rain24hr(
                agency_name,tam_name,amp_name,prov_name,sta_id,tele_station_name,tele_station_oldcode,lat,lon,dt,rain24hr
            )VALUES(
                '${i.agency.agency_name.th}',
                '${i.geocode.tumbon_name.th}',
                '${i.geocode.amphoe_name.th}',
                '${i.geocode.province_name.th}',
                ${i.station.id},
                '${i.station.tele_station_name.th}',
                '${i.station.tele_station_oldcode}',
                ${i.station.tele_station_lat},
                ${i.station.tele_station_long},
                '${i.rainfall_datetime}',
                ${i.rain_24h}
            )`

            dat.query(sql);
            return 'success'
        })

        Promise.all(promisInsert).then((r) => {
            console.log(r);
        })
    })
}

// loadRain24Hr()

setInterval(() => {
    let currentDate = new Date();
    let hh = currentDate.getHours();
    let mm = currentDate.getMinutes();
    let ss = currentDate.getSeconds();
    let t = `${hh}:${mm}:${ss}`;
    console.log(hh, mm, ss);

    if (t == "9:52:50" || t == "18:30:0") {
        promis.then(() => {
            createJson()
        });
    }

    // if (t == "8:25:50" || t == "11:25:0" || t == "14:25:0" || t == "17:25:0" || t == "20:25:0" || t == "23:25:0" || t == "2:25:0" || t == "5:25:0") {
    //     promis.then(() => {
    //         createJson()
    //     });
    // }

}, 1000);


module.exports = app;