var crypto = require('crypto');

module.exports = {

    getSaltCode: async function () {
        var aa = (await crypto.randomBytes(64)).toString('base64');
        return aa;
        /*crypto.randomBytes(64, (err, buf) => {
            if (err) throw err;
            return buf.toString('base64');
        });*/
    },

    getPassWord: function (inputPass, salt) {
        //pbkdf2 -> ��й�ȣ, salt, �ݺ� Ƚ��, ��й�ȣ ����, �ؽ� �˰���
        var key =  crypto.pbkdf2Sync(inputPass, salt, 518, 64, 'sha512');
        return key.toString('hex');
        //crypto.pbkdf2Sync(inputPass, salt, 518, 64, 'sha512', function (err, key) {
        //    return key.toString('base64');
        //});
    }
}