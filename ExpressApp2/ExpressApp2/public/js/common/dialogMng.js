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

var rememberSelBoxHtml = '';
var $insertForm;
var $dlgForm;
var $carouselForm;
var $mediaForm;


$(document).ready(function () {

    // groupType 사양및 장단점 역할
    // sourceType 구분 역할
    var groupType = $('.selected').text();
    var sourceType = $('#tblSourceType').val();
    selectDlgByTxt(groupType, sourceType);

    //api selbox 초기설정
    //selectApiGroup();

    //검색 enter
    $('#iptDialog').keyup(function (e) {
        if (e.keyCode == 13) {
            searchIptDlg(1);
            //selectDlgByTxt('selectDlgByTxt', 'search');
        }
    });


    //그룹박스
    $('.selectbox .selected').click(function (e) {
        $('.selectOptionsbox').toggleClass('active');
        e.stopPropagation();
    });

    //그룹박스 영역 이외에 클릭시 그룹박스 닫기
    $('html').click(function (e) {

        if (!$(e.target).hasClass("selectArea")) {

            $('.selectOptionsbox').removeClass('active');
        }
    });

    $('#tblSourceType').change(function () {

        groupType = $('.selected').text();
        sourceType = $('#tblSourceType').val();
        $('#currentPage').val(1);
        rememberSelBoxHtml = $('#selBoxBody').html();

        selectDlgByTxt(groupType, sourceType);

    });
    
});
/*
function getGroupSeelectBox() {
    $.ajax({
        type: 'POST',
        url: '/learning/getGroupSelectBox',
        isloading: true,
        success: function (data) {
            var groupL = data.groupL;
            var groupM = data.groupM;

            var groupHtml = "";

            for (var i = 0; i < groupL.length; i++) {
                groupHtml += '<option value="' + groupL[i].GROUPL + '">' + groupL[i].GROUPL + '</option>';
            }

            $("#largeGroup").html(groupHtml);

            groupHtml = "";
            for (var i = 0; i < groupM.length; i++) {
                groupHtml += '<option value="' + groupM[i].GROUPM + '">' + groupM[i].GROUPM + '</option>';
            }

            $("#middleGroup").html(groupHtml);
            $("#predictIntent").html(groupHtml);

        }
    });
}
*/

//오른쪽 버튼 클릭시 슬라이드
function nextBtn(botChatNum) {

    $("#slideDiv" + botChatNum).animate({ scrollLeft: ($("#slideDiv" + botChatNum).scrollLeft() + 312) }, 500, function () {

        if ($("#slideDiv" + botChatNum).scrollLeft() ==
            ($("#slideDiv" + botChatNum).find(".wc-carousel-item").length - 2) * 156) {
            $("#nextBtn" + botChatNum).hide();
        }

    });

    $("#prevBtn" + botChatNum).show();
}

//왼쪽 버튼 클릭시 슬라이드
function prevBtn(botChatNum) {

    $("#slideDiv" + botChatNum).animate({ scrollLeft: ($("#slideDiv" + botChatNum).scrollLeft() - 312) }, 500, function () {

        if ($("#slideDiv" + botChatNum).scrollLeft() == 0) {
            $("#prevBtn" + botChatNum).hide();
        }
    });

    $("#nextBtn" + botChatNum).show();
}

function createDialog() {

    var idx = $('form[name=dialogLayout]').length;
    var array = [];
    var exit = false;

    //$('.insertForm input[name=dialogText]').each(function (index) {
    $('.insertForm textarea[name=dialogText]').each(function (index) {
        if ($(this).val().trim() === "") {
            alert(language.You_must_enter_the_dialog_text);
            exit = true;
            return false;
        }
    });
    //dialogText textarea 값 치환
    var temp = $("#dialogText").val();
    temp = temp.replace(/(?:\r\n|\r|\n)/g, '/n');
    $("#dialogText").val(temp);

    if (exit) return;

    $('.insertForm input[name=mediaImgUrl]').each(function (index) {
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
    //JSON.stringify($("form[name=appInsertForm]").serializeObject());
    array[array.length] = JSON.stringify($("form[name=appInsertForm]").serializeObject());//JSON.stringify($("form[name=appInsertForm]"));

    $.ajax({
        url: '/learning/addDialog',
        dataType: 'json',
        type: 'POST',
        data: { 'data': array, /*'entities' : chkEntities*/ },
        success: function (data) {
            //alert(language.Added);

            var inputUttrHtml = '';
            for (var i = 0; i < data.list.length; i++) {
                inputUttrHtml += '<input type="hidden" name="dlgId" value="' + data.list[i] + '"/>';
            }
            //var largeGroup = $('#appInsertForm').find('#largeGroup')[0].value
            var largeGroup;
            var middleGroup;
            $('#appInsertForm').find('[name=middleGroup]').each(function () {
                if ($(this).attr('disabled') == undefined) {
                    luisIntent = $(this).val();
                    return false;
                }
            })
            $('.newMidBtn').click();
            $('.cancelMidBtn').click();

            inputUttrHtml += '<input type="hidden" name="largeGroup" value="' + largeGroup + '"/>';
            inputUttrHtml += '<input type="hidden" name="middleGroup" value="' + middleGroup + '"/>';

            var createDlgClone = $('.dialogView').children().clone();
            $('.dialog_box').html('');
            $('.dialog_box').append(createDlgClone);
            $('.dialog_box').append(inputUttrHtml);
            $('.createDlgModalClose').click();

            $('#proc_content').html(language.Added);
            $('#footer_button').html('<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</button>');
            $('#procDialog').modal('show');
            
            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }
    });
}

//selectbox 중그룹 및 소그룹 찾기 kh
$(document).on('change', '.searchGroup', function () {

    if ($(this).attr('id') == 'searchGroupL') {

        searchGroup($(this).val(), 'searchMedium', 1);
    } else if ($(this).attr('id') == 'searchGroupM') {
        searchGroup($(this).val(), 'searchSmall', 1, $('#searchGroupL').val());
    }

});

//search버튼 클릭시 다이얼로그 검색
$(document).on('click', '#searchDlgBtn', function () {

    var group = {
        sourceType2: $('#sourceType2').val(),
        searchTitleTxt: $('#searchTitleTxt').val(),
        searchDescTxt: $('#searchDescTxt').val()
    }

    $('#currentPage').val(1);
    selectDlgByFilter(group);

});

var searchGroups; // 페이징을 위해서 검색 후 그룹들을 담아둘 변수
function selectDlgByFilter(group) {

    sourceType2 = $('#sourceType2').val();
    searchTitleTxt = $('#searchTitleTxt').val();
    searchDescTxt = $('#searchDescTxt').val();

    params = {
        //'searchTxt':$('#iptDialog').val(),
        'currentPage': ($('#currentPage').val() == '') ? 1 : $('#currentPage').val(),
        'searchTitleTxt': group.searchTitleTxt,
        'searchDescTxt': group.searchDescTxt,
        'sourceType2': group.sourceType2
    };
    if (searchTitleTxt !== '') {
        params.searchTitleTxt = searchTitleTxt;
    }
    if (searchDescTxt !== '') {
        params.searchDescTxt = searchDescTxt;
    }

    $.tiAjax({
        type: 'POST',
        url: '/qna/dialogList',
        data: params,
        isloading: true,
        success: function (data) {

            $('#dialogTbltbody').html('');
            var item = '';
            if (data.list.length > 0) {

                for (var i = 0; i < data.list.length; i++) {
                    if(data.list[i].DLG_TYPE==2){
                        type_name = "TEXT";
                    }else if(data.list[i].DLG_TYPE==3){
                        type_name = "CARD";
                    }else if(data.list[i].DLG_TYPE==4){
                        type_name = "MEDIA";
                    }else{
                        type_name = "NONE";
                    }
                    item += '<tr>' +
                        '<td>' + data.list[i].NUM + '</td>' +
                        '<td class="txt_left">' + data.list[i].DLG_NAME + '</td>' +
                        '<td class="txt_left tex01"><a href="#" onclick="searchDialog(' + data.list[i].DLG_ID + ');return false;">' + data.list[i].DLG_DESCRIPTION + '</a></td>' +
                        '<td>' + type_name + '</td>' +
                        '<td><a href="#" onclick="deleteDialog(' + data.list[i].DLG_ID + ');return false;"><span class="fa fa-trash"></span></a></td>' +
                        '</tr>';
                }

            } else {
                item += '<tr style="height: 175px;">' +
                    '<td colspan="5">' + language.NO_DATA + '</td>' +
                    '</tr>';
            }

            $('#dialogTbltbody').append(item);

            $('#pagination').html('').append(data.pageList);
            currentSearchNum = 1;
            searchGroups = group;
        }
    });

}

//그룹메뉴에서 모두보기 눌렀을시 리스트 초기화
$(document).on('click', '.allGroup', function () {
    var groupType = $(this).text();
    var sourceType = $('#tblSourceType').val();
    $('#currentPage').val(1);
    $('.selected').text($(this).text());
    $('.selectOptionsbox').removeClass('active');
    selectDlgByTxt(groupType, sourceType);
})

// 소그룹 클릭시 리스트 출력
$(document).on('click', '.smallGroup', function () {

    var group = {
        searchGroupL: $('.currentGroupL').text(),
        searchGroupM: $('.currentGroupM').text(),
        searchGroupS: $(this).children().text(),
        sourceType2: $('#tblSourceType').val()
    }

    $('.selected').text($(this).find('.menuName').text());
    $('.selectOptionsbox').removeClass('active');


    $('#currentPage').val(1);
    selectDlgByFilter(group);
});
/*
/** 대그룹 혹은 중그룹 클릭시 하위 그룹 검색 
$(document).on('click', '.checktoggle', function (e) {

    // 대그룹 클릭시 중그룹 검색
    if ($(this).hasClass('largeGroup')) {

        if ($(this).parent().hasClass('active')) {

            $(this).parent().next().slideToggle(200);
            $(this).parent().toggleClass('active').toggleClass('bgcolor');

        } else {
            if ($(this).parent().next().children().size() == 0) {
                searchGroup($(this).prev().text(), 'searchMedium');
            }

            $('.largeGroup').parent().removeClass('active').removeClass('bgcolor');
            $('.largeGroup').parent().next().slideUp(200);
            $('.currentGroupL').removeClass('currentGroupL');

            $(this).prev().addClass('currentGroupL');
            $(this).parent().addClass('active').addClass('bgcolor');
            $(this).parent().next().slideDown(200);

            if (searchGroupM !== '') {
                if ($('#selBoxBody').find('label[for=' + searchGroupL + ']').parents('li')
                    .find('label[for=' + searchGroupM + ']').parent().next().css('display') !== 'block') {
                    if (searchGroupM !== '') {
                        $('#selBoxBody').find('label[for=' + searchGroupL + ']').parents('li')
                            .find('label[for=' + searchGroupM + ']').next().trigger('click');
                    }
                }
            }

        }
    }

    // 중분류 클릭시 소분류 검색
    if ($(this).hasClass('mediumGroup')) {

        if ($(this).parent().hasClass('active')) {
            $(this).parent().next().slideToggle(200);
            $(this).parent().toggleClass('active').toggleClass('bgcolor');
        } else {
            if ($(this).parent().next().children().size() == 0) {
                searchGroup($(this).prev().text(), 'searchSmall', 0, $('.groupL.currentGroupL').text());
            }

            $('.mediumGroup').parent().removeClass('active').removeClass('bgcolor');
            $('.mediumGroup').parent().next().slideUp(200);
            $('.currentGroupM').removeClass('currentGroupM');

            $(this).prev().addClass('currentGroupM');
            $(this).parent().addClass('active').addClass('bgcolor');
            $(this).parent().next().slideDown(200);
        }
    }
});

function searchGroup(groupName, group, type, groupL) {
    $.tiAjax({
        type: 'POST',
        url: '/learning/searchGroup',
        data: { 'groupName': groupName, 'group': group, 'searchType': type, 'groupL': groupL, 'searchTxt': $('#iptDialog').val() },
        isloading: true,
        success: function (data) {
            if (type == 1) {

                if (group == 'searchMedium') {

                    var item = '<option value="">' + language.Middle_group + '</option>';

                    for (var i = 0; i < data.groupList.length; i++) {
                        if (searchGroupL !== '') {
                            //if (groupName === searchGroupL) {
                            item += '<option>' + data.groupList[i].mediumGroup + '</option>';
                            //}
                        } else {
                            item += '<option>' + data.groupList[i].mediumGroup + '</option>';
                        }
                    }
                    $('#searchGroupM').html('');
                    $('#searchGroupS').html('');
                    $('#searchGroupS').html('<option value="">' + language.Small_group + '</option>');
                    $('#searchGroupM').append(item);

                    //$('#selBoxBody').find('label[for=' + groupName + ']').next().trigger('click');

                    if (data.groupList.length > 0) {
                        var item2 = '';

                        for (var i = 0; i < data.groupList.length; i++) {
                            item2 += '<li class="selectArea">' +
                                '<div class="heading selectArea">' +
                                '<label class="selectArea groupM" for="' + data.groupList[i].mediumGroup + '">' + data.groupList[i].mediumGroup + '</label>' +
                                '<span class="checktoggle mediumGroup selectArea"></span></div>' +
                                '<ul class="checklist2 selectArea ' + data.groupList[i].mediumGroup + ' ' + groupName + '">' +
                                '</ul>' +
                                '</li>';

                        }
                    }
                    $('#' + groupName).empty();
                    $('#' + groupName).append(item2);
                    $('.checklist2').hide();


                } else if (group == 'searchSmall') {
                    var item = '<option value="">' + language.Small_group + '</option>';

                    for (var i = 0; i < data.groupList.length; i++) {
                        if (searchGroupM !== '') {
                            //if (data.groupList[i].smallGroup === searchGroupM) {
                            item += '<option>' + data.groupList[i].smallGroup + '</option>';
                            //}
                        } else {
                            item += '<option>' + data.groupList[i].smallGroup + '</option>';
                        }
                    }

                    $('#searchGroupS').html('');
                    $('#searchGroupS').append(item);

                    //$('#selBoxBody').find('label[for=' + $('#searchGroupL').val() + ']').parents('li')
                    //                .find('label[for=' + groupName + ']').next().trigger('click');

                    if (data.groupList.length > 0) {
                        var item2 = '';

                        for (var i = 0; i < data.groupList.length; i++) {

                            item2 += '<li class="smallGroup">' +
                                '<label for="check2 groupS" class="menuName">' + data.groupList[i].smallGroup + '</label>' +
                                '</li>';
                        }
                    }
                    $('.' + groupName + '.' + groupL).empty();
                    $('.' + groupName + '.' + groupL).append(item2);


                }
            } else {

                if (group == 'searchMedium') {

                    if (data.groupList.length > 0) {
                        var item2 = '';

                        for (var i = 0; i < data.groupList.length; i++) {
                            item2 += '<li class="selectArea">' +
                                '<div class="heading selectArea">' +
                                '<label class="selectArea groupM" for="' + data.groupList[i].mediumGroup + '">' + data.groupList[i].mediumGroup + '</label>' +
                                '<span class="checktoggle mediumGroup selectArea"></span></div>' +
                                '<ul class="checklist2 selectArea ' + data.groupList[i].mediumGroup + ' ' + groupName + '">' +
                                '</ul>' +
                                '</li>';

                        }
                    }
                    $('#' + groupName).empty();
                    $('#' + groupName).append(item2);
                    $('.checklist2').hide();

                } else if (group == 'searchSmall') {

                    if (data.groupList.length > 0) {
                        var item2 = '';

                        for (var i = 0; i < data.groupList.length; i++) {

                            item2 += '<li class="smallGroup">' +
                                '<label for="check2 groupS" class="menuName">' + data.groupList[i].smallGroup + '</label>' +
                                '</li>';
                        }
                    }
                    $('.' + groupName + '.' + groupL).empty();
                    $('.' + groupName + '.' + groupL).append(item2);
                }
            }

        }
    });
}
*/
//dialog 페이지 첫 로딩때도 실행
var sourceType2 = $('#sourceType2').val();
var searchTitleTxt = '';
var searchDescTxt = '';
function selectDlgByTxt(groupType, sourceType) {
    if (sourceType === 'search') {
        sourceType = $('#sourceType2').val();
    }
    params = {
        'sourceType2': sourceType2,
        'currentPage': ($('#currentPage').val() == '') ? 1 : $('#currentPage').val(),
        'groupType': groupType,
        'sourceType': sourceType,
        'searchTitleTxt': $('#searchTitleTxt').val(),
        'searchDescTxt': $('#searchDescTxt').val()
    };

    $.tiAjax({
        type: 'POST',
        url: '/qna/dialogList',
        data: params,
        isloading: true,
        success: function (data) {
            searchTitleTxt = $('#searchTitleTxt').val();
            searchDescTxt = $('#searchDescTxt').val();
            $('#dialogTbltbody').html('');
            var item = '';
            var type_name = "";
            if (data.list.length > 0) {
                for (var i = 0; i < data.list.length; i++) {
                    if(data.list[i].DLG_TYPE==2){
                        type_name = language.DLG_TEXT;
                    }else if(data.list[i].DLG_TYPE==3){
                        type_name = language.DLG_CARD;
                    }else if(data.list[i].DLG_TYPE==4){
                        type_name = language.DLG_MEDIA;
                    }else{
                        type_name = "NONE";
                    }
                    item += '<tr>' +
                        '<td>' + data.list[i].NUM + '</td>' +
                        '<td class="txt_left">' + data.list[i].DLG_NAME + '</td>' +
                        '<td class="txt_left tex01"><a href="#"  onclick="searchDialog(' + data.list[i].DLG_ID + ');return false;">' + data.list[i].DLG_DESCRIPTION + '</a></td>' +
                        '<td>' + type_name + '</td>' +
                        '<td><a href="#" onclick="deleteDialogModal(' + data.list[i].DLG_ID + ');return false;"><span class="fa fa-trash"></span></a></td>' +
                        '</tr>';

                }
            } else {
                item += '<tr style="height: 175px;">' +
                    '<td colspan="5">' + language.NO_DATA + '</td>' +
                    '</tr>';
            }

            currentSearchNum = 2;
            $('#dialogTbltbody').append(item);

            $('#pagination').html('').append(data.pageList);

            if (rememberSelBoxHtml !== '') {
                $('#selBoxBody').html(rememberSelBoxHtml);
            }

        }
    });
}




var currentSearchNum = 2; // 0: 검색어로 검색한 경우, 1: 테이블 위 그룹으로 검색한 경우, 2: 테이블에 있는 그룹으로 검색한 경우
$(document).on('click', '.li_paging', function (e) {

    if (!$(this).hasClass('active')) {
        $('#currentPage').val($(this).val());
        if (currentSearchNum == 0) {
            searchIptDlg();
        } else if (currentSearchNum == 1) {
            selectDlgByFilter(searchGroups);
        } else if (currentSearchNum == 2) {

            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }
    }
});

//---------------두연 추가
var insertForm;
var dlgForm;
var carouselForm;
var mediaForm;
var chkEntities;
var addCarouselForm;
var deleteInsertForm;
function openModalBox(target) {

    $('#title').val('');

    // 화면의 높이와 너비를 변수로 만듭니다.
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();

    // 마스크의 높이와 너비를 화면의 높이와 너비 변수로 설정합니다.
    $('.mask').css({ 'width': maskWidth, 'height': maskHeight });


    // 레이어 팝업을 가운데로 띄우기 위해 화면의 높이와 너비의 가운데 값과 스크롤 값을 더하여 변수로 만듭니다.
    var left = ($(window).scrollLeft() + ($(window).width() - $(target).width()) / 2);
    var top = ($(window).scrollTop() + ($(window).height() - $(target).height()) / 2);

    // css 스타일을 변경합니다.
    $(target).css({ 'left': left, 'top': top, 'position': 'absolute' });

    // 레이어 팝업을 띄웁니다.
    setTimeout(function () {
        $(target).fadeIn();
        $('#dialogPreview').css({ 'height': '80%' });
    }, 250);

    $('html').css({ 'overflow': 'hidden', 'height': '100%' });
    $('#element').on('scroll touchmove mousewheel', function (event) { // 터치무브와 마우스휠 스크롤 방지
        event.preventDefault();
        event.stopPropagation();
        return false;
    });
    wrapWindowByMask();

    //carousel clone 초기값 저장
    //$insertForm = $('#commonLayout .insertForm').eq(0).clone();
    insertForm = '<div class="insertForm">';
    insertForm += '<div class="form-group">';
    insertForm += '<form name="dialogLayout" id="dialogLayout">';
    insertForm += '<label>' + language.DIALOG_BOX_TYPE + '<span class="nec_ico">*</span> </label>';
    insertForm += '<select class="form-control" name="dlgType">';
    insertForm += '<option value="2">' + language.TEXT_TYPE + '</option>';
    insertForm += '<option value="3">' + language.CARD_TYPE + '</option>';
    insertForm += '<option value="4">' + language.MEDIA_TYPE + '</option>';
    insertForm += '</select>';
    insertForm += '<div class="btn_wrap" style="clear:both" >';
    insertForm += '</div>';
    insertForm += '<div class="clear-both"></div>';
    insertForm += '</form>';
    insertForm += '</div>';
    insertForm += '</div>';

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

    addCarouselForm = '<div class="btn_wrap addCarouselBtnDiv" style="clear:both" >' +
        '<button type="button" class="btn btn-default addCarouselBtn"><i class="fa fa-plus"></i> ' + language.INSERT_MORE_CARDS + '</button>' +
        '</div>'

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
        //'<input type="text" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder="' + language.Please_enter + '">' +
        '<textarea id="dialogText" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder=" ' + language.Please_enter + ' " rows="5"></textarea>' +
        '</div>' +
        '</div>';

    deleteInsertForm = '<div class="btn_wrap deleteInsertFormDiv" style="clear:both;" >' +
        '<button type="button" class="btn btn-default deleteInsertForm"><i class="fa fa-trash"></i> ' + language.DELETE_DIALOG + '</button>' +
        '</div>'
    //$dlgForm = $('#commonLayout .textLayout').eq(0).clone();
    //$carouselForm = $('#commonLayout .carouselLayout').eq(0).clone();
    //$mediaForm = $('#commonLayout .mediaLayout').eq(0).clone();
    if (target == "#create_dlg") {

        $(".insertForm form").append($(".textLayout").clone(true));
        $(".insertForm form").append(deleteInsertForm);

        $('h4#myModalLabel.modal-title').text(language.CREATE_DIALOG_BOX);
        $('#description').text('');

        $(".insertForm .textLayout").css("display", "block");
        /*
        * intent 부분이 text 타입
        */
        var $iptLuisIntent = $('input[name=predictIntent]');
        var $selectLuisIntent = $('select[name=predictIntent]');

        $iptLuisIntent.show();
        $iptLuisIntent.removeAttr('disabled');

        $selectLuisIntent.hide();
        $selectLuisIntent.attr('disabled', 'disabled');
    }

    if (target == "#search_dlg") {
        selectGroup('searchLargeGroup');
    }

}

function wrapWindowByMask() { //화면의 높이와 너비를 구한다. 
    var maskHeight = $(document).height();
    var maskWidth = $(window).width(); //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채운다. 
    $('#layoutBackground').css({ 'width': maskWidth, 'height': maskHeight }); //마스크의 투명도 처리 
    $('#layoutBackground').fadeTo("fast", 0.7);
}

function selectInent(intent) {
    //intent하위 entity 존재하면 entity select box disable제거되게 구현해야함
    $('#entityList').removeAttr("disabled");
}

function selectEntity(entity) {
    //intent하위 entity 존재하면 entity select box disable제거되게 구현해야함
    $('#btnAddDlg').removeAttr("disabled");
    $('#btnAddDlg').removeClass("disable");
}

function initMordal(objId, objName) {
    //<option selected="selected" disabled="disabled">Select Intent<!-- 서비스 선택 --></option>
    if (objId == 'entityList') {
        $('#' + objId).attr("disabled", "disabled");
    }
    $('#btnAddDlg').attr("disabled", "disabled");
    $('#btnAddDlg').addClass("disable");

    $('#' + objId + ' option:eq(0)').remove();
    $('#' + objId).prepend('<option selected="selected" disabled="disabled">' + objName + '</option>');

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

//다이얼로그 생성
function insertDialog() {

    $.ajax({
        url: '/learning/insertDialog',
        dataType: 'json',
        type: 'POST',
        data: $('#appInsertForm').serializeObject(),
        success: function (data) {
            if (data.status == 200) {
                var inputUttrHtml = '';
                inputUttrHtml += '<tr> <td> <div class="check-radio-tweak-wrapper" type="checkbox">';
                inputUttrHtml += '<input name="dlgChk" class="tweak-input"  onclick="" type="checkbox"/> </div> </td>';
                inputUttrHtml += '<td class="txt_left" ><input type="hidden" name="' + data.DLG_ID + '" value="' + data.DLG_ID + '" />' + data.CARD_TEXT + '</td></tr>';
                $('#dlgListTable').find('tbody').prepend(inputUttrHtml);

                $('#addDialogClose').click();
            }
        }
    });
}
/** 모달 끝 */






var botChatNum4Desc = 1;
//dlg 저장
var dlgMap = new Object();
function searchDialog(dlgID) {

    $insertForm = $('#commonLayout .insertForm').eq(0).clone();
    $dlgForm = $('#commonLayout .textLayout').eq(0).clone();
    $carouselForm = $('#commonLayout .carouselLayout').eq(0).clone();
    $mediaForm = $('#commonLayout .mediaLayout').eq(0).clone();

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
        //'<input type="text" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder="' + language.Please_enter + '">' +
        '<textarea id="dialogText" name="dialogText" class="form-control" onkeyup="writeDialog(this);" placeholder=" ' + language.Please_enter + ' " rows="5"></textarea>' +
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
        data: { 'dlgID': dlgID },      //데이터를 json 형식, 객체형식으로 전송
        beforeSend: function () {

            var width = 0;
            var height = 0;
            var left = 0;
            var top = 0;

            width = 50;
            height = 50;

            top = ( $(window).height() - height ) / 2 + $(window).scrollTop();
            left = ( $(window).width() - width ) / 2 + $(window).scrollLeft();

            $("#loadingBar").addClass("in");
            $("#loadingImg").css({position:'absolute'}).css({left:left,top:top});
            $("#loadingBar").css("display","block");
        },
        complete: function () {
            $("#loadingBar").removeClass("in");
            $("#loadingBar").css("display","none");      
        },
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
                        var cardTextHtml = tmp.dlg[j].CARD_TEXT;
                        var dlgTextArea = tmp.dlg[j].CARD_TEXT;;
                        cardTextHtml = cardTextHtml.replace(/\/n/gi,'</br>');
                        dlgTextArea = dlgTextArea.replace(/\/n/gi,'\r\n');
                        if (tmp.dlg[j].DLG_TYPE == 2) {

                            inputUttrHtml += '<div class="wc-message wc-message-from-bot" style="width:200px">';
                            inputUttrHtml += '<div class="wc-message-content">';
                            inputUttrHtml += '<svg class="wc-message-callout"></svg>';
                            inputUttrHtml += '<div><div class="format-markdown"><div class="textMent">';
                            inputUttrHtml += '<input type="hidden" name="dlgId" value="' + tmp.dlg[j].DLG_ID + '"/>';
                            inputUttrHtml += '<h1 class="textTitle">' + tmp.dlg[j].CARD_TITLE + '</h1>';
                            inputUttrHtml += '<div class="dlg_content">';
                            //inputUttrHtml += tmp.dlg[j].CARD_TEXT;
                            inputUttrHtml += cardTextHtml;
                            inputUttrHtml += '</div>';
                            inputUttrHtml += '</div></div></div></div></div>';

                            $(".insertForm form").append(dlgForm);
                            $(".insertForm form").append(deleteInsertForm);

                            $("#dialogLayout").eq(j).find("select[name=dlgType]").val("2").prop("selected", true);
                            $("#dialogLayout").eq(j).find("input[name=dialogTitle]").val(tmp.dlg[j].CARD_TITLE);
                            //$("#dialogLayout").eq(j).find("input[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);
                            //$("#dialogLayout").eq(j).find("textarea[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);
                            $("#dialogLayout").eq(j).find("textarea[name=dialogText]").val(dlgTextArea);
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

                                //inputUttrHtml += '<p class="carousel" style="height:20px;min-height:20px;">' + /*cardtext*/ tmp.dlg[j].CARD_TEXT + '</p>';
                                inputUttrHtml += '<p class="carousel">' + /*cardtext*/ cardTextHtml + '</p>';
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
                            //$("#dialogLayout").find(".textLayout").eq(j).find("input[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);
                            //$("#dialogLayout").find(".textLayout").eq(j).find("textarea[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);
                            $("#dialogLayout").find(".textLayout").eq(j).find("textarea[name=dialogText]").val(dlgTextArea);
                            $("#dialogLayout").find(".carouselLayout").eq(j).find("input[name=imgUrl]").val(tmp.dlg[j].IMG_URL);
                            $("#dialogLayout").find(".carouselLayout").eq(j).find("select[name=cardValue]").val(tmp.dlg[j].CARD_VALUE).prop("selected", true);

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
                            //$("#dialogLayout").find(".textLayout").eq(j).find("input[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);
                            $("#dialogLayout").find(".textLayout").eq(j).find("textarea[name=dialogText]").val(tmp.dlg[j].CARD_TEXT);

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
                    //}


                    //inputUttrHtml += '</div>';
                    //inputUttrHtml += '</div>';
                }
            }
            $('.dialogView').html(inputUttrHtml);
            //$('#dialogShow').prepend(inputUttrHtml);

            /*
    * intent 부분이 select 타입
    */
            var $iptLuisIntent = $('input[name=predictIntent]');
            var $selectLuisIntent = $('select[name=predictIntent]');

            $selectLuisIntent.show();
            $selectLuisIntent.removeAttr('disabled');

            $iptLuisIntent.hide();
            $iptLuisIntent.attr('disabled', 'disabled');

            //대화상자 수정 추가
            $('h4#myModalLabel.modal-title').text(language.UPDATE_DIALOG_BOX);
            $('#description').val(result['list'][0].DLG_DESCRIPTION);
            $('#title').val(result['list'][0].DLG_NAME);
           
            $("#createDialog").attr('onclick', 'updateDialog()');

            //$(".insertForm .textLayout").css("display","block");

            $('#myModal2').modal('show');

        }


    }); // ------      ajax 끝-----------------

}


//다이얼로그 생성 모달창 - 중그룹 신규버튼
$(document).on('click', '.newMidBtn, .cancelMidBtn', function () {

    var $iptMiddleGroup = $('input[name=middleGroup]');
    var $selectMiddleGroup = $('select[name=middleGroup]');

    if ($(this).hasClass('newMidBtn')) {
        $('.newMidBtn').hide();
        $('.cancelMidBtn').show();

        $iptMiddleGroup.show();
        $iptMiddleGroup.removeAttr('disabled');

        $selectMiddleGroup.hide();
        $selectMiddleGroup.attr('disabled', 'disabled');
    } else {
        $('.newMidBtn').show();
        $('.cancelMidBtn').hide();

        $selectMiddleGroup.show();
        $selectMiddleGroup.removeAttr('disabled');

        $iptMiddleGroup.hide();
        $iptMiddleGroup.attr('disabled', 'disabled');
    }
})