var language;
(function($) {
    $.ajax({
        url: '/jsLang',
        dataType: 'json',
        type: 'POST',
        success: function(data) {
            language= data.lang;
            getIntentList();
        }
    });
})(jQuery);

$(document).ready(function () {

    noAnswerQListAjax();
    $('.btn_delete').attr("disabled","disabled").css('background','url(../images/btn_delete_dis.png)')
    $('.span_delete').css('color','#465361c4');

    $('div[type=checkbox]').click(function(e) {
        checkBoxHandler(e);
    });

    $('#recommendPeriod').change(function(e){
        $('#currentPage').val('1');
        noAnswerQListAjax();
    });
})

function noAnswerQListAjax(){
 
    params = {
        'selectType' : $('#recommendPeriod').find('option:selected').val(),
        'currentPage' : ($('#currentPage').val()== '')? 1 : $('#currentPage').val(),
        'searchRecommendText' : $('input[name=searchRecommendText]').val()
    };

    $.ajax({
        type: 'POST',
        data: params,
        url: '/qna/selectNoAnswerQList',
        isloading: true,
        success: function(data) {
            $('#noAnswerContents').html('');
            var item = '';

            if(data.list.length > 0){
                for(var i = 0; i < data.list.length; i++){
                    item += '<tr>' +
                            '<td><input type="checkbox" class="flat-red" name="tableCheckBox"><input type="hidden" class="seq" value="'+data.list[i].SEQ+'"></td>' +
                            '<td class="txt_left">' +

                            '<a href="/learning/utterances?utterance='+data.list[i].QUERY + 
                                    '" class="dashLink" style="font-size:14px">';
                    var query = data.list[i].QUERY;
                    /*
                    var entities = data.list[i].ENTITIES.split(',');
                    if(entities.length > 0){
                        for(var j = 0; j < entities.length; j++){
                            query = query.split(entities[j]).join('<span class="highlight">'+entities[j]+'</span>');
                        }
                    }
                    */
                    item += query;
                    item += '</a>' +
                            '</td>' +
                            '<td>' +
                            data.list[i].UPD_DT +
                            '</td>' +
                            '</tr>';
                }
                
                $('#noAnswerContents').append(item);
            
                $('.pagination').html('').append(data.pageList)

                $('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
                    checkboxClass: 'icheckbox_flat-green',
                    radioClass   : 'iradio_flat-green'
                })
                    
                $('input[name=tableAllChk]').on('ifChecked', function(event) {
                    $('input[name=tableCheckBox]').parent().iCheck('check');
                        
                }).on('ifUnchecked', function() {
                        $('input[name=tableCheckBox]').parent().iCheck('uncheck');
                    });

                
    
                $('input[name=tableAllChk]').parent().iCheck('uncheck');
            } else {       

                item += '<tr>' +
                            '<td colspan="3">' + language.NO_DATA + '</td>' +
                        '</tr>';
                $('#noAnswerContents').append(item);
                
            }
            
            

            

            
        }
    });
}

//html append시 이벤트 핸들러 달아주기
$(document).on('click','div[type=checkbox]',function(e){
    var checkedVal = false;
    if (typeof $(this).attr("checked") == 'undefined') {
        $(this).attr("checked", "");
    } else {
        $(this).removeAttr('checked');
    }
    checkBoxHandler(e);
});

$(document).on('click','.li_paging',function(e){
 
    if(!$(this).hasClass('active')){
        $('#currentPage').val($(this).val());
        noAnswerQListAjax();
    }
});

//체크박스 click 이벤트 핸들러
function checkBoxHandler(e){

    var isAll = $(e.target).children('#recommendAll').length;
    var isChecked = $(e.target).attr('checked');

    if(isAll == 1 && isChecked == 'checked'){
        $('div[type=checkbox]').each(function(index,item){
            if(index > 0 && $(item).attr('checked') != 'checked'){
                $(item).click();
            }
        });
    }else if(isAll == 1 && isChecked != 'checked'){
        $('div[type=checkbox]').each(function(index,item){
            if($(item).attr('checked') == 'checked'){
                $(item).click();
            }
        });
    }
    var checkCount = $('div[type=checkbox][checked]').length;
    if(checkCount > 0){
        $('.btn_delete').removeAttr("disabled").css('background','url(../images/btn_delete.png)')
        $('.span_delete').css('color','#2873ca');
    }else{
        $('.btn_delete').attr("disabled","disabled").css('background','url(../images/btn_delete_dis.png)')
        $('.span_delete').css('color','#465361c4');
    }
    
    if($('#recommendAll').parents('div[type=checkbox]').attr('checked') == 'checked' && checkCount == 1){
        $('#recommendAll').parents('div[type=checkbox]').click();
    }
}

//delete 버튼 클릭 이벤트 //deleteRecommend
function deleteNoAnswerQ(){
    if ( confirm( language.ASK_DELETE)) {
        var arry = [];
        for(var i = 0; i < $('#noAnswerContents .checked').length; i++)
        {
            arry.push($('#noAnswerContents .checked + .seq')[i].value);
        }
        $.ajax({
                type: 'POST',
                data : {'seq' : arry+''},
                url : '/learning/deleteNoAnswerQ',
                isloading : true,
                success: function(data){
                    alert("삭제되었습니다.");
                    $('#currentPage').val(1)
                    noAnswerQListAjax();
                }
            });
    }
}

// 학습추천 검색 recommendSearch
function noAnswerQSearch() {

    var searchRecommendText = $('input[name=searchRecommendText]').val();

    if(!searchRecommendText) {
        alert("검색어를 입력해주시기 바랍니다.");
    } else {
        noAnswerQListAjax();
    }
}



//delete 버튼 클릭 이벤트 //deleteRecommend
function deleteNoAnswerQ(){
    if ( confirm( language.ASK_DELETE)) {
        var arry = [];
        for(var i = 0; i < $('#noAnswerContents .checked').length; i++)
        {
            arry.push($('#noAnswerContents .checked + .seq')[i].value);
        }
        $.ajax({
                type: 'POST',
                data : {'seq' : arry+''},
                url : '/learning/deleteNoAnswerQ',
                isloading : true,
                success: function(data){
                    alert("삭제되었습니다.");
                    $('#currentPage').val(1)
                    noAnswerQListAjax();
                }
            });
    }
}

function getIntentList() {
    $.ajax({
        type: 'POST',
        url : '/qna/selectIntentApp',
        isloading : true,
        success: function(data){
            if (data.result) {
                var htmlStr = '';
                var intentList = data.intentList;
                for (var i=0; i<intentList.length; i++) {
                    if (i==0) {
                        htmlStr += "<option value='appName'>" + language.SELECT + "</option>";
                    } else {
                        htmlStr += "<option value='appName'>" + intentList[i].INTENT + "</option>";
                    }
                }
                $('#intentListSelect').html(htmlStr);
            }
            
        }
    });
}