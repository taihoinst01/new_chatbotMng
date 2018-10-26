//가장 먼저 실행.
var simpleList = [];
var hierarchyList = [];
var compositeList = [];
var closedList = [];
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
    getEntityList();
})(jQuery);

$(document).ready(function() {
    makeQnaListTable();    
});

var del_similar_id;
$(document).ready(function() {
    //삭제 버튼 confirm
    //로직은 끝 부분에
    $(document).on("click", "#delete_similar", function () {
        del_similar_id = $(this).attr("del_similar_id");
        $('#deleteSimilarBtnModal').modal('show');
    });

    $('#searchDlgBtn').click(function (e) {
        makeQnaListTable(1);
    });

    //다이얼로그생성모달 버튼Add From
    $('#addDialogBtn').click(function (e) {
        //$(".insertForm:eq(0)").clone(true).appendTo(".copyForm");
        //$(".copyForm textarea[name=dialogText]:last").val('');

        var insertForm = '';
        insertForm += '<hr>';
        insertForm += '<div class="insertForm">';
        insertForm += '<div class="form-group" >';
        insertForm += '<form name="dialogLayout" id="dialogLayout">';

        insertForm += '<label>' + language.DIALOG_BOX_TYPE + '<span class="nec_ico">*</span></label>';
        insertForm += '<select class="form-control" name="dlgType">';
        insertForm += '<option value="2">' + language.TEXT_TYPE + '</option>';
        insertForm += '<option value="3">' + language.CARD_TYPE + '</option>';
        insertForm += '<option value="4">' + language.MEDIA_TYPE + '</option>';
        insertForm += '</select>';
        insertForm += '<div class="clear-both"></div>';

        insertForm += '<div class="textLayout" style="display: block;">';
        insertForm += '<div class="btn_wrap" style="clear:both">';
        insertForm += '</div>'
        insertForm += '<div class="form-group">';
        insertForm += '<label>' + language.DIALOG_BOX_TITLE + '</label>';
        insertForm += '<input type="text" name="dialogTitle" class="form-control" onkeyup="writeDialogTitle(this);" placeholder=" ' + language.Please_enter + '">';
        insertForm += '</div>';
        insertForm += '<div class="form-group">';
        insertForm += '<label>' + language.DIALOG_BOX_CONTENTS + '<span class="nec_ico">*</span></label>';
        insertForm += '<input type="text" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder=" ' + language.Please_enter + ' ">';
        insertForm += '</div>';
        insertForm += '</div>';
        insertForm += '<div class="btn_wrap deleteInsertFormDiv" style="clear:both;" >';
        insertForm += '<button type="button" class="btn btn-default deleteInsertForm"><i class="fa fa-trash"></i> ' + language.DELETE_DIALOG + '</button>';
        insertForm += '</div>';
        insertForm += '</form>';
        insertForm += '</div>';
        insertForm += '</div>';

        $(".insertForm:last").after(insertForm);
        //$(".insertFormWrap").append(insertForm);
        var dialogView = '';
        dialogView += '<div class="dialogView" >';
        dialogView += '<div class="wc-message wc-message-from-bot" style="width:80%;">';
        dialogView += '<div class="wc-message-content">';
        dialogView += '<svg class="wc-message-callout"></svg>';
        dialogView += '<div>';
        dialogView += '<div class="format-markdown">';
        dialogView += '<div class="textMent">';
        dialogView += '<h1 class="textTitle">' + language.Please_enter_a_title + '</h1>';
        dialogView += '<p>' + language.Please_enter_your_content + '</p>';
        dialogView += '</div>';
        dialogView += '</div>';
        dialogView += '</div>';
        dialogView += '</div>';

        $('#dialogViewWrap').append(dialogView);
        e.stopPropagation();
        e.preventDefault();

    });


    //다이얼로그생성모달 - 미디어버튼추가
    $(document).on('click', '.addMediaBtn', function (e) {

        var inputHtml = '<label>' + language.BUTTON + '</label></div>' +
            '<div class="form-group col-md-13"  style="padding-left:0; margin-top: 0px;">' +
            '<table class="mediaCopyTbl" style="width:100%"><col width="21%">' +
            '<col width="1%"><col width="35%"><col width="1%"><col width="35%"><col width="1%"><col width="6%">' +
            '<thead><tr><th>' + language.Type + '</th><th></th>' +
            '<th>' + language.NAME + '</th><th></th><th>' + language.CONTENTS + '</th>' +
            '<th></th><th></th></tr></thead><tbody>' +
            '<tr><td>' +
            '<select class="form-control" name="btnType">' +
            '<option value="imBack" selected>imBack</option>' +
            '<option value="openURL">openURL</option>' +
            '</select>' +
            '</td><td></td>' +
            '<td><input type="text" name="mButtonName" class="form-control" placeholder="' + language.Please_enter + '">' +
            '</td><td></td><td>' +
            '<input type="text" name="mButtonContent" class="form-control" placeholder="' + language.Please_enter + '">' +
            '</td><td></td><td>' +
            '<a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a>' +
            '</td></tr></tbody></table></div></div></div>';

        $btnInsertDiv = $(this).parent().prev();
        if ($btnInsertDiv.children().length == 0) {
            $btnInsertDiv.html(inputHtml);
            return;
        }
        var trLength = $btnInsertDiv.find('tbody tr').length;
        if (trLength >= 1 && trLength < 4) {

            var inputTrHtml = '<tr>' +
                '<td>' +
                '<select class="form-control" name="btnType">' +
                '<option value="imBack" selected>imBack</option>' +
                '<option value="openURL">openURL</option>' +
                '</select>' +
                '</td><td></td>' +
                '<td><input type="text" name="mButtonName" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
                '<td></td><td><input type="text" name="mButtonContent" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
                '<td></td><td><a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a></td>' +
                '</tr>'
            $(this).parent().prev().find('tbody').append(inputTrHtml);
        } else {
            alert(language.Up_to_4_buttons_can_be_added);
        }

    });

    // 다이얼로그 생성 모달 (다이얼로그 타입변경)
    $(document).on('change', 'select[name=dlgType]', function (e) {

        addCarouselForm = '<div class="btn_wrap addCarouselBtnDiv" style="clear:both" >' +
            '<button type="button" class="btn btn-default addCarouselBtn"><i class="fa fa-plus"></i> ' + language.INSERT_MORE_CARDS + '</button>' +
            '</div>';

        carouselForm = '<div class="carouselLayout">' +
            '<div class="form-group">' +
            '<label>' + language.IMAGE_URL + '</label>' +
            '<input type="text" name="imgUrl" class="form-control" onkeyup="writeCarouselImg(this);" placeholder="' + language.Please_enter + '">' +
            '</div>' +
            '<div class="modal_con btnInsertDiv">' +
            '</div>' +
            '<div class="clear-both"></div>' +
            '<div class="btn_wrap" style="clear:both" >' +
            '<button type="button" class="btn btn-default deleteCard"><i class="fa fa-trash"></i> ' + language.DELETE_CARD + '</button>' +
            '</div>' +
            '<div class="btn_wrap" style="clear:both" >' +
            '<button type="button" class="btn btn-default carouseBtn"><i class="fa fa-plus"></i> ' + language.INSERT_MORE_BUTTON + '</button>' +
            '</div>' +
            '<div class="clear-both"></div>' +
            '</div>';

        mediaForm = '<label>' + language.IMAGE_URL + '<span class="nec_ico">*</span></label>' +
            '<input type="text" name="mediaImgUrl" class="form-control" placeholder="' + language.Please_enter + '">' +
            '<div class="form-group">' +
            '<label>' + language.MEDIA_URL + '</label>' +
            '<input type="text" name="mediaUrl" class="form-control" placeholder="' + language.Please_enter + '">' +
            '</div>' +
            '<div class="modal_con btnInsertDiv">' +
            '</div>' +
            '<div class="btn_wrap" style="clear:both" >' +
            '<button type="button" class="btn btn-default addMediaBtn" ><i class="fa fa-plus"></i> ' + language.INSERT_MORE_BUTTON + '</button>' +
            '<div class="clear-both"></div>';

        var idx = $("select[name=dlgType]").index(this);
        var insertHtml = "";

        $('.insertForm:eq(' + idx + ') .carouselLayout').remove();
        $('.insertForm:eq(' + idx + ') .carouselLayout').after().remove();
        $('.insertForm:eq(' + idx + ') .mediaLayout').remove();
        $('.insertForm:eq(' + idx + ') .mediaLayout').after().remove();
        $('.insertForm:eq(' + idx + ')').find('.clear-both').each(function (index) {
            $('.insertForm:eq(' + idx + ') form').find('.addCarouselBtnDiv').remove();
            if (index != 0) {
                $(this).next().remove();
                $(this).remove();
            }
        });

        if ($(e.target).val() == "2") {

        } else if ($(e.target).val() == "3") {
            //var $clone = $('.carouselLayout').clone();  <div id="carouselLayout" style="display: block;">[object Object]</div>
            //var caraousHtml = '<div class="carouselLayout" style="display: block;">' +  + '</div>'
            $('.insertForm:eq(' + idx + ') form .deleteInsertFormDiv').before(addCarouselForm);
            $('.insertForm:eq(' + idx + ') form').find('.addCarouselBtnDiv').before(carouselForm);
            $('.insertForm:eq(' + idx + ') .carouselLayout').css('display', 'block');
            $('.insertForm:eq(' + idx + ') .carouselLayout').find('.addCarouselBtn:last').closest('div').css('display', 'inline-block');
        } else if ($(e.target).val() == "4") {
            //var mediaForm = '<div id="mediaLayout" style="display: block;">' + $mediaForm.html() + '</div>'
            $('.insertForm:eq(' + idx + ') form .deleteInsertFormDiv').before('<div class="mediaLayout" style="display:none;">' + mediaForm + '</div>');
            //$('.insertForm:eq(' + idx + ') form').append('<div class="mediaLayout" style="display:none;">' + mediaForm + '</div>') ;
            $('.insertForm:eq(' + idx + ') .mediaLayout').css('display', 'block');
            $('.insertForm:eq(' + idx + ') .mediaLayout').find('.addMediaBtn:last').closest('div').css('display', 'inline-block');
        }

        if ($(e.target).val() == "2") {
            $(".dialogView").eq(idx).html('');
            insertHtml += '<div class="wc-message wc-message-from-bot" style="width:80%;">';
            insertHtml += '<div class="wc-message-content">';
            insertHtml += '<svg class="wc-message-callout"></svg>';
            insertHtml += '<div><div class="format-markdown"><div class="textMent">';
            insertHtml += '<h1 class="textTitle">' + language.Please_enter_a_title + '</h1>';
            insertHtml += '<p>';
            insertHtml += language.Please_enter;
            insertHtml += '</p>';
            insertHtml += '</div></div></div></div></div>';

            $(".dialogView").eq(idx).html(insertHtml);
        } else if ($(e.target).val() == "3") {
            $(".dialogView").eq(idx).html('');
            insertHtml += '<div class="wc-message wc-message-from-bot" style="width:90%">';
            insertHtml += '<div class="wc-message-content" style="width:90%;">';
            insertHtml += '<svg class="wc-message-callout"></svg>';
            insertHtml += '<div class="wc-carousel slideBanner" style="width: 312px;">';
            insertHtml += '<div>';
            insertHtml += '<button class="scroll previous" id="prevBtn' + (idx) + '" style="display: none; height: 30px;" onclick="prevBtn(' + idx + ', this)">';
            insertHtml += '<img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_left_401x.png">';
            insertHtml += '</button>';
            insertHtml += '<div class="wc-hscroll-outer" >';
            insertHtml += '<div class="wc-hscroll slideDiv" style="margin-bottom: 0px;" class="content" id="slideDiv' + (idx) + '">';
            insertHtml += '<ul style="padding-left: 0px;">';
            insertHtml += '<li class="wc-carousel-item">';
            insertHtml += '<div class="wc-card hero">';
            insertHtml += '<div class="wc-container imgContainer">';
            insertHtml += '<img src="https://bot.hyundai.com/assets/images/movieImg/teasure/02_teaser.jpg">';
            insertHtml += '</div>';
            insertHtml += '<h1>' + language.Please_enter_a_title + '</h1>';
            insertHtml += '<p class="carousel">' + language.Please_enter_your_content + '</p>';
            insertHtml += '<ul class="wc-card-buttons" style="padding-left: 0px;"><li><button>BTN_1_TITLE</button></li></ul>';
            insertHtml += '</div>';
            insertHtml += '</li>';

            insertHtml += '</ul>';
            insertHtml += '</div>';
            insertHtml += '</div>';
            insertHtml += '<button class="scroll next" style="display: none; height: 30px;" id="nextBtn' + (idx) + '" onclick="nextBtn(' + idx + ', this)"><img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_right_401x.png"></button>';
            insertHtml += '</div></div></div></div>';
            $(".dialogView").eq(idx).html(insertHtml);
        } else if ($(e.target).val() == "4") {
            $(".dialogView").eq(idx).html('');
            insertHtml += '<div class="wc-message wc-message-from-bot">';
            insertHtml += '<div class="wc-message-content">';
            insertHtml += '<svg class="wc-message-callout"></svg>';
            insertHtml += '<div>';
            insertHtml += '<div class="wc-carousel">';
            insertHtml += '<div>';
            insertHtml += '<button class="scroll previous" disabled=""><img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_left_401x.png"></button>';
            insertHtml += '<div class="wc-hscroll-outer">';
            insertHtml += '<div class="wc-hscroll" style="margin-bottom: 0px;">';
            insertHtml += '<ul style="padding-left: 0px;">';
            insertHtml += '<li class="wc-carousel-item wc-carousel-play">';
            insertHtml += '<div class="wc-card hero">';
            insertHtml += '<div class="wc-card-div imgContainer">';
            insertHtml += '<input type="hidden" name="dlgId" value="dlg_id"/>';
            insertHtml += '<img src="https://bot.hyundai.com/assets/images/convenience/USP_convenience_09.jpg">';
            insertHtml += '<div class="playImg"></div>';
            insertHtml += '<div class="hidden" alt="card_title"></div>';
            insertHtml += '<div class="hidden" alt="card_value"></div>';
            insertHtml += '</div>';
            insertHtml += '<h1>' + language.Please_enter_a_title + '</h1>';
            insertHtml += '<p class="dlgMediaText">' + language.Please_enter_your_content + '</p>';
            insertHtml += '<ul class="wc-card-buttons" style="padding-left: 0px;">';
            insertHtml += '<li><button>BTN_1_TITLE</button></li></ul>';
            insertHtml += '</ul>';
            insertHtml += '</div>';
            insertHtml += '</li></ul></div></div>';
            insertHtml += '<button class="scroll next" disabled=""><img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_right_401x.png"></button>';
            insertHtml += '</div></div></div></div></div>';

            $(".dialogView").eq(idx).html(insertHtml);
        }
    });

    //다이얼로그 생성 - 닫는 버튼
    $('.createDlgModalClose').click(function () {
        $('#mediaCarouselLayout').css('display', 'none');
        $('#cardLayout').css('display', 'none');
        $('#appInsertForm')[0].reset();
        $('.insertForm').remove();
        $('#commonLayout hr').remove();
        $('.btnInsertDiv').each(function () {
            $(this).html("");
        })

        var insertForm = '';
        insertForm += '<div class="insertForm">';
        insertForm += '<div class="form-group" >';
        insertForm += '<form name="dialogLayout" id="dialogLayout">';
        insertForm += '<label>' + language.DIALOG_BOX_TYPE + '<span class="nec_ico">*</span> </label>';
        insertForm += '<select class="form-control" name="dlgType">';
        insertForm += '<option value="2">' + language.TEXT_TYPE + '</option>';
        insertForm += '<option value="3">' + language.CARD_TYPE + '</option>';
        insertForm += '<option value="4">' + language.MEDIA_TYPE + '</option>';
        insertForm += '</select>';
        insertForm += '<div class="clear-both"></div>';
        insertForm += '</form>';
        insertForm += '</div>';
        insertForm += '</div>';

        $('#apiLayout').css('display', 'none');
        $('#commonLayout').css('display', 'block');
        $('#commonLayout').prepend(insertForm);

        if ($('#btnCreateLMiddle').html() == '취소' || $('#btnCreateMiddle').html() == 'CANCEL') {

            $('#btnCreateMiddle').click();
        }
        var dialogView = '';
        dialogView += '<div class="dialogView" >';
        dialogView += '<div class="wc-message wc-message-from-bot" style="width:80%;">';
        dialogView += '<div class="wc-message-content">';
        dialogView += '<svg class="wc-message-callout"></svg>';
        dialogView += '<div>';
        dialogView += '<div class="format-markdown">';
        dialogView += '<div class="textMent">';
        dialogView += '<h1 class="textTitle">' + language.Please_enter_a_title + '</h1>';
        dialogView += '<p>' + language.Please_enter + '</p>';
        dialogView += '</div>';
        dialogView += '</div>';
        dialogView += '</div>';
        dialogView += '</div>';
        dialogView += '</div>';
        dialogView += '</div>';
        $('#dialogViewWrap').html(dialogView);
    });

    //다이얼로그 생성 모달 닫는 이벤트(초기화)
    $(".js-modal-close").click(function () {
        $('html').css({ 'overflow': 'auto', 'height': '100%' }); //scroll hidden 해제
        //$('#element').off('scroll touchmove mousewheel'); // 터치무브 및 마우스휠 스크롤 가능

        $('#appInsertDes').val('');
        $("#intentList option:eq(0)").attr("selected", "selected");
        //$('#intentList').find('option:first').attr('selected', 'selected');
        initMordal('intentList', 'Select Intent');
        initMordal('entityList', 'Select Entity');
        $('#dlgLang').find('option:first').attr('selected', 'selected');
        $('#dlgOrder').find('option:first').attr('selected', 'selected');
        $('#layoutBackground').hide();
    });
    /** 모달 끝 */

    // 다이얼로그 생성 모달 (소스 타입 변경)
    $('#sourceType').change(function (e) {
        if ($(e.target).val() == "API") {
            $('.dialogView').html('');
            $('#commonLayout').css('display', 'none');
            $('#apiLayout').css('display', 'block');
        } else {

            $('.insertForm').remove();
            var insertForm = '';
            insertForm += '<div class="insertForm">';
            insertForm += '<div class="form-group" >';
            insertForm += '<form name="dialogLayout" id="dialogLayout">';
            insertForm += '<label>' + language.DIALOG_BOX_TYPE + '<span class="nec_ico">*</span> </label>';
            insertForm += '<select class="form-control" name="dlgType">';
            insertForm += '<option value="2">' + language.TEXT_TYPE + '</option>';
            insertForm += '<option value="3">' + language.CARD_TYPE + '</option>';
            insertForm += '<option value="4">' + language.MEDIA_TYPE + '</option>';
            insertForm += '</select>';
            insertForm += '<div class="clear-both"></div>';
            insertForm += '</form>';
            insertForm += '</div>';
            insertForm += '</div>';

            $('#commonLayout').css('display', 'block');
            $('#commonLayout').prepend(insertForm);
            var dialogView = '';
            dialogView += '<div class="dialogView" >';
            dialogView += '<div class="wc-message wc-message-from-bot" style="width:80%;">';
            dialogView += '<div class="wc-message-content">';
            dialogView += '<svg class="wc-message-callout"></svg>';
            dialogView += '<div>';
            dialogView += '<div class="format-markdown">';
            dialogView += '<div class="textMent">';
            dialogView += '<p>' + language.Please_enter + '</p>';
            dialogView += '</div>';
            dialogView += '</div>';
            dialogView += '</div>';
            dialogView += '</div>';
            dialogView += '</div>';
            dialogView += '</div>';
            $('#dialogViewWrap').html(dialogView);

            $('#apiLayout').css('display', 'none');
            $(".insertForm form").append($(".textLayout").clone(true));
            $('.insertForm .textLayout').css('display', 'block');
        }
    });

    // 다이얼로그 생성 모달
    $('#btnCreateMiddle').on('click', function (e) {
        if ($(this).html() == "신규" || $(this).html() == "NEW") {
            $(this).html(language.CANCEL);
            $('#middleGroupEdit').css('display', 'block');
            $('#middleGroup').css('display', 'none');
        } else {
            $(this).html(language.NEW);
            $('#middleGroupEdit').css('display', 'none');
            $('#middleGroup').css('display', 'block');
        }

        return;
    });

    $('#iptDialog').on('input', function (e) {

        if ($(this).val() !== "") {
            $(this).next().removeClass('disable');
            $(this).next().prop("disabled", false);
        } else {
            $(this).next().addClass('disable');
            $(this).next().prop("disabled", true);
        }
    });
    
    $('#addUtterModalBtn').click(function() {
        var inputUtter = $('#s_question').val().trim();
        if (inputUtter == '') {
            alert('공백을 입력할 수 없습니다.');
            return false;
        }
        $('#utterTitle').text(inputUtter);
        makeUtterTable(inputUtter);

        $('#utterModal').modal('show');
    });

    $('#editUtterModalBtn').click(function() {
        $('#utterModal').modal('show');
    });

});




/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * 유두연 주임 작업 시작
 */

//utter 추가  버튼
$(document).on("click", "a[name=addUtter]", function(e){
    /*
    if ($(this).parents('tr').next().find('div[name=labelInfoDiv]').length >= 5) {
        alert("우선 5개만 가능합니다.");
        return false;
    }
    */
    var utterBodyHtml = '';
    utterBodyHtml += "<div name='labelInfoDiv'>";
    utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
    utterBodyHtml += "<option value='1' selected>Simple</option>";
    utterBodyHtml += "<option value='3'>hierarchy</option>";
    utterBodyHtml += "<option value='4'>composite</option>";
    //utterBodyHtml += "<option value='5'>closed list</option>";
    utterBodyHtml += "</select>";

    utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
    utterBodyHtml += "<option value='NONE'>선택해주세요.</option>";
    for (var j=0; j<simpleList.length; j++) {
        utterBodyHtml += "<option value='" + simpleList[j].ENTITY_NAME + "'>" + simpleList[j].ENTITY_NAME + "</option>";
    }
    utterBodyHtml += "</select>";
    utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
    utterBodyHtml += "<input type='hidden' name='startIndex' value='' />";
    utterBodyHtml += "<input type='hidden' name='endIndex' value=''  />";
    utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
    utterBodyHtml += "<span name='alertSpan' style='font-size: 25px;'></span>";
    utterBodyHtml += "</div>";
    $(this).parents('tr').next().children().eq(1).append(utterBodyHtml);

});



//input focusin
var rememberUtterInput = '';
var rememberUtterStart = -1;
var rememberUtterEnd = -1;
$(document).on("focusin", "input[name=matchUtterText]", function(e){
    rememberUtterInput = $(this).val().trim();
    rememberUtterStart = $(this).parent().find('input[name=startIndex]').val();
    rememberUtterEnd = $(this).parent().find('input[name=endIndex]').val();
});


//input focusout
$(document).on("focusout", "input[name=matchUtterText]", function(e){

    if ($(this).parent().find('select[name=entityTypeForLabel]').val() == '4') {
        $(this).val('');
        return false;
    }

    //$(this).parent().find('select[name=multiMatchUtterSel]').length > 1 || 
    if ((rememberUtterInput == $(this).val() && rememberUtterInput != '')) {
        return false;
    }

    $(this).val($(this).val().trim());
    if (rememberUtterInput != $(this).val() && rememberUtterStart != -1) {
        if ($(this).parent().find('select[name=entitySelBox]').val() == 'NONE') {
            alert('엔티티를 선택해 주세요.');
            $(this).val('');
            return false;
        }
        $(this).parent().find('input[name=startIndex]').val('');
        $(this).parent().find('input[name=endIndex]').val('');
        if (rememberUtterStart != "") {
            for (var i=rememberUtterStart; i<=rememberUtterEnd; i++) {
                $(this).parents('tr').prev().find('span[name=utterText]').eq(i).removeClass();
            }
        }
        var chkMatch = [];
        var chkMatchIndex = [];
        var inputStr = $(this).val();
        var inputLength = $(this).val().length;
        var utterLength = $(this).parents('tr').prev().find('span[name=utterText]').length;


        var isEngNum = false;
        for (var i=0; i<inputLength; i++) {
            if (isAlpabet(inputStr[i])) {
                isEngNum = true;
                break;
            }
        }
        if (isEngNum) {
            var indexArr = [];
            var inputVal = $(this).val();
            $(this).parents('tr').prev().find('input[name=tokenVal]').each(function(index, item){
                var strVal = '';
                var isMatch = false;

                var innerIndex = 0;
                while (1) {
                    var hasClass = $(item).parent().find('#utterText_' + index).attr('class');
                    hasClass = hasClass == undefined? '' : hasClass;
                    if (hasClass.indexOf('span_color') != -1) {
                        break;
                    }
                    strVal += $(item).parent().find('input[name=tokenVal]').eq(index+innerIndex).val();
                    var subInput = inputVal.substr(0, strVal.length);
                    if (inputVal == strVal) {
                        isMatch = true
                        break;
                    } else if (strVal == subInput) {
                        innerIndex++
                        continue;
                    } else {
                        break;
                    }
                }
                if (isMatch) {
                    var matchObj = new Object();
                    matchObj.startIndex = index;
                    matchObj.endIndex = innerIndex;
                    indexArr.push(matchObj);
                    //
                    chkMatch.push(inputStr);
                    var tmpIndex = index + ',' + innerIndex;
                    chkMatchIndex.push(tmpIndex);
                }
            });
        } else {
            for (var i=0; i<=utterLength-inputLength; i++) {
                var strTmp = '';
                var chkLabeled = false;
                for (var j=0; j<inputLength; j++) {
                    var spanClass = $(this).parents('tr').prev().find('span[name=utterText]').eq(i+j).attr('class');
                    if (typeof spanClass == 'undefined') {
                        spanClass = '';
                }
                    if (spanClass.indexOf('span_color_') != -1) {
                        chkLabeled = true;
                        break;
                    } else {
                        strTmp += $(this).parents('tr').prev().find('span[name=utterText]').eq(i+j).text();
                    }
                }
                if ($(this).val() == strTmp && strTmp != '' && !chkLabeled) {
                    chkMatch.push($(this).val());
                    var tmpNum = (i + inputLength*1)-1;
                    var tmpIndex = i + ',' + tmpNum;
                    chkMatchIndex.push(tmpIndex);
                }
            }
        }
        

        //--------------------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------------------
        var utterBodyHtml = '';
        if (chkMatch.length > 1) {
            rememberUtterInput = $(this).val();
            utterBodyHtml += "<select name='multiMatchUtterSel' class='form-control'  >";
            var j=0;
            for (j=0; j<chkMatch.length; j++) {
                if (j == chkMatch.length-1) {
                    utterBodyHtml += "<option value='" + chkMatchIndex[j] + "' selected>" + (j+1) + " - " + chkMatch[j] + "</option>";
                } else {
                    utterBodyHtml += "<option value='" + chkMatchIndex[j] + "'>" + (j+1) + " - " + chkMatch[j] + "</option>";
                }
            }
            utterBodyHtml += "</select>";
            if ($(this).parent().find('select[name=multiMatchUtterSel]').length > 0) {
                $(this).parent().find('select[name=multiMatchUtterSel]').remove();
            }
            $(this).after(utterBodyHtml);
            //$('select[name=multiMatchUtterSel]').focus();
            
            var matchStartIndex = chkMatchIndex[--j].split(",")[0];
            var matchEndIndex = chkMatchIndex[j].split(",")[1];
            //$(this).parent().find('input[name=startIndex]').val(matchStartIndex);
            //$(this).parent().find('input[name=endIndex]').val(matchEndIndex);
            var trIndex = $("tr[name=utterMainTr]").index($(this).parents('tr').prev());
            var divIndex = $("tr[name=utterMainTr]").eq(trIndex).find('div[name=labelInfoDiv]').index($(this).parents('div[name=labelInfoDiv]'));
            changeMultMatchiLabel(matchStartIndex, matchEndIndex, trIndex, divIndex);

        } else if (chkMatch.length > 0) {
            console.log("매칭되는것 1개 ");
            if (!chkLabeled) {
                if ($(this).parent().find('select[name=multiMatchUtterSel]').length > 1) {
                    $(this).parent().find('select[name=multiMatchUtterSel]').remove();
                }

                rememberUtterInput = $(this).val();
                var matchStartIndex = chkMatchIndex[0].split(",")[0];
                var matchEndIndex = chkMatchIndex[0].split(",")[1];
                var colorIndexArr = [0, 1, 2, 3, 4];
                $(this).parents('tr').prev().find('span[name=utterText]').each(function(){
                    var classValue = $(this).attr('class');

                    if (typeof classValue == 'undefined') {
                        classValue = '';
                    }

                    if (classValue.indexOf('span_color_') != -1) {
                        for (var i=0; i<colorIndexArr.length; i++) {
                            if ('span_color_' + colorIndexArr[i] == $(this).attr('class')) {
                                colorIndexArr.splice(i--, 1);
                            }
                        }
                    }
                });

                for (var i=0; i<matchStartIndex; i++) {
                    var tmpClass = $(this).parents('tr').prev().find('span[name=utterText]').eq(i).attr('class');
                    if (typeof tmpClass == 'undefined') {
                        tmpClass = '';
                    }
                    if (tmpClass.indexOf('span_color_') != -1) {
                        if (colorIndexArr[i] == tmpClass.split('span_color_')[1]) {
                            colorIndexArr.splice(i--, 1);
                            break;
                        }
                    }
                }
                for (var i=matchEndIndex+1; i<matchStartIndex; i++) {
                    var tmpClass = $(this).parents('tr').prev().find('span[name=utterText]').eq(i).attr('class');
                    if (tmpClass.indexOf('span_color_') != -1) {
                        if (colorIndexArr[i] == tmpClass.split('span_color_')[1]) {
                            colorIndexArr.splice(i--, 1);
                            break;
                        }
                    }
                }

                if (colorIndexArr.length > 0) {
                    for (var i=matchStartIndex; i<=matchEndIndex; i++) {
                        $(this).parents('tr').prev().find('#utterText_' + i).addClass('span_color_' + colorIndexArr[0]);
                    }
                    $(this).parent().find('input[name=startIndex]').val(matchStartIndex);
                    $(this).parent().find('input[name=endIndex]').val(matchEndIndex);

                    if ($(this).parent().find('div[name=indentDiv]').length>0) {
                        var nowIndex = $('div[name=labelInfoDiv]').index($(this).parent());
                        for (var k=nowIndex-1; k >= 0; k--) {
                            if ($('div[name=labelInfoDiv]').eq(k).find('div[name=indentDiv]').length == 0) {
                                var startInx = $('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val();
                                var endInx = $('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val();
                                startInx = startInx==""?matchStartIndex:startInx*1;
                                endInx = endInx==""?matchEndIndex:endInx*1;
                                if (startInx <= matchStartIndex) {
                                    $('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val(startInx);
                                }
                                if (endInx >= matchEndIndex) {
                                    $('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val(endInx);
                                }
                            }
                        }
                    }

                    
                    var trIndex = $("tr[name=utterMainTr]").index($(this).parents('tr').prev());
                    
                    chkDulpleSelBox(trIndex, chkMatchIndex[0]);
                }
            }
        } else {
            console.log("매칭되는것 없음 ");
        }
        //--------------------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------------------
    }
});

function makeUtterTable(inputText) {

    if (inputText != '' ) {
        var tokenArr = [];
        var utterBodyHtml = '';
        var inputArr = inputText.split(' ');
        for (var i=0; i<inputArr.length; i++) {
            var englishStr = '';
            for (var j=0; j<inputArr[i].length; j++) {
                if (isAlpabet(inputArr[i][j])) {
                    englishStr += inputArr[i][j];
                    if (j == inputArr[i].length-1) {
                        tokenArr.push(englishStr);
                    }
                } else {
                    if (englishStr != '') {
                        tokenArr.push(englishStr);
                        tokenArr.push(inputArr[i][j]);
                        englishStr = '';
                    } else {
                        tokenArr.push(inputArr[i][j]);
                    }
                }
            }
        }
        
        utterBodyHtml += "<tr name='utterMainTr'>";
        utterBodyHtml += "<td ></td>";
        utterBodyHtml += "<td style='text-align: left; padding-left:1%;'>";
        utterBodyHtml += makeTokenizedText(tokenArr, 'SPAN'); 
        utterBodyHtml += "<a href='#' name='addUtter' onclick='return false;' style='display:inline-block; margin:7px 0 0 7px; '><span class='fa fa-plus' style='font-size: 25px;'></span></a>";
        utterBodyHtml += "</td>";
        //utterBodyHtml += "<td style='text-align: left; padding-left:1.5%;'>" + utterList.tokenizedText + "</td>";
        utterBodyHtml += "<td></td>";
        utterBodyHtml += "<td style='text-align: left; padding-left:1.5%;' >";
        utterBodyHtml += makeTokenizedText(tokenArr, 'INPUT');
        utterBodyHtml += makeTokenizedText(tokenArr, 'INDEX', inputText);
        utterBodyHtml += "<input type='hidden' id='intentHiddenName' name='intentHiddenName' value='" + inputText + "' />";
        utterBodyHtml += "<input type='hidden' id='utterHiddenId' name='intentHiddenId' value='NEW' />";
        utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style='display:inline-block; margin:7px 0 0 7px; '><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
        utterBodyHtml += "</td>";
        utterBodyHtml += "</tr>";
        utterBodyHtml += makeLabelingTr();
            
        $('#utteranceTblBody').html('').html(utterBodyHtml);
    } 
}



function makeTokenizedText(token, chk, text) {
    var tokenHtml = '';
    if (chk == 'INPUT') {
        for (var i=0; i<token.length; i++) {
            if (token[i]=="'") {
                tokenHtml += '<input type="hidden" id="tokenVal_' + i + '" name="tokenVal" value="' + token[i] + '" />';
            } else {
                tokenHtml += "<input type='hidden' id='tokenVal_" + i + "' name='tokenVal' value='" + token[i] + "' />";
            }
        }
    }
    else if (chk == 'SPAN') {
        for (var i=0; i<token.length; i++) {
            tokenHtml += "<span id='utterText_" + i + "' name='utterText' style='' >" + token[i] + "</span>";
            if (i != token.length-1) {
                tokenHtml += "<span class='barClass' style='' >|</span>";
            }
        }
    }
    else if (chk == 'INDEX') {
        var k=0;
        for (var i=0; i<token.length; i++) {
            var tokenLen = token[i].length;
            var sumStr = '';
            var sumIndex = '';
            for (var j=0; j<tokenLen; j++) {
                if (text[k] == ' ') {
                    k++;
                    j--;
                    continue;
                }
                else {
                    sumStr += text[k++];
                }
            }
            if (sumStr == token[i]) {
                var resultK = k - tokenLen; 
                sumIndex = i + ',' + resultK + ',' + (resultK + tokenLen-1);
                tokenHtml += "<input type='hidden' id='indexVal_" + i + "' name='indexVal' value='" + sumIndex + "' />"
            }
        }
    }
    return tokenHtml;
}

function makeLabelingTr(entityLabel) {
    var utterBodyHtml = '';
    var chkComposit = false;
    var startIndx = -1;
    var endIndx = -1;

    utterBodyHtml += "<tr name='utterSubTr'>";
    utterBodyHtml += "<td></td>";
    utterBodyHtml += "<td style='text-align: left; padding-left:1%;'>";
    
    if (entityLabel != null) {
        for (var i=0; i<entityLabel.length; i++) {
            if (i+1 < entityLabel.length) {
                if (entityLabel[i+1].entityType == 4) {
                    entityLabel = entityLabel.move(i+1, i);

                    chkComposit = true;
                    compositeObj = entityLabel[i].CHILD_ENTITY_LIST;
                    startIndx = entityLabel[i].startTokenIndex;
                    endIndx = entityLabel[i].endTokenIndex;
                }
            }
            switch(entityLabel[i].entityType) {
                case 1:
                    //'Simple';
                    for (var j=0; j<simpleList.length; j++) {
                        if (simpleList[j].ENTITY_ID == entityLabel[i].id) {
                            utterBodyHtml += "<div name='labelInfoDiv'>";
                            
                            if (chkComposit) {
                                if (chkInsideNum(startIndx, endIndx, entityLabel[i].startTokenIndex, entityLabel[i].endTokenIndex) ) {
                                    utterBodyHtml += "<div name='indentDiv'>&emsp;&emsp;</div>";
                                } else {
                                    chkComposit = false;
                                }
                            }
                            utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                            utterBodyHtml += "<option value='1' selected>Simple</option>";
                            utterBodyHtml += "<option value='3'>hierarchy</option>";
                            if (!chkInsideNum(startIndx, endIndx, entityLabel[i].startTokenIndex, entityLabel[i].endTokenIndex) ) {
                                utterBodyHtml += "<option value='4'>composite</option>";
                            }
                            //utterBodyHtml += "<option value='5'>closed list</option>";
                            utterBodyHtml += "</select>";
    
                            utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
                            utterBodyHtml += "<option value='" + entityLabel[i].id + "'></option>";
                            utterBodyHtml += "</select>";
                            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='' />";
                            utterBodyHtml += "<input type='hidden' name='startIndex' value='" + entityLabel[i].startTokenIndex + "' />";
                            utterBodyHtml += "<input type='hidden' name='endIndex' value='" + entityLabel[i].endTokenIndex + "'  />";
                            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
                            utterBodyHtml += "<span name='alertSpan' style='font-size: 25px;'></span>";
                            utterBodyHtml += "</div>";
                        }
                    }
                    break;
                case 2:
                    //'Prebuilt';
                    break;
                case 3:
                    //'Hierarchical';
                    for (var j=0; j<hierarchyList.length; j++) {
                        if (hierarchyList[j].ENTITY_ID == entityLabel[i].id) {
                            utterBodyHtml += "<div name='labelInfoDiv'>";
    
                            utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                            utterBodyHtml += "<option value='1'>Simple</option>";
                            utterBodyHtml += "<option value='3' selected>hierarchy</option>";
                            utterBodyHtml += "<option value='4'>composite</option>";
                            //utterBodyHtml += "<option value='5'>closed list</option>";
                            utterBodyHtml += "</select>";
    
                            utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
                            utterBodyHtml += "<option value='" + entityLabel[i].id + "'></option>";
                            utterBodyHtml += "</select>";
                            utterBodyHtml += "<select name='entityChildSelBox' class='form-control' style='display:none' >";
                            utterBodyHtml += "<option value=''></option>";
                            utterBodyHtml += "</select>";
                            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
                            utterBodyHtml += "<input type='hidden' name='startIndex' value='" + entityLabel[i].startTokenIndex + "' />";
                            utterBodyHtml += "<input type='hidden' name='endIndex' value='" + entityLabel[i].endTokenIndex + "'  />";
                            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
                            utterBodyHtml += "<span name='alertSpan' style='font-size: 25px;'></span>";
                            utterBodyHtml += "</div>";
                        }
                    }
                    break;
                case 4:
                    //'Composite';
                    for (var j=0; j<compositeList.length; j++) {
                        if (compositeList[j].ENTITY_ID == entityLabel[i].id) {
                            utterBodyHtml += "<div name='labelInfoDiv'>";
    
                            utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                            utterBodyHtml += "<option value='1'>Simple</option>";
                            utterBodyHtml += "<option value='3'>hierarchy</option>";
                            utterBodyHtml += "<option value='4' selected>composite</option>";
                            //utterBodyHtml += "<option value='5'>closed list</option>";
                            utterBodyHtml += "</select>";
    
                            
                            utterBodyHtml += "<select name='entitySelBox' class='form-control' >";
                            utterBodyHtml += "<option value='" + entityLabel[i].id + "'></option>";
                            utterBodyHtml += "</select>";
                            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
                            utterBodyHtml += "<input type='hidden' name='startIndex' value='" + entityLabel[i].startTokenIndex + "' />";
                            utterBodyHtml += "<input type='hidden' name='endIndex' value='" + entityLabel[i].endTokenIndex + "'  />";
                            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
                            utterBodyHtml += "<span name='alertSpan' style='font-size: 25px;'></span>";
                            utterBodyHtml += "</div>";
                        }
                    }
                    break;
                    /*
                case 5:
                    //'Closed List';
                    for (var j=0; j<closedList.length; j++) {
                        if (closedList[j].ENTITY_ID == entityLabel[i].id) {
                            utterBodyHtml += "<div name='labelInfoDiv'>";
    
                            utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                            utterBodyHtml += "<option value='1'>Simple</option>";
                            utterBodyHtml += "<option value='3'>hierarchy</option>";
                            utterBodyHtml += "<option value='4'>composite</option>";
                            utterBodyHtml += "<option value='5' selected>closed list</option>";
                            utterBodyHtml += "</select>";
    

                            utterBodyHtml += "<select name='entitySelBox' class='form-control' >";
                            utterBodyHtml += "<option value='" + entityLabel[i].id + "'></option>";
                            utterBodyHtml += "</select>";
                            
                            utterBodyHtml += "<select name='entityChildSelBox' class='form-control' >";
                            utterBodyHtml += "<option value='" + entityLabel[i].phrase + "'></option>";
                            utterBodyHtml += "</select>";

                            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
                            utterBodyHtml += "<input type='hidden' name='startIndex' value='" + entityLabel[i].startTokenIndex + "' />";
                            utterBodyHtml += "<input type='hidden' name='endIndex' value='" + entityLabel[i].endTokenIndex + "'  />";
                            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
                            utterBodyHtml += "<span name='alertSpan' style='font-size: 25px;'></span>";
                            utterBodyHtml += "</div>";
                        }
                    }
                    break;
                    */
                case 6:
                    //'hierarchy child List';
                    for (var j=0; j<hierarchyList.length; j++) {
                        if (entityLabel[i].entityName.indexOf((hierarchyList[j].ENTITY_NAME + '::')) != -1 ) {
                            for (var k=0; k<hierarchyList[j].CHILD_ENTITY_LIST.length; k++) {
                                if (hierarchyList[j].CHILD_ENTITY_LIST[k].CHILDREN_ID == entityLabel[i].id) {
                                    utterBodyHtml += "<div name='labelInfoDiv'>";
    
                                    utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                                    utterBodyHtml += "<option value='1'>Simple</option>";
                                    utterBodyHtml += "<option value='3' selected>hierarchy</option>";
                                    utterBodyHtml += "<option value='4'>composite</option>";
                                    //utterBodyHtml += "<option value='5'>closed list</option>";
                                    utterBodyHtml += "</select>";
            
                                    
                                    utterBodyHtml += "<select name='entitySelBox' class='form-control' >";
                                    utterBodyHtml += "<option value='" + hierarchyList[j].ENTITY_ID + "'></option>";
                                    utterBodyHtml += "</select>";
                                    utterBodyHtml += "<select name='entityChildSelBox' class='form-control' >";
                                    utterBodyHtml += "<option value='" + entityLabel[i].id + "'></option>";
                                    utterBodyHtml += "</select>";
                                    utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
                                    utterBodyHtml += "<input type='hidden' name='startIndex' value='" + entityLabel[i].startTokenIndex + "' />";
                                    utterBodyHtml += "<input type='hidden' name='endIndex' value='" + entityLabel[i].endTokenIndex + "'  />";
                                    utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
                                    utterBodyHtml += "<span name='alertSpan' style='font-size: 25px;'></span>";
                                    utterBodyHtml += "</div>";
                                    break;
                                }
                            }
                        }
                    }
                    break;
                default:
                    //'None';
                    break;
            }
        }
    }
    
    utterBodyHtml += "</td>";
    utterBodyHtml += "<td></td>";
    utterBodyHtml += "<td></td>";
    utterBodyHtml += "</tr>";

    return utterBodyHtml;
}


function isAlpabet(ch) {
    var numUnicode = ch.charCodeAt(0);
    
    if (48 <= numUnicode && numUnicode <= 57) {
        return true; //숫자
    }
    if (65 <= numUnicode && numUnicode <= 90) {
        return true; //대문자
    }
    if (97 <= numUnicode && numUnicode <= 122) {
        return true; //소문자
    }
    return false;
}


//엔티티 가져오기
function getEntityList(intentName, intentId) {

    $.ajax({
        type: 'POST',
        url: '/luis/getEntityList',
        success: function(data) {
            if (data.error) {
                alert(data.message);
            }
            else 
            {
                simpleList = data.simpleList;
                hierarchyList = data.hierarchyList;
                compositeList = data.compositeList;
                closedList = data.closedList;
            }
        }
    });
}





function chkDulpleSelBox(trIndex, chkIndexStr) {
    
    $("tr[name=utterMainTr]").eq(trIndex).next().find('select[name=multiMatchUtterSel]').each(function(){

        $(this).children().each(function(){
            if (chkIndexStr == $(this).val()) {
                $(this).remove();
                return false;
            }
        });
        if ($(this).children().length <= 1) {
            //$(this).remove();
        }
    });

}



//utter 삭제  버튼
$(document).on("click", "a[name=delLabelBtn]", function(e){
    if ($(this).parent().find('div[name=indentDiv]').length>0) {
        alert('상위 entity를 삭제해 주세요.');
        return false;
    }
    if ($(this).parent().find('select[name=entityTypeForLabel]').val() == '4') {
        while(1) {
            if ($(this).parent().next().find('div[name=indentDiv]').length>0) {
                $(this).parent().next().remove();
            } else {
                break;
            }
        }
    }

    var startIndexTmp = $(this).parent().find('input[name=startIndex]').val();
    var endIndexTmp = $(this).parent().find('input[name=endIndex]').val();
    for (var i=startIndexTmp; i<=endIndexTmp; i++) {
        $(this).parents('tr').prev().find('span[name=utterText]').eq(i).removeClass();
    }

    $(this).parents('div[name=labelInfoDiv]').remove();
});




var utterArr = [];
var newArr = []

$(document).on("click", "#saveUtterModal", function(e){

    utterArr = [];
    newArr = []

    var isNew = false;
    var trIndex = 0;
    var uterObj;

    $('#utteranceTblBody tr').each(function(){ 
        if (trIndex++%2 == 0) {
            uterObj = new Object();
            var utterText = $(this).find('input[name=intentHiddenName]').val();
            if ($(this).find('input[name=intentHiddenId]').val() == 'NEW') {
                var tmpNewObj = new Object();
                tmpNewObj.text = utterText;
                tmpNewObj.intentName = $('#similarQform').find('#mother_intent').val();
                newArr.push(tmpNewObj);
            }
            uterObj.text = utterText;
            uterObj.intentName = $('#similarQform').find('#mother_intent').val();
            return true;
        }
        else  // trIndex == 2
        { 
            var entityLabels = [];
            $(this).find('div[name=labelInfoDiv]').each(function(){
                
                var labelObj = new Object();
                var selEntity;
                var startIndex;
                var endIndex;
                var childName = '';
                var utterEntityType = $(this).find('select[name=entityTypeForLabel]').val();
                switch (utterEntityType) {
                    case '1':
                        
                        selEntity = $(this).find('select[name=entitySelBox]').val();
                        startIndex = $(this).find('input[name=startIndex]').val();
                        endIndex = $(this).find('input[name=endIndex]').val();
                        break;
                    case '3':
                        selEntity = $(this).find('select[name=entitySelBox]').val();
                        startIndex = $(this).find('input[name=startIndex]').val();
                        endIndex = $(this).find('input[name=endIndex]').val();
                        
                        if ($(this).find('select[name=entityChildSelBox]').val() != "NONE") {
                            selEntity = selEntity + "::" + $(this).find('select[name=entityChildSelBox]').val();
                        }
                        break;

                    case '4':
                        selEntity = $(this).find('select[name=entitySelBox]').val();
                        startIndex = $(this).find('input[name=startIndex]').val();
                        endIndex = $(this).find('input[name=endIndex]').val();
                        break;
                }
                
                if (!isNew) {
                    labelObj.entityName = selEntity;
                    labelObj.childName = childName;
    
                    var startInx = $(this).parents('tr').prev().find('#indexVal_' + startIndex).val().split(',')[1];
                    var endInx = $(this).parents('tr').prev().find('#indexVal_' + endIndex).val().split(',')[2];
    
                    labelObj.startCharIndex = startInx;
                    labelObj.endCharIndex = endInx;
                    entityLabels.push(labelObj)
                }
            });
            uterObj.entityLabels = entityLabels;
            utterArr.push(uterObj);
        }

    });
    $('#utterModal').modal('hide');

    $('#s_question').attr('readonly', true);
    $('#editUtterModalBtn').show();
    $('#addUtterModalBtn').hide();

});



function changeMultMatchiLabel(matchStartIndex, matchEndIndex, trIndex, divIndex) {
    
    var colorIndexArr = [0, 1, 2, 3, 4];
    $('tr[name=utterMainTr]').eq(trIndex).find('span[name=utterText]').each(function(){

        var classValue = $(this).attr('class');

        if (typeof classValue == 'undefined') {
            classValue = '';
        }

        if (classValue.indexOf('span_color_') != -1) {
            for (var i=0; i<colorIndexArr.length; i++) {
                if ('span_color_' + colorIndexArr[i] == $(this).attr('class')) {
                    colorIndexArr.splice(i--, 1);
                }
            }
        }
    });

    for (var i=0; i<matchStartIndex; i++) {
        var tmpClass = $('tr[name=utterMainTr]').eq(trIndex).find('span[name=utterText]').eq(i).attr('class');
        if (typeof tmpClass == 'undefined') {
            tmpClass = '';
        }
        if (tmpClass.indexOf('span_color_') != -1) {
            if (colorIndexArr[i] == tmpClass.split('span_color_')[1]) {
                colorIndexArr.splice(i--, 1);
                break;
            }
        }
    }
    for (var i=matchEndIndex+1; i<matchStartIndex; i++) {
        var tmpClass = $('tr[name=utterMainTr]').eq(trIndex).find('span[name=utterText]').eq(i).attr('class');
        if (tmpClass.indexOf('span_color_') != -1) {
            if (colorIndexArr[i] == tmpClass.split('span_color_')[1]) {
                colorIndexArr.splice(i--, 1);
                break;
            }
        }
    }

    if (colorIndexArr.length > 0) {
        for (var i=matchStartIndex; i<=matchEndIndex; i++) {
            $('tr[name=utterMainTr]').eq(trIndex).find('#utterText_' + i).addClass('span_color_' + colorIndexArr[0]);
        }
        $('tr[name=utterMainTr]').eq(trIndex).next().find('div[name=labelInfoDiv]').eq(divIndex).find('input[name=startIndex]').val(matchStartIndex);
        $('tr[name=utterMainTr]').eq(trIndex).next().find('div[name=labelInfoDiv]').eq(divIndex).find('input[name=endIndex]').val(matchEndIndex);
    }
}

 /**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 유두연 주임 작업 끝
  */

























//테이블 페이지 버튼 클릭
$(document).on('click', '#qnaListTablePaging .li_paging', function (e) {
    if (!$(this).hasClass('active')) {
        makeQnaListTable($(this).text());
    }
});

var searchQuestiontText = ""; //페이징시 필요한 검색어 담아두는 변수
var searchIntentText = ""; //페이징시 필요한 검색어 담아두는 변수
function makeQnaListTable(page) {
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
        url: '/qna/selectQnaList',
        success: function (data) {

            if (data.rows) {

                var tableHtml = "";
                var saveTableHtml = "";
                for (var i = 0; i < data.rows.length; i++) {
                    tableHtml += '<tr><td>' + data.rows[i].NUM + '</td>';
                    
                    tableHtml += '<td class="txt_left">' + data.rows[i].DLG_QUESTION + '</td>';
                    
                    tableHtml += '<td>' + data.rows[i].INTENT + '</td>';
                    tableHtml += '<td class="txt_left">' + data.rows[i].ENTITY + '</td>';
                    tableHtml += '<td class="tex01"><button type="button" class="btn btn-default btn-sm" id="show_dlg" dlg_id="' + data.rows[i].DLG_ID + '"><i class="fa fa-edit"></i> ' + language.Show_dlg + '</button></td>';
                    tableHtml += '<td class="tex01"><button type="button" class="btn btn-default btn-sm" id="insert_similarQ_dlg" dlg_id="' + data.rows[i].DLG_ID + '" q_seq="' + data.rows[i].SEQ + '"><i class="fa fa-edit"></i> ' + language.Insert_similarQ + '</button></td>';
                    tableHtml += '</tr>';
                   
                    
                    if(data.rows[i].subQryList.length==0){
                        tableHtml += "";
                    }else{
                        
                        for (var j = 0; j< data.rows[i].subQryList.length; j++){
                            tableHtml += '<tr>';
                            tableHtml += '<td></td>';
                            tableHtml += '<td colspan="2" class="txt_left"><i class="fa fa-caret-right" aria-hidden="true"></i> '+data.rows[i].subQryList[j].DLG_QUESTION +'</td>';
                            tableHtml += '<td class="txt_left">'+data.rows[i].subQryList[j].ENTITY +'</td>';
                            tableHtml += '<td></td>';
                            tableHtml += '<td class="tex01"><button type="button" class="btn btn-default btn-sm" id="delete_similar" del_similar_id="' + data.rows[i].subQryList[j].SEQ + '"><i class="fa fa-trash"></i></button></td>';
                            tableHtml += '</tr>';
                        }
                    }
                }
                //tableHtml += '</tr>';
                saveTableHtml = tableHtml;
                
                $('#qnaListbody').html(saveTableHtml);

                //사용자의 appList 출력
                $('#qnaListbody').find('tr').eq(0).children().eq(0).trigger('click');

                $('#qnaListTablePaging .pagination').html('').append(data.pageList);

            } else {
                saveTableHtml = '<tr><td colspan="4" class="text-center">No QnA Data</td></tr>';
                $('#qnaListbody').html(saveTableHtml);
            }

        }
    });
}


var botChatNum4Desc = 1;
//dlg 저장
var dlgMap = new Object();
var relationID = 1;
//function getDlgInfo(dlgID, relationID) {
$(document).on("click", "#show_dlg", function () {
    var dlgID = $(this).attr("dlg_id");
   
    $insertForm = $('#commonLayout .insertForm').eq(0).clone();
    $dlgForm = $('#commonLayout .textLayout').eq(0).clone();
    $carouselForm = $('#commonLayout .carouselLayout').eq(0).clone();
    $mediaForm = $('#commonLayout .mediaLayout').eq(0).clone();

    var tr = $(this).parent().parent();
    var td = tr.children();
    var show_question = td.eq(1).text();
    var show_intent = td.eq(2).text();
    var show_entity = td.eq(3).text();

    carouselForm = '<div class="carouselLayout">' +
        '<div class="form-group">' +
        '<label>' + language.IMAGE_URL + '</label>' +
        '<input type="text" name="imgUrl" class="form-control" onkeyup="writeCarouselImg(this);" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '<div class="modal_con btnInsertDiv">' +
        '</div>' +
        '<div class="clear-both"></div>' +
        '<div class="btn_wrap" style="clear:both" >' +
        '<button type="button" class="btn btn-default deleteCard"><i class="fa fa-trash"></i> ' + language.DELETE_CARD + '</button>' +
        '</div>' +
        '<div class="btn_wrap" style="clear:both" >' +
        '<button type="button" class="btn btn-default carouseBtn"><i class="fa fa-plus"></i> ' + language.INSERT_MORE_BUTTON + '</button>' +
        '</div>' +
        '<div class="clear-both"></div>' +
        '</div>';

    addCarouselForm = '<div class="btn_wrap addCarouselBtnDiv" style="clear:both" >' +
        '<button type="button" class="btn btn-default addCarouselBtn"><i class="fa fa-plus"></i> ' + language.INSERT_MORE_CARDS + '</button>' +
        '</div>';

    mediaForm = '<div class="mediaLayout">' +
        '<label>' + language.IMAGE_URL + '<span class="nec_ico">*</span></label>' +
        '<input type="text" name="mediaImgUrl" class="form-control" placeholder="' + language.Please_enter + '">' +
        '<div class="form-group">' +
        '<label>' + language.MEDIA_URL + '</label>' +
        '<input type="text" name="mediaUrl" class="form-control" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '<div class="modal_con btnInsertDiv">' +
        '</div>' +
        '<div class="btn_wrap" style="clear:both" >' +
        '<button type="button" class="btn btn-default addMediaBtn" ><i class="fa fa-plus"></i> ' + language.INSERT_MORE_BUTTON + '</button>' +
        '<div class="clear-both"></div>' +
        '</div>';

    dlgForm = '<div class="textLayout">' +
        '<div class="form-group">' +
        '<label>' + language.DIALOG_BOX_TITLE + '</label>' +
        '<input type="text" name="dialogTitle" class="form-control" onkeyup="writeDialogTitle(this);" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>' + language.DIALOG_BOX_CONTENTS + '</label>' +
        '<input type="text" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '</div>';

    deleteInsertForm = '<div class="btn_wrap deleteInsertFormDiv" style="clear:both;" >' +
        '<button type="button" class="btn btn-default deleteInsertForm"><i class="fa fa-trash"></i> ' + language.DELETE_DIALOG + '</button>' +
        '</div>';

    var inputHtml = '<div><label>' + language.BUTTON + '</label></div>' +
        '<div class="form-group col-md-13"  style="padding-left:0; margin-top: 0px;">' +
        '<table class="cardCopyTbl" style="width:100%">' +
        '<col width="21%"><col width="1%"><col width="35%">' +
        '<col width="1%"><col width="35%"><col width="1%"><col width="6%">' +
        '<thead><tr>' +
        '<th>' + language.Type + '</th><th></th><th>' + language.NAME + '</th>' +
        '<th></th><th>' + language.CONTENTS + '</th><th></th><th></th>' +
        '</tr></thead>' +
        '<tbody>' +
        '<tr>' +
        '<td><select class="form-control" name="btnType"><option value="imBack" selected>imBack</option>' +
        '<option value="openURL">openURL</option></select></td>' +
        '<td></td><td><input type="text" name="cButtonName" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><input type="text" name="cButtonContent" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a></td>' +
        '</tr></tbody></table></div>';

    var inputTrHtml = '<tr>' +
        '<td><select class="form-control" name="btnType"><option value="imBack" selected>imBack</option>' +
        '<option value="openURL">openURL</option></select></td>' +
        '<td></td><td><input type="text" name="cButtonName" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><input type="text" name="cButtonContent" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a></td>' +
        '</tr>';

    var inputMHtml = '<label>' + language.BUTTON + '</label></div>' +
        '<div class="form-group col-md-13"  style="padding-left:0; margin-top: 0px;">' +
        '<table class="mediaCopyTbl" style="width:100%"><col width="21%">' +
        '<col width="1%"><col width="35%"><col width="1%"><col width="35%"><col width="1%"><col width="6%">' +
        '<thead><tr><th>' + language.Type + '</th><th></th>' +
        '<th>' + language.NAME + '</th><th></th><th>' + language.CONTENTS + '</th>' +
        '<th></th><th></th></tr></thead><tbody>' +
        '<tr><td>' +
        '<select class="form-control" name="btnType">' +
        '<option value="imBack" selected>imBack</option>' +
        '<option value="openURL">openURL</option>' +
        '</select>' +
        '</td><td></td>' +
        '<td><input type="text" name="mButtonName" class="form-control" placeholder="' + language.Please_enter + '">' +
        '</td><td></td><td>' +
        '<input type="text" name="mButtonContent" class="form-control" placeholder="' + language.Please_enter + '">' +
        '</td><td></td><td>' +
        '<a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a>' +
        '</td></tr></tbody></table></div></div></div>';

    var inputMTrHtml = '<tr>' +
        '<td>' +
        '<select class="form-control" name="btnType">' +
        '<option value="imBack" selected>imBack</option>' +
        '<option value="openURL">openURL</option>' +
        '</select>' +
        '</td><td></td>' +
        '<td><input type="text" name="mButtonName" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><input type="text" name="mButtonContent" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a></td>' +
        '</tr>';

    $.ajax({
        url: '/qna/getDlgAjax',                //주소
        dataType: 'json',                  //데이터 형식
        type: 'POST',                      //전송 타입
        data: { 'dlgID': dlgID, 'relationID': relationID },      //데이터를 json 형식, 객체형식으로 전송

        success: function (result) {          //성공했을 때 함수 인자 값으로 결과 값 나옴
            var inputUttrHtml = '';

            if (result['list'].length == 0) {
                inputUttrHtml += '<div style="display:table-cell;vertical-align:middle; height:400px; width:900px; text-align:center;">' +
                    language.NO_DATA +
                    '</div>';
            } else {

                var row = result['list'];

                for (var i = 0; i < row.length; i++) {
                    botChatNum4Desc++;
                    var val = row[i];

                    var tmp = val;//val[l];

                    for (var j = 0; j < tmp.dlg.length; j++) {

                        if (tmp.dlg[j].DLG_TYPE == 2) {

                            inputUttrHtml += '<div class="wc-message wc-message-from-bot" style="width:200px">';
                            inputUttrHtml += '<div class="wc-message-content">';
                            inputUttrHtml += '<svg class="wc-message-callout"></svg>';
                            inputUttrHtml += '<div><div class="format-markdown"><div class="textMent">';
                            inputUttrHtml += '<p>';
                            inputUttrHtml += '<input type="hidden" name="dlgId" value="' + tmp.dlg[j].DLG_ID + '"/>';
                            inputUttrHtml += '<h1 class="textTitle">' + tmp.dlg[j].CARD_TITLE + '</h1>';
                            inputUttrHtml += tmp.dlg[j].CARD_TEXT;
                            inputUttrHtml += '</p>';
                            inputUttrHtml += '</div></div></div></div></div>';

                            $(".insertForm form").append(dlgForm);
                            $(".insertForm form").append(deleteInsertForm);
                            $("#dialogLayout").eq(j).find("select[name=dlgType]").val("2").prop("selected", true);
                            $("#dialogLayout").eq(j).find("input[name=dialogTitle]").val(tmp.dlg[j].CARD_TITLE);
                            $("#dialogLayout").eq(j).find("input[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);
                            $(".insertForm .textLayout").css("display", "block");
                        } else if (tmp.dlg[j].DLG_TYPE == 3) {

                            if (j == 0) {
                                inputUttrHtml += '<div class="wc-message wc-message-from-bot">';
                                inputUttrHtml += '<div class="wc-message-content">';
                                inputUttrHtml += '<svg class="wc-message-callout"></svg>';
                                inputUttrHtml += '<div class="wc-carousel slideBanner" style="width: 312px;">';
                                inputUttrHtml += '<div>';
                                inputUttrHtml += '<button class="scroll previous" id="prevBtn0" style="display: none;" onclick="prevBtn(0,this)">';
                                inputUttrHtml += '<img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_left_401x.png">';
                                inputUttrHtml += '</button>';
                                inputUttrHtml += '<div class="wc-hscroll-outer" >';
                                inputUttrHtml += '<div class="wc-hscroll slideDiv" style="margin-bottom: 0px;" class="content" id="slideDiv0">';
                                inputUttrHtml += '<ul>';
                                //inputUttrHtml += '<input type="hidden" name="dlgId" value="' + tmp.dlg[j].DLG_ID + '"/>';
                            }
                            inputUttrHtml += '<li class="wc-carousel-item">';
                            inputUttrHtml += '<div class="wc-card hero">';
                            inputUttrHtml += '<div class="wc-container imgContainer" >';
                            inputUttrHtml += '<img src="' + tmp.dlg[j].IMG_URL + '">';
                            inputUttrHtml += '</div>';
                            if (tmp.dlg[j].CARD_TITLE != null) {
                                inputUttrHtml += '<h1>' + /*cardtitle*/ tmp.dlg[j].CARD_TITLE + '</h1>';
                            }
                            if (tmp.dlg[j].CARD_TEXT != null) {

                                inputUttrHtml += '<p class="carousel" style="height:20px;min-height:20px;">' + /*cardtext*/ tmp.dlg[j].CARD_TEXT + '</p>';
                            }
                            if (tmp.dlg[j].BTN_1_TITLE != null) {
                                inputUttrHtml += '<ul class="wc-card-buttons"><li><button>' + /*btntitle*/ tmp.dlg[j].BTN_1_TITLE + '</button></li></ul>';
                            }
                            inputUttrHtml += '</div>';
                            inputUttrHtml += '</li>';

                            //다이얼로그가 한개일때에는 오른쪽 버튼 x
                            if ((tmp.dlg.length - 1) == j) {
                                inputUttrHtml += '</ul>';
                                inputUttrHtml += '</div>';
                                inputUttrHtml += '</div>';
                                if ((tmp.dlg.length) > 2) {
                                    inputUttrHtml += '<button class="scroll next" style="display: block; height: 30px;" id="nextBtn0" onclick="nextBtn(0,this)"><img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_right_401x.png"></button>';
                                } else {
                                    inputUttrHtml += '<button class="scroll next" style="display: none; height: 30px;" id="nextBtn0" onclick="nextBtn(0,this)"><img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_right_401x.png"></button>';
                                }
                                inputUttrHtml += '</div></div></div></div>';
                            }

                            if (j != 0) {
                                $(".insertForm form").append('<div class="clear-both"></div>');
                            }
                            $(".insertForm form").append(dlgForm);
                            $(".insertForm form").append(carouselForm);

                            if ((tmp.dlg.length - 1) == j) {
                                $("#dialogLayout").find(".carouselLayout").eq(j).after(addCarouselForm);
                                $("#dialogLayout").find(".addCarouselBtnDiv").after(deleteInsertForm);
                            }

                            $("#dialogLayout").eq(j).find("select[name=dlgType]").val("3").prop("selected", true);
                            $("#dialogLayout").find(".textLayout").eq(j).css("display", "block");
                            $("#dialogLayout").find(".carouselLayout").eq(j).css("display", "block");

                            $("#dialogLayout").find(".textLayout").eq(j).find("input[name=dialogTitle]").val(tmp.dlg[j].CARD_TITLE);
                            $("#dialogLayout").find(".textLayout").eq(j).find("input[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);
                            $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=imgUrl]").val(tmp.dlg[j].IMG_URL);

                            if (tmp.dlg[j].BTN_1_TYPE != null && tmp.dlg[j].BTN_1_TYPE != "") {
                                $("#dialogLayout").find(".carouselLayout").eq(j).find(".btnInsertDiv").append(inputHtml);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("select[name=btnType]:eq(0)").val(tmp.dlg[j].BTN_1_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonName]:eq(0)").val(tmp.dlg[j].BTN_1_TITLE);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonContent]:eq(0)").val(tmp.dlg[j].BTN_1_CONTEXT);
                            }
                            if (tmp.dlg[j].BTN_2_TYPE != null && tmp.dlg[j].BTN_2_TYPE != "") {
                                $("#dialogLayout").find(".carouselLayout").eq(j).find(".cardCopyTbl tbody").append(inputTrHtml);

                                $("#dialogLayout").find(".carouselLayout").eq(j).find("select[name=btnType]:eq(1)").val(tmp.dlg[j].BTN_2_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonName]:eq(1)").val(tmp.dlg[j].BTN_2_TITLE);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonContent]:eq(1)").val(tmp.dlg[j].BTN_2_CONTEXT);
                            }
                            if (tmp.dlg[j].BTN_3_TYPE != null && tmp.dlg[j].BTN_3_TYPE != "") {
                                $("#dialogLayout").find(".carouselLayout").eq(j).find(".cardCopyTbl tbody").append(inputTrHtml);

                                $("#dialogLayout").find(".carouselLayout").eq(j).find("select[name=btnType]:eq(2)").val(tmp.dlg[j].BTN_3_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonName]:eq(2)").val(tmp.dlg[j].BTN_3_TITLE);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonContent]:eq(2)").val(tmp.dlg[j].BTN_3_CONTEXT);
                            }
                            if (tmp.dlg[j].BTN_4_TYPE != null && tmp.dlg[j].BTN_4_TYPE != "") {
                                $("#dialogLayout").find(".carouselLayout").eq(j).find(".cardCopyTbl tbody").append(inputTrHtml);

                                $("#dialogLayout").find(".carouselLayout").eq(j).find("select[name=btnType]:eq(3)").val(tmp.dlg[j].BTN_4_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonName]:eq(3)").val(tmp.dlg[j].BTN_4_TITLE);
                                $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=cButtonContent]:eq(3)").val(tmp.dlg[j].BTN_4_CONTEXT);
                            }
                        } else if (tmp.dlg[j].DLG_TYPE == 4) {
                            inputUttrHtml += '<div class="wc-message wc-message-from-bot">';
                            inputUttrHtml += '<div class="wc-message-content">';
                            inputUttrHtml += '<svg class="wc-message-callout"></svg>';
                            inputUttrHtml += '<div>';
                            inputUttrHtml += '<div class="wc-carousel">';
                            inputUttrHtml += '<div>';
                            inputUttrHtml += '<button class="scroll previous" disabled=""><img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_left_401x.png"></button>';
                            inputUttrHtml += '<div class="wc-hscroll-outer">';
                            inputUttrHtml += '<div class="wc-hscroll" style="margin-bottom: 0px;">';
                            inputUttrHtml += '<ul style="min-width:0px">';
                            inputUttrHtml += '<li class="wc-carousel-item wc-carousel-play">';
                            inputUttrHtml += '<div class="wc-card hero" style="width:70%">';
                            inputUttrHtml += '<div class="wc-card-div imgContainer">';
                            inputUttrHtml += '<input type="hidden" name="dlgId" value="' + tmp.dlg[j].DLG_ID + '"/>';
                            inputUttrHtml += '<img src="' + /* 이미지 url */ tmp.dlg[j].MEDIA_URL + '">';
                            inputUttrHtml += '<div class="playImg"></div>';
                            inputUttrHtml += '<div class="hidden" alt="' + tmp.dlg[j].CARD_TITLE + '"></div>';
                            inputUttrHtml += '<div class="hidden" alt="' + /* media url */ tmp.dlg[j].CARD_VALUE + '"></div>';
                            inputUttrHtml += '</div>';
                            inputUttrHtml += '<h1>' + /* title */ tmp.dlg[j].CARD_TITLE + '</h1>';
                            inputUttrHtml += '<ul class="wc-card-buttons">';
                            inputUttrHtml += '</ul>';
                            inputUttrHtml += '</div>';
                            inputUttrHtml += '</li></ul></div></div>';
                            inputUttrHtml += '<button class="scroll next" disabled=""><img src="https://bot.hyundai.com/assets/images/02_contents_carousel_btn_right_401x.png"></button>';
                            inputUttrHtml += '</div></div></div></div></div>';

                            $(".insertForm form").append(dlgForm);
                            $(".insertForm form").append(mediaForm);
                            $("#dialogLayout .mediaLayout").after(deleteInsertForm);
                            $("#dialogLayout").eq(j).find("select[name=dlgType]").val("4").prop("selected", true);
                            $("#dialogLayout").find(".textLayout").eq(j).css("display", "block");
                            $("#dialogLayout").find(".mediaLayout").eq(j).css("display", "block");

                            $("#dialogLayout").find(".textLayout").eq(j).find("input[name=dialogTitle]").val(tmp.dlg[j].CARD_TITLE);
                            $("#dialogLayout").find(".textLayout").eq(j).find("input[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);

                            $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mediaImgUrl]").val(tmp.dlg[j].MEDIA_URL);
                            $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mediaUrl]").val(tmp.dlg[j].CARD_VALUE);

                            if (tmp.dlg[j].BTN_1_TYPE != null && tmp.dlg[j].BTN_1_TYPE != "") {
                                $("#dialogLayout").find(".mediaLayout").eq(j).find(".btnInsertDiv").append(inputMHtml);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("select[name=btnType]:eq(0)").val(tmp.dlg[j].BTN_1_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonName]:eq(0)").val(tmp.dlg[j].BTN_1_TITLE);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonContent]:eq(0)").val(tmp.dlg[j].BTN_1_CONTEXT);
                            }
                            if (tmp.dlg[j].BTN_2_TYPE != null && tmp.dlg[j].BTN_2_TYPE != "") {
                                $("#dialogLayout").find(".mediaLayout").eq(j).find(".mediaCopyTbl tbody").append(inputMTrHtml);

                                $("#dialogLayout").find(".mediaLayout").eq(j).find("select[name=btnType]:eq(1)").val(tmp.dlg[j].BTN_2_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonName]:eq(1)").val(tmp.dlg[j].BTN_2_TITLE);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonContent]:eq(1)").val(tmp.dlg[j].BTN_2_CONTEXT);
                            }
                            if (tmp.dlg[j].BTN_3_TYPE != null && tmp.dlg[j].BTN_3_TYPE != "") {
                                $("#dialogLayout").find(".mediaLayout").eq(j).find(".mediaCopyTbl tbody").append(inputMTrHtml);

                                $("#dialogLayout").find(".mediaLayout").eq(j).find("select[name=btnType]:eq(2)").val(tmp.dlg[j].BTN_3_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonName]:eq(2)").val(tmp.dlg[j].BTN_3_TITLE);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonContent]:eq(2)").val(tmp.dlg[j].BTN_3_CONTEXT);
                            }
                            if (tmp.dlg[j].BTN_4_TYPE != null && tmp.dlg[j].BTN_4_TYPE != "") {
                                $("#dialogLayout").find(".mediaLayout").eq(j).find(".mediaCopyTbl tbody").append(inputMTrHtml);

                                $("#dialogLayout").find(".mediaLayout").eq(j).find("select[name=btnType]:eq(3)").val(tmp.dlg[j].BTN_4_TYPE).prop("selected", true);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonName]:eq(3)").val(tmp.dlg[j].BTN_4_TITLE);
                                $("#dialogLayout").find(".mediaLayout").eq(j).find("input[name=mButtonContent]:eq(3)").val(tmp.dlg[j].BTN_4_CONTEXT);
                            }

                        }
                        $('#updateDlgId').val(tmp.dlg[j].DLG_ID);
                        $('#updateDlgType').val(tmp.dlg[j].DLG_TYPE);
                        $('#updateDlgEntity').val(tmp.GROUPS);
                    }
                }
            }
            
            $('.dialogView').html(inputUttrHtml);

            //대화상자 수정 추가
            $('h4#myModalLabel.modal-title').text(language.Show_dlg);
            $('#description').val(result['list'][0].DLG_DESCRIPTION);
            $("#largeGroup").val(result['list'][0].GROUPL);
            $("#middleGroup").val(result['list'][0].GROUPM);

            $('#dlgQuestion').text(show_question);
            $('#luisIntent').text(show_intent);
            $("#createDialog").attr('onclick', 'updateDialog()');
        }


    }); // ------      ajax 끝-----------------

    $('#myModal2').modal('show');
});


function updateDialog() {

    var dlgId = $('#updateDlgId').val();
    var dlgType = $('#updateDlgType').val();
    var entity = $('#updateDlgEntity').val();

    var idx = $('form[name=dialogLayout]').length;
    var array = [];
    var exit = false;
    /*
    if ($('#description').val().trim() === "") {
        alert(language.Description_must_be_entered);
        return false;
    }
*/
    $('.insertForm textarea[name=dialogText]').each(function (index) {
        if ($(this).val().trim() === "") {
            alert(language.You_must_enter_a_Dialog_Title);
            exit = true;
            return false;
        }
    });
    if (exit) return;
    $('.insertForm input[name=imgUrl]').each(function (index) {
        if ($(this).val().trim() === "") {
            alert(language.ImageURL_must_be_entered);
            exit = true;
            return false;
        }
    });
    if (exit) return;


    for (var i = 0; i < idx; i++) {
        var tmp = $("form[name=dialogLayout]").eq(i).serializeArray();
        var object = {};
        var carouselArr = [];
        var objectCarousel = {};
        if (tmp[0].value === "3") {
            var btnTypeCount = 1;
            var cButtonContentCount = 1;
            var cButtonNameCount = 1;
            for (var j = 1; j < tmp.length; j++) {
                if (tmp[j].name == 'btnType') {
                    tmp[j].name = 'btn' + (btnTypeCount++) + 'Type';
                    if (btnTypeCount == 5) {
                        btnTypeCount = 1;
                    }
                }
                if (tmp[j].name == 'cButtonContent') {
                    tmp[j].name = 'cButtonContent' + (cButtonContentCount++);
                    if (cButtonContentCount == 5) {
                        cButtonContentCount = 1;
                    }
                }
                if (tmp[j].name == 'cButtonName') {
                    tmp[j].name = 'cButtonName' + (cButtonNameCount++);
                    if (cButtonNameCount == 5) {
                        cButtonNameCount = 1;
                    }
                }

                if (typeof objectCarousel[tmp[j].name] !== "undefined") {
                    carouselArr.push(objectCarousel);
                    objectCarousel = {};
                    btnTypeCount = 1;
                    cButtonContentCount = 1;
                    cButtonNameCount = 1;
                }

                if (j === tmp.length - 1) {
                    object[tmp[0].name] = tmp[0].value;
                    objectCarousel[tmp[j].name] = tmp[j].value;

                    carouselArr.push(objectCarousel);
                    objectCarousel = {};
                    break;
                }
                object[tmp[0].name] = tmp[0].value;
                objectCarousel[tmp[j].name] = tmp[j].value;
            }
            //carouselArr.push(objectCarousel);
            object['carouselArr'] = carouselArr;
        } else if (tmp[0].value === "4") {

            var btnTypeCount = 1;
            var mButtonContentCount = 1;
            var mButtonNameCount = 1;

            for (var j = 0; j < tmp.length; j++) {

                if (tmp[j].name == 'btnType') {
                    tmp[j].name = 'btn' + (btnTypeCount++) + 'Type';
                }
                if (tmp[j].name == 'mButtonContent') {
                    tmp[j].name = 'mButtonContent' + (mButtonContentCount++);

                }
                if (tmp[j].name == 'mButtonName') {
                    tmp[j].name = 'mButtonName' + (mButtonNameCount++);
                }

                object[tmp[j].name] = tmp[j].value;
            }

        } else {
            for (var j = 0; j < tmp.length; j++) {
                object[tmp[j].name] = tmp[j].value;
            }
        }

        array[i] = JSON.stringify(object);//JSON.stringify(tmp);//tmp.substring(1, tmp.length-2);
    }
    
    array[array.length] = JSON.stringify($("form[name=appInsertForm]").serializeObject());//JSON.stringify($("form[name=appInsertForm]"));

    $.ajax({
        url: '/qna/updateDialog',                //주소
        dataType: 'json',                  //데이터 형식
        type: 'POST',                      //전송 타입
        data: { 'dlgId': dlgId, 'dlgType': dlgType, 'updateData': array, 'entity': entity },      //데이터를 json 형식, 객체형식으로 전송

        success: function (result) {
            alert('success');
            $('.createDlgModalClose').click();

            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }

    });
}

function deleteDialog(dlgId) {
    $.ajax({
        url: '/qna/deleteDialog',                //주소
        dataType: 'json',                  //데이터 형식
        type: 'POST',                      //전송 타입
        data: { 'dlgId': dlgId },      //데이터를 json 형식, 객체형식으로 전송

        success: function (result) {
            alert('delele complete');
            $('.createDlgModalClose').click();
            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }

    });
}

//다이얼로그 생성 유효성 검사
function dialogValidation(type) {
    if (type == 'dialogInsert') {
        var dialogText = $('#dialogText').val();

        if (dialogText != "") {
            $('#btnAddDlg').removeClass("disable");
            $('#btnAddDlg').attr("disabled", false);
        } else {
            $('#btnAddDlg').attr("disabled", "disabled");
            $('#btnAddDlg').addClass("disable");
        }
    }
}

// 다이얼로그 생성 모달 (다이얼로그 타이틀 입력)
function writeDialogTitle(e) {

    //var idx = $('input[name=dialogTitle]').index(e);
    var idx = $('#commonLayout .insertForm').index($(e).parents('.insertForm'));
    var icx = $('#commonLayout').find('.insertForm').index($(e).parents('.insertForm'));
    var jcx = $(e).parents('.insertForm').find('input[name=dialogTitle]').index(e);

    if ($(e).parents('.insertForm').find('select[name=dlgType]').val() == 3) {
        //$('.dialogView:eq(' + idx + ') .carousel').html(e.value);
        $('.dialogView').children().eq(icx).find('ul:eq(0)').children().eq(jcx).find('h1').text(e.value);
    } else if ($(e).parents('.insertForm').find('select[name=dlgType]').val() == 4) {
        $('.dialogView').children().eq(icx).find('h1').html(e.value);
        //$('.dialogView h1').eq(idx).html(e.value);
    } else {
        $('.dialogView').children().eq(icx).find('.textMent .textTitle').html(e.value);
    }
}

function writeCarouselImg(e) {
    var icx = $('#commonLayout').find('.insertForm').index($(e).parents('.insertForm'));
    var jcx = $(e).parents('.insertForm').find('input[name=imgUrl]').index(e);

    $('#dialogPreview').children().eq(icx).find('ul:eq(0)').children().eq(jcx).find('.imgContainer img').attr("src", e.value);
}

// 다이얼로그 생성 모달 (다이얼로그 내용 입력)
function writeDialog(e) {
    //var idx = $('textarea[name=dialogText]').index(e);

    var idx = $('#commonLayout .insertForm').index($(e).parents('.insertForm'));
    var icx = $('#commonLayout').find('.insertForm').index($(e).parents('.insertForm'));
    //var jcx = $(e).parents('.insertForm').find('input[name=dialogTitle]').index(e);

    if ($(e).parents('.insertForm').find('select[name=dlgType]').val() == 3) {
        //$('.dialogView:eq(' + idx + ') .carousel').html(e.value);
        //var icx = $('#commonLayout').find('.insertForm').index($(e).parents('.insertForm'));
        var jcx = $(e).parents('.insertForm').find('input[name=dialogText]').index(e);
        if ($(e).parent().prev().find('input[name=dialogTitle]').val() == '') {
            $('.dialogView').children().eq(icx).find('ul:eq(0)').children().eq(jcx).find('h1').text('');
        }
        $('.dialogView').children().eq(icx).find('ul:eq(0)').children().eq(jcx).find('p').text(e.value);


    } else if ($(e).parents('.insertForm').find('select[name=dlgType]').val() == 4) {
        $('.dialogView h1').eq(idx).text(e.value);
    } else {
        //$('.dialogView .textMent p:eq(' + idx + ')').html(e.value);
        //$('.dialogView').children().eq(icx).find('.textMent p:eq(' + idx + ')').html(e.value);
        if ($(e).parent().prev().find('input[name=dialogTitle]').val() == '') {
            $('.dialogView').children().eq(icx).find('.textMent .textTitle').text('');
        }
        $('.dialogView').children().eq(icx).find('.textMent p').text(e.value);
    }

}

//다이얼로그생성모달 - 다이얼로그삭제
$(document).on('click', '.deleteInsertForm', function (e) {

    insertFormLength = $('.insertForm').length;
    if (insertFormLength == 1) {
        alert(language.You_must_have_one_dialog_by_default);
    } else {
        var idx = $(".deleteInsertForm").index(this);
        if (idx == 0) {

            $(this).parents('.insertForm').next().remove();
        }
        $(".dialogView").eq(idx).remove();
        $(this).parents('.insertForm').prev().remove();
        $(this).parents('.insertForm').remove();
    }
    $(this).parents('.insertForm');
});

//다이얼로그생성모달 - 카드삭제 
$(document).on('click', '.deleteCard', function (e) {

    var insertFormIdx;
    $('.insertForm').each(function (count) {
        if ($(this)[0] == $(e.target).parents('#commonLayout').find($('.insertForm').find(e.target).parents('.insertForm'))[0]) {
            insertFormIdx = count;
        }
    })
    insertFormLength = $('.insertForm').length;
    //insertFormIdx = $('.insertForm').index();
    var carouselLayoutLength = $(this).parents('form[name=dialogLayout]').find('.carouselLayout').length;
    var idx = $(this).parents('form[name=dialogLayout]').find('.carouselLayout').find('.deleteCard').index(this);

    if (insertFormLength == 1) {

        if (carouselLayoutLength == 1) {
            alert(language.You_must_have_at_least_one_card);

        } else {

            if ($('.dialogView').eq(insertFormIdx).find('.slideDiv .wc-carousel-item').length == 3) {
                $('.dialogView').eq(insertFormIdx).find('.next').hide();
                $('.dialogView').eq(insertFormIdx).find('.previous').hide();
            }

            $(".dialogView").eq(insertFormIdx).find('.slideDiv .wc-carousel-item').eq(idx).remove();
            $(this).parent().parent().prev().remove();
            $(this).parent().parent().remove();
        }

    } else {

        if (carouselLayoutLength == 1) {
            alert(language.You_must_have_at_least_one_card);
        } else {

            if ($('.dialogView').eq(insertFormIdx).find('.slideDiv .wc-carousel-item').length == 3) {
                $('.dialogView').eq(insertFormIdx).find('.next').hide();
                $('.dialogView').eq(insertFormIdx).find('.previous').hide();
            }

            $(".dialogView").eq(insertFormIdx).find('.slideDiv .wc-carousel-item').eq(idx).remove();
            $(this).parent().parent().prev().prev().remove();
            $(this).parent().parent().prev().remove();
            $(this).parent().parent().remove();
        }

    }

});

//다이얼로그생성모달 - 버튼삭제
$(document).on('click', '.btn_delete', function (e) {

    var trLength = $(this).parents('tbody').children().length;
    if (trLength == 1) {
        $(this).parents('.btnInsertDiv').html('');
        return;
    }
    $(this).parent().parent().remove();
});

//다이얼로그생성모달 - 버튼추가
$(document).on('click', '.carouseBtn', function (e) {

    var inputHtml = '<div><label>' + language.BUTTON + '</label></div>' +
        '<div class="form-group col-md-13"  style="padding-left:0; margin-top: 0px;">' +
        '<table class="cardCopyTbl" style="width:100%">' +
        '<col width="21%"><col width="1%"><col width="35%">' +
        '<col width="1%"><col width="35%"><col width="1%"><col width="6%">' +
        '<thead><tr>' +
        '<th>' + language.Type + '</th><th></th><th>' + language.NAME + '</th>' +
        '<th></th><th>' + language.CONTENTS + '</th><th></th><th></th>' +
        '</tr></thead>' +
        '<tbody>' +
        '<tr>' +
        '<td><select class="form-control" name="btnType"><option value="imBack" selected>imBack</option>' +
        '<option value="openURL">openURL</option></select></td>' +
        '<td></td><td><input type="text" name="cButtonName" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><input type="text" name="cButtonContent" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
        '<td></td><td><a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a></td>' +
        '</tr></tbody></table></div>';

    $btnInsertDiv = $(this).parent().prev().prev().prev();
    if ($btnInsertDiv.children().length == 0) {
        $btnInsertDiv.html(inputHtml);
        return;
    }
    var trLength = $(this).parent().prev().prev().prev().find('.cardCopyTbl tbody tr').length;
    if (trLength >= 1 && trLength < 4) {

        var inputTrHtml = '<tr>' +
            '<td><select class="form-control" name="btnType"><option value="imBack" selected>imBack</option>' +
            '<option value="openURL">openURL</option></select></td>' +
            '<td></td><td><input type="text" name="cButtonName" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
            '<td></td><td><input type="text" name="cButtonContent" class="form-control" placeholder="' + language.Please_enter + '"></td>' +
            '<td></td><td><a href="#" class="btn_delete" style="margin:0px;"><span class="fa fa-trash"></span></a></td>' +
            '</tr>'
        $(this).parent().prev().prev().prev().find('.cardCopyTbl tbody').append(inputTrHtml);
    } else {
        alert("버튼은 4개까지 추가할 수 있습니다.");
    }

});

//다이얼로그생성모달 - 카드추가 복사본!!
$(document).on('click', '.addCarouselBtn', function (e) {
    //var $newInsertForm = $insertForm.clone();
    //var $newDlgForm = $dlgForm.clone();
    //var $newCarouselForm = $carouselForm.clone();

    dlgForm = '<div class="textLayout">' +
        '<div class="form-group">' +
        '<label>' + language.DIALOG_BOX_TITLE + '</label>' +
        '<input type="text" name="dialogTitle" class="form-control" onkeyup="writeDialogTitle(this);" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>' + language.DIALOG_BOX_CONTENTS + '<span class="nec_ico">*</span></label>' +
        '<input type="text" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '</div>';

    carouselForm = '<div class="carouselLayout">' +
        '<div class="form-group">' +
        '<label>' + language.IMAGE_URL + '</label>' +
        '<input type="text" name="imgUrl" class="form-control" onkeyup="writeCarouselImg(this);" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '<div class="modal_con btnInsertDiv">' +
        '</div>' +
        '<div class="clear-both"></div>' +
        '<div class="btn_wrap" style="clear:both" >' +
        '<button type="button" class="btn btn-default deleteCard"><i class="fa fa-trash"></i> ' + language.DELETE_CARD + '</button>' +
        '</div>' +
        '<div class="btn_wrap" style="clear:both" >' +
        '<button type="button" class="btn btn-default carouseBtn"><i class="fa fa-plus"></i> ' + language.INSERT_MORE_BUTTON + '</button>' +
        '</div>' +
        '<div class="clear-both"></div>' +
        '</div>';

    if ($(this).parents('.insertForm').find('.carouselLayout').length == 10) {
        alert(language.Up_to_10_cards_can_be_added);
    } else {
        var idx = $(".addCarouselBtn:visible").index(this);
        var jdx = $('select[name=dlgType]').index(($(".addCarouselBtn:visible").eq(idx).parents('form[name=dialogLayout]').find('select[name=dlgType]')));
        //$('.addCarouselBtn').eq(0).parent().parent().remove();
        //$(this).parents('.insertForm').after( $newInsertForm);  
        //<div id="textLayout" style="display: block;">  </div>
        //var caraousHtml = '<div class="carouselLayout" style="display: block;">' + $carouselForm.html() + '</div>';
        var dlgFormHtml = '<div class="textLayout" style="display: block;">' + dlgForm + '</div>';
        $(this).parent().before('<div class="clear-both"></div>').before(dlgFormHtml).before(carouselForm);
        //$(this).parents('form[name=dialogLayout] .deleteInsertFormDiv').before('<div class="clear-both"></div>').after(dlgFormHtml).append(carouselForm);
        //$(this).parents('.insertForm').next().find('.clear-both').after($newDlgForm);
        var claerLen = $(this).parents('form[name=dialogLayout]').children('.clear-both').length - 1;
        $(this).parents('form[name=dialogLayout]').children('.clear-both').eq(claerLen).next().css('display', 'block');
        $(this).parents('form[name=dialogLayout]').children('.clear-both').eq(claerLen).next().next().css('display', 'block');
        //$(this).parent().parent().remove();
        //$(this).parent().css('display', 'none');
        $(this).parents('form[name=dialogLayout]').find('.addCarouselBtn:last').closest('div').css('display', 'inline-block');

        var inputUttrHtml = '<li class="wc-carousel-item">';
        inputUttrHtml += '<div class="wc-card hero">';
        inputUttrHtml += '<div class="wc-container imgContainer" >';
        inputUttrHtml += '<img src="https://bot.hyundai.com/assets/images/movieImg/teasure/02_teaser.jpg">';
        inputUttrHtml += '</div>';
        inputUttrHtml += '<h1>CARD_TITLE</h1>';
        inputUttrHtml += '<p class="carousel">CARD_TEXT</p>';
        inputUttrHtml += '<ul class="wc-card-buttons" style="padding-left:0px;"><li><button>BTN_1_TITLE</button></li></ul>';
        inputUttrHtml += '</div>';
        inputUttrHtml += '</li>';

        var kdx = $('.insertForm').index($(this).parents('.insertForm'));

        $('.dialogView').eq(jdx).find('#slideDiv' + kdx).children().append(inputUttrHtml);

        if ($('.dialogView').eq(jdx).find('#slideDiv' + kdx).children().children().length > 2) {
            $('#nextBtn' + jdx).show();
        }
    }
});

// input 엔터 감지
$(document).on("keypress", "input[name=matchUtterText]", function(e){ 
    if (e.keyCode === 13) {	//	Enter Key
        if ($(this).parent().find('select[name=multiMatchUtterSel]').length < 2) {
            if ($(this).val().trim() != '' && rememberUtterInput != $(this).val().trim()) {
                //$(this).focusout();
                $(this).trigger('blur');
            }
        }
    }
});


$(document).on("click", "#insert_similarQ_dlg", function () {
    $('#s_question').val('');
    var dlgID = $(this).attr("dlg_id");
    var qSeq = $(this).attr("q_seq");
  
    var tr = $(this).parent().parent();
    var td = tr.children();
    var show_question = td.eq(1).text();
    var show_intent = td.eq(2).text();
    //var show_entity = td.eq(3).text();

    $('#mother_q').text(show_question);
    //$('#mother_intent').text(show_intent);
    $('#mother_intent').val(show_intent);
    $('#sq_dlgId').val(dlgID);
    $('#sq_qSeq').val(qSeq);

    
    $('#s_question').attr('readonly', false);
    $('#similarQform').modal('show');
});



$(document).on("click", "#similarQBtn", function () {
    /*
    * relation table insert
    * qnamng table insert
    * 
    * */

    if ($('#s_question').val().trim() == '') {
        alert('유사질문을 입력 해 주세요.');
        return false;
    }

    var saveArr = new Array();
    var data = new Object() ;

    data.PROC_TYPE = "INSERT";
    data.LUIS_INTENT = $('#mother_intent').val();
    //data.LUIS_ENTITIES = "TEST"; //새로 설정한 값이 들어가야 함.
    data.DLG_ID = $('#sq_dlgId').val();
    data.DLG_QUESTION = $('#s_question').val();
    data.GROUP_ID = $('#sq_qSeq').val();

    saveArr.push(data);
    var jsonData = JSON.stringify(saveArr);
    var params = {
        'saveArr' : jsonData,
        'utterArr' : utterArr,
        'newArr' : newArr,
        'intentName' : data.LUIS_INTENT
    };

    $.ajax({
        type: 'POST',
        datatype: "JSON",
        data: params,
        url: '/qna/procSimilarQuestion',
        success: function(data) {
            console.log(data);
            if (data.status === 200) {
                alert(language['REGIST_SUCC']);
                window.location.reload();
            } else {
                alert(language['It_failed']);
            }
        }
    });
});

//유사질문 삭제
$(document).on("click", "#deleteSimilarBtn", function () {
    
    var saveArr = new Array();
    var data = new Object() ;

    data.PROC_TYPE = "DELETE";
    data.DEL_SEQ = del_similar_id;

    saveArr.push(data);
    var jsonData = JSON.stringify(saveArr);
    var params = {
        'saveArr' : jsonData
    };

    $.ajax({
        type: 'POST',
        datatype: "JSON",
        data: params,
        url: '/qna/procSimilarQuestion',
        success: function(data) {
            console.log(data);
            if (data.status === 200) {
                alert(language['REGIST_SUCC']);
                window.location.reload();
            } else {
                alert(language['It_failed']);
            }
        }
    });
});