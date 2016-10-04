/**
 * Youtube動画一覧を表示するウィンドウ
 * @param gameDate
 */
function YoutubeWindow(title, gameDate, otherTeamId) {
    var config = require("/config").config;
    var util = require("/util/util").util;
    var style = require("/util/style").style;
    var Video = require("/model/Video");
    var self = Ti.UI.createWindow({
        title: title
        ,backgroundColor: 'white'
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
//        navBarHidden: true
        ,titleAttributes: {
            color: style.common.navTintColor
        }
    });
    // function
    self.searchYoutube = searchYoutube;
    var vsTeam;
    // create table view data object
    var data = [];
    self.addEventListener('open',function(e) {
        searchYoutube();
    });

    var tableView = Ti.UI.createTableView({
        data : data
        //,backgroundColor : style.common.backgroundColor	//Youtubeのサムネイルの黒帯があるため黒固定
        ,backgroundColor : style.common.backgroundColor    //TODO style
        ,separatorColor : "black"
    });
    if (util.isiOS()) {
        tableView.scrollIndicatorStyle = Ti.UI.iPhone.ScrollIndicatorStyle.WHITE;        
    }

    self.add(tableView);
    tableView.addEventListener('click', function(e) {
        Ti.API.info('>>>>>>>>>> click');
        playYouTube(e.row.videoTitle, e.row.videoUrl);
    });
    
    // インジケータ
    var ind = Ti.UI.createActivityIndicator({
        style: util.isiOS()? Ti.UI.ActivityIndicatorStyle.PLAIN : Ti.UI.ActivityIndicatorStyle.BIG
    });
    self.add(ind);
    ind.show();

    /**
     * Youtubeで検索し、一覧表示する。
     */
    function searchYoutube() {
        // オンラインチェック
        if(!Ti.Network.online) {
            util.openOfflineMsgDialog();
            return;
        }
        try {
            var video = new Video(gameDate, otherTeamId);
            Ti.App.Analytics.trackPageview('/movieList');
            video.load({
                success: function(videoDataList) {
                try {
                    if(videoDataList == null) {
                        //indicator.hide();
                        ind.hide();
                        util.showMsg(style.common.noMovieMsg);
                        return;
                    }
                    var rowsData = new Array();
                    //TODO なぜか配列でないと判定されてしまうのでjoinメソッド有無で配列判定。
                    for (var i=0; i<videoDataList.length; i++) {
                        rowsData.push(createYoutubeRow(videoDataList[i]));
                    }
                    if (0 < rowsData.length) {
                        tableView.setData(rowsData);
                    } else {
                        util.showMsg(style.common.noMovieMsg);
                    }
                    ind.hide();
                } catch(e1) {
                    ind.hide();
                    Ti.API.error('youtube読み込みエラー1：' + e1);
                } finally {
                }
                Ti.API.info('ind.hide() last');
                ind.hide();
            }});
        } catch(e2) {
            Ti.API.error('youtube読み込みエラー2：' + e2);
            ind.hide();
        }
    }

    /**
     * TableViewRowを生成して返す
     */
    function createYoutubeRow(item) {
        // try {
            //Ti.API.info('###### createYoutubeRow() item =' + util.toString(item));
            var title = item.videoTitle;
            //Ti.API.info("◎ " + item.videoTitle + "  " + item.viewCount + "回再生");
            
            var link = item.videoUrl;
            
            var thumbnail = item.thumbnailUrl;
            Ti.API.info('動画サムネイル：' + thumbnail);
            
            var row = Ti.UI.createTableViewRow({
                height : Ti.UI.SIZE,
        //      backgroundSelectedColor : "#f33",
                type : "CONTENT"
            });
        
            row.url = link;
            row.videoUrl = item.videoUrl;
            row.videoTitle = title;
            //row.backgroundColor = style.common.backgroundColor;
            //Youtubeのサムネイルの黒帯があるため背景黒固定
            row.backgroundColor = "black";
            //row.color = style.common.mainTextColor;
            row.color = "white";
           //TODO style
           //thumbnail = thumbnail.replaceAll("hqdefault", "maxresdefault");	//上下の黒帯をなくす →maxresがない場合があるのでNG
            var img = Ti.UI.createImageView({
                image : thumbnail
                ,top: 0
                ,left : 0
                ,height : 240
                ,width : 320
                ,backgroundColor: "#ccc"
            });
            row.add(img);
           
            var labelTitle = Ti.UI.createLabel({
                text : title
                ,left : 10
                ,right : 10
                ,top : 230
                ,bottom : 23
                ,width: Ti.UI.FILL
                ,height : Ti.UI.SIZE
                ,font : {
                    fontSize : 14
                }
                ,wordWrap: true
                //,color : style.common.mainTextColor
                ,color : "white"
            });
            row.add(labelTitle);
        
            var viewCount = "";
            if(item.viewCount) {
                viewCount = item.viewCount + "回再生    ";
            }

            var labelSummary = Ti.UI.createLabel({
                text : viewCount
                ,right : 10
                ,bottom : 0
                ,font : {
                    fontSize : 13
                }
                ,color : "#A3A3A3"
            });
            row.add(labelSummary);
        
            return row;
        // } catch(ex) {
            // Ti.API.info('Youtube読み込み時エラー : ' + ex);
        // }
    }
    
    /**
     * 動画を再生する
     */
    function playYouTube(vtitle, videoUrl) {
        Ti.App.Analytics.trackPageview('/playMovie');
        Ti.API.info('------- playYouTube.. ' + Ti.Platform.name);
        if(util.isAndroid()) {
            // Youtubeアプリに任せる
            Ti.Platform.openURL(videoUrl);
        } else {
            var videoView = Ti.UI.createWebView({
                url : videoUrl
            });
            var videoWin = Ti.UI.createWindow({
                title: "動画"
                ,barColor: style.common.barColor
                ,navTintColor: style.common.navTintColor
                ,titleAttributes: {
                    color: style.common.navTintColor
                }
            });
            videoWin.add(videoView);
            Ti.App.tabGroup.activeTab.open(videoWin, {
                animated : true
            });
        }
    }
    return self;
}
module.exports = YoutubeWindow;
