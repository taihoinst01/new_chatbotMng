﻿'use strict';
var express = require('express');
var crypto = require('crypto');
var sql = require('mssql');
var Client = require('node-rest-client').Client;
var dbConfig = require('../config/dbConfig').dbConfig;
var dbConnect = require('../config/dbConnect');
var paging = require('../config/paging');
var router = express.Router();


var i18n = require("i18n");

//log start
var Logger = require("../config/logConfig");
var logger = Logger.CreateLogger();
//log end
/*
var key = 'taiho123!@#$';
var initPW = '1234';
//기본 암호화 pw 
const cipher = crypto.createCipher('aes192', key);
let basePW = cipher.update(initPW, 'utf8', 'base64'); 
basePW = cipher.final('base64'); 
*/


//암호화
var pwConfig = require('../config/passConfig');


//const HOST = 'https://westus.api.cognitive.microsoft.com'; // Luis api host
/* GET users listing. */
router.get('/', function (req, res) {
    if (!req.session.sid) {
        res.cookie('i18n', 'ko', { maxAge: 900000, httpOnly: true });
        res.render('login');   
    } else {
        res.redirect("/list");
    }
    //res.send('respond with a resource');
});

router.post('/login', function (req, res) {  
    //req.session.sid = req.body.mLoginId;

    var userId = req.body.mLoginId;
    var userPw = req.body.mLoginPass;

    //암호화
    /*
    var cipher = crypto.createCipher('aes192', key);
    cipher.update('1234', 'utf8', 'base64');
    var cipheredOutput = cipher.final('base64');
    console.log(cipheredOutput);
    */

    var loginSelQry = "";
    loginSelQry = "SELECT USER_ID, SCRT_NUM, ISNULL(PW_INIT_YN, 'N') AS PW_INIT_YN, SCRT_SALT, USER_AUTH \n";
    loginSelQry += " FROM TB_USER_M \n WHERE USER_ID = @userId AND USE_YN = 'Y' ";

    dbConnect.getConnection(sql).then(pool => {
    //new sql.ConnectionPool(dbConfig).connect().then(pool => {
        return pool.request()
                    .input('userId', sql.NVarChar, userId)
                    .query(loginSelQry)
        }).then(result => {
            let rows = result.recordset;
            console.log(rows);

            if(rows.length > 0 && rows[0].USER_ID != null && rows[0].USER_ID == userId) {

                
                var userPwConverted = pwConfig.getPassWord(userPw, rows[0].SCRT_SALT);

                if (rows[0].PW_INIT_YN == 'Y') {
                    logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.body.mLoginId, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, '비밀번호 초기화');
                    res.render('passwordChng', {
                        changeId: req.body.mLoginId,
                    });
                } else {
                    if (rows[0].SCRT_NUM == userPwConverted) {
                        //if(decipheredOutput == userPw) {
                        req.session.sid = req.body.mLoginId;
                        req.session.sAuth = rows[0].USER_AUTH;
                        logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, '로그인');
    
                        //subscription key 조회 start-----
                        var subsQry = "";
                        subsQry += "SELECT CNF_TYPE, CNF_VALUE \n";
                        subsQry += "  FROM TBL_CHATBOT_CONF \n";
                        subsQry += " WHERE CNF_TYPE = 'LUIS_SUBSCRIPTION' \n";
                        subsQry += "    OR CNF_TYPE = 'HOST_URL' \n";
                        //subsQry += "   AND CHATBOT_NAME IN (SELECT CHAT_ID \n";
                        //subsQry += "					      FROM TBL_USER_RELATION_APP \n";
                        //subsQry += "					     WHERE USER_ID = @userId) \n";
                        //subsQry += "GROUP BY CNF_VALUE; \n";
    
                        dbConnect.getConnection(sql).then(pool => { 
                            return pool.request()
                                .input('userId', sql.NVarChar, userId)
                                .query(subsQry) 
                        }).then(result => {
                            let subsList = result.recordset;
                            if (subsList.length > 0) {
                                //req.session.subsKey = subsList[0].CNF_VALUE;
                                req.session.subKey = subsList.find((item, idx) => {return item.CNF_TYPE === 'LUIS_SUBSCRIPTION'}).CNF_VALUE;
                                req.session.subsKey = req.session.subKey;
                                req.session.hostURL = subsList.find((item, idx) => {return item.CNF_TYPE === 'HOST_URL'}).CNF_VALUE;
                                var tmpArr = [];
                                tmpArr.push(subsList.find((item, idx) => {return item.CNF_TYPE === 'LUIS_SUBSCRIPTION'}));
                                req.session.subsKeyList = tmpArr;
                            }
                            /*
                            //subsList[subsList.findIndex(x => x.CNF_TYPE === 'LUIS_SUBSCRIPTION')].CNF_VALUE;
                            //subsList[subsList.findIndex(x => x.CNF_TYPE === 'HOST_URL')].CNF_VALUE;
                            if (subsList.findIndex(x => x.CNF_NM === req.session.sid) !== -1) {
                                req.session.subsKey = subsList[subsList.findIndex(x => x.CNF_NM === req.session.sid)].CNF_VALUE;
                            } else {
                                req.session.subsKey = subsList[subsList.findIndex(x => x.CNF_NM === 'admin')].CNF_VALUE;
                            }
                            */
                            req.session.save(function(){
                                res.redirect("/");
                            });
                        }).catch(err => {
                            console.log(err);
                            sql.close();
                        });
                            //subscription key 조회 end-----
                            
                    } else {
                        logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.body.mLoginId, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, '비밀번호 불일치');
                        res.send('<script>alert("비밀번호가 일치하지 않습니다");location.href="/";</script>');
                    }
                }
                
            } else {
                logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.body.mLoginId, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, '아이디를 찾을수 없거나 사용중지 중인 아이디');
                res.send('<script>alert("아이디를 찾을수 없거나 사용중지 중입니다");location.href="/";</script>');
            }
          sql.close();
        }).catch(err => {
          console.log(err);
          sql.close();
        });

});

router.get('/logout', function (req, res) { 
    
    req.session.destroy(function (err) { 
        if (err) { 
            var logoutID = req.session.sid?"NONE":req.session.sid;
            logger.info('[에러] [id : %s] [url : %s] [내용 : %s] ', logoutID, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, err.message);
        } else { 
            res.clearCookie('sid');
            res.redirect('/'); 
        }
    });
    

    /*
    delete req.session.sid;
    delete req.session.appName;
    delete req.session.appId;
    delete req.session.leftList;
    delete req.session.subKey;

    req.session.save(function(){
		res.redirect('/');
	});
    */
	
});

router.get('/userMng', function (req, res) {  
    res.render('userMng');
});

router.post('/selectUserList', function (req, res) {

    let sortIdx = checkNull(req.body.sort, "USER_ID") + " " + checkNull(req.body.order, "ASC");
    let pageSize = checkNull(req.body.rows, 10);
    let currentPageNo = checkNull(req.body.page, 1);
    
    let searchName = checkNull(req.body.searchName, null);
    let searchId = checkNull(req.body.searchId, null);

    (async () => {
        try {
         
            var QueryStr =  "SELECT TBZ.* ,(TOT_CNT - SEQ + 1) AS NO \n" +
                            "  FROM (SELECT TBY.* \n" +
                            "          FROM (SELECT ROW_NUMBER() OVER(ORDER BY TBX." + sortIdx + ") AS SEQ, \n" +
                            "                       COUNT('1') OVER(PARTITION BY '1') AS TOT_CNT, \n" +
                            "                       CEILING(ROW_NUMBER() OVER(ORDER BY TBX." + sortIdx + ") / CONVERT( NUMERIC, " + pageSize + " ) ) PAGEIDX, \n" +
                            "                       TBX.* \n" +
                            "                  FROM ( \n" +
                            "                         SELECT \n" +
                            "                              A.EMP_NUM      AS EMP_NUM \n" +
                            "                            , ISNULL(A.USER_ID, ' ')      AS USER_ID \n" +
                            //"                            , ISNULL(A.SCRT_NUM, ' ')     AS SCRT_NUM " +
                            "                            , ISNULL(A.EMP_NM, ' ')       AS EMP_NM \n" +
                            "                            , ISNULL(A.EMP_ENGNM, ' ')    AS EMP_ENGNM \n" +
                            "                            , ISNULL(A.EMAIL, ' ')        AS EMAIL \n" +
                            "                            , ISNULL(A.HPHONE, ' ')        AS HPHONE \n" +
                            "                            , ISNULL(A.M_P_NUM_1, ' ')    AS M_P_NUM_1 \n" +
                            "                            , ISNULL(A.M_P_NUM_2, ' ')    AS M_P_NUM_2 \n" +
                            "                            , ISNULL(A.M_P_NUM_3, ' ')    AS M_P_NUM_3 \n" +
                            "                            , ISNULL(A.USE_YN, ' ')       AS USE_YN \n" +
                            "                            , ISNULL(CONVERT(NVARCHAR(10), A.REG_DT, 120), ' ') AS REG_DT \n" +
                            "                            , ISNULL(A.REG_ID, ' ')       AS REG_ID " +
                            "                            , ISNULL(CONVERT(NVARCHAR(10), A.MOD_DT, 120), ' ') AS MOD_DT \n" +
                            "                            , ISNULL(A.MOD_ID, ' ')       AS MOD_ID \n" +
                            "                            , ISNULL(A.USER_AUTH, ' ')       AS USER_AUTH \n" +
                            "                            , ISNULL(PW_INIT_YN, 'N')  AS PW_INIT_YN  \n" + 
                            "                            , ISNULL(A.LOGIN_FAIL_CNT, 0)      AS LOGIN_FAIL_CNT \n" +
                            "                            , ISNULL(CONVERT(NVARCHAR, A.LAST_LOGIN_DT, 120), ' ')  AS LAST_LOGIN_DT \n" +
                            "                            , ISNULL(CONVERT(NVARCHAR, A.LOGIN_FAIL_DT, 120), ' ')  AS LOGIN_FAIL_DT \n" +
                            "                         FROM TB_USER_M A \n" +
                            "                         WHERE 1 = 1 \n";
                            //"					      AND A.USE_YN = 'Y' \n"; 

            if (searchName) {
                QueryStr += "					      AND A.EMP_NM like '%" + searchName + "%' \n";
            }
            if (searchId) {
                QueryStr += "					      AND A.USER_ID like '%" + searchId + "%' \n";
            }
            QueryStr +=     "                       ) TBX \n" +
                            "               ) TBY \n" +
                            "       ) TBZ \n" +
                            " WHERE PAGEIDX = " + currentPageNo + " \n" +
                            "ORDER BY " + sortIdx + " \n";
            
            let pool = await dbConnect.getConnection(sql);
            let result1 = await pool.request().query(QueryStr);

            let rows = result1.recordset;

            var recordList = [];
            for(var i = 0; i < rows.length; i++){
                var item = {};
                item = rows[i];
                

                recordList.push(item);
            }


            if(rows.length > 0){

                var totCnt = 0;
                if (recordList.length > 0)
                    totCnt = checkNull(recordList[0].TOT_CNT, 0);
                var getTotalPageCount = Math.floor((totCnt - 1) / checkNull(rows[0].TOT_CNT, 10) + 1);


                res.send({
                    records : recordList.length,
                    total : getTotalPageCount,
                    pageList : paging.pagination(currentPageNo,rows[0].TOT_CNT), //page : checkNull(currentPageNo, 1),
                    rows : recordList
                });

            }else{
                //res.send({list : result});
                res.send({
                    records : 0,
                    rows : null
                });
            }
        } catch (err) {
            console.log(err)
            // ... error checks
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })


});

function checkNull(val, newVal) {
    if (val === "" || typeof val === "undefined" || val === "0") {
        return newVal;
    } else {
        return val;
    }
}

router.post('/saveUserInfo', function (req, res) {  
            
    

    (async () => {
        try {

            
            var userArr = JSON.parse(req.body.saveArr);
            var saveStr = "";
            var updateStr = "";
            var deleteStr = "";
            var useYnStr = "";

            var initPWQry = "SELECT TOP 1 CNF_VALUE FROM TBL_CHATBOT_CONF WHERE CNF_TYPE = 'CHAT_MNG_INIT_PW'"

            
            let pool = await dbConnect.getConnection(sql);


            var initPw = "";
            let initPwQry = await pool.request().query(initPWQry);
            var getUserInitRow = initPwQry.recordset;
            if (getUserInitRow.length > 0) {
                initPw = getUserInitRow[0].CNF_VALUE;
            } else {
                res.send({status:500 , message:'등록된 초기화 비밀번호가 없습니다. 설정해주세요.'});
                return;
            }

            
            var newSalt = await pwConfig.getSaltCode();
            let basePW = pwConfig.getPassWord(initPw, newSalt);

            for (var i=0; i<userArr.length; i++) {
                if (userArr[i].statusFlag === 'NEW') {
                    saveStr += "INSERT INTO TB_USER_M (EMP_NUM, USER_ID, SCRT_NUM, SCRT_SALT, EMP_NM, HPHONE, EMAIL, USE_YN, USER_AUTH) " + 
                               "VALUES ( (SELECT MAX(EMP_NUM)+1 FROM TB_USER_M), ";
                    saveStr += " '" + userArr[i].USER_ID  + "', '" + basePW  + "',  '" + newSalt  + "', N'" + userArr[i].EMP_NM  + "', '" + userArr[i].HPHONE  + "', '" + userArr[i].EMAIL  + "', 'Y', 77); ";
                    
                } else if (userArr[i].statusFlag === 'EDIT') {
                    updateStr += "UPDATE TB_USER_M SET EMP_NM = '" + userArr[i].EMP_NM  + "',HPHONE = '" + userArr[i].HPHONE + "',EMAIL = '" + userArr[i].EMAIL + "' WHERE USER_ID = '" + userArr[i].USER_ID + "'; ";
                } else if (userArr[i].statusFlag === 'USEYN') {
                    useYnStr += "UPDATE TB_USER_M SET USE_YN = '" + userArr[i].USE_YN + "' WHERE USER_ID = '" + userArr[i].USER_ID + "' AND EMP_NM = '" + userArr[i].EMP_NM + "'; ";
                } else { //DEL
                    deleteStr += "DELETE FROM TB_USER_M WHERE USER_ID = '" + userArr[i].USER_ID + "' AND EMP_NM = '" + userArr[i].EMP_NM + "'; ";
                }
            }


            if (saveStr !== "") {
                let insertUser = await pool.request().query(saveStr);
            }
            if (updateStr !== "") {
                let updateUser = await pool.request().query(updateStr);
            }
            if (useYnStr !== "") {
                let useYnUser = await pool.request().query(useYnStr);
            }
            if (deleteStr !== "") {
                let deleteUser = await pool.request().query(deleteStr);
            }

            res.send({status:200 , message:'Save Success'});
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'Save Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
});
router.post('/inItPassword', function (req, res) {

    var initPWStr = "SELECT TOP 1 CNF_VALUE FROM TBL_CHATBOT_CONF WHERE CNF_TYPE = 'CHAT_MNG_INIT_PW'"

    var adminId = req.session.sid;
    var userId = req.body.paramUserId;
    //basePW
    (async () => {
        try {
            var chkAdminAuthStr = "SELECT USER_ID, ISNULL(USER_AUTH, '0') AS USER_AUTH \n";
            chkAdminAuthStr +=    "  FROM TB_USER_M \n";
            chkAdminAuthStr +=    " WHERE USER_ID = @userId ";

            let pool = await dbConnect.getConnection(sql);
            let getUserAuth = await pool.request()
                .input('userId', sql.NVarChar, req.session.sid)
                .query(chkAdminAuthStr);
            var getUserAuthRow = getUserAuth.recordset;
            logger.info('사용자 비밀번호 초기화 전 관리자 권한 조회 [관리자id : %s]  [url : %s]', adminId, 'users/inItPassword');

            var userAuthYN = '0';
            if (getUserAuthRow.length > 0) {
                userAuthYN = getUserAuthRow[0].USER_AUTH;

                logger.info('사용자 비밀번호 초기화 전 관리자 권한 조회 [관리자id : %s] [대상id : %s] [url : %s]', adminId, getUserAuthRow[0].ADMIN_YN, 'users/saveUserInfo');
            } else {
                logger.info('[에러]사용자 비밀번호 초기화 전 [관리자id : %s] [url : %s] [error : %s]', adminId, 'users/saveUserInfo', '계정 정보가 없습니다.');
                res.send({ status: 400, message: 'failed' });
                return;
            }

            if (userAuthYN < 99) {
                logger.info('[에러]사용자 비밀번호 초기화 전 [관리자id : %s] [url : %s] [error : %s]', adminId, 'users/inItPassword', '관리자 권한이 없는 사용자 접근입니다.');
                res.send({ status: 400, message: 'failed' });
                return;
            } else {
                let initRst = await pool.request().query(initPWStr);
                
                var getUserInitRow = initRst.recordset;
                if (getUserInitRow.length > 0) {

                    var initPW = getUserInitRow[0].CNF_VALUE; 
                    var newSalt = await pwConfig.getSaltCode();
                    let basePW = pwConfig.getPassWord(initPW, newSalt);
    
                    var initStr = "UPDATE TB_USER_M SET SCRT_NUM = '" + basePW + "', SCRT_SALT = '" + newSalt + "', PW_INIT_YN='Y' WHERE USER_ID = '" + userId + "'; ";
                    let initPwRst = await pool.request().query(initStr);
    
                    logger.info('사용자 비밀번호 초기화 [관리자id : %s] [대상id : %s] [url : %s]', adminId, userId, 'users/inItPassword');
                    res.send({status:200 , message:'Init Success'});
                } else {
                    res.send({status:500 , message:'등록된 초기화 비밀번호가 없습니다. 설정해주세요.'});
                }
                
            }
        } catch (err) {
            logger.info('[에러]사용자 비밀번호 초기화 [관리자id : %s] [대상id : %s] [url : %s] [error : %s]', adminId, userId, 'users/inItPassword', err);
            res.send({status:500 , message:'Init Error'});
        } finally {
            sql.close();
        }
    })()

});

//
router.get('/userAuthMng', function (req, res) {  
    res.render('userAuthMng');
});

router.post('/selectUserAppList', function (req, res) {
    
    let userId = checkNull(req.body.userId, '');
    var currentPage = checkNull(req.body.currentPage, 1);
    var currentPageUser = checkNull(req.body.currentPageUser, 1);
    var selectAppListStr = "SELECT tbp.* from \n" +
                            " (SELECT ROW_NUMBER() OVER(ORDER BY CHATBOT_NAME DESC) AS NUM, \n" +
                            "         COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"  +
                            "         CEILING((ROW_NUMBER() OVER(ORDER BY CHATBOT_NAME DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                            "         CHATBOT_NUM, CHATBOT_NAME, CULTURE, DESCRIPTION, APP_COLOR \n" +
                           "          FROM TBL_CHATBOT_APP ) tbp \n" +
                           " WHERE 1=1 \n" +
                           "   AND PAGEIDX = " + currentPage + "; \n";

    var UserAppListStr = "SELECT tbp.* from \n" +
                         "   (SELECT ROW_NUMBER() OVER(ORDER BY USER_ID DESC) AS NUM, \n" +
                         "           COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"  +
                         "           CEILING((ROW_NUMBER() OVER(ORDER BY USER_ID DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                        "            APP_ID \n" +
                        "       FROM TBL_USER_RELATION_APP \n" +
                        "      WHERE 1=1 \n" +
                        "        AND USER_ID = '" + userId + "') tbp  \n" + 
                        " WHERE 1=1;  \n";
                        //"   AND PAGEIDX = " + currentPage + "; \n";                  
    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            let appList = await pool.request().query(selectAppListStr);
            let rows = appList.recordset;

            var recordList = [];
            for(var i = 0; i < rows.length; i++){
                var item = {};
                item = rows[i];
                recordList.push(item);
            }

            let userAppList = await pool.request().query(UserAppListStr);
            let rows2 = userAppList.recordset;

            var checkedApp = [];
            for(var i = 0; i < rows2.length; i++){
                for (var j=0; j < recordList.length; j++) {
                    if (Number(rows2[i].APP_ID) === recordList[j].CHATBOT_NUM) {
                        var item = {};
                        item = rows2[i];
                        checkedApp.push(item);
                        break;
                    }
                }
                
            }

            res.send({
                records : recordList.length,
                rows : recordList,
                checkedApp : checkedApp,
                pageList : paging.pagination(currentPage,rows[0].TOTCNT)
            });
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'app Load Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
})

router.post('/updateUserAppList', function (req, res) {
    let userId = req.body.userId;
    let saveData = JSON.parse(checkNull(req.body.saveData, ''));
    let removeData = JSON.parse(checkNull(req.body.removeData, ''));
    var saveDataStr = "";
    var removeDataStr = "";

    for (var i=0; i<saveData.length; i++) {
        saveDataStr += "INSERT INTO TBL_USER_RELATION_APP(USER_ID, APP_ID, CHAT_ID) " +
                    "     VALUES ('" + userId + "', " + saveData[i] + ", " + saveData[i] + "); \n";    
    }
    
    for (var i=0; i<removeData.length; i++) {
        removeDataStr += "DELETE FROM TBL_USER_RELATION_APP \n" +
                    "      WHERE 1=1 \n" +
                    "        AND CHAT_ID = " + removeData[i].APP_ID + " \n" +
                    "        AND USER_ID = '" + userId + "'; \n";     
    }
                        
                   
    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            if (saveData.length > 0) {
                let appList = await pool.request().query(saveDataStr);
            }
            
            if (removeData.length > 0) {
                let userAppList = await pool.request().query(removeDataStr);
            }

            res.send({status:200 , message:'Update Success'});
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'Update Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
    
})

router.get('/chatBotMng', function (req, res) {  
    res.render('chatBotMng');
});

router.post('/selecChatList', function (req, res) {

    let pageSize = checkNull(req.body.rows, 10);
    let currentPageNo = checkNull(req.body.page, 1);
    
    let searchName = checkNull(req.body.searchName, null);
    let sortIdx = "CHATBOT_NAME";
    (async () => {
        try {
         
            var QueryStr =  "SELECT TBZ.* ,(TOT_CNT - SEQ + 1) AS NO \n" +
                            "  FROM (SELECT TBY.* \n" +
                            "          FROM (SELECT ROW_NUMBER() OVER(ORDER BY TBX." + sortIdx + ") AS SEQ, \n" +
                            "                       COUNT('1') OVER(PARTITION BY '1') AS TOT_CNT, \n" +
                            "                       CEILING(ROW_NUMBER() OVER(ORDER BY TBX." + sortIdx + ") / CONVERT( NUMERIC, " + pageSize + " ) ) PAGEIDX, \n" +
                            "                       TBX.* \n" +
                            "                  FROM ( \n" +
                            "                         SELECT \n" +
                            "                              A.CHATBOT_NUM      AS CHATBOT_NUM, \n" +
                            "                              A.CHATBOT_NAME      AS CHATBOT_NAME, \n" +
                            "                              A.CULTURE      AS CULTURE, \n" +
                            "                              A.DESCRIPTION      AS DESCRIPTION, \n" +
                            "                              A.APP_COLOR      AS APP_COLOR \n" +
                            "                         FROM TBL_CHATBOT_APP A \n" +
                            "                         WHERE 1 = 1 \n" ;

            if (searchName) {
                QueryStr += "					      AND A.CHATBOT_NAME like '%" + searchName + "%' \n";
            }
            QueryStr +=     "                       ) TBX \n" +
                            "               ) TBY \n" +
                            "       ) TBZ \n" +
                            " WHERE PAGEIDX = " + currentPageNo + " \n";
            
            
            let pool = await dbConnect.getConnection(sql);
            let result1 = await pool.request().query(QueryStr);

            let rows = result1.recordset;

            var recordList = [];
            for(var i = 0; i < rows.length; i++){
                var item = {};
                item = rows[i];
                

                recordList.push(item);
            }


            if(rows.length > 0){

                var totCnt = 0;
                if (recordList.length > 0)
                    totCnt = checkNull(recordList[0].TOT_CNT, 0);
                var getTotalPageCount = Math.floor((totCnt - 1) / checkNull(rows[0].TOT_CNT, 10) + 1);


                res.send({
                    records : recordList.length,
                    total : getTotalPageCount,
                    pageList : paging.pagination(currentPageNo,rows[0].TOT_CNT), //page : checkNull(currentPageNo, 1),
                    rows : recordList
                });

            }else{
                //res.send({list : result});
                res.send({
                    records: 0,
                    rows: null
                });
            }
        } catch (err) {
            console.log(err)
            // ... error checks
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })


});

router.post('/selectChatAppList', function (req, res) {
    
    let chatId = checkNull(req.body.clicChatId, '');
    var currentPage = checkNull(req.body.currentPage, 1);
    var currentPageUser = checkNull(req.body.currentPageUser, 1);
    var selectAppListStr = "SELECT tbp.* from \n" +
                            " (SELECT ROW_NUMBER() OVER(ORDER BY APP_NAME DESC) AS NUM, \n" +
                            "         COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"  +
                            "         CEILING((ROW_NUMBER() OVER(ORDER BY APP_NAME DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                            "         APP_NAME, APP_ID,  LEFT(OWNER_EMAIL, CHARINDEX('@', OWNER_EMAIL)-1) OWNER_EMAIL, CHATBOT_ID \n" +
                           "          FROM TBL_LUIS_APP ) tbp \n" +
                           " WHERE 1=1 \n" +
                           "   AND PAGEIDX = " + currentPage + "; \n";

    var UserAppListStr = " SELECT  CHAT_ID, APP_ID \n" +
                         "   FROM TBL_CHAT_RELATION_APP  \n" +
                         "  WHERE 1=1  \n"  +
                         "    AND CHAT_ID = " + chatId + "  \n";          
    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            let appList = await pool.request().query(selectAppListStr);
            let rows = appList.recordset;

            var recordList = [];
            for(var i = 0; i < rows.length; i++){
                var item = {};
                item = rows[i];
                recordList.push(item);
            }

            let userAppList = await pool.request().query(UserAppListStr);
            let rows2 = userAppList.recordset;

            var checkedApp = [];

            if (rows2.length > 0) {
                for(var i = 0; i < rows2.length; i++){
                    if(rows2[i].APP_ID==null){
                        //nothing
                    }else{
                        for (var j=0; j < recordList.length; j++) {
                            if (rows2[i].APP_ID.trim() === recordList[j].APP_ID.trim()) {
                                var item = {};
                                rows2[i].APP_ID = rows2[i].APP_ID.trim();
                                item = rows2[i];
                                checkedApp.push(item);
                                break;
                            }
                        }
                    }
                }
            } else {

            }
            
            res.send({
                records : recordList.length,
                rows : recordList,
                checkedApp : checkedApp,
                pageList : paging.pagination(currentPage,rows[0].TOTCNT)
            });

            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'app Load Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
})

router.post('/updateChatAppList', function (req, res) {
    let chatId = req.body.chatId.trim();
    let saveData = JSON.parse(checkNull(req.body.saveData, ''));
    let removeData = JSON.parse(checkNull(req.body.removeData, ''));
    var saveDataStr = "";
    var removeDataStr = "";
    var nullDeleteStr = "";
    var nullDeleteCnt = 0;

    for (var i=0; i<saveData.length; i++) {
        saveDataStr += "INSERT INTO TBL_CHAT_RELATION_APP(CHAT_ID, APP_ID) " +
                    "     VALUES (" + chatId + ", '" + saveData[i] + "'); \n";    
        nullDeleteCnt++;
    }
    
    for (var i=0; i<removeData.length; i++) {
        removeDataStr += "DELETE FROM TBL_CHAT_RELATION_APP \n" +
                    "      WHERE 1=1 \n" +
                    "        AND CHAT_ID = " + chatId + " \n" +
                    "        AND APP_ID = '" + removeData[i].APP_ID.trim() + "'; \n ";     
        
        //removeDataStr += " UPDATE TBL_LUIS_APP SET CHATBOT_ID = NULL WHERE APP_ID = '" + removeData[i].APP_ID.trim() + "'; \n" ;
    }
    nullDeleteStr += "DELETE FROM TBL_CHAT_RELATION_APP WHERE APP_ID IS NULL; \n" ;                   
                   
    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            if (saveData.length > 0) {
                let appList = await pool.request().query(saveDataStr);
            }
            
            if (removeData.length > 0) {
                let userAppList = await pool.request().query(removeDataStr);
            }

            if (nullDeleteCnt > 0) {
                nullDeleteCnt = 0;
                let nullDelete = await pool.request().query(nullDeleteStr);
            }

            res.send({status:200 , message:'Update Success'});
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'Update Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
    
})

router.get('/apiSetting', function (req, res) {
    res.render('apiSetting');
})

router.post('/selectApiList', function (req, res) {
    res.locals.selMenu = req.session.selMenu = 'm1';
    
    let sortIdx = checkNull(req.body.sort, "USER_ID") + " " + checkNull(req.body.order, "ASC");
    let pageSize = checkNull(req.body.rows, 10);
    let currentPageNo = checkNull(req.body.page, 1);
    
    let searchId = checkNull(req.body.searchId, null);

    var selectAppListStr = "SELECT tbp.* from \n" +
                            " (SELECT ROW_NUMBER() OVER(ORDER BY API_ID DESC) AS NUM, \n" +
                            "         COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"  +
                            "         CEILING((ROW_NUMBER() OVER(ORDER BY API_ID DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                            "         API_SEQ, API_ID AS API_ID_HIDDEN, API_ID,  API_URL, API_DESC, USE_YN \n" +
                            "     FROM TBL_URL ) tbp \n" +
                            " WHERE 1=1 \n" +
                            " AND   USE_YN='Y' \n";
    if (searchId) {
        selectAppListStr +="   AND API_ID like '%" + searchId + "%' \n";
    }          
    selectAppListStr +=  "ORDER BY API_SEQ ASC, API_ID ASC; \n";
    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            let appList = await pool.request().query(selectAppListStr);
            let rows = appList.recordset;


            var recordList = [];
            for(var i = 0; i < rows.length; i++){
                var item = {};
                item = rows[i];
                recordList.push(item);
            }

            res.send({
                records : recordList.length,
                rows : recordList,
                pageList : paging.pagination(currentPageNo,rows[0].TOTCNT)
            });
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'app Load Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
})

router.post('/saveApiInfo', function(req, res){
    var apiArr = JSON.parse(req.body.saveArr);
    var saveStr = "";
    var updateStr = "";
    var deleteStr = "";

    for (var i=0; i<apiArr.length; i++) {
        if (apiArr[i].statusFlag === 'NEW') {
            saveStr += "INSERT INTO TBL_URL (API_ID, API_URL, API_DESC) ";
            saveStr += "VALUES ('" + apiArr[i].API_ID  + "', '" + apiArr[i].API_URL  + "', '" + apiArr[i].API_DESC  + "'); ";
        } else if (apiArr[i].statusFlag === 'EDIT') {
            updateStr += "UPDATE TBL_URL SET API_ID = '" + apiArr[i].API_ID  + "', "
                                        +  " API_URL = '" + apiArr[i].API_URL  + "', "
                                        +  " API_DESC = '" + apiArr[i].API_DESC   + "' "
                      +  "WHERE API_SEQ = '" + apiArr[i].API_SEQ + "'; ";
        } else { //DEL
            deleteStr += "UPDATE TBL_URL SET USE_YN = 'N' WHERE API_SEQ = '" + apiArr[i].API_SEQ + "'; ";
        }
    }

    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            if (saveStr !== "") {
                let insertUser = await pool.request().query(saveStr);
            }
            if (updateStr !== "") {
                let updateUser = await pool.request().query(updateStr);
            }
            if (deleteStr !== "") {
                let deleteUser = await pool.request().query(deleteStr);
            }

            res.send({status:200 , message:'Save Success'});
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'Save Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
});


router.get('/addApp', function (req, res) {
    res.render('addApp');
});
/*
router.post('/selecChatList', function (req, res) {

    var selectAppListStr =  " SELECT CHATBOT_NUM, CHATBOT_NAME, CULTURE, DESCRIPTION, APP_COLOR \n" + 
                            " FROM TBL_CHATBOT_APP \n" +
                            " WHERE 1=1 \n" +
                            " ORDER BY CHATBOT_NAME DESC, CULTURE DESC; \n";
    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            let appList = await pool.request().query(selectAppListStr);
            let rows = appList.recordset;


            var recordList = [];
            for(var i = 0; i < rows.length; i++){
                var item = {};
                item = rows[i];
                recordList.push(item);
            }

            res.send({
                rows : recordList
            });
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'app Load Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
})
*/

router.post('/addApp', function (req, res) {

    var chatNum = req.body.selApp;
    var chatName = req.body.selAppName;
    var appDes = checkNull(req.body.appDes, ' ');
    var getApplist = "SELECT APP_NAME, CULTURE, SUBSC_KEY FROM TBL_LUIS_APP WHERE CHATBOT_ID = " + chatNum + ";";
    var HOST = req.session.hostURL;
    
    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            let rows = await pool.request().query(getApplist);

            var appNames = rows.recordset;
            var appName = appNames[0].APP_NAME.split("_")[0] + "_" + appNames[0].APP_NAME.split("_")[1] + "_" + pad(appNames.length+1, 2);
            var appCulture = appNames[0].CULTURE;

            var selSubKey = appNames[0].SUBSC_KEY;

            var client = new Client();
            
            var options = {
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': selSubKey
                },
                data: {
                    'name': appName,
                    'description': appDes,
                    'culture': appCulture
                }
            };
            try{
                client.post( HOST + '/luis/api/v2.0/apps/', options, function (data, response) {
                    //console.log(data); // app id값
                    
                    if(response.statusCode == 201){ // 등록 성공

                        var createAppId = data;

                        var client = new Client();
                            var options = {
                                headers: {
                                    'Ocp-Apim-Subscription-Key': selSubKey//subKey
                                }
                            };

                            client.get( HOST + '/luis/api/v2.0/apps/' + createAppId, options, function (data, response) {

                                var appInfo = data;
                                var appStr = "";
                                appStr += "INSERT INTO TBL_LUIS_APP (APP_NUM, SUBSC_KEY, APP_ID, VERSION, APP_NAME, OWNER_EMAIL, REG_DT, CULTURE, DESCRIPTION) \n";
                                appStr += "VALUES ((SELECT isNULL(MAX(APP_NUM),0) FROM TBL_LUIS_APP)+1, '" + selSubKey + "', '" + appInfo.id + "', \n" +
                                            " '" + appInfo.activeVersion + "', '" + appInfo.name + "', '" + appInfo.ownerEmail + "', \n" +
                                            " convert(VARCHAR(33), '" + appInfo.createdDateTime + "', 126), '" + appInfo.culture + "', '" + appInfo.description + "'); \n";

                                appStr += "INSERT INTO TBL_CHAT_RELATION_APP(CHAT_ID, APP_ID) \n";
                                appStr += "VALUES(" + chatNum + ", '" + appInfo.id + "'); \n";

                                dbConnect.getConnection(sql).then(pool => {
                                    //new sql.ConnectionPool(dbConfig).connect().then(pool => {
                                    return pool.request().query(appStr)
                                }).then(result => {
                                    let rows = result.recordset;

                                    var insertQry = "INSERT INTO TBL_CHATBOT_CONF (CNF_TYPE, CNF_NM, CNF_VALUE, ORDER_NO) \n" +
                                                    "VALUES ('LUIS_APP_ID', '" + appInfo.name + "', '" + appInfo.id + "', (SELECT MAX(ORDER_NO)+1 FROM TBL_CHATBOT_CONF WHERE CNF_TYPE='LUIS_APP_ID')); "
                                    dbConnect.getAppConnection(sql, chatName, req.session.dbValue).then(pool => {
                                        //new sql.ConnectionPool(dbConfig).connect().then(pool => {
                                        return pool.request().query(insertQry) 
                                    }).then(result => {
                                        let rows = result.recordset;

                                        res.send({ message:'Save Success'});
                                        sql.close();
                                    }).catch(err => {
                                        console.log(err);
                                        sql.close();
                                    });
                                }).catch(err => {
                                    console.log(err);
                                    sql.close();
                                });
                                
                                
                                //res.send({ resultId:response.statusCode, createAppId:createAppId,  message:'Save Success'});
                        });

                        
                        
                    }else{
                        res.send({ message:'Save failed'});
                    }
                });
            }catch(e){
                console.log(e);
            }
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'Save Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
})


router.post('/getAppSelValues', function (req, res) {


    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            if (saveStr !== "") {
                let insertUser = await pool.request().query(saveStr);
            }
            if (updateStr !== "") {
                let updateUser = await pool.request().query(updateStr);
            }
            if (deleteStr !== "") {
                let deleteUser = await pool.request().query(deleteStr);
            }

            res.send({status:200 , message:'Save Success'});
            
        } catch (err) {
            console.log(err);
            res.send({status:500 , message:'Save Error'});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
})


router.post('/changePW', function (req, res) {

    if (req.body.err) {
        res.redirect("/users/error");
        return;
    }
    
    var userId = req.body.changeId;
    var userPw = req.body.changePw1;

    //let chngPw = encryption(userPw);
    (async () => {
        try {

            var newSalt = await pwConfig.getSaltCode();
            let chngPw = pwConfig.getPassWord(userPw, newSalt);

            var QueryStr = "UPDATE TB_USER_M SET SCRT_NUM = @chngPw, SCRT_SALT = @newSalt, PW_INIT_YN = 'N' WHERE USER_ID = @userId;";

            let pool = await dbConnect.getConnection(sql);
            let result1 = await pool.request()
                .input('chngPw', sql.NVarChar, chngPw)
                .input('newSalt', sql.NVarChar, newSalt)
                .input('userId', sql.NVarChar, userId)
                .query(QueryStr);

            logger.info('비밀번호변경 [id : %s] [url : %s]', userId, 'users/changePW');
            res.send('<script>alert("' + i18n.getCatalog()[res.locals.languageNow].ALERT_CHNG_SUCCESS + '");location.href="/";</script>');

        } catch (err) {
            logger.info('[에러]비밀번호변경 [id : %s] [url : %s] [message : %s]', userId, 'users/changePW', err);
            res.send('<script>alert("' + i18n.getCatalog()[res.locals.languageNow].ALERT_CHNG_FAIL + '");location.href="/";</script>');
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        logger.info('[에러]비밀번호변경 [id : %s] [url : %s] [message : %s]', userId, 'users/changePW', err);
        res.send('<script>alert("' + i18n.getCatalog()[res.locals.languageNow].ALERT_CHNG_FAIL + '");location.href="/";</script>');
    })
});





function pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function checkNull(val, newVal) {
    if (val === "" || typeof val === "undefined" || val === "0") {
        return newVal;
    } else {
        return val;
    }
}




/*
router.post('/', function (req, res) {
    let sortIdx = checkNull(req.body.sort, "USER_ID") + " " + checkNull(req.body.order, "ASC");
    let pageSize = checkNull(req.body.rows, 10);
    let currentPageNo = checkNull(req.body.page, 1);
    
    let searchName = checkNull(req.body.searchName, null);
    let searchId = checkNull(req.body.searchId, null);

    (async () => {
        try {
         
            var QueryStr =  "SELECT TBZ.* ,(TOT_CNT - SEQ + 1) AS NO " +
                            "  FROM (SELECT TBY.* " +
                            "          FROM (SELECT ROW_NUMBER() OVER(ORDER BY TBX." + sortIdx + ") AS SEQ, " +
                            "                       COUNT('1') OVER(PARTITION BY '1') AS TOT_CNT, " +
                            "                       CEILING(ROW_NUMBER() OVER(ORDER BY TBX." + sortIdx + ") / CONVERT( NUMERIC, " + pageSize + " ) ) PAGEIDX, " +
                            "                       TBX.*" +
                            "                  FROM ( " +
                            "                         SELECT " +
                            "                              A.EMP_NUM      AS EMP_NUM " +
                            "                            , A.USER_ID      AS USER_ID_HIDDEN " +
                            "                            , A.USER_ID      AS USER_ID " +
                            "                            , A.SCRT_NUM     AS SCRT_NUM " +
                            "                            , A.EMP_NM       AS EMP_NM " +
                            "                            , A.EMP_ENGNM    AS EMP_ENGNM " +
                            "                            , A.EMAIL        AS EMAIL " +
                            "                            , A.M_P_NUM_1    AS M_P_NUM_1 " +
                            "                            , A.M_P_NUM_2    AS M_P_NUM_2 " +
                            "                            , A.M_P_NUM_3    AS M_P_NUM_3 " +
                            "                            , A.USE_YN       AS USE_YN " +
                            "                            , CONVERT(NVARCHAR(10), A.REG_DT, 120) AS REG_DT " +
                            "                            , A.REG_ID       AS REG_ID " +
                            "                            , CONVERT(NVARCHAR(10), A.MOD_DT, 120) AS MOD_DT " +
                            "                            , A.MOD_ID       AS MOD_ID " +
                            "                            , A.LOGIN_FAIL_CNT      AS LOGIN_FAIL_CNT " +
                            "                            , CONVERT(NVARCHAR, A.LAST_LOGIN_DT, 120)  AS LAST_LOGIN_DT " +
                            "                            , CONVERT(NVARCHAR, A.LOGIN_FAIL_DT, 120)  AS LOGIN_FAIL_DT " +
                            "                         FROM TB_USER_M A " +
                            "                         WHERE 1 = 1 " +
                            "					      AND A.USE_YN = 'Y' "; 

            if (searchName) {
                QueryStr += "					      AND A.EMP_NM like '%" + searchName + "%' ";
            }
            if (searchId) {
                QueryStr += "					      AND A.USER_ID like '%" + searchId + "%' ";
            }
            QueryStr +=     "                       ) TBX " +
                            "               ) TBY " +
                            "       ) TBZ" +
                            " WHERE PAGEIDX = " + currentPageNo + " " +
                            "ORDER BY " + sortIdx + " ";
            
            
            let pool = await sql.connect(dbConfig)
            let result1 = await pool.request().query(QueryStr);

            let rows = result1.recordset;

            var recordList = [];
            for(var i = 0; i < rows.length; i++){
                var item = {};

                item = rows[i];
                

                recordList.push(item);
            }


            if(rows.length > 0){

                var totCnt = 0;
                if (recordList.length > 0)
                    totCnt = checkNull(recordList[0].TOT_CNT, 0);
                var getTotalPageCount = Math.floor((totCnt - 1) / checkNull(rows[0].TOT_CNT, 10) + 1);


                res.send({
                    records : recordList.length,
                    total : getTotalPageCount,
                    page : checkNull(currentPageNo, 1),
                    rows : recordList
                });

            }else{
                res.send({list : result});
            }
        } catch (err) {
            console.log(err)
            // ... error checks
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
});
*/





router.get('/error', function (req, res) {
    if (req.session.sid) {
        res.render('error');
    } else {
        var userId = req.session.sid;
        res.render('error');
    }
});

module.exports = router;
