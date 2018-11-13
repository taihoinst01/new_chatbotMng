
$(document).ready(function () {

    $('#mLoginId').focus();

    $('#sendLoginBtn').click(function () {
        $("#loadingLoginModalMain").modal('show');
        $('#loginfrm').submit();
    });

    $('#mLoginPass, #mLoginId').keyup(function(e){
        if(e.keyCode == 13) {
            $('#sendLoginBtn').click();
        }
    });
})
