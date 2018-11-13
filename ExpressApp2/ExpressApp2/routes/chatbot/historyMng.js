'use strict';
var express = require('express');
var Client = require('node-rest-client').Client;
var sql = require('mssql');
var dbConfig = require('../../config/dbConfig');
var dbConnect = require('../../config/dbConnect');
var paging = require('../../config/paging');
var util = require('../../config/util');
var Client = require('node-rest-client').Client;

const syncClient = require('sync-rest-client');
const appDbConnect = require('../../config/appDbConnect');
const appSql = require('mssql');

var router = express.Router();

//템플릿 관리
router.get('/historyList', function (req, res) {

    var selectChannel = "";
    selectChannel += "  SELECT ISNULL(CHANNEL,'') AS CHANNEL FROM TBL_HISTORY_QUERY \n";
    selectChannel += "   WHERE 1=1 \n";
    selectChannel += "GROUP BY CHANNEL \n";
    dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue).then(pool => {
        //new sql.ConnectionPool(dbConfig).connect().then(pool => {
        return pool.request().query(selectChannel)
    }).then(result => {
        let rows = result.recordset
        req.session.save(function(){
            res.render('chatbotMng/historyList', {   
                //selMenu: req.session.menu,
                //appName: req.session.appName,
                //subKey: req.session.subKey,
                channelList : rows
            });   
        });
        sql.close();
    }).catch(err => {
        res.status(500).send({ message: "${err}"})
        sql.close();
    });
});

router.post('/selectHistoryList', function (req, res) {

    var currentPage = checkNull(req.body.currentPage, 1);

    (async () => {
        try {

            var QueryStr = "";
            QueryStr += "  SELECT tbx.* \n";
            QueryStr += "    FROM ( \n";
            QueryStr += "           SELECT ROW_NUMBER() OVER(ORDER BY SID DESC) AS NUM \n";
            QueryStr += "                  ,COUNT('1') OVER(PARTITION BY '1') AS TOTCNT \n";
            QueryStr += "                  ,CEILING((ROW_NUMBER() OVER(ORDER BY SID DESC))/ convert(numeric ,10)) PAGEIDX \n";
            QueryStr += "                  ,CUSTOMER_COMMENT_KR, CHATBOT_COMMENT_CODE, CHANNEL, RESPONSE_TIME, REG_DATE \n";
            QueryStr += "                  ,(CASE RTRIM(LUIS_INTENT) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(LUIS_INTENT, 'NONE') END \n";
            QueryStr += "                  ) AS LUIS_INTENT \n";
            QueryStr += "                  ,(CASE RTRIM(LUIS_ENTITIES) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(LUIS_ENTITIES, 'NONE') END \n";
            QueryStr += "                  ) AS LUIS_ENTITIES \n";
            QueryStr += "                  ,(CASE RTRIM(DLG_ID) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(DLG_ID, 'NONE') END \n";
            QueryStr += "                  ) AS DLG_ID, SID \n";
            QueryStr += "             FROM TBL_HISTORY_QUERY \n";
            QueryStr += "            WHERE RTRIM(CUSTOMER_COMMENT_KR) != '' \n";
            QueryStr += "              AND SID IN ( \n";
            QueryStr += "                           SELECT MAX(SID) AS SID \n";
            QueryStr += "                           FROM TBL_HISTORY_QUERY  \n";
            QueryStr += "                           GROUP BY REPLACE(CUSTOMER_COMMENT_KR, ' ', '') \n";
            QueryStr += "                         ) \n";
            QueryStr += "     ) tbx\n";
            QueryStr += "  WHERE PAGEIDX = @currentPage\n";

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request()
                    .input('currentPage', sql.NVarChar, currentPage)
                    .query(QueryStr);

            let rows = result1.recordset;

            if (rows.length > 0) {
                res.send({ rows: rows, pageList: paging.pagination(currentPage, rows[0].TOTCNT) });
            } else {
                res.send({
                    rows : []
                });
            }
        } catch (err) {
            console.log(err)
            // ... error checks
        } finally {
            sql.close();
        }
    })()


});


router.post('/selectHistoryDetail', function (req, res) {
    
    var sId = req.body.sId;

    (async () => {
        try {

            var QueryStr = "";
            QueryStr += "  SELECT tbx.* \n";
            QueryStr += "    FROM ( \n";
            QueryStr += "           SELECT ROW_NUMBER() OVER(ORDER BY SID DESC) AS NUM \n";
            QueryStr += "                  ,COUNT('1') OVER(PARTITION BY '1') AS TOTCNT \n";
            QueryStr += "                  ,CEILING((ROW_NUMBER() OVER(ORDER BY SID DESC))/ convert(numeric ,10)) PAGEIDX \n";
            QueryStr += "                  ,CUSTOMER_COMMENT_KR, CHATBOT_COMMENT_CODE, CHANNEL, RESPONSE_TIME, REG_DATE \n";
            QueryStr += "                  ,(CASE RTRIM(LUIS_INTENT) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(LUIS_INTENT, 'NONE') END \n";
            QueryStr += "                  ) AS LUIS_INTENT \n";
            QueryStr += "                  ,(CASE RTRIM(LUIS_ENTITIES) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(LUIS_ENTITIES, 'NONE') END \n";
            QueryStr += "                  ) AS LUIS_ENTITIES \n";
            QueryStr += "                  ,(CASE RTRIM(DLG_ID) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(DLG_ID, 'NONE') END \n";
            QueryStr += "                  ) AS DLG_ID, SID \n";
            QueryStr += "             FROM TBL_HISTORY_QUERY \n";
            QueryStr += "            WHERE RTRIM(CUSTOMER_COMMENT_KR) != '' \n";
            QueryStr += "              AND REPLACE(CUSTOMER_COMMENT_KR, ' ', '') = ( \n";
            QueryStr += "                           SELECT REPLACE(CUSTOMER_COMMENT_KR, ' ', '')  \n";
            QueryStr += "                           FROM TBL_HISTORY_QUERY  \n";
            QueryStr += "                           WHERE SID = @sId \n";
            QueryStr += "                         ) \n";
            QueryStr += "     ) tbx\n";

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request()
                    .input('sId', sql.NVarChar, sId)
                    .query(QueryStr);

            let rows = result1.recordset;

            if (rows.length > 0) {
                res.send({ rows: rows});
            } else {
                res.send({
                    rows : []
                });
            }
        } catch (err) {
            console.log(err)
            // ... error checks
        } finally {
            sql.close();
        }
    })()


});


function checkNull(val, newVal) {
    if (val === "" || typeof val === "undefined" || val === "0") {
        return newVal;
    } else {
        return val;
    }
}

router.post('/procTemplate', function (req, res) {
    var dataArr = JSON.parse(req.body.saveArr);
    var saveStr = "";
    var updateAllStr = "";
    var updateStr = "";
    var deleteStr = "";
    var userId = req.session.sid;

    for (var i = 0; i < dataArr.length; i++) {
        if (dataArr[i].statusFlag === 'NEW') {
            saveStr += "INSERT INTO TBL_CHATBOT_TEMPLATE (HEADER_COLOR, BODY_COLOR, POPHEADER_COLOR, BOT_COLOR, USER_COLOR, ICON_IMG, BACKGROUND_IMG, CHATBOT_NAME, REG_DT, USE_YN) " +
                "VALUES (";
            saveStr += " '" + dataArr[i].HEADER_COLOR + "', '" + dataArr[i].BODY_COLOR + "', '" + dataArr[i].POPHEADER_COLOR + "', '" + dataArr[i].BOT_COLOR + "', '" + dataArr[i].USER_COLOR + "', '" + dataArr[i].ICON_IMG + "', '" + dataArr[i].BACKGROUND_IMG + "', '" + dataArr[i].CHATBOT_NAME + "', GETDATE() , 'N');";
        } else if (dataArr[i].statusFlag === 'UPDATE_USEYN') {
            updateAllStr += "UPDATE TBL_CHATBOT_TEMPLATE SET USE_YN ='N' WHERE CHATBOT_NAME = '" + dataArr[i].CHATBOT_NAME + "';";
            updateStr += "UPDATE TBL_CHATBOT_TEMPLATE SET USE_YN ='Y' WHERE SEQ = '" + dataArr[i].USEYN_SEQ + "'; ";
        } else { //DEL
            deleteStr += "DELETE FROM TBL_CHATBOT_TEMPLATE WHERE SEQ = '" + dataArr[i].DEL_SEQ + "'; ";
        }
    }

    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            if (saveStr !== "") {
                let insertTemplate = await pool.request().query(saveStr);
            }
            if (updateStr !== "") {
                let updateTemplateAll = await pool.request().query(updateAllStr);
                let updateTemplate = await pool.request().query(updateStr);
            }
            if (deleteStr !== "") {
                let deleteBannedWord = await pool.request().query(deleteStr);
            }

            res.send({ status: 200, message: 'Save Success' });

        } catch (err) {
            console.log(err);
            res.send({ status: 500, message: 'Save Error' });
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
});

module.exports = router;