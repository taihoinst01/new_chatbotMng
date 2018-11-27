'use strict';

var express = require('express');

var sql = require('mssql');
var dbConfig = require('../../config/dbConfig');
var dbConnect = require('../../config/dbConnect');

const appDbConnect = require('../../config/appDbConnect');

var router = express.Router();

//log start
var Logger = require("../../config/logConfig");
var logger = Logger.CreateLogger();
//log end


router.get('/getChatSentence', function (req, res) {

    if (req.query.chat_res_code == '976431') {
        (async () => {
            try {
                let pool = await dbConnect.getConnection(sql);
                
                
                var selectQry = "SELECT USER_ID \n"
                selectQry += "          ,EMP_NM \n";
                selectQry += "     FROM TB_USER_M; \n";


                let getSentence = await pool.request().query(selectQry);
                let similarSentence = getSentence.recordset;

                var content = new Object();
                var contentList = [];
                for (var i=0; i<similarSentence.length; i++) {
                    contentList.push(similarSentence[i].USER_ID);
                }
                
                content['statusCode'] = 200;
                content['content'] = contentList;
                return res.json(content);
            }
            catch(e) {
                
                logger.info('[에러]자동완성 api 응답 에러  [url : %s] [내용 : %s]', 'apiServer/getChatSentence',  e.message);
                var apiFail = [
                    {
                        statusCode : 500
                    }
                ]
                return res.json(apiFail);
            }
        })();
    } else {
        var apiFail = [
            {
                statusCode : 401
            }
        ]
        return res.json(apiFail);
    }

});



router.get('/getChatTemplate', function (req, res) {

    if (req.query.chat_name) {
        (async () => {
            try {
                let pool = await dbConnect.getConnection(sql);
                
                var selectQry = "SELECT HEADER_COLOR \n"
                selectQry += "          ,BODY_COLOR \n";
                selectQry += "          ,POPHEADER_COLOR \n";
                selectQry += "          ,BOT_COLOR \n";
                selectQry += "          ,USER_COLOR \n";
                selectQry += "          ,ICON_IMG \n";
                selectQry += "          ,BACKGROUND_IMG \n";
                selectQry += "          ,CHATBOT_NAME \n";
                selectQry += "     FROM TBL_CHATBOT_TEMPLATE \n";
                selectQry += "    WHERE USE_YN = 'Y' \n";
                selectQry += "      AND CHATBOT_NAME = @chatName \n";


                let getSentence = await pool.request()
                        .input('chatName', sql.NVarChar, req.query.chat_name)
                        .query(selectQry);
                let templateResult = getSentence.recordset;

                var content = new Object();
                var contentList = [];

                if (templateResult.length == 0) {
                    content['statusCode'] = 200;
                    content['message'] = "Chatbot does not exist."
                    content['content'] = contentList;
                    return res.json(content);
                } else {
                    for (var i=0; i<templateResult.length; i++) {
                        contentList.push(templateResult[i]);
                        break;
                    }
                    
                    content['statusCode'] = 200;
                    content['content'] = contentList;
                    return res.json(content);
                }
            }
            catch(e) {
                
                logger.info('[에러]챗봇 템플릿 응답 에러  [url : %s] [내용 : %s]', 'apiServer/getChatTemplate',  e.message);
                var apiFail = [
                    {
                        statusCode : 500
                    }
                ]
                return res.json(apiFail);
            }
        })();
    } else {
        var apiFail = [
            {
                statusCode : 403,
                message : "missing parameter"
            }
        ]
        return res.json(apiFail);
    }

});


//test test 11-27

var QryConfig = {
    getMsQry:
        `( SELECT B.MS + (B.Seconds * 1000) + (B.Minutes * 60 * 1000) + (B.Hours * 60 * 60 * 1000) AS RST 
             FROM (
                   SELECT   
                         --*,  
                         --Days = datediff(dd,0,DateDif),  
                         Hours = datepart(hour,DateDif),  
                         Minutes = datepart(minute,DateDif),  
                         Seconds = datepart(second,DateDif), 
                         MS = datepart(ms,DateDif) 
                    FROM ( 
                          SELECT 
                                DateDif = EndDate-StartDate,  
                                aa.*  
                            FROM ( 
                                  SELECT 
                                         StartDate = convert(datetime, aaa.REG_DATE), 
                                         EndDate   = convert(datetime, SWITCHOFFSET(getDate(), '+09:00')) 
                                    FROM  ( 
                                            SELECT TOP 1 SID, REG_DATE 
                                              FROM TBL_HISTORY_QUERY 
                                             WHERE USER_NUMBER = @userConvNum1 
                                             ORDER BY REG_DATE 
                                          ) aaa 
                                 ) aa  
                         ) a 
                  ) B ) `,
    preQry:
        `UPDATE TBL_HISTORY_QUERY SET RESPONSE_TIME =  `,
    suffQry:
        ` WHERE SID = (SELECT TOP 1 SID 
            FROM TBL_HISTORY_QUERY 
            WHERE USER_NUMBER =  @userConvNum2 
            ORDER BY REG_DATE) `
};

router.get('/updateLatestDate', function (req, res) {

    if (req.query.chat_res_code == '976431') {
        (async () => {
            try {
                //let pool = await dbConnect.getConnection(sql);
                var userConvNum = req.query.userConvNum;
                var totalQry = QryConfig.preQry + QryConfig.getMsQry + QryConfig.suffQry;
                /*
                let getSentence = await pool.request()
                            .input('userConvNum1', sql.NVarChar, userConvNum)
                            .input('userConvNum2', sql.NVarChar, userConvNum)
                            .query(totalQry);
                let similarSentence = getSentence.recordset;
                */
                logger.info('[테스트]응답시간 api 테스트 성공  [url : %s] [내용 : %s]', 'api/updateLatestDate', 'conversation 아이디 : ' + userConvNum);
                var content = new Object();
                content['statusCode'] = 200;
                return res.json(content);
            }
            catch(e) {
                
                logger.info('[에러]응답시간 api 에러  [url : %s] [내용 : %s]', 'api/updateLatestDate',  e.message);
                var apiFail = [
                    {
                        statusCode : 500
                    }
                ]
                return res.json(apiFail);
            }
        })();
    } else {
        var apiFail = [
            {
                statusCode : 401
            }
        ]
        return res.json(apiFail);
    }

});








module.exports = router;
