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
                    
                    tableHtml += '<tr style="cursor:pointer" name="userTr"><td>' + data.rows[i].NUM + '</td>';
                    tableHtml += '<td>' + data.rows[i].TOP_COLOR + '</td>'
                    tableHtml += '<td>' + data.rows[i].BACKGROUND_COLOR + '</td>'
                    tableHtml += '<td>' + data.rows[i].ICON_IMG + '</td>'
                    tableHtml += '<td>' + data.rows[i].BACKGROUND_IMG + '</td>'
                    tableHtml += '<td>DELETE</td>'
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

function procTemplate(procType) {
    var saveArr = new Array();

    if (procType === 'NEW') {

        var data = new Object();
        data.statusFlag = procType;
        data.TOP_COLOR = $('#top_color').val();
        data.BACKGROUND_COLOR = $('#background_color').val();
        data.ICON_IMG = $('#icon_img').val();
        data.BACKGROUND_IMG = $('#background_img').val();
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
                alert(language['REGIST_SUCC']);
                window.location.reload();
            } else {
                alert(language['It_failed']);
            }
        }
    });
}