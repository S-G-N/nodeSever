var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const PORT = 8080;

app.listen(PORT, function() {
    init();
    console.log('Server listening on port %s', PORT);
});

const JSON_HEADER = {
    'Content-Type': 'application/json',
};
const PNG_HEADER  = {
    'Content-Type': 'image/png',
};
const TEXT_HEADER = {
    'Content-Type': 'text/plain',
};
var mLauncherboxes;
var mLiveboxes;
var mMovieboxes;
var mVarietyboxes;
var mDramaboxes;
var mLiveDetail_1;
var mLiveDetail_2;
var mMovieDetail;
var mVarietyDetail;
var mDramaDetail;

var mUsers;

function init() {
    mLauncherboxes = fs.readFileSync('./json/launcherboxes.json', 'utf8');
    mLiveboxes = fs.readFileSync('./json/liveboxes.json', 'utf8');
    mMovieboxes = fs.readFileSync('./json/movieboxes.json', 'utf8');
    mVarietyboxes = fs.readFileSync('./json/varietyboxes.json', 'utf8');
    mDramaboxes = fs.readFileSync('./json/dramaboxes.json', 'utf8');
    mLiveDetail_1 = fs.readFileSync('./json/livedetail_1.json', 'utf8');
    mLiveDetail_2 = fs.readFileSync('./json/livedetail_2.json', 'utf8');
    mMovieDetail = fs.readFileSync('./json/moviedetail.json', 'utf8');
    mVarietyDetail = fs.readFileSync('./json/varietydetail.json', 'utf8');
    mDramaDetail = fs.readFileSync('./json/dramadetail.json', 'utf8');
    mUsers = JSON.parse(fs.readFileSync('./json/users.json', 'utf8'));
}

app.post('/launcherboxes', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mLauncherboxes);
});

app.post('/liveboxes', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mLiveboxes);
});

app.post('/movieboxes', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mMovieboxes);
});

app.post('/varietyboxes', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mVarietyboxes);
});

app.post('/dramaboxes', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mDramaboxes);
});

app.post('/livedetail', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    var mainId = req.body.mainid;
    if (mainId == '15') {
        res.end(mLiveDetail_1);
    } else {
        res.end(mLiveDetail_2);
    }
});

app.post('/moviedetail', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mMovieDetail);
});

app.post('/varietydetail', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mVarietyDetail);
});

app.post('/dramadetail', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end(mDramaDetail);
});

app.post('/playurl', function(req, res) {
    // var result = '{"url": "http://192.168.10.10/movie/019.ts"}';
    var result = '{"url": "http://192.168.10.10/movie/02.mp4"}';
    var mainId = req.body.mainid;
    var subId = req.body.subid;
    if (!subId || subId == '0') {
        switch (mainId) {
        case '15': // Live
        case '2155': // Movie
            result = '{"url": "http://192.168.10.10/movie/02.mp4"}';
            break;
        case '16': // Live
        case '2135': // Movie
            result = '{"url": "http://192.168.10.10/movie/01.mp4"}';
            break;
        default:
            break;
        }
    } else {
        switch (mainId) {
        case '2255': // Variety
        case '2355': // Drama
            result = '{"url": "http://192.168.10.10/movie/02.mp4"}';
            break;
        case '2235': // Variety
        case '2335': // Drama
            result = '{"url": "http://192.168.10.10/movie/01.mp4"}';
            break;
        default:
            break;
        }
    }
    res.writeHead(200, JSON_HEADER);
    res.end(result);
});

/**
 * User util functions.
 */

/**
 * Turn credit card number from "1234567890" to "******7890".
 */
function cardMasker(cardNumber) {
    if (cardNumber.length <= 4) {
        return cardNumber;
    }
    return cardNumber.slice(0, -4).replace(/./g,"*") + cardNumber.slice(-4);
}

/**
 * Returns user id according to the token, -1 for none.
 */
function tokenChecker(token) {
    var i;
    for (i = 0; i < mUsers.length; i++) {
        if (mUsers[i].token == token) {
            return i;
        }
    }
    return -1;
}

app.post('/visitorlogin', function(req, res) {
    var result = {
        "token": "TestVisitorTokenBalabalabcdefghijklmn" + (new Date()).getTime(),
        "token_expire": "7200",
        "free_trial": 1,
        "country": "US",
        "planid": 1,
        "service_fee": "$9.90"
    };
    res.writeHead(200, JSON_HEADER);
    res.end(JSON.stringify(result));
});

app.post('/userlogin', function(req, res) {
    for (var i = 0; i < mUsers.length; i++) {
        if (req.body.email == mUsers[i].info.email) {
            if (mUsers[i].error_count >= 3 && req.body.verify_code != "5376") {
                res.writeHead(600, TEXT_HEADER);
                res.end('20320');
                return;
            }
            if (req.body.password == mUsers[i].password) {
                var timestamp = new Date().getTime();
                var result = {
                    "token": "UserLoginTokenBalabalabcdefghijklmn" + timestamp,
                    "token_expire": 7200,
                    "medal": "AutoLoginId123456abcdefg" + timestamp
                };
                result["state"] = mUsers[i].state;
                mUsers[i].token = result.token;
                mUsers[i].medal = result.medal;
                mUsers[i].error_count = 0;
                console.log('user ' + i + ' token: ' + result.token);
                console.log('Auto login medal: ' + result.medal);
                res.writeHead(200, JSON_HEADER);
                res.end(JSON.stringify(result));
            } else {
                mUsers[i].error_count++;
                res.writeHead(600, TEXT_HEADER);
                if (mUsers[i].error_count < 3) {
                    res.end('20110');
                } else {
                    res.end('20111');
                }
            }
            return;
        }
    }
    res.writeHead(600, TEXT_HEADER);
    res.end('20110'); // Wrong password.
});

app.post('/autologin', function(req, res) {
    for (var i = 0; i < mUsers.length; i++) {
        if (req.body.medal == mUsers[i].medal) {
            var result = {
                "token": "UserLoginTokenBalabalabcdefghijklmn" + new Date().getTime(),
                "token_expire": 7200
            };
            result["state"] = mUsers[i].state;
            mUsers[i].token = result.token;
            console.log('user ' + i + ' token: ' + result.token);
            res.writeHead(200, JSON_HEADER);
            res.end(JSON.stringify(result));
            return;
        }
    }
    res.writeHead(600, TEXT_HEADER);
    res.end('20112');
});

app.post('/requestpictureverifycode', function(req, res) {
    var data = fs.readFileSync('img/verifcode5376.png').toString('base64');
    res.writeHead(200, PNG_HEADER);
    res.end('data:image/png;base64,' + data);
});

app.post('/testpictureverifycode', function(req, res) {
    if (req.body.verify_code == "5376") {
        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('20320');
    }
});

app.post('/userlogout', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
    }
    if (req.body.token == mUsers[userIndex].token) {
        mUsers[userIndex].token = "";
        console.log('User ' + userIndex + ' logout.');
        res.writeHead(200, TEXT_HEADER);
        res.end();
        return;
    }
});

app.post('/phonelogin', function(req, res) {
    // Copied from
    for (var i = 0; i < mUsers.length; i++) {
        if (req.body.email == mUsers[i].info.email) {
            if (mUsers[i].error_count >= 3 && req.body.verify_code != "5376") {
                res.writeHead(600, TEXT_HEADER);
                res.end('20320');
                return;
            }
            if (req.body.password == mUsers[i].password) {
                var timestamp = new Date().getTime();
                var result = {
                    "token": "UserLoginTokenBalabalabcdefghijklmn" + timestamp
                };
                result["state"] = mUsers[i].state;
                mUsers[i].token = result.token;
                mUsers[i].error_count = 0;
                console.log('user ' + i + ' phone token: ' + result.token);
                res.writeHead(200, JSON_HEADER);
                res.end(JSON.stringify(result));
            } else {
                mUsers[i].error_count++;
                res.writeHead(600, TEXT_HEADER);
                if (mUsers[i].error_count < 3) {
                    res.end('20110');
                } else {
                    res.end('20111');
                }
            }
            return;
        }
    }
    res.writeHead(600, TEXT_HEADER);
    res.end('20110'); // Wrong password.
});

app.post('/checkemail', function(req, res) {
    var result = {
        "email_used": 0
    };
    for (var i = 0; i < mUsers.length; i++) {
        if (req.body.email == mUsers[i].info.email) {
            result.email_used = 1;
        }
    }
    res.writeHead(200, JSON_HEADER);
    res.end(JSON.stringify(result));
});

app.post('/register', function(req, res) {
    for (var i = 0; i < mUsers.length; i++) {
        if (req.body.email == mUsers[i].info.email) {
            res.writeHead(600, TEXT_HEADER);
            res.end('20102'); // email duplicated.
            return;
        }
    }
    var cardNumber = cardMasker(req.body.card_number);
    var newUser = {
        "info": {
            "first_name": req.body.first_name,
            "last_name": req.body.last_name,
            "email": req.body.email,
            "phone_number": req.body.phone_number,
            "card_number": cardNumber,
            "card_expire_month": req.body.card_expire_month,
            "card_expire_year": req.body.card_expire_year
        },
        "card": {
            "card_number": cardNumber,
            "card_first_name": req.body.card_first_name,
            "card_last_name": req.body.card_last_name,
            "card_expire_month": req.body.card_expire_month,
            "card_expire_year": req.body.card_expire_year,
            "card_security_code": req.body.card_security_code,
            "card_address_1": req.body.card_address_1,
            "card_address_2": req.body.card_address_2,
            "card_city": req.body.card_city,
            "card_state": req.body.card_state,
            "postcode": req.body.postcode,
            "card_status": 1
        },
        "password": req.body.password,
        "token": "",
        "medal": "",
        "state": 1,
        "allow_promotion": 1,
        "error_count": 0
    };
    mUsers.push(newUser);
    var result = {
        "free_trial": 1,
        "free_trial_days": 30
    };
    res.writeHead(200, JSON_HEADER);
    res.end(JSON.stringify(result));
});

app.post('/requestemailverifycode', function(req, res) {
    res.writeHead(200, TEXT_HEADER);
    res.end();
});

app.post('/testemailverifycode', function(req, res) {
    if (req.body.verify_code != "5376") {
        res.writeHead(600, TEXT_HEADER);
        res.end('20310'); // Bad image verify code.
        return;
    }else {
        res.writeHead(200, TEXT_HEADER);
        res.end();
    }
});

app.post('/resetpassword', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    if (req.body.verify_code != "5376") {
        res.writeHead(600, TEXT_HEADER);
        res.end('20310'); // Bad email verify code.
        return;
    }
    if (req.body.password && req.body.password.length >= 6 && req.body.password.length <= 10) {
        mUsers[userIndex].password = req.body.password;
        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('20103'); // Invalid password length.
    }
});

app.post('/getuserbasicinfo', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
    } else {
        res.writeHead(200, JSON_HEADER);
        res.end(JSON.stringify(mUsers[userIndex].info));
    }
});

app.post('/resetuserinfoname', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    if (req.body.first_name && req.body.last_name
            && req.body.first_name.length > 0 && req.body.last_name.length > 0) {
        mUsers[userIndex].info.first_name = req.body.first_name;
        mUsers[userIndex].info.last_name = req.body.last_name;
        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('20401');
    }
});

app.post('/modifyemail', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    if (req.body.password != mUsers[userIndex].password) {
        res.writeHead(600, TEXT_HEADER);
        res.end('20200'); // Wrong password.
        return;
    }
    if (req.body.email && req.body.email.length > 0) {
        mUsers[userIndex].info.email = req.body.email;
        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('20103');
    }
});

app.post('/requestsmsverifycode', function(req, res) {
    res.writeHead(200, JSON_HEADER);
    res.end('{"freezing_time": 60}');
});

app.post('/testsmsverifycode', function(req, res) {
    if (req.body.verify_code == "1234") {
        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('20301');
    }
});

app.post('/modifyphonenumber', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    if (req.body.verify_code != "1234") {
        res.writeHead(600, TEXT_HEADER);
        res.end('20301'); // token expired.
        return;
    }
    if (req.body.phone_number && req.body.phone_number.length == 10) {
        mUsers[userIndex].info.phone_number = req.body.phone_number;
        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('20303'); // token expired.
    }
});

app.post('/modifypassword', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    if (mUsers[userIndex].error_count >= 3 && req.body.verify_code != "5376") {
        res.writeHead(600, TEXT_HEADER);
        res.end('20320'); // Wrong image verify code.
        return;
    }
    if (req.body.old_password != mUsers[userIndex].password) {
        mUsers[userIndex].error_count++;

        if (mUsers[userIndex].error_count < 3) {
            res.writeHead(600, TEXT_HEADER);
            res.end('20200'); // Wrong password.
        } else {
            res.writeHead(600, TEXT_HEADER);
            res.end('20203'); // Wrong password 3 times.
        }
        return;
    }
    mUsers[userIndex].error_count = 0;
    if (req.body.new_password && req.body.new_password.length >= 6 && req.body.new_password.length <= 10) {
        mUsers[userIndex].password = req.body.new_password;
        res.writeHead(200, TEXT_HEADER);
        res.end()
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('20202'); // token expired.
    }
});

app.post('/getcardstatus', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    res.writeHead(200, JSON_HEADER);
    res.end('{"card_status": 0}');
});

app.post('/getcardinfo', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    res.writeHead(200, JSON_HEADER);
    res.end(JSON.stringify(mUsers[userIndex].card));
});

app.post('/modifycardinfo', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    if (!req.body.card_number || req.body.card_number.length < 1
            || !req.body.card_first_name || req.body.card_first_name.length < 1
            || !req.body.card_last_name || req.body.card_last_name.length < 1
            || !req.body.card_expire_month || req.body.card_expire_month.length < 1
            || !req.body.card_expire_year || req.body.card_expire_year.length < 1
            || !req.body.card_security_code || req.body.card_security_code.length < 1
            || !req.body.card_address_1
            || !req.body.card_address_2
            || !req.body.card_city || req.body.card_city.length < 1
            || !req.body.card_state || req.body.card_state.length < 1
            || !req.body.postcode || req.body.postcode.length < 1) {
        res.writeHead(600, TEXT_HEADER);
        res.end("20410");
        return;
    }
    var cardNumber = cardMasker(req.body.card_number);
    mUsers[userIndex].info.card_number = cardNumber;
    mUsers[userIndex].info.card_expire_month = req.body.card_expire_month;
    mUsers[userIndex].info.card_expire_year = req.body.card_expire_year;
    mUsers[userIndex].card.card_number = cardNumber;
    mUsers[userIndex].card.card_first_name = req.body.card_first_name;
    mUsers[userIndex].card.card_last_name = req.body.card_last_name;
    mUsers[userIndex].card.card_expire_month = req.body.card_expire_month;
    mUsers[userIndex].card.card_expire_year = req.body.card_expire_year;
    mUsers[userIndex].card.card_security_code = req.body.card_security_code;
    mUsers[userIndex].card.card_address_1 = req.body.card_address_1;
    mUsers[userIndex].card.card_address_2 = req.body.card_address_2;
    mUsers[userIndex].card.card_city = req.body.card_city;
    mUsers[userIndex].card.card_state = req.body.card_state;
    mUsers[userIndex].card.postcode = req.body.postcode;
    res.writeHead(200, TEXT_HEADER);
    res.end();
});

app.post('/getsystemactiveplan', function(req, res) {
    var result = {
        "planid": 1,
        "name": "Plan A",
        "service_fee": "$9.90",
        "description": "Plan A"
    };
    res.writeHead(200, JSON_HEADER);
    res.end(JSON.stringify(result));
});

app.post('/getuserstate', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex >= 0) {
        res.writeHead(200, JSON_HEADER);
        res.end('{"state": ' + mUsers[userIndex].state + '}');
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
    }
});

app.post('/getuserplan', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex < 0) {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
        return;
    }
    var result = {
    };
    var result1 = {
        "planid": 1,
        "name": "iTalkBB蜻蜓电视基础套餐",
        "service_fee": "免费",
        "description": "中文频道直播高清影视综艺点播",
        "state_description": 1,
        "due_date": "2017-11-11"
    };
    var result2 = {
        "planid": 2,
        "name": "iTalkBB蜻蜓电视基础套餐",
        "service_fee": "$9.90",
        "description": "中文频道直播高清影视综艺点播",
        "state_description": 2,
        "due_date": "2017-11-11"
    };
    var result3 = {
        "planid": 3,
        "name": "iTalkBB蜻蜓电视基础套餐",
        // "service_fee": "$9.90",
        "description": "中文频道直播高清影视综艺点播",
        "state_description": 3,
        "due_date": "2017-11-11"
    };
    var result4 = {
        "planid": 4,
        "name": "iTalkBB蜻蜓电视基础套餐",
        // "service_fee": "$9.90",
        "description": "中文频道直播高清影视综艺点播",
        "state_description": 4,
        "due_date": "2017-11-11"
    };
    switch (mUsers[userIndex].state){
        case 1:
            result=result1;
            break;
        case 2:
            result=result2;
            break;
        case 3:
            result=result3;
            break;
        case 4:
            result=result4;
            break;
    }
    res.writeHead(200, JSON_HEADER);
    res.end(JSON.stringify(result));
});

app.post('/unsubscribe', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex >= 0) {
        if(mUsers[userIndex].state==2){
            mUsers[userIndex].state = 4;
        }else if(mUsers[userIndex].state==1){
            mUsers[userIndex].state==3
        }

        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
    }
});

app.post('/resume', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex >= 0) {
        mUsers[userIndex].state = 2;
        res.writeHead(200, TEXT_HEADER);
        res.end();
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
    }
});

app.post('/allowpromotion', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex >= 0) {
        if (mUsers[userIndex].state == 1 && mUsers[userIndex].allow_promotion == 1) {
            res.writeHead(200, JSON_HEADER);
            res.end('{"allow": 1}');
        } else {
            res.writeHead(600, TEXT_HEADER);
            res.end('20802');
        }
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
    }
});

app.post('/checkpromotioncode', function(req, res) {
    var userIndex = tokenChecker(req.body.token);
    if (userIndex >= 0) {
        if (mUsers[userIndex].state == 1) {
            if (mUsers[userIndex].allow_promotion == 1) {
                mUsers[userIndex].allow_promotion = 0;
                res.writeHead(200, JSON_HEADER);
                res.end('{"due_date": "2017-11-11"}');
            } else {
                res.writeHead(600, TEXT_HEADER);
                res.end('20803');
            }
        } else {
            res.writeHead(600, TEXT_HEADER);
            res.end('20802'); // token expired.
        }
    } else {
        res.writeHead(600, TEXT_HEADER);
        res.end('10001'); // token expired.
    }
});
