exports.customIndicator = {
    create : function() {
        var style = require("/util/style").style;
        // window
        var indWin = Ti.UI.createWindow({
            height:180,
            width:180,
            borderRadius:10
        });
     
        // view
        var indView = Titanium.UI.createView({
            height:176,
            width:176,
            backgroundColor: style.common.backgroundColor,
            borderRadius:20,
            opacity:0.9,
            layout:'vertical'
        });
        indWin.add(indView);
        
        var imageView =  Titanium.UI.createImageView({
            width: 53
            ,height: 44
            ,top: 30
            ,left:60
             ,image: '/images/heart.png'
            // ミリ秒単位で次のフレームまでの間隔を指定
            ,duration: 100
            ,repeatCount: 0
        });
        indView.add(imageView);
        
        // message
        var message = Titanium.UI.createLabel({
            top: 40,
            text: style.common.loadingMsg,
            color: '#fff',
            width: Ti.UI.FILL,
            height: Ti.UI.SIZE,
            textAlign : 'center'
            ,font: {fontSize:20,fontWeight:'bold'}
        });
        indView.add(message);
        // indWin.open(); //呼び出し側でopen・closeする
        
        return indWin;
    }
};