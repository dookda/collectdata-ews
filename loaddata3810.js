const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

// var https_options = {
//     key: fs.readFileSync("/etc/apache2/ssl/private.key"),
//     cert: fs.readFileSync("/etc/apache2/ssl/public.crt"),
//     ca: fs.readFileSync('/etc/apache2/ssl/intermediate.crt')
// };

// var https_options = {
//     key: fs.readFileSync("/etc/apache2/ssl/private.key"),
//     cert: fs.readFileSync("/etc/apache2/ssl/public.crt"),
//     ca: fs.readFileSync('/etc/apache2/ssl/intermediate.crt')
// };

// var server = https.createServer(https_options, app);
// var port = process.env.PORT || 3700;
// server.listen(port, function () {
//     console.log('listening on port ' + server.address().port);
// });

app.use(express.static(__dirname + '/www'));

app.listen(3810, () => {
    console.log('running on http://localhost:3810')
});

const ews = require('./service/ews');
app.use(ews);
