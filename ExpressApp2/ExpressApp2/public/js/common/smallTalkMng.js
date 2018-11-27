//가장 먼저 실행.
var language;
;(function($) {
    $.ajax({
        url: '/jsLang',
        dataType: 'json',
        type: 'POST',
        success: function(data) {
            language= data.lang;
        }
    });
})(jQuery);

$(document).ready(function() {
    makeSmallTalkTable();    
});

$(document).ready(function() {
    //삭제 버튼 confirm
    $('#deleteSmallTalkBtnModal').click(function() {
        var del_count = $("#DELETE_ST_SEQ:checked").length;

        if(del_count > 0){
            $('#proc_content').html(language.SmallTalk_DELETE_CONFIRM);
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> '+ language.CLOSE +'</button><button type="button" class="btn btn-primary" id="deleteSmallTalkBtn"><i class="fa fa-edit"></i> '+ language.SmallTalk_Delete +'</button>');
            $('#procSmallTalk').modal('show');
        }else{
            $('#proc_content').html(language.SmallTalk_DELETE_COUNT);
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> '+ language.CLOSE +'</button>');
            $('#procSmallTalk').modal('show');
            //alert(language.SmallTalk_CANCEL_COUNT);
        }
    });

    //삭제 버튼
    $(document).on("click", "#deleteSmallTalkBtn", function () {
        //cancelSmallTalkProc('DEL');
        smallTalkProc('DEL');
    });

    $('#addSmallTalk').click(function() {
        var answerCnt = $("input[id='s_answer_array']").length;
        var answerData = "";
        for(var i=0; i<answerCnt - 1; i++){
            answerData = answerData + $("input[id='s_answer_array']")[i].value;
            if(i == answerCnt - 2){
                answerData = answerData;
            }else{
                answerData = answerData + "^";
            }
        }
        $('#s_answer').val(answerData);
        smallTalkProc('ADD');
    });

    $('#searchDlgBtn').click(function (e) {
        makeSmallTalkTable(1);
    });

    $('#createSmallTalkBtn').click(function (e) {
        $("#smallTalkForm")[0].reset();
        //window.location.reload();
        $('#smallTalkMngModal').modal('show');
    });

    $(".add-more").click(function(){ 
        var html = $(".copy").html();
        $(".after-add-more").after(html);
    });


    $("body").on("click",".answer-remove",function(){ 
        $(this).parents(".control-group").remove();
    });

    // question 입력
    $('input[name=s_query]').keypress(function (e) {

        if (e.keyCode == 13) {	//	Enter Key
            $('input[name=s_query]').attr('readonly', true);
            var queryText = $(this).val();
            if (queryText.trim() == "" || queryText.trim() == null) {
                $('input[name=s_query]').attr('readonly', false);
                return false;
            }
            getEntityFromQ(queryText);
            
            $("input[name=s_query]").attr("readonly", false);
        }
    });
});

//Banned Word List 테이블 페이지 버튼 클릭
$(document).on('click', '#smallTalkTablePaging .li_paging', function (e) {
    if (!$(this).hasClass('active')) {
        makeSmallTalkTable($(this).text());
    }
});

var searchQuestiontText = ""; //페이징시 필요한 검색어 담아두는 변수
var searchIntentText = ""; //페이징시 필요한 검색어 담아두는 변수
function makeSmallTalkTable(page) {
    if (page) {
        //$('#currentPage').val(1);
        searchQuestiontText = $('#searchQuestion').val();
        searchIntentText = $('#searchIntent').val();
    }

    params = {
        //'currentPage': ($('#currentPage').val() == '') ? 1 : $('#currentPage').val(),
        'currentPage': ($('#currentPage').val() == '') ? 1 : page,
        'searchQuestiontText': searchQuestiontText,
        'searchIntentText': searchIntentText
    };

    $.ajax({
        type: 'POST',
        data: params,
        url: '/smallTalkMng/selectSmallTalkList',
        success: function (data) {

            if (data.rows) {

                var tableHtml = "";
                var answerText = "";
                for (var i = 0; i < data.rows.length; i++) {
                    answerText = data.rows[i].S_ANSWER;
                    //answerText = answerText.replace(/^/gi,'</br>');
                    answerText = answerText.split("^").join("</br>");
                    tableHtml += '<tr style="cursor:pointer" name="userTr"><td>' + data.rows[i].NUM + '</td>';
                    tableHtml += '<td><input type="checkbox" class="flat-red" name="DELETE_ST_SEQ" id="DELETE_ST_SEQ" value="'+ data.rows[i].SEQ+'"></td>';
                    tableHtml += '<td>' + data.rows[i].ENTITY + '</td>';
                    tableHtml += '<td class="txt_left tex01">' + data.rows[i].S_QUERY + '</td>';
                    tableHtml += '<td class="txt_left">' + answerText + '</td>';
                    tableHtml += '</tr>';
                }

                saveTableHtml = tableHtml;
                $('#smallTalktbody').html(tableHtml);

                iCheckBoxTrans();

                //사용자의 appList 출력
                $('#smallTalktbody').find('tr').eq(0).children().eq(0).trigger('click');

                $('#smallTalkTablePaging .pagination').html('').append(data.pageList);

            } else {
                saveTableHtml = '<tr><td colspan="5" class="text-center">'+language.NO_DATA+'</td></tr>';
                $('#smallTalktbody').html(saveTableHtml);
            }

        }
    });
}

function smallTalkProc(procType) {
    var saveArr = new Array();
    var data = new Object();

    var testArr = new Array();

    if(procType=="ADD"){
        data.statusFlag = procType;
        data.S_QUERY = $('#s_query').val();
        //data.INTENT = $('#INTENT').val();
        data.INTENT = "smalltalk";
        data.S_ANSWER = $('#s_answer').val();
        data.ENTITY = $('#s_entity').val();
        saveArr.push(data);
    }else if(procType=="DEL"){
        //data.statusFlag = procType;
        
        $("input[name=DELETE_ST_SEQ]:checked").each(function() {
            data = new Object();
            data.statusFlag = procType;
            data.DELETE_ST_SEQ = "";
            var test = $(this).val();
            data.DELETE_ST_SEQ = test;
            
            saveArr.push(data);
        });
       
    }else{

    }
    
 
    var jsonData = JSON.stringify(saveArr);
    var params = {
        'saveArr': jsonData
    };
    $.ajax({
        type: 'POST',
        datatype: "JSON",
        data: params,
        url: '/smallTalkMng/smallTalkProc',
        success: function (data) {
            if (data.status === 200) {
                //alert(language['REGIST_SUCC']);
                $('#proc_content').html(language.REGIST_SUCC);
                $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal" onClick="reloadPage();"><i class="fa fa-times"></i> Close</button>');
                $('#procSmallTalk').modal('show');
                //window.location.reload();
            } else {
                //alert(language['It_failed']);
                $('#proc_content').html(language.It_failed);
                $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal" onClick="reloadPage();"><i class="fa fa-times"></i> Close</button>');
                $('#procSmallTalk').modal('show');
            }
        }
    });
}
function reloadPage(){
    window.location.reload();
}

function getEntityFromQ(queryText) {
    
    $.ajax({
        url: '/smallTalkMng/getEntityAjax',                //주소
        dataType: 'json',                  //데이터 형식
        type: 'POST',                      //전송 타입
        data: { 'iptUtterance': queryText },

        success: function (result) {          //성공했을 때 함수 인자 값으로 결과 값 나옴
            var entities = result['entities'];
            //for (var k = 0; k < queryTextArr.length; k++) {
                if (entities[0] != null) {
                    entities[0] = entities[0].split(",");
                } else {
                    entities[0] = [];
                }

                if (result['result'] == true) {
                    var utter = utterHighlight(result.commonEntities[0], queryText);

                    $('input[name="s_query"').val(queryText);
                    $('input[name="s_query"').attr("disabled", true);
                    var inputUttrHtml = '';
                    inputUttrHtml += '<table><tr>';
                    inputUttrHtml += '<td class="txt_left clickUtter">' + utter + '</td>';
                    inputUttrHtml += '<td><a href="#"><span class="fa  fa-trash utterDelete"><span class="hc">삭제</span></span></a></td>';
                    inputUttrHtml += '</tr></table>';

                    $('#squeryEntity').html(inputUttrHtml);
                }
            //}
        } //function끝

    }); // ------      ajax 끝-----------------
}

function utterHighlight(entities, utter) {
    var result = utter;
    var entity_data = "";
    var entity_comm = ",";
    if (entities) {
        for (var i = 0; i < entities.length; i++) {
            result = result.replace(entities[i].ENTITY_VALUE, '<span class="highlight">' + entities[i].ENTITY_VALUE + '</span>');
            
            if(i < entities.length -1){
                
            }else{
                entity_comm = "";
            }
            entity_data = entity_data + entities[i].ENTITY_VALUE + entity_comm;
        }
        $('#s_entity').val(entity_data);
    }
    return result;
}

// Utterance 삭제
$(document).on('click', '.utterDelete', function () {

    $('input[name="s_query"').attr("disabled", false);
    $('#squeryEntity').html("Question Entity");
    $('#s_entity').val();
    $('input[name="s_query"').text("");

});

function iCheckBoxTrans() {
    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass   : 'iradio_minimal-blue'
    })
    //Red color scheme for iCheck
    $('input[type="checkbox"].minimal-red, input[type="radio"].minimal-red').iCheck({
        checkboxClass: 'icheckbox_minimal-red',
        radioClass   : 'iradio_minimal-red'
    })
    //Flat red color scheme for iCheck
    $('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass   : 'iradio_flat-green'
    })

    $('#check-all').iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass   : 'iradio_flat-green'
    }).on('ifChecked', function(event) {
        $('input[name=DELETE_ST_SEQ]').parent().iCheck('check');
        
    }).on('ifUnchecked', function() {
        $('input[name=DELETE_ST_SEQ]').parent().iCheck('uncheck');
        
    });
}