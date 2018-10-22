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
router.get('/templateMng', function (req, res) {
    res.render('chatbotMng/templateMng');
});

router.post('/selectTemplateList', function (req, res) {
    var pageSize = checkNull(req.body.rows, 10);
    var currentPage = checkNull(req.body.currentPage, 1);
    var chatbotName = req.body.chatbotName;

    (async () => {
        try {

            var QueryStr = "SELECT tbp.* from \n" +
                            " (SELECT ROW_NUMBER() OVER(ORDER BY SEQ DESC) AS NUM, \n" +
                            "         COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"  +
                            "         CEILING((ROW_NUMBER() OVER(ORDER BY SEQ DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                            "         SEQ, TOP_COLOR, BACKGROUND_COLOR, ICON_IMG, BACKGROUND_IMG, CHATBOT_NAME, REG_DT, USE_YN \n" +
                           "          FROM TBL_CHATBOT_TEMPLATE ) tbp \n" +
                           " WHERE CHATBOT_NAME = '"+chatbotName+ "' \n" +
                           "   AND PAGEIDX = " + currentPage + "; \n";

            let pool = await dbConnect.getConnection(sql);
            let result1 = await pool.request().query(QueryStr);

            let rows = result1.recordset;

            var recordList = [];
            for (var i = 0; i < rows.length; i++) {
                var item = {};
                item = rows[i];


                recordList.push(item);
            }


            if (rows.length > 0) {

                var totCnt = 0;
                if (recordList.length > 0)
                    totCnt = checkNull(recordList[0].TOTCNT, 0);
                var getTotalPageCount = Math.floor((totCnt - 1) / checkNull(rows[0].TOTCNT, 10) + 1);


                res.send({
                    records: recordList.length,
                    total: getTotalPageCount,
                    pageList: paging.pagination(currentPage, rows[0].TOTCNT), //page : checkNull(currentPageNo, 1),
                    rows: recordList
                });

            } else {
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

router.post('/procTemplate', function (req, res) {
    var dataArr = JSON.parse(req.body.saveArr);
    var saveStr = "";
    var updateStr = "";
    var deleteStr = "";
    var userId = req.session.sid;

    for (var i = 0; i < dataArr.length; i++) {
        if (dataArr[i].statusFlag === 'NEW') {
            saveStr += "INSERT INTO TBL_BANNED_WORD_LIST (BANNED_WORD, BANNED_WORD_TYPE) " +
                "VALUES (";
            saveStr += " '" + dataArr[i].BANNED_WORD + "', '" + dataArr[i].BANNED_WORD_TYPE + "');";
        } else { //DEL
            deleteStr += "DELETE FROM TBL_BANNED_WORD_LIST WHERE SEQ = '" + dataArr[i].DEL_SEQ + "'; ";
        }
    }

    (async () => {
        try {
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            if (saveStr !== "") {
                let insertBannedWord = await pool.request().query(saveStr);
            }
            if (updateStr !== "") {
                let updateBannedWord = await pool.request().query(updateStr);
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