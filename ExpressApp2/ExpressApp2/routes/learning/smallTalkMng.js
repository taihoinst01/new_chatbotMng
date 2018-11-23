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

router.get('/smallTalkMng', function (req, res) {
    res.render('smallTalkMng');
});

router.post('/selectSmallTalkList', function (req, res) {
    var pageSize = checkNull(req.body.rows, 10);
    var currentPage = checkNull(req.body.currentPage, 1);
    
    (async () => {
        try {

            var QueryStr = "SELECT tbp.* from \n" +
                            " (SELECT ROW_NUMBER() OVER(ORDER BY SEQ DESC) AS NUM, \n" +
                            "         COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"  +
                            "         CEILING((ROW_NUMBER() OVER(ORDER BY SEQ DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                            "         SEQ, S_QUERY, INTENT, S_ANSWER \n" +
                           "          FROM TBL_SMALLTALK \n" +
                           "          WHERE 1=1 \n";
                           if (req.body.searchQuestiontText !== '') {
                            QueryStr += "AND S_QUERY like '%" + req.body.searchQuestiontText + "%' \n";
                        }

                        if (req.body.searchIntentText !== '') {
                            QueryStr += "AND INTENT like '" + req.body.searchIntentText + "%' \n";
                        }
                        QueryStr +="  ) tbp WHERE PAGEIDX = " + currentPage + "; \n";

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
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

router.post('/cancelSmallTalkProc', function (req, res) {
    var menuArr = JSON.parse(req.body.saveArr);
    var updateStr = "";
    var userId = req.session.sid;

    for (var i = 0; i < menuArr.length; i++) {
        updateStr += "UPDATE TBL_DLG_RELATION_LUIS SET ST_FLAG='F' WHERE RELATION_ID = '" + menuArr[i].CANCEL_ST_SEQ + "'; ";
    }

    (async () => {
        try {
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            if (updateStr !== "") {
                let updateSmallTalk= await pool.request().query(updateStr);
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

router.post('/smallTalkProc', function (req, res) {
    var dataArr = JSON.parse(req.body.saveArr);
    var insertStr = "";
    var userId = req.session.sid;

    for (var i = 0; i < dataArr.length; i++) {
        insertStr += "INSERT INTO TBL_SMALLTALK (S_QUERY, INTENT, S_ANSWER, DLG_TYPE, REG_DT) " +
        "VALUES (";
        insertStr += " '" + dataArr[i].S_QUERY + "', '" + dataArr[i].INTENT + "', '" + dataArr[i].S_ANSWER + "','2',GETDATE());";
    }

    (async () => {
        try {
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            if (insertStr !== "") {
                let insertSmallTalk= await pool.request().query(insertStr);
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