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
    $('#cancelSmallTalkBtnModal').click(function() {
        var del_count = $("#CANCEL_ST_SEQ:checked").length;
         
        if(del_count > 0){
            $('#cancel_content').html(language.SmallTalk_CANCEL_CONFIRM);
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> '+ language.CLOSE +'</button><button type="button" class="btn btn-primary" id="cancelSmallTalkBtn"><i class="fa fa-edit"></i> '+ language.SmallTalk_Cancel +'</button>');
        }else{
            $('#cancel_content').html(language.SmallTalk_CANCEL_COUNT);
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> '+ language.CLOSE +'</button>');
        }
        $('#cancelSmallTalkModal').modal('show');
    });

    //삭제 버튼
    $(document).on("click", "#cancelSmallTalkBtn", function () {
        cancelSmallTalkProc('DEL');
    });

    $('#addSmallTalk').click(function() {
        var answerCnt = $("input[id='s_answer_array']").length;
        var answerArrayData = new Array(answerCnt);
        var answerData = "";
        for(var i=0; i<answerCnt; i++){
            answerData = answerData + $("input[id='s_answer_array']")[i].value;
            if(i == answerCnt - 1){
                answerData = answerData;
            }else{
                answerData = answerData + "&**&";
            }
        }
        //alert("answerData==="+answerData);
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
                for (var i = 0; i < data.rows.length; i++) {
                    tableHtml += '<tr style="cursor:pointer" name="userTr"><td>' + data.rows[i].NUM + '</td>';
                    tableHtml += '<td><input type="checkbox" class="flat-red" name="CANCEL_ST_SEQ" id="CANCEL_ST_SEQ" value="'+ data.rows[i].SEQ+'"></td>';
                    tableHtml += '<td>' + data.rows[i].INTENT + '</td>';
                    tableHtml += '<td class="txt_left tex01"><a href="#">' + data.rows[i].S_QUERY + '</a></td>';
                    tableHtml += '<td>' + data.rows[i].S_ANSWER + '</td>';
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
    data.statusFlag = procType;
    data.S_QUERY = $('#s_query').val();
    data.INTENT = $('#INTENT').val();
    data.S_ANSWER = $('#s_answer').val();
    saveArr.push(data);
 
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
                $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
                $('#procSmallTalk').modal('show');
                window.location.reload();
            } else {
                //alert(language['It_failed']);
                $('#proc_content').html(language.It_failed);
                $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
                $('#procSmallTalk').modal('show');
            }
        }
    });
}

function cancelSmallTalkProc(procType) {
    var saveArr = new Array();
    var data = new Object();
    data.statusFlag = procType;
    //data.DEL_SEQ = $('#DEL_SEQ').val();
    $("input[name=CANCEL_ST_SEQ]:checked").each(function() {
        var test = $(this).val();
        console.log(test);
        data.CANCEL_ST_SEQ = test;
    });
    saveArr.push(data);
 
    var jsonData = JSON.stringify(saveArr);
    var params = {
        'saveArr': jsonData
    };
    $.ajax({
        type: 'POST',
        datatype: "JSON",
        data: params,
        url: '/smallTalkMng/cancelSmallTalkProc',
        success: function (data) {
            if (data.status === 200) {
                alert(language['REGIST_SUCC']);
                window.location.reload();
            } else {
                alert(language['It_failed']);
            }
        }
    });
}

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
        $('input[name=CANCEL_ST_SEQ]').parent().iCheck('check');
        
    }).on('ifUnchecked', function() {
        $('input[name=CANCEL_ST_SEQ]').parent().iCheck('uncheck');
        
    });
}