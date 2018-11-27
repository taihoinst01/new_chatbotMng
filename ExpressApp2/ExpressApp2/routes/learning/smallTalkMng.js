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
                            "         SEQ, S_QUERY, INTENT, ENTITY, S_ANSWER \n" +
                           "          FROM TBL_SMALLTALK \n" +
                           "          WHERE 1=1 \n";
                           if (req.body.searchQuestiontText !== '') {
                            QueryStr += "AND S_QUERY like '%" + req.body.searchQuestiontText + "%' \n";
                        }

                        if (req.body.searchIntentText !== '') {
                            QueryStr += "AND ENTITY like '" + req.body.searchIntentText + "%' \n";
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
    var deleteStr = "";
    var userId = req.session.sid;
    console.log("dataArr.length=="+dataArr.length);

    for (var i = 0; i < dataArr.length; i++) {
        if (dataArr[i].statusFlag === 'ADD') {
            insertStr += "INSERT INTO TBL_SMALLTALK (S_QUERY, INTENT, ENTITY, S_ANSWER, DLG_TYPE, REG_DT) " +
            "VALUES (";
            insertStr += " '" + dataArr[i].S_QUERY + "', '" + dataArr[i].INTENT + "', '" + dataArr[i].ENTITY + "', '" + dataArr[i].S_ANSWER + "','2',GETDATE());";
        }else if (dataArr[i].statusFlag === 'DEL') {
            deleteStr += "DELETE FROM TBL_SMALLTALK WHERE SEQ = '" + dataArr[i].DELETE_ST_SEQ + "'; ";
        }else{

        }
    }
   

    (async () => {
        try {
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            if (insertStr !== "") {
                let insertSmallTalk= await pool.request().query(insertStr);
            }

            if (deleteStr !== "") {
                let deleteSmallTalk = await pool.request().query(deleteStr);
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

router.post('/getEntityAjax', function (req, res, next) {

    //view에 있는 data 에서 던진 값을 받아서
    //var iptUtterance = req.body['iptUtterance[]'];
    var iptUtterance = req.body.iptUtterance;
    var entitiesArr = [];
    var commonEntitiesArr = [];

    (async () => {
        try {
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

            //res.send({result:true, iptUtterance:iptUtterance, entities:entities, selBox:rows2, commonEntities: commonEntities});
            //    for (var i = 0; i < (typeof iptUtterance !== 'string' ? iptUtterance.length : 1); i++) {
                //var iptUtterTmp = (typeof iptUtterance === 'string' ? iptUtterance : iptUtterance[i]);
                var iptUtterTmp = iptUtterance;
                let result1 = await pool.request()
                    .input('iptUtterance', sql.NVarChar, iptUtterTmp)
                    .query('SELECT RESULT FROM dbo.FN_ENTITY_ORDERBY_ADD(@iptUtterance)')

                let rows = result1.recordset;

                if (rows[0]['RESULT'] != '') {
                    var entities = rows[0]['RESULT'];
                    var entityArr = entities.split(',');
    
                    var queryString2 = "SELECT ENTITY_VALUE,ENTITY FROM TBL_COMMON_ENTITY_DEFINE WHERE ENTITY IN (";
                    for (var j = 0; j < entityArr.length; j++) {
                        queryString2 += "'";
                        queryString2 += entityArr[j];
                        queryString2 += "'";
                        queryString2 += (j != entityArr.length - 1) ? "," : "";
                    }
                    queryString2 += ")";
                    let result3 = await pool.request()
                        .query(queryString2)
                    
                    let rows3 = result3.recordset
                    var commonEntities = [];
                    for (var j = 0; j < rows3.length; j++) {
                        // 중복되는 엔티티가 있는 경우 길이가 긴 것이 우선순위를 갖음
                        if (iptUtterTmp.indexOf(rows3[j].ENTITY_VALUE) != -1) {
                            // 첫번째 엔티티는 등록
                            var isCommonAdd = false;
                            if (commonEntities.length == 0) {
                                isCommonAdd = true;
                            } else {
                                for (var k = 0; k < commonEntities.length; k++) {
                                    var longEntity = '';
                                    var shortEntity = '';
                                    var isAdd = false;
                                    if (rows3[j].ENTITY_VALUE.length >= commonEntities[k].ENTITY_VALUE.length) {
                                        longEntity = rows3[j].ENTITY_VALUE;
                                        shortEntity = commonEntities[k].ENTITY_VALUE;
                                        isAdd = true;
                                    } else {
                                        longEntity = commonEntities[k].ENTITY_VALUE;
                                        shortEntity = rows3[j].ENTITY_VALUE;
                                    }
                                    if (longEntity.indexOf(shortEntity) != -1) {
                                        if (isAdd) {
                                            commonEntities.splice(k, 1);
                                            isCommonAdd = true;
                                            break;
                                        }
                                    } else {
                                        isAdd = true;
                                    }
                                    if (isAdd && k == commonEntities.length - 1) {
                                        isCommonAdd = true;
                                    }
                                }
                            }
                            if (isCommonAdd) {
                                var item = {};
                                item.ENTITY_VALUE = rows3[j].ENTITY_VALUE;
                                item.ENTITY = rows3[j].ENTITY;
                                commonEntities.push(item);
                            }
                        }

                    }
                    entitiesArr.push(entities);
                    commonEntitiesArr.push(commonEntities);

                } else {
                    entitiesArr.push(null);
                    commonEntitiesArr.push(null);

                }
            //}

            res.send({ result: true, entities: entitiesArr, commonEntities: commonEntitiesArr });

        } catch (err) {
            // ... error checks
            console.log(err);
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })

});

module.exports = router;