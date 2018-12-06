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

//질문답변 관리
router.get('/qnaList', function (req, res) {
    res.render('qna/qnaList');
});

//미답변 질문목록
router.get('/noAnswerQList', function (req, res) {
    res.render('qna/noAnswerQList');
});

//대화상자 설정
router.get('/dialogMng', function (req, res) {
    res.render('qna/dialogMng');
});

//초기메세지 설정(welcome, sorry, suggess)
router.get('/initDialogMng', function (req, res) {
    res.render('qna/initdialogMng');
});

router.post('/selectQnaList', function (req, res) {
    var pageSize = checkNull(req.body.rows, 10);
    var currentPage = checkNull(req.body.currentPage, 1);
    
    (async () => {
        try {

            var QueryStr = "SELECT tbp.* from \n" +
                            " (SELECT ROW_NUMBER() OVER(ORDER BY SEQ DESC) AS NUM, \n" +
                            "         COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n"  +
                            "         CEILING((ROW_NUMBER() OVER(ORDER BY SEQ DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                            "         SEQ, Q_ID, DLG_QUESTION, INTENT, ENTITY, GROUP_ID, DLG_ID, REG_DT, APP_ID, USE_YN \n" +
                           "          FROM TBL_QNAMNG \n" +
                           "          WHERE GROUP_ID IS NULL \n";
                           if (req.body.searchQuestiontText !== '') {
                            QueryStr += "AND DLG_QUESTION like '%" + req.body.searchQuestiontText + "%' \n";
                        }

                        if (req.body.searchIntentText !== '') {
                            QueryStr += "AND INTENT like '" + req.body.searchIntentText + "%' \n";
                        }
                        QueryStr +="  ) tbp WHERE PAGEIDX = " + currentPage + "; \n";

            var subQryStr = "SELECT SEQ, ENTITY, DLG_QUESTION FROM TBL_QNAMNG WHERE GROUP_ID = @motherSeq";

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request().query(QueryStr);

            let rows = result1.recordset;

            var recordList = [];
            for (var i = 0; i < rows.length; i++) {
                var item = {};
                item = rows[i];
                /*
                * 유사질문 내용 추가
                * */
               
               item.subQryList = [];
               let subQryResult = await pool.request()
               .input('motherSeq', sql.NVarChar, rows[i].SEQ)
               .query(subQryStr);

               let subQryRows = subQryResult.recordset;
               
                for(var j=0; j<subQryRows.length; j++){
                    var subQryItem = {};
                    subQryItem.SEQ = subQryRows[j].SEQ;
                    subQryItem.DLG_QUESTION = subQryRows[j].DLG_QUESTION;
                    subQryItem.ENTITY = subQryRows[j].ENTITY;
                    
                    item.subQryList.push(subQryItem);
                }


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

router.post('/getDlgAjax', function (req, res) {

    var entity = [];
    var dlgID = req.body.dlgID;
   
    var selectDlgType = " SELECT DLG_TYPE \n" +
        " , DLG_NAME, DLG_DESCRIPTION , DLG_GROUP, DLG_ORDER_NO, GROUPL , GROUPM, GROUPS, '' as MissingEntities, RELATION_NUM \n" +
        " FROM TBL_DLG \n" +
        " WHERE DLG_ID=" + dlgID + " \n";


    var dlgText = "SELECT DLG_ID, CARD_TITLE, CARD_TEXT, USE_YN, '2' AS DLG_TYPE \n"
        + "FROM TBL_DLG_TEXT\n"
        + "WHERE 1=1 \n"
        + "AND USE_YN = 'Y'\n"
        + "AND DLG_ID = " + dlgID + " \n";
    + "ORDER BY DLG_ID";

    var dlgCard = "SELECT DLG_ID, CARD_TEXT, CARD_TITLE, IMG_URL, BTN_1_TYPE, BTN_1_TITLE, BTN_1_CONTEXT,\n"
        + "BTN_2_TYPE, BTN_2_TITLE, BTN_2_CONTEXT,\n"
        + "BTN_3_TYPE, BTN_3_TITLE, BTN_3_CONTEXT,\n"
        + "BTN_4_TYPE, BTN_4_TITLE, BTN_4_CONTEXT,\n"
        + "CARD_ORDER_NO, CARD_VALUE,\n"
        + "USE_YN, '3' AS DLG_TYPE \n"
        + "FROM TBL_DLG_CARD\n"
        + "WHERE 1=1\n"
        + "AND USE_YN = 'Y'\n"
        + "AND DLG_ID = " + dlgID + " \n";
    + "ORDER BY DLG_ID";

    var dlgMedia = "SELECT DLG_ID, CARD_TEXT, CARD_TITLE, MEDIA_URL, BTN_1_TYPE, BTN_1_TITLE, BTN_1_CONTEXT,\n"
        + "BTN_2_TYPE, BTN_2_TITLE, BTN_2_CONTEXT,\n"
        + "BTN_3_TYPE, BTN_3_TITLE, BTN_3_CONTEXT,\n"
        + "BTN_4_TYPE, BTN_4_TITLE, BTN_4_CONTEXT,\n"
        + "CARD_VALUE,\n"
        + "USE_YN, '4' AS DLG_TYPE \n"
        + "FROM TBL_DLG_MEDIA\n"
        + "WHERE 1=1\n"
        + "AND USE_YN = 'Y'\n"
        + "AND DLG_ID = " + dlgID + " \n";
    + "ORDER BY DLG_ID";

    (async () => {
        try {
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

            let dlgTextResult = await pool.request()
                .query(dlgText);
            let rowsText = dlgTextResult.recordset;

            let dlgCardResult = await pool.request()
                .query(dlgCard);
            let rowsCard = dlgCardResult.recordset;

            let dlgMediaResult = await pool.request()
                .query(dlgMedia);
            let rowsMedia = dlgMediaResult.recordset;

            let result1 = await pool.request()
                .query(selectDlgType)
            let rows = result1.recordset;
            var result = [];
            
            for (var i = 0; i < rows.length; i++) {
                var row = {};
                row.DLG_TYPE = rows[i].DLG_TYPE;
                row.DLG_NAME = rows[i].DLG_NAME;
                row.DLG_DESCRIPTION = rows[i].DLG_DESCRIPTION;
                row.DLG_ORDER_NO = rows[i].DLG_ORDER_NO;
                row.DLG_GROUP = rows[i].DLG_GROUP;
                row.GROUPL = rows[i].GROUPL;
                row.GROUPM = rows[i].GROUPM;
                row.GROUPS = rows[i].GROUPS;
                row.RELATION_NUM = rows[i].RELATION_NUM;
                row.DLG_ID = dlgID;
                row.DLG_RELATION = [];
                row.dlg = [];
                
                let dlg_type = rows[i].DLG_TYPE;
                if (dlg_type == 2) {
                    
                    for (var j = 0; j < rowsText.length; j++) {
                        let textDlgId = rowsText[j].DLG_ID;
                        if (row.DLG_ID == textDlgId) {
                            row.dlg.push(rowsText[j]);
                        }
                    }
                } else if (dlg_type == 3) {
                    for (var j = 0; j < rowsCard.length; j++) {
                        var cardDlgId = rowsCard[j].DLG_ID;
                        if (row.DLG_ID == cardDlgId) {
                            row.dlg.push(rowsCard[j]);
                        }
                    }
                } else if (dlg_type == 4) {
                    for (var j = 0; j < rowsMedia.length; j++) {
                        var mediaDlgId = rowsMedia[j].DLG_ID;
                        if (row.DLG_ID == mediaDlgId) {
                            row.dlg.push(rowsMedia[j]);
                        }
                    }
                }

                result.push(row);
            }

            res.send({ list: result });

        } catch (err) {

            console.log(err);
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        console.log(err);
    })
});

router.post('/updateDialog', function (req, res) {
    var dlgIdReq = req.body.dlgId;
    var dlgType = req.body.dlgType;
    var entity = req.body.entity;
    var relationNum = req.body.relationNum;

    //var data = req.body['updateData[]'];
    var data = req.body.updateData;
    var array = [];
    var queryText = "";
    var tblDlgId = [];
    var order = [];
    
    if (typeof data == "string") {
        console.log("data is string");
        var json = JSON.parse(data);

        for (var key in json) {
            console.log("key : " + key + " value : " + json[key]);
        }

    } else {
        console.log("data is object======qna");

        //array = JSON.parse(data);

        var dataIdx = data.length;

        for (var i = 0; i < dataIdx; i++) {
            array[i] = JSON.parse(data[i]);
        }

        for (var i = 0; i < array.length; i++) {
            for (var key in array[i]) {
                console.log("key : " + key + " value : " + array[i][key]);
            }
        }
    }

    var delDlgTextQuery = "DELETE FROM TBL_DLG_TEXT WHERE DLG_ID = @dlgId";
    var delDlgCardQuery = "DELETE FROM TBL_DLG_CARD WHERE DLG_ID = @dlgId";
    var delDlgMediaQuery = "DELETE FROM TBL_DLG_MEDIA WHERE DLG_ID = @dlgId";
    var delDlgQuery = "DELETE FROM TBL_DLG WHERE DLG_ID = @dlgId"

    var selDlgQuery = "SELECT DLG_ID, DLG_LANG, DLG_GROUP, DLG_TYPE, DLG_ORDER_NO, GROUPS, RELATION_NUM \n";
    selDlgQuery += "FROM TBL_DLG\n";
    selDlgQuery += "WHERE DLG_ID = @dlgId";

    var selDlgGroupSQuery = "SELECT DLG_ID, DLG_LANG, DLG_GROUP, DLG_TYPE, DLG_ORDER_NO, GROUPS\n";
    selDlgGroupSQuery += "FROM TBL_DLG\n";
    selDlgGroupSQuery += "WHERE GROUPS = @groupS \n"
    selDlgGroupSQuery += "ORDER BY DLG_ORDER_NO";

    var updDlgOrderQuery = "UPDATE TBL_DLG SET DLG_ORDER_NO = @order WHERE DLG_ID = @dlgId";

    
    var updRelationQuery = "UPDATE TBL_DLG_RELATION_LUIS SET DLG_ID = @newDlgId WHERE DLG_ID = @dlgIdBefore";

    //var updDlgRelationQuery = "UPDATE TBL_DLG_RELATION_LUIS SET LUIS_ID = @luisId, LUIS_INTENT = @luisIntent WHERE DLG_ID = @dlgId";
    (async () => {
        try {

            var selectDlgId = 'SELECT ISNULL(MAX(DLG_ID)+1,1) AS DLG_ID FROM TBL_DLG';
            var insertTblDlg = 'INSERT INTO TBL_DLG(DLG_ID,DLG_NAME,DLG_DESCRIPTION,DLG_LANG,DLG_TYPE,DLG_ORDER_NO,USE_YN,GROUPL,GROUPM,GROUPS,DLG_GROUP,RELATION_NUM) VALUES ' +
                '(@dlgId,@dialogTitle,@dialogDesc,\'KO\',@dlgType,@dialogOrderNo,\'Y\',@groupl,@groupm,@groups,2,@relationNum)';
            var inserTblDlgText = 'INSERT INTO TBL_DLG_TEXT(DLG_ID,CARD_TITLE,CARD_TEXT,USE_YN) VALUES ' +
                '(@dlgId,@dialogTitle,@dialogText,\'Y\')';
            var insertTblCarousel = 'INSERT INTO TBL_DLG_CARD(DLG_ID,CARD_TITLE,CARD_TEXT,IMG_URL,BTN_1_TYPE,BTN_1_TITLE,BTN_1_CONTEXT,BTN_2_TYPE,BTN_2_TITLE,BTN_2_CONTEXT,BTN_3_TYPE,BTN_3_TITLE,BTN_3_CONTEXT,BTN_4_TYPE,BTN_4_TITLE,BTN_4_CONTEXT,CARD_ORDER_NO,USE_YN,CARD_VALUE) VALUES ' +
                '(@dlgId,@dialogTitle,@dialogText,@imgUrl,@btn1Type,@buttonName1,@buttonContent1,@btn2Type,@buttonName2,@buttonContent2,@btn3Type,@buttonName3,@buttonContent3,@btn4Type,@buttonName4,@buttonContent4,@cardOrderNo,\'Y\',@cardValue)';
            var insertTblDlgMedia = 'INSERT INTO TBL_DLG_MEDIA(DLG_ID,CARD_TITLE,CARD_TEXT,MEDIA_URL,BTN_1_TYPE,BTN_1_TITLE,BTN_1_CONTEXT,BTN_2_TYPE,BTN_2_TITLE,BTN_2_CONTEXT,BTN_3_TYPE,BTN_3_TITLE,BTN_3_CONTEXT,BTN_4_TYPE,BTN_4_TITLE,BTN_4_CONTEXT,CARD_DIVISION,CARD_VALUE,USE_YN) VALUES ' +
                '(@dlgId,@dialogTitle,@dialogText,@imgUrl,@btn1Type,@buttonName1,@buttonContent1,@btn2Type,@buttonName2,@buttonContent2,@btn3Type,@buttonName3,@buttonContent3,@btn4Type,@buttonName4,@buttonContent4,@cardDivision,@cardValue,\'Y\')';
            var insertTblRelation = "INSERT INTO TBL_DLG_RELATION_LUIS(LUIS_ID,LUIS_INTENT,LUIS_ENTITIES,DLG_ID,DLG_API_DEFINE,USE_YN, DLG_QUESTION, ST_FLAG) "
                + "VALUES( @luisId, @luisIntent, @entity, @dlgId, 'D', 'Y', @dlgQuestion, 'T' ) ";

            var luisId = array[array.length - 1]["largeGroup"];
            var luisIntent = array[array.length - 1]["middleGroup"];
            var sourceType = array[array.length - 1]["sourceType"];
            var title = array[array.length - 1]["title"];
            var description = array[array.length - 1]["description"];
            var dlgQuestion = array[array.length - 1]["dlgQuestion"];

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

            let selDlgRes = await pool.request()
                .input('dlgId', sql.Int, dlgIdReq)
                .query(selDlgQuery);

            let selDlg = selDlgRes.recordset;

            //selDlg[0].DLG_ID
            //tbl_dlg 삭제
            let delDlg = await pool.request()
                .input('dlgId', sql.Int, dlgIdReq)
                .query(delDlgQuery);

            //tbl_dlg text, card, media 삭제
            if (selDlg[0].DLG_TYPE == 2) {
                let delDlgText = await pool.request()
                    .input('dlgId', sql.Int, dlgIdReq)
                    .query(delDlgTextQuery);
            } else if (selDlg[0].DLG_TYPE == 3) {
                let delDlgCard = await pool.request()
                    .input('dlgId', sql.Int, dlgIdReq)
                    .query(delDlgCardQuery);
            } else if (selDlg[0].DLG_TYPE == 4) {
                let delDlgMedia = await pool.request()
                    .input('dlgId', sql.Int, dlgIdReq)
                    .query(delDlgMediaQuery);
            }

            for (var i = 0; i < (array.length - 1); i++) {

                let result1 = await pool.request()
                    .query(selectDlgId)
                let dlgId = result1.recordset;

                let result2 = await pool.request()
                    .input('dlgId', sql.Int, i == 0 ? dlgIdReq : dlgId[0].DLG_ID)
                    .input('dialogTitle', sql.NVarChar, title)
                    .input('dialogDesc', sql.NVarChar, description)
                    .input('dlgType', sql.NVarChar, array[i]["dlgType"])
                    //.input('dialogOrderNo', sql.Int, (i + 1))
                    .input('dialogOrderNo', sql.Int, selDlg[0].DLG_ORDER_NO)
                    .input('groupl', sql.NVarChar, luisId)
                    .input('groupm', sql.NVarChar, luisIntent)
                    .input('groups', sql.NVarChar, entity)
                    .input('relationNum', sql.NVarChar, selDlg[0].RELATION_NUM)
                    .query(insertTblDlg)

                if (array[i]["dlgType"] == "2") {

                    let result4 = await pool.request()
                        .input('dlgId', sql.Int, i == 0 ? dlgIdReq : dlgId[0].DLG_ID)
                        .input('dialogTitle', sql.NVarChar, array[i]["dialogTitle"])
                        .input('dialogText', sql.NVarChar, array[i]["dialogText"])
                        .query(inserTblDlgText);

                } else if (array[i]["dlgType"] == "3") {

                    for (var j = 0; j < array[i].carouselArr.length; j++) {
                        var carTmp = array[i].carouselArr[j];

                        carTmp["btn1Type"] = (carTmp["cButtonContent1"] != "") ? carTmp["btn1Type"] : "";
                        carTmp["btn2Type"] = (carTmp["cButtonContent2"] != "") ? carTmp["btn2Type"] : "";
                        carTmp["btn3Type"] = (carTmp["cButtonContent3"] != "") ? carTmp["btn3Type"] : "";
                        carTmp["btn4Type"] = (carTmp["cButtonContent4"] != "") ? carTmp["btn4Type"] : "";

                        let result2 = await pool.request()
                            .input('dlgId', sql.Int, i == 0 ? dlgIdReq : dlgId[0].DLG_ID)
                            .input('dialogTitle', sql.NVarChar, carTmp["dialogTitle"])
                            .input('dialogText', sql.NVarChar, carTmp["dialogText"])
                            .input('imgUrl', sql.NVarChar, carTmp["imgUrl"])
                            .input('cardValue', sql.NVarChar, carTmp["cardValue"])
                            .input('btn1Type', sql.NVarChar, carTmp["btn1Type"])
                            .input('buttonName1', sql.NVarChar, carTmp["cButtonName1"])
                            .input('buttonContent1', sql.NVarChar, carTmp["cButtonContent1"])
                            .input('btn2Type', sql.NVarChar, carTmp["btn2Type"])
                            .input('buttonName2', sql.NVarChar, carTmp["cButtonName2"])
                            .input('buttonContent2', sql.NVarChar, carTmp["cButtonContent2"])
                            .input('btn3Type', sql.NVarChar, carTmp["btn3Type"])
                            .input('buttonName3', sql.NVarChar, carTmp["cButtonName3"])
                            .input('buttonContent3', sql.NVarChar, carTmp["cButtonContent3"])
                            .input('btn4Type', sql.NVarChar, carTmp["btn4Type"])
                            .input('buttonName4', sql.NVarChar, carTmp["cButtonName4"])
                            .input('buttonContent4', sql.NVarChar, carTmp["cButtonContent4"])
                            .input('cardOrderNo', sql.Int, (j + 1))
                            .query(insertTblCarousel);

                    }

                } else if (array[i]["dlgType"] == "4") {
                    //동영상 일때 cardDivision 컬럼에 play 가 있어야 한다.
                    //이것은 임시방편으로서 나중에는 수정을 해야 한다.
                    //입력하는 부분에도 있다....함께 고쳐야 한다.
                    var cardDivision = "";
                    if (array[i]["mediaUrl"] == "" || array[i]["mediaUrl"] == null) {

                    } else {
                        cardDivision = "play";
                    }
                    let result4 = await pool.request()
                        .input('dlgId', sql.Int, i == 0 ? dlgIdReq : dlgId[0].DLG_ID)
                        .input('dialogTitle', sql.NVarChar, array[i]["dialogTitle"])
                        .input('dialogText', sql.NVarChar, array[i]["dialogText"])
                        .input('imgUrl', sql.NVarChar, array[i]["mediaImgUrl"])
                        .input('btn1Type', sql.NVarChar, array[i]["btn1Type"])
                        .input('buttonName1', sql.NVarChar, array[i]["mButtonName1"])
                        .input('buttonContent1', sql.NVarChar, array[i]["mButtonContent1"])
                        .input('btn2Type', sql.NVarChar, array[i]["btn2Type"])
                        .input('buttonName2', sql.NVarChar, array[i]["mButtonName2"])
                        .input('buttonContent2', sql.NVarChar, array[i]["mButtonContent2"])
                        .input('btn3Type', sql.NVarChar, array[i]["btn3Type"])
                        .input('buttonName3', sql.NVarChar, array[i]["mButtonName3"])
                        .input('buttonContent3', sql.NVarChar, array[i]["mButtonContent3"])
                        .input('btn4Type', sql.NVarChar, array[i]["btn4Type"])
                        .input('buttonName4', sql.NVarChar, array[i]["mButtonName4"])
                        .input('buttonContent4', sql.NVarChar, array[i]["mButtonContent4"])
                        .input('cardDivision', sql.NVarChar, cardDivision)
                        .input('cardValue', sql.NVarChar, array[i]["mediaUrl"])
                        .query(insertTblDlgMedia)

                }
                /*
                //order_no 부분 2018-12-06 작업중  주석 수정예정
                //유두연주임 
                if (i != 0) {
                    let insertTblRelationRes = await pool.request()
                        .input('luisId', sql.NVarChar, luisId)
                        .input('luisIntent', sql.NVarChar, luisIntent)
                        .input('entity', sql.NVarChar, entity)
                        .input('dlgId', sql.Int, dlgId[0].DLG_ID)
                        .input('dlgQuestion', sql.NVarChar, dlgQuestion)
                        .query(insertTblRelation)
                }
                
                //tblDlgId.push(i == 0 ? parseInt(dlgIdReq) : dlgId[0].DLG_ID);
                */
               let updateTblRelationRes = await pool.request()
                    .input('newDlgId', sql.Int, dlgId[0].DLG_ID)
                    .input('dlgIdBefore', sql.Int, dlgIdReq)
                    .query(updRelationQuery)
            }

            /*
            //order_no 부분 2018-12-06 작업중 불필요해보여서 주석
            //유두연주임 

            for (var oNum = 0; oNum < order.length; oNum++) {
                if (order[oNum] == tblDlgId[0]) {
                    order.splice(oNum, 1);
                    order.splice(oNum, 0, tblDlgId);
                    break;
                }
            }

            console.log(order);

            var orderCount = 1;

            for (var i = 0; i < order.length; i++) {

                if (Array.isArray(order[i])) {
                    for (var j = 0; j < order[i].length; j++) {
                        let updDlgOrder = await pool.request()
                            .input('order', sql.NVarChar, orderCount++)
                            .input('dlgId', sql.NVarChar, order[i][j])
                            .query(updDlgOrderQuery);
                    }
                } else {
                    let updDlgOrder = await pool.request()
                        .input('order', sql.NVarChar, orderCount++)
                        .input('dlgId', sql.NVarChar, order[i])
                        .query(updDlgOrderQuery);
                }
            }
            */
            res.send({ "res": true });

        } catch (err) {
            res.send({ "res": false });
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
    })
});

router.post('/updateInitDialog', function (req, res) {
    var dlgIdReq = req.body.dlgId;
    var dlgType = req.body.dlgType;
    var entity = req.body.entity;

    //var data = req.body['updateData[]'];
    var data = req.body.updateData;
    var array = [];
    var queryText = "";
    var tblDlgId = [];
    var order = [];
    
    if (typeof data == "string") {
        console.log("data is string");
        var json = JSON.parse(data);

        for (var key in json) {
            console.log("key : " + key + " value : " + json[key]);
        }

    } else {
        console.log("data is object======initdlg");

        //array = JSON.parse(data);

        var dataIdx = data.length;

        for (var i = 0; i < dataIdx; i++) {
            array[i] = JSON.parse(data[i]);
        }

        for (var i = 0; i < array.length; i++) {
            for (var key in array[i]) {
                console.log("key : " + key + " value : " + array[i][key]);
            }
        }
    }

    var delDlgTextQuery = "DELETE FROM TBL_DLG_TEXT WHERE DLG_ID = @dlgId";
    var delDlgCardQuery = "DELETE FROM TBL_DLG_CARD WHERE DLG_ID = @dlgId";
    var delDlgQuery = "DELETE FROM TBL_DLG WHERE DLG_ID = @dlgId"

    var selDlgQuery = "SELECT DLG_ID, DLG_LANG, DLG_GROUP, DLG_TYPE, DLG_ORDER_NO, GROUPS\n";
    selDlgQuery += "FROM TBL_DLG\n";
    selDlgQuery += "WHERE DLG_ID = @dlgId";

    (async () => {
        try {

            var selectDlgId = 'SELECT ISNULL(MAX(DLG_ID)+1,1) AS DLG_ID FROM TBL_DLG';
            var insertTblDlg = 'INSERT INTO TBL_DLG(DLG_ID,DLG_NAME,DLG_DESCRIPTION,DLG_LANG,DLG_TYPE,DLG_ORDER_NO,USE_YN,GROUPL,GROUPM,GROUPS,DLG_GROUP) VALUES ' +
                '(@dlgId,@dialogTitle,@dialogDesc,\'KO\',@dlgType,@dialogOrderNo,\'Y\',\'\',\'\',\'\',@dlgGroup)';
            var inserTblDlgText = 'INSERT INTO TBL_DLG_TEXT(DLG_ID,CARD_TITLE,CARD_TEXT,USE_YN) VALUES ' +
                '(@dlgId,@dialogTitle,@dialogText,\'Y\')';
            var insertTblCarousel = 'INSERT INTO TBL_DLG_CARD(DLG_ID,CARD_TITLE,CARD_TEXT,IMG_URL,BTN_1_TYPE,BTN_1_TITLE,BTN_1_CONTEXT,BTN_2_TYPE,BTN_2_TITLE,BTN_2_CONTEXT,BTN_3_TYPE,BTN_3_TITLE,BTN_3_CONTEXT,BTN_4_TYPE,BTN_4_TITLE,BTN_4_CONTEXT,CARD_ORDER_NO,USE_YN,CARD_VALUE) VALUES ' +
                '(@dlgId,@dialogTitle,@dialogText,@imgUrl,@btn1Type,@buttonName1,@buttonContent1,@btn2Type,@buttonName2,@buttonContent2,@btn3Type,@buttonName3,@buttonContent3,@btn4Type,@buttonName4,@buttonContent4,@cardOrderNo,\'Y\',@cardValue)';

            var title = array[array.length - 1]["title"];
            var description = array[array.length - 1]["description"];
            var dlgGroup = array[array.length - 1]["dlgGroup"];
            var dialogOrderNo = array[array.length - 1]["dlgOrderNo"];

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

            let selDlgRes = await pool.request()
                .input('dlgId', sql.Int, dlgIdReq)
                .query(selDlgQuery);

            let selDlg = selDlgRes.recordset;

            //selDlg[0].DLG_ID
            //tbl_dlg 삭제
            let delDlg = await pool.request()
                .input('dlgId', sql.Int, dlgIdReq)
                .query(delDlgQuery);

            //tbl_dlg text, card, media 삭제
            if (selDlg[0].DLG_TYPE == 2) {
                let delDlgText = await pool.request()
                    .input('dlgId', sql.Int, dlgIdReq)
                    .query(delDlgTextQuery);
            } else if (selDlg[0].DLG_TYPE == 3) {
                let delDlgCard = await pool.request()
                    .input('dlgId', sql.Int, dlgIdReq)
                    .query(delDlgCardQuery);
            } 

            for (var i = 0; i < (array.length - 1); i++) {
                
                let result1 = await pool.request()
                    .query(selectDlgId)
                let dlgId = result1.recordset;

                let result2 = await pool.request()
                    .input('dlgId', sql.Int, i == 0 ? dlgIdReq : dlgId[0].DLG_ID)
                    .input('dialogTitle', sql.NVarChar, title)
                    .input('dialogDesc', sql.NVarChar, description)
                    .input('dlgType', sql.NVarChar, array[i]["dlgType"])
                    .input('dlgGroup', sql.NVarChar, dlgGroup)
                    .input('dialogOrderNo', sql.Int, dialogOrderNo)
                    //.input('dialogOrderNo', sql.Int, (i + 1))
                    .query(insertTblDlg)

                if (array[i]["dlgType"] == "2") {

                    let result4 = await pool.request()
                        .input('dlgId', sql.Int, i == 0 ? dlgIdReq : dlgId[0].DLG_ID)
                        .input('dialogTitle', sql.NVarChar, array[i]["dialogTitle"])
                        .input('dialogText', sql.NVarChar, array[i]["dialogText"])
                        .query(inserTblDlgText);

                } else if (array[i]["dlgType"] == "3") {

                    for (var j = 0; j < array[i].carouselArr.length; j++) {
                        var carTmp = array[i].carouselArr[j];

                        carTmp["btn1Type"] = (carTmp["cButtonContent1"] != "") ? carTmp["btn1Type"] : "";
                        carTmp["btn2Type"] = (carTmp["cButtonContent2"] != "") ? carTmp["btn2Type"] : "";
                        carTmp["btn3Type"] = (carTmp["cButtonContent3"] != "") ? carTmp["btn3Type"] : "";
                        carTmp["btn4Type"] = (carTmp["cButtonContent4"] != "") ? carTmp["btn4Type"] : "";

                        let result2 = await pool.request()
                            .input('dlgId', sql.Int, i == 0 ? dlgIdReq : dlgId[0].DLG_ID)
                            .input('dialogTitle', sql.NVarChar, carTmp["dialogTitle"])
                            .input('dialogText', sql.NVarChar, carTmp["dialogText"])
                            .input('imgUrl', sql.NVarChar, carTmp["imgUrl"])
                            .input('cardValue', sql.NVarChar, carTmp["cardValue"])
                            .input('btn1Type', sql.NVarChar, carTmp["btn1Type"])
                            .input('buttonName1', sql.NVarChar, carTmp["cButtonName1"])
                            .input('buttonContent1', sql.NVarChar, carTmp["cButtonContent1"])
                            .input('btn2Type', sql.NVarChar, carTmp["btn2Type"])
                            .input('buttonName2', sql.NVarChar, carTmp["cButtonName2"])
                            .input('buttonContent2', sql.NVarChar, carTmp["cButtonContent2"])
                            .input('btn3Type', sql.NVarChar, carTmp["btn3Type"])
                            .input('buttonName3', sql.NVarChar, carTmp["cButtonName3"])
                            .input('buttonContent3', sql.NVarChar, carTmp["cButtonContent3"])
                            .input('btn4Type', sql.NVarChar, carTmp["btn4Type"])
                            .input('buttonName4', sql.NVarChar, carTmp["cButtonName4"])
                            .input('buttonContent4', sql.NVarChar, carTmp["cButtonContent4"])
                            .input('cardOrderNo', sql.Int, (j + 1))
                            .query(insertTblCarousel);

                    }

                } 

                tblDlgId.push(i == 0 ? parseInt(dlgIdReq) : dlgId[0].DLG_ID);
            }

            res.send({ "res": true });

        } catch (err) {
            console.log(err);
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {

    })
});

router.post('/dialogList', function (req, res) {
    var searchTitleTxt = req.body.searchTitleTxt;
    var searchDescTxt = req.body.searchDescTxt;
    var currentPage = req.body.currentPage;

    (async () => {
        try {
            var sourceType = req.body.sourceType;
            var groupType = req.body.groupType;
            var dlg_desQueryString = "select tbp.* from \n" +
                "(select ROW_NUMBER() OVER(ORDER BY DLG_ID DESC) AS NUM, \n" +
                "      DLG_ID, \n" +
                "COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n" +
                "CEILING((ROW_NUMBER() OVER(ORDER BY DLG_ID DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                "DLG_NAME, DLG_DESCRIPTION, DLG_TYPE \n" +
                "FROM TBL_DLG \n" +
                "WHERE DLG_GROUP = 2 \n";
            if (req.body.searchTitleTxt !== '') {
                dlg_desQueryString += "AND DLG_NAME like '%" + req.body.searchTitleTxt + "%' \n";
            }
            if (req.body.searchDescTxt !== '') {
                dlg_desQueryString += "AND DLG_DESCRIPTION like '%" + req.body.searchDescTxt + "%' \n";
            }
            dlg_desQueryString += ") tbp \n" +
                "WHERE PAGEIDX = @currentPage";
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request().input('currentPage', sql.Int, currentPage).query(dlg_desQueryString);
            let rows = result1.recordset;

            var result = [];
            for (var i = 0; i < rows.length; i++) {
                var item = {};

                var num = rows[i].NUM;
                var dlgName = rows[i].DLG_NAME;
                var description = rows[i].DLG_DESCRIPTION;
                var dlgType = rows[i].DLG_TYPE;
                var dialogueId = rows[i].DLG_ID;

                item.NUM = num;
                item.DLG_ID = dialogueId;
                item.DLG_NAME = dlgName;
                item.DLG_DESCRIPTION = description;
                item.DLG_TYPE = dlgType;

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

router.post('/procSimilarQuestion', function (req, res) {  
    var dataArr = JSON.parse(req.body.saveArr);
    var saveRelation = "";
    var saveQna = "";
    var deleteQna = "";
    var deleteRelation = "";

    
    var intentName = req.body.intentName;
    var labeledUtterArr = req.body.labelArr;//req.body['labelArr[]'];
    var newUtterArr = req.body.newUtterArr;//req.body['labelArr[]'];
    
    

    (async () => {
        try {
            if (labeledUtterArr.length > 0) {
                var labelArr = [];
                var tmpObj = new Object();
                
                for (var i=0; i<labeledUtterArr.length; i++) {
                    options.payload = labeledUtterArr[i];
                    
                    tmpLuisObj = syncClient.post(HOST + '/luis/api/v2.0/apps/' + req.session.selAppId + '/versions/' + '0.1' + '/example', options);
                    
                    if (newUtterArr != undefined) {
                        for (var j=0; j<newUtterArr.length; j++) {
                            if (newUtterArr[j].text == labeledUtterArr[i].text) {
                                newUtterArr[j].id = tmpLuisObj.body;
                                var entityTmp = labeledUtterArr[i].entityLabels;
                                var entities = '';
                                for (var k=0; k<entityTmp.length; k++) {
                                    entities += entityTmp[k].entityName;
                                    if (k < entityTmp.length-1) {
                                        entities += ',';
                                    }
                                }

                                for (var i=0; i<dataArr.length; i++) {
                                    if (dataArr[i].PROC_TYPE === 'INSERT') {
                                        saveRelation += "INSERT INTO TBL_DLG_RELATION_LUIS (LUIS_ID, LUIS_INTENT, LUIS_ENTITIES, DLG_ID, USE_YN, DLG_QUESTION, SIMILAR_ID) " + 
                                                    "VALUES ( ";
                                        saveRelation += "'luisId', '" + dataArr[i].LUIS_INTENT  + "', '" + entities  + "', '" + dataArr[i].DLG_ID  + "', 'Y', '" + dataArr[i].DLG_QUESTION  + "',(SELECT ISNULL(MAX(SEQ),1) AS SIMILAR_ID FROM TBL_QNAMNG))";
                            
                                        saveQna += "INSERT INTO TBL_QNAMNG (DLG_QUESTION, INTENT, ENTITY, GROUP_ID, DLG_ID, REG_DT) " + 
                                                    "VALUES ( ";
                                        saveQna += " '" + dataArr[i].DLG_QUESTION  + "', '" + dataArr[i].LUIS_INTENT  + "', '" + entities  + "', '" + dataArr[i].GROUP_ID  + "', '" + dataArr[i].DLG_ID  + "', GETDATE()); ";
                                    }else{//삭제
                                        deleteQna += "DELETE FROM TBL_QNAMNG WHERE SEQ = '" + dataArr[i].DEL_SEQ + "'; ";
                                        deleteRelation += "DELETE FROM TBL_DLG_RELATION_LUIS WHERE SIMILAR_ID = '" + dataArr[i].DEL_SEQ + "'; ";
                                    }
                                }
                                    
                                let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);

                                if (saveQna !== "") {
                                    let insertQna = await pool.request().query(saveQna);
                                }

                                if (saveRelation !== "") {
                                    let insertRelation = await pool.request().query(saveRelation);
                                }

                                if (deleteRelation !== "") {
                                    let deleteRelationLet = await pool.request().query(deleteRelation);
                                }

                                if (deleteQna !== "") {
                                    let deleteQnaLet = await pool.request().query(deleteQna);
                                }
                                

                            }
                        }
                    }
                    luisResult.push(tmpLuisObj);
                }

                var rstChk = false;
                for (var tmp in luisResult) {
                    console.log(luisResult[tmp]);
                    if (luisResult[tmp].statusCode != 201) {
                        var resultCode = luisResult[tmp].body.error.code;
                        var resultStr = luisResult[tmp].body.error.message;
                        logger.info('[에러] 어터런스 변경 저장  [id : %s] [url : %s] [코드 : %s] [내용 : %s]', userId, 'luis/saveUtterance', luisResult[tmp].statusCode, resultCode + ':' + resultStr);
                    } 
                }
        
                res.send({status:200 , message:'Save Success'});
            } else {
                res.send({status:500 , message:'Save Success'});
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
});



router.post('/selectNoAnswerQList', function (req, res) {
    var selectType = req.body.selectType;
    var currentPage = req.body.currentPage;
    var searchRecommendText = req.body.searchRecommendText;

    (async () => {
        try {
            var entitiesQueryString = "" +
                "SELECT TBZ.* \n" +
                "  FROM ( \n" +
                "        SELECT TBY.*  \n" +
                "          FROM ( \n" +
                "		        SELECT ROW_NUMBER() OVER(ORDER BY TBX.SEQ DESC) AS NUM,  \n" +
                "                       COUNT('1') OVER(PARTITION BY '1') AS TOTCNT,  \n" +
                "                       CEILING((ROW_NUMBER() OVER(ORDER BY TBX.SEQ DESC) )/ convert(numeric ,10)) PAGEIDX,  \n" +
                "                       TBX.*  \n" +
                "                 FROM (  \n" +
                "                        SELECT SEQ,QUERY,CONVERT(CHAR(19), UPD_DT, 20) AS UPD_DT,TBH.QUERY_KR \n" + //--(SELECT RESULT FROM dbo.FN_ENTITY_ORDERBY_ADD(QUERY)) AS ENTITIES
                "                          FROM TBL_QUERY_ANALYSIS_RESULT, ( \n" +
                "						                                     SELECT CUSTOMER_COMMENT_KR AS QUERY_KR \n" +
                "						                                       FROM TBL_HISTORY_QUERY \n" +
                "						                                      GROUP BY CUSTOMER_COMMENT_KR ) TBH \n" +
                "                         WHERE RESULT NOT IN ('H', 'R')     \n" +
            //    "                           AND TRAIN_FLAG = 'N'  \n" +
                "                           AND QUERY = dbo.fn_replace_regex(TBH.QUERY_KR)  \n";

            if (selectType == 'yesterday') {
                entitiesQueryString += " AND (CONVERT(CHAR(10), UPD_DT, 23)) like '%'+(select CONVERT(CHAR(10), (select dateadd(day,-1,getdate())), 23)) + '%'";
            } else if (selectType == 'lastWeek') {
                entitiesQueryString += " AND (CONVERT(CHAR(10), UPD_DT, 23)) >= (SELECT CONVERT(CHAR(10), (DATEADD(wk, DATEDIFF(d, 0, getdate()) / 7 - 1, -1)), 23))";
                entitiesQueryString += " AND (CONVERT(CHAR(10), UPD_DT, 23)) <= (SELECT CONVERT(CHAR(10), (DATEADD(wk, DATEDIFF(d, 0, getdate()) / 7 - 1, 5)), 23))";
            } else if (selectType == 'lastMonth') {
                entitiesQueryString += "  AND CONVERT(CHAR(10), UPD_DT, 23)  BETWEEN CONVERT(CHAR(10),dateadd(month,-1,getdate()), 23) and CONVERT(CHAR(10), getdate(), 23) ";
            } else {
            }

            if (searchRecommendText) {

                entitiesQueryString += " AND QUERY LIKE '%" + searchRecommendText + "%' ";
            }

            entitiesQueryString += "" +
                "                       ) TBX \n" +
                "			   ) TBY \n" +
                "	     ) TBZ \n" +
                " WHERE 1=1  \n" +
                "   AND PAGEIDX = @currentPage  \n" +
                " ORDER BY NUM \n";

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request()
                .input('currentPage', sql.Int, currentPage)
                .query(entitiesQueryString)
            let rows = result1.recordset;


            var result = [];
            for (var i = 0; i < rows.length; i++) {
                var item = {};
                var query = rows[i].QUERY_KR;
                var seq = rows[i].SEQ;
                //var entities = rows[i].ENTITIES;
                var updDt = rows[i].UPD_DT;
                //var entityArr = rows[i].ENTITIES.split(',');
                //var luisQueryString = "";

                item.QUERY = query;
                item.UPD_DT = updDt;
                item.SEQ = seq;
                
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



router.post('/deleteNoAnswerQ', function (req, res) {
    (async () => {
        try {
            var arryseq = req.body.seq;
            //var arryseq = seqs.split(',');
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            for (var i = 0; i < arryseq.length; i++) {
                var deleteQueryString1 = "UPDATE TBL_QUERY_ANALYSIS_RESULT SET RESULT = 'R' WHERE seq=@seq";
                let result5 = await pool.request()
                            .input('seq', sql.NVarChar, arryseq[i])
                            .query(deleteQueryString1);
            }
            res.send({result : true});
        } catch (err) {
            res.send({result : false});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        console.log(err);
    })
});




router.post('/selectIntentApp', function (req, res) {
    var userId = req.session.sid;

    (async () => {
        try {
            var intentList = req.session.intentList;
            res.send({ result: true, intentList: intentList});
        } catch (err) {
            res.send({ result: false });

        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        console.log(err);
    })
});


router.post('/getAppNumber', function (req, res) {
    var userId = req.session.sid;
    var selAppId = req.body.appId
    try {
        var selIndex = -1;
        var appInfo = req.session.selChatInfo;
        for (var i=0; i<appInfo.chatbot.appList.length; i++) { 
            if (appInfo.chatbot.appList[i].APP_ID == selAppId) {
                selIndex = i;
            }
        }
        res.send({ result: true, selIndex: selIndex});
    } catch (err) {
        res.send({ result: false });

    } finally {
        sql.close();
    }
});


router.post('/initDialogList', function (req, res) {
    var searchTitleTxt = req.body.searchTitleTxt;
    var searchDescTxt = req.body.searchDescTxt;
    var currentPage = req.body.currentPage;

    (async () => {
        try {
            var sourceType = req.body.sourceType;
            var groupType = req.body.groupType;
            var dlg_desQueryString = "select tbp.* from \n" +
                "(select ROW_NUMBER() OVER(ORDER BY DLG_ID DESC) AS NUM, \n" +
                "COUNT('1') OVER(PARTITION BY '1') AS TOTCNT, \n" +
                "CEILING((ROW_NUMBER() OVER(ORDER BY DLG_ID DESC))/ convert(numeric ,10)) PAGEIDX, \n" +
                "DLG_ID, DLG_NAME, DLG_DESCRIPTION, DLG_LANG, DLG_GROUP, DLG_TYPE, DLG_ORDER_NO, USE_YN, DLG_INTENT \n" +
                "FROM TBL_DLG \n" +
                "WHERE DLG_GROUP != 2 \n";
                /*
            if (req.body.searchTitleTxt !== '') {
                dlg_desQueryString += "AND DLG_NAME like '%" + req.body.searchTitleTxt + "%' \n";
            }
            if (req.body.searchDescTxt !== '') {
                dlg_desQueryString += "AND DLG_DESCRIPTION like '%" + req.body.searchDescTxt + "%' \n";
            }
            */
            dlg_desQueryString += ") tbp \n" +
                "WHERE PAGEIDX = @currentPage \n" +
                "ORDER BY DLG_GROUP ASC, DLG_ORDER_NO ASC" ;
            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request().input('currentPage', sql.Int, currentPage).query(dlg_desQueryString);
            let rows = result1.recordset;

            var result = [];
            for (var i = 0; i < rows.length; i++) {
                var item = {};

                var num = rows[i].NUM;
                var dialogueId = rows[i].DLG_ID;
                var dlgName = rows[i].DLG_NAME;
                var description = rows[i].DLG_DESCRIPTION;
                var dlgGroup = rows[i].DLG_GROUP;
                var dlgType = rows[i].DLG_TYPE;
                var useYn = rows[i].USE_YN;
                var dlgIntent = rows[i].DLG_INTENT;
                var dlgOrderNo = rows[i].DLG_ORDER_NO;

                item.NUM = num;
                item.DLG_ID = dialogueId;
                item.DLG_NAME = dlgName;
                item.DLG_DESCRIPTION = description;
                item.DLG_GROUP = dlgGroup;
                item.DLG_TYPE = dlgType;
                item.DLG_USEYN = useYn;
                item.DLG_INTENT = dlgIntent;
                item.DLG_ORDER_NO = dlgOrderNo;

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