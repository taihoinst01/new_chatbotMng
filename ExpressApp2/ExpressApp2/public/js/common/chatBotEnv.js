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
    selectChatBotEnv();
});

$(document).ready(function() {
    //수정
    $(document).on("click", "#updateChatBotEnvBtn", function() {
        var TimeLimit = $('#luisTimeLimit').val();
        var ScoreLimit = $("#luisScoreLimit option:selected").val();
        
        var validation_check = 0;
        if(TimeLimit==""||TimeLimit==null){
            validation_check = validation_check + 0;
        }else{
            validation_check = validation_check + 1;
        }

        if(ScoreLimit==""||ScoreLimit==null){
            validation_check = validation_check + 0;
        }else{
            validation_check = validation_check + 1;
        }

        if(validation_check==2){
            procChatBotEnv('UPDATE');
        }else{
            $('#proc_content').html('필수사항에 데이터가 없습니다');
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
            $('#chatBotEnvModal').modal('show');
            return;
        }     

       
    });
});




function selectChatBotEnv(){
    $("#loadingModal").modal('show');
    var chatbotName_ = $('#chatbotName').val();
    var params = {
        'chatbotName' : chatbotName_,
        'rows': $('td[dir=ltr]').find('select').val()
    };

    $.ajax({
        type: 'POST',
        data: params,
        url: '/chatBotEnv/selectChatbotEnv',
        success: function (data) {
            $("#loadingModal").modal('hide');
            if (data.rows) {
                $('#dbId').text(data.rows[0].USER_NAME);
                $('#dbPassword').text(data.rows[0].PASSWORD);
                $('#dbServer').text(data.rows[0].SERVER);
                $('#dbName').text(data.rows[0].DATABASE_NAME);

                $('#luisTimeLimit').val(data.rows[1].LUIS_TIME_LIMIT);
                //$('#luisScoreLimit').val(data.rows[1].LUIS_SCORE_LIMIT);
                $("#luisScoreLimit").val(data.rows[1].LUIS_SCORE_LIMIT).attr("selected", "selected");
            } else {
                $('#dbId').text("");
            }

        }
    });
}

function procChatBotEnv(procType) {
    var saveArr = new Array();

    if (procType === 'UPDATE') {

        var data = new Object();
        data.statusFlag = procType;
        data.LUIS_TIME_LIMIT = $('#luisTimeLimit').val();
        data.LUIS_SCORE_LIMIT = $('#luisScoreLimit').val();
        saveArr.push(data);
    } else if (procType === 'DEL') {
        
    }

    var jsonData = JSON.stringify(saveArr);
    var params = {
        'saveArr': jsonData
    };
    $.ajax({
        type: 'POST',
        datatype: "JSON",
        data: params,
        url: '/chatBotEnv/procChatBotEnv',
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