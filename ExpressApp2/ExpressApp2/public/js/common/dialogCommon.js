var language;
; (function ($) {
    $.ajax({
        url: '/jsLang',
        dataType: 'json',
        type: 'POST',
        success: function (data) {
            language = data.lang;

        }
    });
})(jQuery);

$(document).ready(function() {
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
        //insertForm += '<input type="text" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder=" ' + language.Please_enter + ' ">';
        insertForm += '<textarea id="dialogText" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder=" ' + language.Please_enter + ' " rows="5"></textarea>';
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
            '<div class="form-group form-inline">' +
            '<label>Card_Mobile</label>' +
            '&nbsp;&nbsp;<select class="form-control" name="cardValue" id="cardValue"><option value="">미적용</option><option value="m^^">적용</option></select>' +
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
        
        //dyyoo change이벤트 후 미리보기 적용. keycode:17 - ctrl한번 누르기
        /*
        var e = jQuery.Event( "keyup", { keyCode: 17 } ); 
        $("input[name=dialogTitle]").trigger(e);
        //$("input[name=dialogText]").trigger(e);
        $("textarea[name=dialogText]").trigger(e);
        $("input[name=imgUrl]").trigger(e);
        $("input[name=mediaUrl]").trigger(e);
        */
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
});

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
        //var jcx = $(e).parents('.insertForm').find('input[name=dialogText]').index(e);
        var jcx = $(e).parents('.insertForm').find('textarea[name=dialogText]').index(e);
        if ($(e).parent().prev().find('input[name=dialogTitle]').val() == '') {
            $('.dialogView').children().eq(icx).find('ul:eq(0)').children().eq(jcx).find('h1').text('');
        }
        var test = e.value;
        test = test.replace(/(?:\r\n|\r|\n)/g, '\n');
        var obj = $('.dialogView').children().eq(icx).find('ul:eq(0)').children().eq(jcx).find('p').text(test);
        obj.html(obj.html().replace(/\n/g,'<br/>'));
        //$('.dialogView').children().eq(icx).find('ul:eq(0)').children().eq(jcx).find('p').text(e.value);


    } else if ($(e).parents('.insertForm').find('select[name=dlgType]').val() == 4) {
        $('.dialogView h1').eq(idx).text(e.value);
    } else {
        //$('.dialogView .textMent p:eq(' + idx + ')').html(e.value);
        //$('.dialogView').children().eq(icx).find('.textMent p:eq(' + idx + ')').html(e.value);
        if ($(e).parent().prev().find('input[name=dialogTitle]').val() == '') {
            $('.dialogView').children().eq(icx).find('.textMent .textTitle').text('');
        }
        var test = e.value;
        test = test.replace(/(?:\r\n|\r|\n)/g, '\n');
        var obj = $('.dialogView').children().eq(icx).find('.textMent .dlg_content').text(test);
        obj.html(obj.html().replace(/\n/g,'<br/>'));
    }

}

//다이얼로그생성모달 - 다이얼로그삭제
$(document).on('click', '.deleteInsertForm', function (e) {

    insertFormLength = $('.insertForm').length;
    if (insertFormLength == 1) {
        $('#alertMsg').text(language.You_must_have_one_dialog_by_default);
        $('#alertBtnModal').modal('show');
        //alert(language.You_must_have_one_dialog_by_default);
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
        //'<input type="text" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder="' + language.Please_enter + '">' +
        '<textarea id="dialogText" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder=" ' + language.Please_enter + ' " rows="5"></textarea>' +
        '</div>' +
        '</div>';

    carouselForm = '<div class="carouselLayout">' +
        '<div class="form-group">' +
        '<label>' + language.IMAGE_URL + '</label>' +
        '<input type="text" name="imgUrl" class="form-control" onkeyup="writeCarouselImg(this);" placeholder="' + language.Please_enter + '">' +
        '</div>' +
        '<div class="form-group form-inline">' +
        '<label>Card_Mobile</label>' +
        '&nbsp;&nbsp;<select class="form-control" name="cardValue" id="cardValue"><option value="">미적용</option><option value="m^^">적용</option></select>' +
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
            //alert(language.You_must_enter_a_Dialog_Title);
            $('#alertMsg').text(language.You_must_enter_a_Dialog_Title);
            $('#alertBtnModal').modal('show');
            exit = true;
            return false;
        }
    });

    //dialogText textarea 값 치환
    var temp = $("#dialogText").val();
    temp = temp.replace(/(?:\r\n|\r|\n)/g, '/n');
    $("#dialogText").val(temp);

    if (exit) return;
    $('.insertForm input[name=imgUrl]').each(function (index) {
        if ($(this).val().trim() === "") {
            $('#alertMsg').text(language.ImageURL_must_be_entered);
            $('#alertBtnModal').modal('show');
            //alert(language.ImageURL_must_be_entered);
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
            
            $('#proc_content').html(language.REGIST_SUCC);
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> ' + language.CLOSE +'</button>');
            $('#procDialog').modal('show');
            
            $('.createDlgModalClose').click();

            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }

    });
}

var deleteDlgId = "";
function deleteDialogModal(dlgId) {
    deleteDlgId = dlgId;
    $('#proc_content').html(language.IS_DELETE_CONFIRM);
    $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> ' + language.CLOSE +'</button><button type="button" class="btn btn-primary" id="deleteDialogBtn" onClick="deleteDialog();"><i class="fa fa-trash"></i> ' + language.DELETE +'</button>');
    $('#procDialog').modal('show');
}

function deleteDialog() {
    $('#procDialog').modal('hide');
    $.ajax({
        url: '/learning/deleteDialog',                //주소
        dataType: 'json',                  //데이터 형식
        type: 'POST',                      //전송 타입
        data: { 'dlgId': deleteDlgId },      //데이터를 json 형식, 객체형식으로 전송

        success: function (result) {
            //alert('delele complete');
            $('#proc_content').html(language.Deleted);
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
            $('#procDialog').modal('show');
            $('.createDlgModalClose').click();
            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }

    });
}

