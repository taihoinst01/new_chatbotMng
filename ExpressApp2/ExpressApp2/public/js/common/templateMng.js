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
    makeTemplateTable();    
});

$(document).ready(function() {

    $(document).on("click", "#useTemplateeBtn", function () {
        procTemplate("UPDATE_USEYN");
    });

    //삭제 버튼 confirm
    $('#deleteTemplateBtnModal').click(function() {
        var del_count = $("#DEL_SEQ:checked").length;
         
        if(del_count > 0){
            $('#proc_content').html('정말로 삭제하시겠습니까? 복구할 수 없습니다.<br>모두 삭제하면 기본템플릿을 사용합니다.');
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button><button type="button" class="btn btn-primary" id="deleteTemplateBtn"><i class="fa fa-edit"></i> Delete</button>');
        }else{
            $('#proc_content').html('삭제할 대상은 한 개 이상이어야 합니다.');
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
        }
        $('#templateModal').modal('show');
    });

    //삭제 버튼
    $(document).on("click", "#deleteTemplateBtn", function () {
        procTemplate('DEL');
    });
});

$(document).on('click', '#templateTablePaging .li_paging', function (e) {
    if (!$(this).hasClass('active')) {
        makeTemplateTable($(this).text());
    }
});


function makeTemplateTable(newPage) {
    var chatbotName_ = $('#chatbotName').val();
    var saveTableHtml = "";
    var params = {
        'chatbotName' : chatbotName_,
        'currentPage': newPage,
        'rows': $('td[dir=ltr]').find('select').val()
    };

    $.ajax({
        type: 'POST',
        data: params,
        url: '/templateMng/selectTemplateList',
        success: function (data) {

            if (data.rows) {

                var tableHtml = "";
                for (var i = 0; i < data.rows.length; i++) {
                    
                    tableHtml += '<tr name="userTr"><td>' + data.rows[i].NUM + '</td>';
                    tableHtml += '<td><input type="checkbox" class="flat-red" name="DEL_SEQ" id="DEL_SEQ" value="'+ data.rows[i].SEQ+'"></td>';
                    tableHtml += '<td>' + data.rows[i].TOP_COLOR + '</td>'
                    tableHtml += '<td>' + data.rows[i].BACKGROUND_COLOR + '</td>'
                    tableHtml += '<td>' + data.rows[i].ICON_IMG + '</td>'
                    tableHtml += '<td>' + data.rows[i].BACKGROUND_IMG + '</td>'
                    tableHtml += '<td><a href="#" onClick="goChangeUseYn(\''+ data.rows[i].SEQ+'\')">' + data.rows[i].USE_YN + '</a></td>'
                    tableHtml += '<td><button type="button" class="btn btn-default btn-sm" id="preview_template" template_id="' + data.rows[i].SEQ + '"><i class="fa fa-edit"></i> 미리보기</button></td>';
                    tableHtml += '<tr>'
                }

                saveTableHtml = tableHtml;
                $('#templateTableBodyId').html(saveTableHtml);

                iCheckBoxTrans();

                //사용자의 appList 출력
                $('#templateTableBodyId').find('tr').eq(0).children().eq(0).trigger('click');

                $('#templateTablePaging .pagination').html('').append(data.pageList);

            } else {
                saveTableHtml = '<tr><td colspan="6" class="text-center">No Template Data</td></tr>';
                $('#templateTableBodyId').html(saveTableHtml);
            }

        }
    });
}

var ChangeSeq = "";
function goChangeUseYn(change_seq){
    ChangeSeq = change_seq;
    $('#proc_content').html('선택된 템플릿을 사용하시겠습니까?');
    $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button><button type="button" class="btn btn-primary" id="useTemplateeBtn"><i class="fa fa-edit"></i> Yes</button>');
    $('#templateModal').modal('show');
    
}

function procTemplate(procType) {
    var saveArr = new Array();

    if (procType === 'NEW') {

        var data = new Object();
        data.statusFlag = procType;
        data.TOP_COLOR = $('#top_color').val();
        data.BACKGROUND_COLOR = $('#background_color').val();
        data.ICON_IMG = $('#icon_img').val();
        data.BACKGROUND_IMG = $('#background_img').val();
        data.CHATBOT_NAME = $('#chatbotName').val();
        saveArr.push(data);
    } else if (procType === 'DEL') {
        var data = new Object();
        data.statusFlag = procType;
        //data.DEL_SEQ = $('#DEL_SEQ').val();
        $("input[name=DEL_SEQ]:checked").each(function() {
            var test = $(this).val();
            console.log(test);
            data.DEL_SEQ = test;
        });
        saveArr.push(data);
    } else if (procType === 'UPDATE_USEYN') {
        var data = new Object();
        data.statusFlag = procType;
        data.USEYN_SEQ = ChangeSeq;
        data.CHATBOT_NAME = $('#chatbotName').val();
        saveArr.push(data);
    }

    var jsonData = JSON.stringify(saveArr);
    var params = {
        'saveArr': jsonData
    };
    $.ajax({
        type: 'POST',
        datatype: "JSON",
        data: params,
        url: '/templateMng/procTemplate',
        success: function (data) {
            if (data.status === 200) {
                ChangeSeq = "";
                alert(language['REGIST_SUCC']);
                //$('#proc_content').html("요청사항이 진행되었습니다");
                //$('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
                //$('#templateModal').modal('show');
                window.location.reload();
            } else {
                ChangeSeq = "";
                //alert(language['It_failed']);
                $('#templateModal').modal('hide');
                $('#proc_content').html("요청사항이 실패되었습니다");
                $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
                $('#templateModal').modal('show');
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
        $('input[name=DEL_SEQ]').parent().iCheck('check');
        
    }).on('ifUnchecked', function() {
        $('input[name=DEL_SEQ]').parent().iCheck('uncheck');
        
    });
}