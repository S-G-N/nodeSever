var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const PORT = 9088;

app.listen(PORT, function () {
    console.log('Server listening on port %s', PORT);
});

const JSON_HEADER = {
    'Content-Type': 'application/json',
};
const PNG_HEADER = {
    'Content-Type': 'image/png',
};
const TEXT_HEADER = {
    'Content-Type': 'text/plain',
};

app.post('/statistics', function (req, res) {
    res.writeHead(200, JSON_HEADER);
    console.log('成功接收统计请求')
    console.log(req.headers)
    console.log(req.body)
    res.end()
});
