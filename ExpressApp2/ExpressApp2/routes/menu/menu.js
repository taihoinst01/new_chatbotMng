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

router.get('/menuMng', function (req, res) {
    //logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'router 시작');
    res.render('menuMng/menuMng');
});

router.post('/procMenu', function (req, res) {
    logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'router 시작');
    var menuArr = JSON.parse(req.body.saveArr);
    var saveStr = "";
    var updateStr = "";
    var deleteStr = "";
    var userId = req.session.sid;

    for (var i = 0; i < menuArr.length; i++) {
        if (menuArr[i].statusFlag === 'NEW') {
            saveStr += "INSERT INTO TB_MENU_AUTH (MENU_ID, MENU_NM, MENU_URL, MENU_AUTH, REG_ID, REG_DT) " +
                "VALUES ( ";
            saveStr += " '" + menuArr[i].MENU_ID + "', '" + menuArr[i].MENU_NM + "', '" + menuArr[i].MENU_URL + "', ";
            saveStr += " '" + menuArr[i].MENU_AUTH + "', '" + userId + "', GETDATE()); ";
        } else if (menuArr[i].statusFlag === 'UPDATE') {
            updateStr += "UPDATE TB_MENU_AUTH SET ";
            updateStr += "MENU_NM = '" + menuArr[i].MENU_NM + "', MENU_URL = '" + menuArr[i].MENU_URL + "', ";
            updateStr += "MENU_AUTH = '" + menuArr[i].MENU_AUTH + "', ";
            updateStr += "MOD_ID = '" + userId + "', MOD_DT = GETDATE() ";
            updateStr += "WHERE MENU_ID = '" + menuArr[i].MENU_ID + "'; ";
        } else { //DEL
            deleteStr += "DELETE FROM TB_MENU_AUTH WHERE MENU_ID = '" + menuArr[i].MENU_ID + "'; ";
        }
    }

    (async () => {
        try {
            let pool = await dbConnect.getConnection(sql);
            if (saveStr !== "") {
                logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'TB_MENU_AUTH 테이블 추가'); 
                let insertMenu = await pool.request().query(saveStr);
            }
            if (updateStr !== "") {
                logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'TB_MENU_AUTH 테이블 수정');
                let updateMenu = await pool.request().query(updateStr);
            }
            if (deleteStr !== "") {
                logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'TB_MENU_AUTH 테이블 제거');
                let deleteMenu = await pool.request().query(deleteStr);
            }

            res.send({ status: 200, message: 'Save Success' });

        } catch (err) {
            logger.info('[에러] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, err.message);
        
            res.send({ status: 500, message: 'Save Error' });
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
});

router.post('/selectMenuList', function (req, res) {
    logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'router 시작');

    (async () => {
        try {

            //var QueryStr = "SELECT MENU_ID, MENU_NM, MENU_URL, MENU_AUTH, REG_ID, REG_DT, MOD_ID, MOD_DT FROM TB_MENU_AUTH";
            var QueryStr = `
            SELECT MENU_ID, MENU_NM, MENU_URL, MENU_AUTH, A.REG_ID, A.REG_DT, A.MOD_ID, A.MOD_DT, AUTHGRP_M_NM 
              FROM TB_MENU_AUTH A 
            INNER JOIN TB_AUTHGRP_M ON MENU_AUTH = AUTH_LEVEL;
            `

            //logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'TB_MENU_AUTH 테이블 조회');
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
                res.send({
                    records: recordList.length,
                    rows: recordList
                });

            } else {
                res.send({
                    records: 0,
                    rows: null
                });
            }
        } catch (err) {
            logger.info('[에러] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, err.message);
            // ... error checks
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
});

router.post('/checkMenuAuth', function (req, res) {
    //logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'router 시작');
    var menuArr = JSON.parse(req.body.saveArr);
    var checkStr = "";
    var MENU_AUTH = "0";

    for (var i = 0; i < menuArr.length; i++) {
        checkStr += "SELECT MENU_AUTH FROM TB_MENU_AUTH WHERE MENU_URL = '" + menuArr[i].MENU_URL + "'; ";
    }
    
    (async () => {
        try {
            //logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'TB_MENU_AUTH 테이블 조회');
            let pool = await dbConnect.getConnection(sql);
            let result1 = await pool.request().query(checkStr);

            let rows = result1.recordset;
            if(rows.length==0){
                MENU_AUTH = parseInt("0");
            }else{
                MENU_AUTH = parseInt(rows[0].MENU_AUTH);
            }
           
            var USER_AUTH = parseInt(typeof req.session.sAuth=='undefined'?0:req.session.sAuth);
            
            if(USER_AUTH >= MENU_AUTH) {
                res.send({ status: 'PASS' });
            }else{
                res.send({ status: 'FAIL' });
            }
            

        } catch (err) {
            logger.info('[에러] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, err.message);
            res.send({ status: 'FAIL' });
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
        // ... error handler
    })
});

router.post('/selectMenuAuthList', function (req, res) {
    //logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'router 시작');

    (async () => {
        try {

            var QueryStr = "SELECT AUTHGRP_M_NM, AUTH_LEVEL FROM TB_AUTHGRP_M";


            //logger.info('[알림] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, 'TB_AUTHGRP_M 테이블 조회');
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
                res.send({
                    records: recordList.length,
                    rows: recordList
                });

            } else {
                res.send({
                    records: 0,
                    rows: null
                });
            }
        } catch (err) {
            logger.info('[에러] [id : %s] [url : %s] [내용 : %s] ', req.session.sid, req.originalUrl.indexOf("?")>0?req.originalUrl.split("?")[0]:req.originalUrl, err.message);
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