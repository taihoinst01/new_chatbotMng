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

//log start
var Logger = require("../../config/logConfig");
var logger = Logger.CreateLogger();
//log end

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

        req.session.channelList = rows;
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

    var searchQuestion = req.body.searchQuestion;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var selDate = req.body.selDate;
    var selChannel = req.body.selChannel;
    var currentPage = checkNull(req.body.currentPage, 1);

    if (chkBoardParams(req.body, req.session.channelList)) {
        logger.info('[에러]대시보드 검색 필터 오류 [id : %s] [url : %s] [error : %s]', userId, 'historyMng/selectHistoryList', req.body.toString());
        res.send({ status: "PARAM_ERROR" });
    } else {
        (async () => {
            try {
    
                var QueryStr = "";
                QueryStr += "  SELECT tbx.* \n";
                QueryStr += "    FROM ( \n";
                QueryStr += "           SELECT ROW_NUMBER() OVER(ORDER BY A.SID DESC) AS NUM \n";
                QueryStr += "                  ,COUNT('1') OVER(PARTITION BY '1') AS TOTCNT \n";
                QueryStr += "                  ,CEILING((ROW_NUMBER() OVER(ORDER BY A.SID DESC))/ convert(numeric ,10)) PAGEIDX \n";
                QueryStr += "                  ,A.CUSTOMER_COMMENT_KR, A.CHATBOT_COMMENT_CODE, A.CHANNEL, A.RESPONSE_TIME, A.REG_DATE \n";
                QueryStr += "                  ,(CASE RTRIM(A.LUIS_INTENT) WHEN '' THEN 'NONE' \n";
                QueryStr += "                         ELSE ISNULL(A.LUIS_INTENT, 'NONE') END \n";
                QueryStr += "                  ) AS LUIS_INTENT \n";
                QueryStr += "                  ,(CASE RTRIM(A.LUIS_ENTITIES) WHEN '' THEN 'NONE' \n";
                QueryStr += "                         ELSE ISNULL(A.LUIS_ENTITIES, 'NONE') END \n";
                QueryStr += "                  ) AS LUIS_ENTITIES \n";
                QueryStr += "                  ,(CASE RTRIM(A.DLG_ID) WHEN '' THEN 'NONE' \n";
                QueryStr += "                         ELSE ISNULL(A.DLG_ID, 'NONE') END \n";
                QueryStr += "                  ) AS DLG_ID, A.SID, TBL_B.SAME_CNT \n";
                QueryStr += "             FROM TBL_HISTORY_QUERY A, \n";
                QueryStr += "                  ( \n";
                QueryStr += "			         SELECT REPLACE(CUSTOMER_COMMENT_KR, ' ', '') AS TRANS_COMMENT, COUNT(CUSTOMER_COMMENT_KR) AS SAME_CNT \n";
                QueryStr += "                  	   FROM TBL_HISTORY_QUERY\n";
                QueryStr += "        			  WHERE RTRIM(CUSTOMER_COMMENT_KR) != '' \n";
                QueryStr += "                  GROUP BY REPLACE(CUSTOMER_COMMENT_KR, ' ', '')\n";
                QueryStr += "                  ) TBL_B \n";
                QueryStr += "            WHERE RTRIM(CUSTOMER_COMMENT_KR) != '' \n";
                QueryStr += "              AND REPLACE(A.CUSTOMER_COMMENT_KR, ' ', '') = TBL_B.TRANS_COMMENT \n";
                QueryStr += "              AND TBL_B.TRANS_COMMENT LIKE @searchQuestion \n";
                if (selDate == 'today') {
                    QueryStr += "AND CONVERT(int, CONVERT(char(8), CONVERT(DATE,CONVERT(DATETIME,REG_DATE),120), 112)) = CONVERT(VARCHAR, GETDATE(), 112) \n";
                } else if (selDate == 'select') {
                    QueryStr += "AND CONVERT(date, @startDate) <= CONVERT(date, REG_DATE)  AND  CONVERT(date, REG_DATE)   <= CONVERT(date, @endDate) ";
                }
                if (selChannel !== 'all') {
                    QueryStr += "AND	CHANNEL = @selChannel \n";
                }
        
                /**중복행 제거 부분 주석 */
                //QueryStr += "              AND SID IN ( \n";
                //QueryStr += "                           SELECT MAX(SID) AS SID \n";
                //QueryStr += "                           FROM TBL_HISTORY_QUERY  \n";
                //QueryStr += "                           GROUP BY REPLACE(CUSTOMER_COMMENT_KR, ' ', '') \n";
                //QueryStr += "                         ) \n";
                QueryStr += "     ) tbx\n";
                QueryStr += "  WHERE PAGEIDX = @currentPage\n";
    
                let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
                let result1 = await pool.request()
                        .input('searchQuestion', sql.NVarChar, '%' + searchQuestion + '%')
                        .input('startDate', sql.NVarChar, startDate)
                        .input('endDate', sql.NVarChar, endDate)
                        .input('selChannel', sql.NVarChar, selChannel)
                        .input('currentPage', sql.NVarChar, currentPage)
                        .query(QueryStr);
    
                let rows = result1.recordset;
    
                if (rows.length > 0) {
                    res.send({ rows: rows, pageList: paging.pagination(currentPage, rows[0].TOTCNT), status : true });
                } else {
                    res.send({
                        rows : [],
                        status : true
                    });
                }
            } catch (err) {
                res.send({ rows: [], status : false});
                console.log(err)
                // ... error checks
            } finally {
                sql.close();
            }
        })()
    }
});


router.post('/selectHistoryDetail', function (req, res) {
    
    var sId = req.body.sId;

    (async () => {
        try {

            var QueryStr = "";
            QueryStr += "  SELECT tbx.* \n";
            QueryStr += "    FROM ( \n";
            QueryStr += "           SELECT ROW_NUMBER() OVER(ORDER BY A.SID DESC) AS NUM \n";
            QueryStr += "                  ,COUNT('1') OVER(PARTITION BY '1') AS TOTCNT \n";
            QueryStr += "                  ,CEILING((ROW_NUMBER() OVER(ORDER BY A.SID DESC))/ convert(numeric ,10)) PAGEIDX \n";
            QueryStr += "                  ,A.CUSTOMER_COMMENT_KR, A.CHATBOT_COMMENT_CODE, A.CHANNEL, A.RESPONSE_TIME, A.REG_DATE \n";
            QueryStr += "                  ,(CASE RTRIM(A.LUIS_INTENT) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(A.LUIS_INTENT, 'NONE') END \n";
            QueryStr += "                  ) AS LUIS_INTENT \n";
            QueryStr += "                  ,(CASE RTRIM(A.LUIS_ENTITIES) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(A.LUIS_ENTITIES, 'NONE') END \n";
            QueryStr += "                  ) AS LUIS_ENTITIES \n";
            QueryStr += "                  ,(CASE RTRIM(A.DLG_ID) WHEN '' THEN 'NONE' \n";
            QueryStr += "                         ELSE ISNULL(A.DLG_ID, 'NONE') END \n";
            QueryStr += "                  ) AS DLG_ID, A.SID \n";
            QueryStr += "             FROM TBL_HISTORY_QUERY A, \n";
            QueryStr += "                  ( \n";
            QueryStr += "			         SELECT REPLACE(CUSTOMER_COMMENT_KR, ' ', '') AS TRANS_COMMENT \n";
            QueryStr += "                  	   FROM TBL_HISTORY_QUERY\n";
            QueryStr += "        			  WHERE RTRIM(CUSTOMER_COMMENT_KR) != '' \n";
            QueryStr += "        			    AND SID = @sId \n";
            QueryStr += "                  GROUP BY REPLACE(CUSTOMER_COMMENT_KR, ' ', '')\n";
            QueryStr += "                  ) TBL_B \n";
            QueryStr += "            WHERE RTRIM(CUSTOMER_COMMENT_KR) != '' \n";
            QueryStr += "              AND REPLACE(A.CUSTOMER_COMMENT_KR, ' ', '') = TBL_B.TRANS_COMMENT \n";
            QueryStr += "     ) tbx\n";

            let pool = await dbConnect.getAppConnection(sql, req.session.appName, req.session.dbValue);
            let result1 = await pool.request()
                    .input('sId', sql.NVarChar, sId)
                    .query(QueryStr);

            let rows = result1.recordset;

            if (rows.length > 0) {
                res.send({ rows: rows, status : true });
            } else {
                res.send({
                    rows : [], 
                    status : true 
                });
            }
        } catch (err) {
            res.send({ rows: [], status : false});
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


function is_number(v) {
    var reg = /^(\s|\d)+$/;
    return reg.test(v);
}

//검색 필터 체크
function chkBoardParams(bodyReq, channelList) {
    var startDate = bodyReq.startDate;
    var endDate = bodyReq.endDate;
    var selDate = bodyReq.selDate;
    var selChannel = bodyReq.selChannel;

    var dataIsOk = false;
    //var chkDate = "SELECT CONVERT(date, '" + startDate + "') AS CHK1, CONVERT(date, '" + endDate + "') AS CHK2";
    try {
        if (selDate == 'select') {
            var dateArr = startDate.split('/');
            if (dateArr.length != 3) {
                dataIsOk = true;
            } else {
                for (var i=0; i<3; i++) {
                    if (!is_number(dateArr[i]*1)) {
                        dataIsOk = true;
                        break;
                    }
                }
            }

            dateArr = endDate.split('/');
            if (dateArr.length != 3) {
                dataIsOk = true;
            } else {
                for (var i=0; i<3; i++) {
                    if (!is_number(dateArr[i]*1)) {
                        dataIsOk = true;
                        break;
                    }
                }
            }
        }

        if (typeof startDate == 'undefined') {
            dataIsOk = true;
        } else if (startDate.trim() == '') {
            dataIsOk = true;
        }
        if (typeof endDate == 'undefined') {
            dataIsOk = true;
        } else if (endDate.trim() == '') {
            dataIsOk = true;
        }
        if (typeof selDate == 'undefined') {
            dataIsOk = true;
        } else {
            var chkSelDate = false;
            if (selDate.trim() == '') {
                chkSelDate = true;
            }
            if (selDate.trim() == 'allDay') {
                chkSelDate = true;
            }
            if (selDate.trim() == 'today') {
                chkSelDate = true;
            }

            if (selDate.trim() == 'select') {
                chkSelDate = true;
            }

            if (!chkSelDate) {
                dataIsOk = true;
            }
        }
        if (typeof selChannel == 'undefined') {
            dataIsOk = true;
        } else if (selChannel.trim() == '') {
            dataIsOk = true;
        } else {
            if (selChannel.trim() == 'all') {

            } else if (channelList.findIndex(x => x.CHANNEL === selChannel) == -1) {
                dataIsOk = true;
            }
        }
        return dataIsOk;
    }
    catch (err) {
        return false;
    }
}


module.exports = router;