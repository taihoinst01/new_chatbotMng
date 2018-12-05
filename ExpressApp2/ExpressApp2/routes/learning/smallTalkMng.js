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

router.get('/smallTalkEntity', function (req, res) {
    res.render('smallTalkEntity');
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
                            "         SEQ, S_QUERY, INTENT, ENTITY, S_ANSWER, USE_YN \n" +
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

router.post('/smallTalkProc', function (req, res) {
    var dataArr = JSON.parse(req.body.saveArr);
    var insertStr = "";
    var deleteStr = "";
    var userId = req.session.sid;
    
    for (var i = 0; i < dataArr.length; i++) {
        if (dataArr[i].statusFlag === 'ADD') {
            insertStr += "INSERT INTO TBL_SMALLTALK (S_QUERY, INTENT, ENTITY, S_ANSWER, DLG_TYPE, REG_DT) " +
            "VALUES (";
            insertStr += " '" + dataArr[i].S_QUERY + "', '" + dataArr[i].INTENT + "', '" + dataArr[i].ENTITY + "', '" + dataArr[i].S_ANSWER + "','2',GETDATE());";
        }else if (dataArr[i].statusFlag === 'DEL') {
            deleteStr += "DELETE FROM TBL_SMALLTALK WHERE SEQ = '" + dataArr[i].DELETE_ST_SEQ + "'; ";
        }else if (dataArr[i].statusFlag === 'UPDATE') {
            deleteStr += "UPDATE TBL_SMALLTALK SET S_ANSWER='" + dataArr[i].S_ANSWER + "', USE_YN='" + dataArr[i].USE_YN + "' WHERE SEQ = '" + dataArr[i].SEQ + "'; ";
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

    var iptUtterance = req.body.iptUtterance;
    var entitiesArr = [];
    var commonEntitiesArr = [];

    (async () => {
        try {
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

                var iptUtterTmp = iptUtterance;
                let result1 = await pool.request()
                    .input('iptUtterance', sql.NVarChar, iptUtterTmp)
                    .query('SELECT RESULT FROM dbo.FN_SMALLTALK_ENTITY_ORDERBY_ADD(@iptUtterance)')

                let rows = result1.recordset;

                if (rows[0]['RESULT'] != '') {
                    var entities = rows[0]['RESULT'];
                    var entityArr = entities.split(',');
    
                    var queryString2 = "SELECT ENTITY_VALUE,ENTITY FROM TBL_SMALLTALK_ENTITY_DEFINE WHERE ENTITY IN (";
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

/*
* entity mng
*/
router.post('/entities', function (req, res) {

    var currentPage = req.body.currentPage;

    (async () => {
        try {

            var entitiesQueryString = "SELECT tbp.* \n"
                + "  FROM ( SELECT ROW_NUMBER() OVER(ORDER BY api_group DESC) AS NUM, \n"
                + "                COUNT('1') OVER(PARTITION BY '1') AS TOTCNT,  \n"
                + "                CEILING((ROW_NUMBER() OVER(ORDER BY api_group DESC))/ convert(numeric ,10)) PAGEIDX, \n"
                + "                entity_value, entity, api_group \n"
                + "           from (   \n"
                + "                SELECT DISTINCT entity, API_GROUP ,  \n"
                + "                       STUFF(( SELECT '[' + b.entity_value + ']' \n"
                + "                                 FROM TBL_SMALLTALK_ENTITY_DEFINE b \n"
                + "                                WHERE b.entity = a.entity FOR XML PATH('') ),1,1,'[') AS entity_value  \n"
                + "                  FROM TBL_SMALLTALK_ENTITY_DEFINE a \n"
                + "                 WHERE API_GROUP != 'OCR TEST' \n"
                + "              GROUP BY entity, API_GROUP) TBL_SMALLTALK_ENTITY_DEFINE \n"
                + "         ) tbp \n"
                + "WHERE PAGEIDX = @currentPage; \n"
                
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request().input('currentPage', sql.Int, currentPage).query(entitiesQueryString);

            let rows = result1.recordset;

            var result = [];
            for (var i = 0; i < rows.length; i++) {
                var item = {};

                var entitiyValue = rows[i].entity_value;
                var entity = rows[i].entity;

                item.ENTITY_VALUE = entitiyValue;
                item.ENTITY = entity;

                result.push(item);
            }
            if (rows.length > 0) {
                res.send({ list: result, pageList: paging.pagination(currentPage, rows[0].TOTCNT) });
            } else {
                res.send({ list: result });
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

router.post('/deleteEntity', function (req, res) {

    var delEntityDefine = req.body.delEntityDefine;
    
    (async () => {
        try {

            var deleteAppStr = "DELETE FROM TBL_SMALLTALK_ENTITY_DEFINE WHERE ENTITY = '" + delEntityDefine + "'; \n";
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

            let result1 = await pool.request().query(deleteAppStr);

            res.send({ status: 200, message: 'delete Entity Success' });
            
        } catch (err) {
            console.log(err);
            console.log("res 500");
            res.send({ status: 500, message: 'delete Entity Error' });
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
    })

});



//엔티티 추가
router.post('/insertEntity', function (req, res) {

    var entityList = req.body;
    var entityTemp = [];
    if (entityList.entityDefine) {
        var tmpObj = new Object();
        tmpObj.entityDefine = entityList.entityDefine;
        tmpObj.entityValue = entityList.entityValue;
        entityTemp.push(tmpObj);
        entityList = entityTemp;
    }
    //var entityList = JSON.parse(req.body.entityObj);
    (async () => {
        try {
            var entityInputStr = "";
            entityInputStr += " SELECT COUNT(*) as count FROM TBL_SMALLTALK_ENTITY_DEFINE \n";
            entityInputStr += "  WHERE 1=1 \n";
            entityInputStr += "    AND ENTITY = '" + entityList[0].entityDefine + "' \n";
            entityInputStr += "    AND ( ";
            for (var i = 0; i < entityList.length; i++) {
                if (i !== 0) { entityInputStr += "     OR " }
                entityInputStr += "ENTITY_VALUE = '" + entityList[i].entityValue + "' \n";
            }
            entityInputStr += "); \n";
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

            let result0 = await pool.request().query(entityInputStr);
           
            let rows = result0.recordset;

            if (rows[0].count == 0) {

                var entityInputStr = "";
                for (var i = 0; i < entityList.length; i++) {
                    entityInputStr += " INSERT INTO TBL_SMALLTALK_ENTITY_DEFINE(ENTITY, ENTITY_VALUE) \n";
                    entityInputStr += " VALUES ('" + entityList[i].entityDefine + "', '" + entityList[i].entityValue + "'); \n";
                }

                let result1 = await pool.request().query(entityInputStr);

                res.send({ status: 200, message: 'insert Success' });
            } else {
                res.send({ status: 'Duplicate', message: 'Duplicate entities exist' });
            }

        } catch (err) {
            console.log(err);
            res.send({ status: 500, message: 'insert Entity Error' });
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
    })

});

//엔티티 수정
router.post('/updateEntity', function (req, res) {

    var entity = req.body.entityDefine;
    var updEntityValue = req.body.entityValue;
    var oriEntityValue = [];
    var insertValue = [];
    var deleteValue = [];
    var intentInfo = [];
    var entityCheck = false;

    var appName = req.session.appName;
    var subsKey = req.session.subsKey;

    var options = {
        headers: {
            'Ocp-Apim-Subscription-Key': subsKey
        }
    };

    var client = new Client();

    var selEntityQuery = "SELECT ENTITY_VALUE, ENTITY \n";
    selEntityQuery += "FROM TBL_SMALLTALK_ENTITY_DEFINE\n";
    selEntityQuery += "WHERE ENTITY = @entity";

    var delEntityQuery = "DELETE FROM TBL_SMALLTALK_ENTITY_DEFINE WHERE ENTITY_VALUE = @entityValue";

    var insertEntityQuery = "INSERT INTO TBL_SMALLTALK_ENTITY_DEFINE(ENTITY_VALUE,ENTITY)\n";
    insertEntityQuery += "VALUES(@entityValue, @entity)";

    (async () => {
        try {
            let appPool = await appDbConnect.getAppConnection(appSql, req.session.appName, req.session.dbValue);

            let selEntity = await appPool.request()
                .input('entity', sql.NVarChar, entity)
                .query(selEntityQuery);

            var selEntityRecord = selEntity.recordset;

            for (var i = 0; i < selEntityRecord.length; i++) {
                oriEntityValue.push(selEntityRecord[i].ENTITY_VALUE);
            }

            deleteValue = JSON.parse(JSON.stringify(oriEntityValue));
            insertValue = JSON.parse(JSON.stringify(updEntityValue));

            for (var i = 0; i < selEntityRecord.length; i++) {
                for (var j = 0; j < updEntityValue.length; j++) {
                    if (oriEntityValue[i] == updEntityValue[j]) {
                        deleteValue.splice(deleteValue.indexOf(oriEntityValue[i]), 1);
                        insertValue.splice(insertValue.indexOf(updEntityValue[i]), 1);
                        break;
                    }
                }
            }

            if (insertValue.length > 0 || deleteValue.length > 0) {
                for (var i = 0; i < insertValue.length; i++) {

                    let insertEntity = await appPool.request()
                                .input('entityValue', sql.NVarChar, insertValue[i])
                                .input('entity', sql.NVarChar, entity)
                                .query(insertEntityQuery);
                            break;
                }

                for (var delNum = 0; delNum < deleteValue.length; delNum++) {
                    let delEntity = await appPool.request()
                                    .input('entityValue', sql.NVarChar, deleteValue[delNum])
                                    .query(delEntityQuery);
                }
            }
            res.send({ status: 200 });
        } catch (err) {
            console.log(err);
            res.send({ status: 500, message: 'insert Entity Error' });
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
    })


});

//엔티티 검색
router.post('/searchEntities', function (req, res) {

    var currentPage = req.body.currentPage;
    var searchEntities = req.body.searchEntities;

    (async () => {
        try {

            var entitiesQueryString = "SELECT tbp.* \n FROM "
                + "    (SELECT ROW_NUMBER() OVER(ORDER BY api_group DESC) AS NUM, \n"
                + "            COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"
                + "            CEILING((ROW_NUMBER() OVER(ORDER BY api_group DESC))/ convert(numeric ,10)) PAGEIDX, \n"
                + "            entity_value, entity, api_group from (SELECT DISTINCT entity, API_GROUP , \n"
                + "            STUFF(( SELECT '[' + b.entity_value + ']' \n "
                + "                      FROM TBL_SMALLTALK_ENTITY_DEFINE b \n"
                + "                     WHERE b.entity = a.entity \n "
                + "                       AND b.API_GROUP = a.API_GROUP FOR XML PATH('') ),1,1,'[') AS entity_value \n"
                + "      FROM TBL_SMALLTALK_ENTITY_DEFINE a \n"
                + "     WHERE API_GROUP != 'OCR TEST' \n"
                + "       AND (entity like @searchEntities or entity_value like @searchEntities) \n"
                + "  GROUP BY entity, API_GROUP) a \n"
                + "      ) tbp  \n"
                + "WHERE PAGEIDX = 1 \n";

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request().input('currentPage', sql.Int, currentPage).input('searchEntities', sql.NVarChar, '%' + searchEntities + '%').query(entitiesQueryString);

            let rows = result1.recordset;

            var result = [];
            for (var i = 0; i < rows.length; i++) {
                var item = {};

                var entitiyValue = rows[i].entity_value;
                var entity = rows[i].entity;

                item.ENTITY_VALUE = entitiyValue;
                item.ENTITY = entity;

                result.push(item);
            }
            if (rows.length > 0) {
                res.send({ list: result, pageList: paging.pagination(currentPage, rows[0].TOTCNT) });
            } else {
                res.send({ list: result });
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

module.exports = router;