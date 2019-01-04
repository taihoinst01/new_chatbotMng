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
    //getEntityList();
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
    
    $('#addUtterModalBtn').click(function() {
        var inputUtter = $('#s_question').val().trim();
        if (inputUtter == '') {
            $('#alertMsg').text('공백을 입력할 수 없습니다.');
            $('#alertBtnModal').modal('show');
            //alert('공백을 입력할 수 없습니다.');
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
    utterBodyHtml += "<option value='1' selected>" + language.SIMPLE_ENTITY + "</option>";
    utterBodyHtml += "<option value='3'>" + language.HIERARCHY_ENTITY + "</option>";
    utterBodyHtml += "<option value='4'>" + language.COMPOSITE_ENTITY + "</option>";
    //utterBodyHtml += "<option value='5'>" + language.CLOSED_LIST_ENTITY + "</option>";
    utterBodyHtml += "</select>";

    utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
    utterBodyHtml += "<option value='NONE'>" + language.SELECT + "</option>";
    for (var j=0; j<simpleList.length; j++) {
        utterBodyHtml += "<option value='" + simpleList[j].ENTITY_NAME + "'>" + simpleList[j].ENTITY_NAME + "</option>";
    }
    utterBodyHtml += "</select>";
    utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
    utterBodyHtml += "<input type='hidden' name='startIndex' value='' />";
    utterBodyHtml += "<input type='hidden' name='endIndex' value=''  />";
    utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
    utterBodyHtml += "<span name='alertSpan'></span>";
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
            $('#alertMsg').text(language.ALERT_ENTITY_SELECT);
            $('#alertBtnModal').modal('show');
            //alert('엔티티를 선택해 주세요.');
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
                    matchObj.endIndex = index+innerIndex;
                    indexArr.push(matchObj);
                    //
                    chkMatch.push(inputStr);
                    var tmpIndex = index + ',' + matchObj.endIndex;
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
            $(this).parent().find('span[name=alertSpan]').text("");
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
            if (!chkLabeled) {
                $(this).parent().find('span[name=alertSpan]').text("");
                if ($(this).parent().find('select[name=multiMatchUtterSel]').length > 1) {
                    $(this).parent().find('select[name=multiMatchUtterSel]').remove();
                }

                rememberUtterInput = $(this).val();
                var matchStartIndex = chkMatchIndex[0].split(",")[0]*1;
                var matchEndIndex = chkMatchIndex[0].split(",")[1]*1;
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

                if (colorIndexArr.length > 0) {
                    for (var i=matchStartIndex; i<=matchEndIndex; i++) {
                        $(this).parents('tr').prev().find('#utterText_' + i).addClass('span_color_' + colorIndexArr[0]);
                    }
                    $(this).parent().find('input[name=startIndex]').val(matchStartIndex);
                    $(this).parent().find('input[name=endIndex]').val(matchEndIndex);

                    if ($(this).parent().find('div[name=indentDiv]').length>0) {
                        var nowIndex = $('div[name=labelInfoDiv]').index($(this).parent());
                        var minIndex = -1;
                        var maxIndex = -1;
                        for (var k=nowIndex-1; k >= 0; k--) {
                            if ($('div[name=labelInfoDiv]').eq(k).find('div[name=indentDiv]').length == 0) {
                                minIndex = $('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val()==""?-1:$('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val();
                                maxIndex = $('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val()==""?-1:$('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val();
                                break;
                            }
                        }
                        for (var k=nowIndex; k >= 0; k--) {
                            if ($('div[name=labelInfoDiv]').eq(k).find('div[name=indentDiv]').length == 0) {
                                /*
                                var startInx = $('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val();
                                var endInx = $('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val();
                                startInx = startInx==""?matchStartIndex:startInx*1;
                                endInx = endInx==""?matchEndIndex:endInx*1;
                                if (startInx <= matchStartIndex) {
                                    $('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val(startInx);
                                }
                                if (endInx <= matchEndIndex) {
                                    $('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val(matchEndIndex);
                                }
                                */
                               $('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val(minIndex);
                               $('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val(maxIndex);
                                break;
                            } else {
                                var startInx = $('div[name=labelInfoDiv]').eq(k).find('input[name=startIndex]').val();
                                var endInx = $('div[name=labelInfoDiv]').eq(k).find('input[name=endIndex]').val();
                                if (minIndex == -1 || minIndex >= startInx) {
                                    minIndex = startInx;
                                }
                                if (maxIndex == -1 || endInx >= maxIndex) {
                                    maxIndex = endInx;
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
            $(this).parent().find('span[name=alertSpan]').text(language.ALERT_NO_MATCHING_WORDS);
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
                            utterBodyHtml += "<option value='1' selected>" + language.SIMPLE_ENTITY + "</option>";
                            utterBodyHtml += "<option value='3'>" + language.HIERARCHY_ENTITY + "</option>";
                            if (!chkInsideNum(startIndx, endIndx, entityLabel[i].startTokenIndex, entityLabel[i].endTokenIndex) ) {
                                utterBodyHtml += "<option value='4'>" + language.COMPOSITE_ENTITY + "</option>";
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
                            utterBodyHtml += "<span name='alertSpan' ></span>";
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
    
                            var isInside = chkInsideNum(startIndx, endIndx, entityLabel[i].startTokenIndex, entityLabel[i].endTokenIndex);
                            if (chkComposit) {
                                if (isInside ) {
                                    utterBodyHtml += "<div name='indentDiv'>&emsp;&emsp;</div>";
                                } else {
                                    chkComposit = false;
                                }
                            }

                            utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                            utterBodyHtml += "<option value='1'>" + language.SIMPLE_ENTITY + "</option>";
                            utterBodyHtml += "<option value='3' selected>" + language.HIERARCHY_ENTITY + "</option>";
                            if (!isInside ) {
                                utterBodyHtml += "<option value='4'>" + language.COMPOSITE_ENTITY + "</option>";
                            }
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
                            utterBodyHtml += "<span name='alertSpan' ></span>";
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
                            utterBodyHtml += "<option value='1'>" + language.SIMPLE_ENTITY + "</option>";
                            utterBodyHtml += "<option value='3'>" + language.HIERARCHY_ENTITY + "</option>";
                            utterBodyHtml += "<option value='4' selected>" + language.COMPOSITE_ENTITY + "</option>";
                            //utterBodyHtml += "<option value='5'>closed list</option>";
                            utterBodyHtml += "</select>";
    
                            utterBodyHtml += "<select name='entitySelBox' class='form-control' >";
                            utterBodyHtml += "<option value='" + entityLabel[i].id + "'></option>";
                            utterBodyHtml += "</select>";
                            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' disabled/>";
                            utterBodyHtml += "<input type='hidden' name='startIndex' value='" + entityLabel[i].startTokenIndex + "' />";
                            utterBodyHtml += "<input type='hidden' name='endIndex' value='" + entityLabel[i].endTokenIndex + "'  />";
                            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
                            utterBodyHtml += "<span name='alertSpan' ></span>";
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
    
                                    var isInside = chkInsideNum(startIndx, endIndx, entityLabel[i].startTokenIndex, entityLabel[i].endTokenIndex);
                                    if (chkComposit) {
                                        if (isInside ) {
                                            utterBodyHtml += "<div name='indentDiv'>&emsp;&emsp;</div>";
                                        } else {
                                            chkComposit = false;
                                        }
                                    }

                                    utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                                    utterBodyHtml += "<option value='1'>" + language.SIMPLE_ENTITY + "</option>";
                                    utterBodyHtml += "<option value='3' selected>" + language.HIERARCHY_ENTITY + "</option>";
                                    if (!isInside ) {
                                        utterBodyHtml += "<option value='4'>" + language.COMPOSITE_ENTITY + "</option>";
                                    }
                                    //utterBodyHtml += "<option value='4'>composite</option>";
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
                                    utterBodyHtml += "<span name='alertSpan' ></span>";
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
function getEntityList(dlg_id) {

    $.ajax({
        type: 'POST',
        url: '/luis/getSelEntityList',
        data: {
                  'isAll' : 'NOTALL'
                , 'dlg_id' : dlg_id
              },
        success: function(data) {
            if (data.error) {
                //alert(data.message);
                $('#alertMsg').text(data.message);
                $('#alertBtnModal').modal('show');
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
        //alert('상위 entity를 삭제해 주세요.');
        $('#alertMsg').text('상위 entity를 삭제해 주세요.');
        $('#alertBtnModal').modal('show');
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

                var chkCompositeChild = false;
                var utterEntityType = $(this).find('select[name=entityTypeForLabel]').val();
                switch (utterEntityType) {
                    case '1':
                        if ($(this).find('div[name=indentDiv]').length) {
                            chkCompositeChild = true;
                        }
                        selEntity = $(this).find('select[name=entitySelBox]').val();
                        startIndex = $(this).find('input[name=startIndex]').val();
                        endIndex = $(this).find('input[name=endIndex]').val();
                        break;
                    case '3':
                        if ($(this).find('div[name=indentDiv]').length) {
                            chkCompositeChild = true;
                        }
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
                    if (chkCompositeChild) {
                        var childTmpObj = entityLabels.pop();
                        entityLabels.push(labelObj);
                        entityLabels.push(childTmpObj);
                    } else {
                        entityLabels.push(labelObj)
                    }
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
 * 
 * 신규작업 유두연주임 20181214
 * 
 */

//entity name sel
$(document).on("change", "select[name=entitySelBox]", function(e){
    $(this).parent().find('input[name=matchUtterText]').prop('disabled', false);
    var entityType = $(this).parent().find('select[name=entityTypeForLabel]').val();


    $(this).parent().find('input[name=matchUtterText]').val('');
    var startIndex = $(this).parent().find('input[name=startIndex]').val();
    var endIndex = $(this).parent().find('input[name=endIndex]').val();
    if (startIndex != '' && endIndex != '') {
        for (var i=startIndex; i<=endIndex; i++) {
            $(this).parents('tr').prev().find('#utterText_' + i).removeClass();//.removeAttr('class');
        }
    }
    if ($(this).parent().find('select[name=multiMatchUtterSel]').length > 0) {
        $(this).parent().find('select[name=multiMatchUtterSel]').remove();
    }

    switch(entityType*1) {
        case 3:

            makeChildSelBox ($(this), entityType);

            $(this).parent().find('select[name=entityChildSelBox]').show();
            $(this).parent().find('select[name=entityChildSelBox]').children('option').each(function() {
                if ($(this).is(':selected'))
                { 
                    $(this).removeAttr('selected');
                    return false;
                }
            });
            $(this).parent().find('select[name=entityChildSelBox]').children().eq(0).prop('selected', 'selected');
            break;
        case 4:
            while (1) {
                if ($(this).parents('div').next().find('div[name=indentDiv]').length > 0 ) {
                    $(this).parents('div').next().find('div[name=indentDiv]').parent().remove();
                } else {
                    break;
                }
            }

            var utterBodyHtml = "";
            for (var j=0; j<compositeList.length; j++) {
                if (compositeList[j].ENTITY_NAME == $(this).val()) {
                    var childList = compositeList[j].CHILD_ENTITY_LIST.slice();
                    for (var k=0; k<childList.length; k++) {

                        var childTypeStr = "";
                        var chkChildType = false;
                        for (var h=0; h<simpleList.length; h++) {
                            if (simpleList[h].ENTITY_ID == childList[k].CHILDREN_ID) {
                                chkChildType = true;
                                break;
                            }
                        }
                        if (chkChildType) {
                            childTypeStr = "<option value='1' selected>" + language.SIMPLE_ENTITY + "</option>";
                        } else {
                            childTypeStr = "<option value='3'>" + language.HIERARCHY_ENTITY + "</option>";
                        }

                        utterBodyHtml += "<div name='labelInfoDiv'>";
                        
                        utterBodyHtml += "<div name='indentDiv'>&emsp;&emsp;</div>";
                        utterBodyHtml += "<select name='entityTypeForLabel' class='form-control'  >";
                        utterBodyHtml += childTypeStr;
                        //utterBodyHtml += "<option value='1' selected>" + language.SIMPLE_ENTITY + "</option>";
                        //utterBodyHtml += "<option value='3'>" + language.HIERARCHY_ENTITY + "</option>";
                        //utterBodyHtml += "<option value='4'>" + language.COMPOSITE_ENTITY + "</option>";
                        //utterBodyHtml += "<option value='5'>" + language.CLOSED_LIST_ENTITY + "</option>";
                        utterBodyHtml += "</select>";
            
                        utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
                        //utterBodyHtml += "<option value='NONE'>" + language.SELECT + "</option>";
                        utterBodyHtml += "<option value='" + childList[k].CHILDREN_NAME + "'>" + childList[k].CHILDREN_NAME + "</option>";
                        /*
                        for (var q=0; q<childList.length; q++) {
                            utterBodyHtml += "<option value='" + childList[q].CHILDREN_NAME + "'>" + childList[q].CHILDREN_NAME + "</option>";
                        }
                        */
                        utterBodyHtml += "</select>";
                        utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='' />";
                        utterBodyHtml += "<input type='hidden' name='startIndex' value='' />";
                        utterBodyHtml += "<input type='hidden' name='endIndex' value=''  />";
                        utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
                        utterBodyHtml += "<span name='alertSpan' ></span>";
                        utterBodyHtml += "</div>";
                    }
                    $(this).parents('div[name=labelInfoDiv]').after(utterBodyHtml);
                    break;
                }
            }
            $(this).parent().find('input[name=matchUtterText]').prop('disabled', true);
            break;
        case 5:
            makeChildSelBox ($(this), entityType);
            $(this).parent().find('select[name=entityChildSelBox]').show();
            $(this).parent().find('select[name=entityChildSelBox]').children('option').each(function() {
                if ($(this).is(':selected'))
                { 
                    $(this).removeAttr('selected');
                    return false;
                }
            });
            $(this).parent().find('select[name=entityChildSelBox]').children().eq(0).prop('selected', 'selected');
            break;
    }
});


function makeChildSelBox(selObj, entityType) {
    var selEntity = $(selObj).val();
    var utterBodyHtml = '';
    switch(entityType*1) {
        case 3:
        
            utterBodyHtml += "<option value='NONE'>" + language.SELECT + "</option>";
            for (var j=0; j<hierarchyList.length; j++) {
                if (selEntity == hierarchyList[j].ENTITY_NAME) {
                    for (var k=0; k<hierarchyList[j].CHILD_ENTITY_LIST.length; k++) {
                        
                        utterBodyHtml += "<option value='" + hierarchyList[j].CHILD_ENTITY_LIST[k].CHILDREN_NAME + "'> " + hierarchyList[j].CHILD_ENTITY_LIST[k].CHILDREN_NAME + "</option>";
                    }
                    break;
                }
            }
            break;
        case 4:

            break;
            /*
        case 5:
            utterBodyHtml += "<option value='NONE'>선택해주세요.</option>";
            for (var j=0; j<closedList.length; j++) {
                if (selEntity == closedList[j].ENTITY_NAME) {
                    for (var k=0; k<closedList[j].CHILD_ENTITY_LIST.length; k++) {
                        utterBodyHtml += "<option value='" + closedList[j].CHILD_ENTITY_LIST[k].CHILDREN_NAME + "'> " + closedList[j].CHILD_ENTITY_LIST[k].CHILDREN_NAME + "</option>";
                    }
                    break;
                }
            }
            break;
            */
    }

    $(selObj).parent().find('select[name=entityChildSelBox]').html(utterBodyHtml);
}


//entity type sel
$(document).on("change", "select[name=entityTypeForLabel]", function(e){
    $(this).parent().find('select[name=entitySelBox]').remove();
    $(this).parent().find('select[name=entityChildSelBox]').remove();
    $(this).parent().find('input[name=matchUtterText]').remove();
    $(this).parent().find('a[name=delLabelBtn]').remove();
    $(this).parent().find('div[name=alertSpan]').remove();
    
    if ($(this).parent().find('select[name=multiMatchUtterSel]').length > 0) {
        $(this).parent().find('select[name=multiMatchUtterSel]').remove();
    }

    var startIndex = $(this).parent().find('input[name=startIndex]').val();
    var endIndex = $(this).parent().find('input[name=endIndex]').val();
    for (var i=startIndex; i<=endIndex; i++) {
        $(this).parents('tr').prev().find('#utterText_' + i).removeClass();//.removeAttr('class');
    }
    while(1) {
        if ($(this).parents('div').next().find('div[name=indentDiv]').length > 0) {
            $(this).parents('div').next().remove();
        } else {
            break;
        }
    }
    

    var utterBodyHtml = '';
    switch($(this).val()*1) {
        case 1:
            utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
            utterBodyHtml += "<option value='NONE'>" + language.SELECT + "</option>";
            for (var j=0; j<simpleList.length; j++) {
                utterBodyHtml += "<option value='" + simpleList[j].ENTITY_NAME + "'>" + simpleList[j].ENTITY_NAME + "</option>";
            }
            utterBodyHtml += "</select>";
            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
            utterBodyHtml += "<input type='hidden' name='startIndex' value='' />";
            utterBodyHtml += "<input type='hidden' name='endIndex' value=''  />";
            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
            utterBodyHtml += "<span name='alertSpan' ></span>";
            $(this).parent().append(utterBodyHtml);
            break;
        case 3:
            utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
            utterBodyHtml += "<option value='NONE'>" + language.SELECT + "</option>";
            for (var j=0; j<hierarchyList.length; j++) {
                utterBodyHtml += "<option value='" + hierarchyList[j].ENTITY_NAME + "'>" + hierarchyList[j].ENTITY_NAME + "</option>";
            }
            utterBodyHtml += "</select>";
            utterBodyHtml += "<select name='entityChildSelBox' class='form-control' style='display:none' >";
            utterBodyHtml += "<option value=''></option>";
            utterBodyHtml += "</select>";
            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
            utterBodyHtml += "<input type='hidden' name='startIndex' value='' />";
            utterBodyHtml += "<input type='hidden' name='endIndex' value=''  />";
            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
            utterBodyHtml += "<span name='alertSpan' ></span>";
            $(this).parent().append(utterBodyHtml);
            break;
        case 4:
            utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
            utterBodyHtml += "<option value='NONE'>" + language.SELECT + "</option>";
            for (var j=0; j<compositeList.length; j++) {
                utterBodyHtml += "<option value='" + compositeList[j].ENTITY_NAME + "'>" + compositeList[j].ENTITY_NAME + "</option>";
            }
            utterBodyHtml += "</select>";
            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
            utterBodyHtml += "<input type='hidden' name='startIndex' value='' />";
            utterBodyHtml += "<input type='hidden' name='endIndex' value=''  />";
            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
            utterBodyHtml += "<span name='alertSpan' ></span>";
            $(this).parent().append(utterBodyHtml);
            break;
            /*
        case 5:
            utterBodyHtml += "<select name='entitySelBox' class='form-control'  >";
            utterBodyHtml += "<option value='NONE'>선택해주세요.</option>";
            for (var j=0; j<closedList.length; j++) {
                utterBodyHtml += "<option value='" + closedList[j].ENTITY_NAME + "'>" + closedList[j].ENTITY_NAME + "</option>";
            }
            utterBodyHtml += "</select>";
            utterBodyHtml += "<select name='entityChildSelBox' class='form-control' style='display:none' >";
            utterBodyHtml += "<option value=''></option>";
            utterBodyHtml += "</select>";
            utterBodyHtml += "<input type='text' name='matchUtterText' value='' style='padding:0.5% 0; margin:0 0 0.5% 0;' />";
            utterBodyHtml += "<input type='hidden' name='startIndex' value='' />";
            utterBodyHtml += "<input type='hidden' name='endIndex' value=''  />";
            utterBodyHtml += "<a href='#' name='delLabelBtn' onclick='return false;' style=''><span class='fa fa-trash' style='font-size: 25px;'></span></a>";
            utterBodyHtml += "<span name='alertSpan' style='font-size: 25px;'></span>";
            $(this).parent().append(utterBodyHtml);
            break;
            */
        default:
            break;
    }
});


$(document).on("change", "select[name=multiMatchUtterSel]", function(e){ 

    var beforeStart;
    var beforeEnd;
    if ($(this).parent().find('input[name=startIndex]').val() != "") {
        beforeStart = $(this).parent().find('input[name=startIndex]').val();
        beforeEnd = $(this).parent().find('input[name=endIndex]').val();
        for (var i=beforeStart; i<=beforeEnd; i++) {
            $(this).parents('tr').prev().find('span[name=utterText]').eq(i).removeClass();
        }
    }


    var matchStartIndex = $(this).val().split(",")[0];
    var matchEndIndex = $(this).val().split(",")[1];
    //$(this).parent().find('input[name=startIndex]').val(matchStartIndex);
    //$(this).parent().find('input[name=endIndex]').val(matchEndIndex);
    var trIndex = $("tr[name=utterMainTr]").index($(this).parents('tr').prev());
    var divIndex = $("tr[name=utterMainTr]").eq(trIndex).find('div[name=labelInfoDiv]').index($(this).parents('div[name=labelInfoDiv]'));

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


    changeMultMatchiLabel(matchStartIndex, matchEndIndex, trIndex, divIndex);
});

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
        makeQnaListTable($(this).val());
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
                    tableHtml += '<td class="tex01"><button type="button" class="btn btn-default btn-sm" id="show_dlg" page_type="qna" dlg_id="' + data.rows[i].DLG_ID + '"><i class="fa fa-edit"></i> ' + language.Show_dlg + '</button></td>';
                    //tableHtml += '<td class="tex01"><button type="button" class="btn btn-default btn-sm" id="show_dlg" onClick="searchDialog(\'' + data.rows[i].DLG_ID + '\',\'qna\')"><i class="fa fa-edit"></i> ' + language.Show_dlg + '</button></td>';
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

    getEntityList($(this).attr('dlg_id'));

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
        $('#alertMsg').text('유사질문을 입력 해 주세요.');
        $('#alertBtnModal').modal('show');
        //alert('유사질문을 입력 해 주세요.');
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
                
                $('#alertMsg').text(language['REGIST_SUCC']);
                $('#alertBtnModal').modal('show');
                $('#chkAfterAlert').val('RELOAD');

                //alert(language['REGIST_SUCC']);
                //window.location.reload();
            } else {
                //alert(language['It_failed']);
                $('#alertMsg').text(language['It_failed']);
                $('#alertBtnModal').modal('show');
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

                $('#alertMsg').text(language['REGIST_SUCC']);
                $('#alertBtnModal').modal('show');
                $('#chkAfterAlert').val('RELOAD');
                //alert(language['REGIST_SUCC']);
                //window.location.reload();
            } else {
                //alert(language['It_failed']);
                $('#alertMsg').text(language['It_failed']);
                $('#alertBtnModal').modal('show');
            }
        }
    });
});



//alert 메세지 초기화
$(document).on("click", "#alertCloseBtn", function () {
    $('#alertMsg').text('');
    var chkMsg = $('#chkAfterAlert').val();
    if (chkMsg != 'NONE') {
        if (chkMsg == 'RELOAD') {
            location.reload();
        }
        else if (chkMsg == 'DELETE_DLG') {
            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }
        else if (chkMsg == 'UPDATE_DLG') {
            
            $('.createDlgModalClose').click();

            var groupType = $('.selected').text();
            var sourceType = $('#tblSourceType').val();
            selectDlgByTxt(groupType, sourceType);
        }
    }
});


