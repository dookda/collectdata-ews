const express = require('express');
const app = express.Router();
const con = require("./db");
const dat = con.dat;

const { default: axios } = require('axios');



let loadRain24Hr = () => {
    axios.get('http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/rain_24h').then(r => {
        let dat = r.data
        console.log(dat);
    })
}

loadRain24Hr()

module.exports = app