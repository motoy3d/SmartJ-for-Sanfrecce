var config = require("/config").config;
exports.style = {
	common : {
	    barColor : config.color,
        navTintColor : config.tintColor,
		loadingMsg : '読み込み中...',
		offlineMsg : 'ネットワークに接続できません。\n接続後に再度お試しください。',
		loadingFailMsg : '読み込みに失敗しました',
		noDataMsg : '該当データが見つかりませんでした',
		noMovieMsg : '動画が見つかりませんでした',
		mainTextColor : 'white',
		rowBgSelectedColor : "#f66",
		indicator : {
			font: {
				fontSize : 17,
				fontWeight : 'bold'
			},
			color: 'white',
			message: '読み込み中...'			
		}
	},
    tabsAndroid : {
        tabsBackgroundColor: "black"
        ,activeTabBackgroundColor: "white"
    },
	news : {
        listView : {
            separatorColor: '#666'
            ,allowsSelection: true
            ,backgroundColor: "black"
            ,top: 0 //80
        },
        listViewTemplate : [
            {
                type: 'Ti.UI.ImageView',
                bindId: 'userProfileImage',    //プロフィール画像
                properties: {
                    top: 6
                    ,left: 6
                    ,width: 0
                    ,height: 0
                    ,borderRadius: 5
//                    ,backgroundColor: '#000'
                }
            },
            {
                type: 'Ti.UI.View',
                bindId: 'contentView',
                properties: {
                    top: 6
                    ,left: 6
                    ,right: 6
                    ,height: Ti.UI.SIZE
//                    ,backgroundColor: '#000'
                },
                childTemplates: [
                    {
                        // iOSではLabelにリンクがつけられない
                        type: 'Ti.UI.Label',
                        bindId: 'title',    //タイトルラベル
                        properties: {
                            color: '#fff'
//                            ,backgroundColor: '#000'
                            ,font: {fontSize: 16}
                            ,top: 0
                            ,left: 0
                            //,bottom: 260
                            ,bottom: 30
                            ,height: Ti.UI.SIZE
                        }
                    },
                    {
                        type: 'Ti.UI.ImageView',
                        bindId: 'postImage',    //投稿内画像
                        properties: {
                            top: 0,
                            width: Ti.UI.SIZE
                            ,left: 0
                            ,bottom: 6
                            //,height: 250
                            ,height: 0
//                            ,backgroundColor: '#000'
                        },
                        events: {
                            load: function(e){var util = require("/util/util").util; Ti.API.info('■■■image loaded. ' + util.toString(e.source));},
                            error: function(e){
                                var util = require("/common/util").util;
                                Ti.API.error('■■■画像読み込みエラー　 ' + util.toString(e.source));
                            }
                        }
                    },
                    {
                        type: 'Ti.UI.Label',
                        bindId: 'siteNameAndDatetime',    //サイト名＋日時ラベル
                        properties: {
                            color: '#A3A3A3'
//                            ,backgroundColor: '#000'
                            ,font: {fontSize: 14}
                            ,bottom: 6
                            ,right: 4
                        }
                    }
                ],
            },
        ],
        /* Android用ツールバー */
        listViewRefreshTemplate : [
            {
                type: 'Ti.UI.Button',
                bindId: 'refreshBtn',
                properties: {
                    backgroundImage: "/images/refresh.png",
                    backgroundSelectedImage: "/images/refresh_pressed.png",
                    width: "48dp",
                    height: "48dp",
                    top : "2dp",
                    right : "68dp"
                }
            },
            {
                type: 'Ti.UI.Button',
                bindId: 'configBtn',
                properties: {
                    backgroundImage: "/images/gear.png",
                    backgroundSelectedImage: "/images/gear_pressed.png",
                    width: "38dp",
                    height: "38dp",
                    top : "2dp",
                    right : "10dp"
                }
            }
        ],
                
        adViewContainer : {
            backgroundColor: 'white'
            ,top: 0
            ,width: Ti.UI.FILL
            ,height: 0 //80
        },
	    adViewIPhoneIcon : {
            backgroundColor: 'white'
            ,orientation: 'horizontal'
            ,top: 5
            ,left: 10
            ,width: 320
            ,height: 75
	    },
        adViewIPhoneBanner : {
            width: 320
            ,height: 100
        },
        adViewAndroid : {
            backgroundColor: 'white'
            ,orientation: 'horizontal'
            ,adType:'icon'
            ,orientation:'horizontal'
            ,top: '5dp'
            ,left: '10dp'
            ,width: '320dp'
            ,height: '75dp'
        },
		visitedBgColor : '#457',
		webWindowToolbar : {
            animated: false, // true by default
            translucent: false, // true for iOS 7+, false otherwise
            barColor: config.color,
            tintColor: config.tintColor // iOS 7+ only
		}
	},
    config : {
        window : {
            title: "設定"
            ,navBarHidden: false
            ,backgroundColor: "black"
            ,navTintColor: config.tintColor
            ,tintColor: config.tintColor
        },
        tableView : {
            backgroundColor: "black"
            ,separatorColor: '#888'
            //,separatorColor: 'black'
            ,allowsSelection: true
            ,scrollable: false
            ,top: 0
            ,width: Ti.UI.FILL
            ,height: Ti.UI.SIZE
        },
        lineRow : {
            title: "友達にLINEですすめる"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        mailRow : {
            title: "友達にメールですすめる"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        twitterRow : {
            title: "twitterでつぶやく"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        fbRow : {
            title: "facebookでシェア"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        appReviewRow : {
            title: "レビューを書く（プリーズ！）"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        }
    },
	results : {
	    table : {
	        backgroundColor: 'black',
	        separatorColor: 'gray'
	    },
		tableViewRow : {
			height : 'auto',
			backgroundColor : 'black',
//			backgroundSelectedColor : "#f66",
			className : 'resultsTableRow',
			type: 'CONTENT'
		},
		dateLabel : {
			width : 135,
			color : 'lightgray',
			font : {fontSize : 13},
			height : 24,
			top : 4,
			left : 4			
		},
		compeLabel : {
			color : 'lightgray',
			font : {fontSize : 13},
            width : Ti.UI.FILL,
			height : 24,
			top : 4,
			left : 155			
		},
		stadiumLabel : {
			width : 200,
			color : 'lightgray',
			font : {fontSize : 13},
			top : 26,
			left : 5			
		},
		teamLabel : {
			width : 210,
			color : 'white',
			font : {fontSize : 19},
			top : 51,
			// bottom : 10,
			left : 5
		},
		resultLabel : {
			width : 32,
			height : 32,
			top : 46,
			right : 60			
		},
		scoreLabel : {
			color : 'white',
			font : {fontSize : 25},
			height : "auto",
			top : 48,
			// bottom : 10,
			right : 10			
		},
        scoreLabelSmall : {
            color : 'white',
            font : {fontSize : 15},
            height : "auto",
            top : 48,
            // bottom : 10,
            right : 10          
        },
		detailButton : {
			backgroundImage : '/images/gameDetailBtn.png',
			backgroundSelectedImage : '/images/gameDetailSelectedBtn.png',
			color : 'white',
			font : {fontSize : 17},
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 112 //元々90			
		},
		movieButton : {
			backgroundImage : '/images/movieSearchBtn.png',
			backgroundSelectedImage : '/images/movieSearchSelectedBtn.png',
			color : 'white',
			font : {fontSize : 17},
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 10			
		}
	},
	standings : {
	    backgroundColor : "#600e94",
	    standingsView : {
	        top : 0
	        ,backgroundColor: "black"
	    },
	    table : {
            top: 37
            ,allowsSelection: false
            ,separatorColor: '#666'
            ,backgroundColor: "black"
	    },
	    headerView : {
	        top: 0
	        ,backgroundColor: 'black'
	    },
	    headerLabel : {
            height: 33,
            top : 1,
            backgroundColor: 'black',
            color: 'white'	        
	    },
	    border : {
            width: Ti.UI.FILL,
            height: 1,
            top: 34
            ,borderWidth: 1
            ,borderColor: '#999'	        
	    },
	    tableViewRow : {
            height: 28
            ,color: 'white'
            ,backgroundColor: 'black'
            ,className: "standingsTableRow"
	    },
	    compeButtonBar : {
	        backgroundColor: config.color
            ,tintColor: config.color
            ,width: 200
	    }
	},
	twitter : {
        webWindow : {
            backgroundColor: 'black'
            ,barColor: config.color
            ,navTintColor: config.tintColor
//            navBarHidden: true  
        },
        webWindowToolbar : {
            bottom: 0
            ,borderTop: true
            ,borderBottom: true
            ,backgroundColor: '#29b'        
        },
        listView : {
            separatorColor: '#666'
            ,allowsSelection: true
            ,backgroundColor: "black"
        },
        listViewTemplate : [
            {
                type: 'Ti.UI.Label',
                bindId: 'userName',    //名前ラベル
                properties: {
                    color: '#fff'
                    ,backgroundColor: '#000'
                    ,font: {fontSize: 16, fontWeight: 'bold'}
                    ,top: 4
                    ,left: 60
                }
            },
            {
                type: 'Ti.UI.ImageView',
                bindId: 'userProfileImage',    //プロフィール画像
                properties: {
                    top: 6
                    ,left: 6
                    ,width: 48
                    ,height: 48
                    ,borderRadius: 5
                    ,backgroundColor: '#000'
                }
            },
            {
                type: 'Ti.UI.View',
                bindId: 'contentView',
                properties: {
                    top: 42
                    ,left: 60
                    ,right: 6
                    ,height: Ti.UI.SIZE
                    ,backgroundColor: '#000'
                },
                childTemplates: [
                    {
                        // iOSではLabelにリンクがつけられない
                        type: 'Ti.UI.Label',
                        bindId: 'content',
                        properties: {
                            color: '#fff'
                            ,backgroundColor: '#000'
                            ,font: {fontSize: 16}
                            ,top: 0
                            ,left: 0
                            ,bottom: 260
                            ,height: Ti.UI.SIZE
                        }
                    },
                    {
                        type: 'Ti.UI.ImageView',
                        bindId: 'postImage',    //投稿内画像
                        properties: {
                            top: 0,
                            width: Ti.UI.SIZE
                            ,left: 0
                            ,bottom: 6
                            ,height: 250
                            ,backgroundColor: '#000'
                        },
                        events: {
                            load: function(e){var util = require("/common/util").util; Ti.API.info('■■■image loaded. ' + util.toString(e.source));},
                            error: function(e){
                                var util = require("/common/util").util;
                                Ti.API.error('■■■画像読み込みエラー　 ' + util.toString(e.source));
                            }
                        }
                    }
                ],
            },
            {
                type: 'Ti.UI.Label',
                bindId: 'time',    //日時ラベル
                properties: {
                    color: '#ddd'
                    ,backgroundColor: '#000'
                    ,font: {fontSize: 12}
                    ,top: 24
                    //,bottom: 8
                    ,right: 13
                }
            },
        ],
        /* Android用ツールバー */
        listViewRefreshTemplate : [
            {
                type: 'Ti.UI.Button',
                bindId: 'refreshBtn',
                properties: {
                    backgroundImage: "/images/refresh.png",
                    backgroundSelectedImage: "/images/refresh_pressed.png",
                    width: "48dp",
                    height: "48dp",
                    top : "2dp",
                    right : "10dp"
                }
            }
        ]
    },
    webWindow : {
        //Android用ボタン
        backButton : {
            backgroundImage: "/images/arrow_left_grey.png"
            ,backgroundSelectedImage: "/images/arrow_left_grey.png"
            ,backgroundColor: 'transparent'
            ,enabled: false
            ,height: "32dp"
            ,width: "32dp"
            ,top: "8dp"
            ,right: "75dp"  
        },
        forwardButton : {
            backgroundImage: "/images/arrow_right_grey.png"
            ,backgroundSelectedImage: "/images/arrow_right_grey.png"
            ,backgroundColor: 'transparent'
            ,enabled: false
            ,height: "32dp"
            ,width: "32dp"
            ,top: "8dp"
            ,right: "10dp"
        },
        lineButton : {
            backgroundImage: "/images/line_icon.png"
            ,backgroundSelectedImage: "/images/line_icon_grey.png"
            ,backgroundColor: 'transparent'
            ,enabled: false
            ,width: "48dp"
            ,height: "32dp"
            ,left: "20dp"
        },
        twitterButton : {
            backgroundImage: "/images/twitter_icon.png"
            ,backgroundSelectedImage: "/images/twitter_icon_grey.png"
            ,backgroundColor: 'transparent'
            ,enabled: false
            ,width: "32dp"  //40でいいはずだが、なぜか切れる
            ,height: "32dp"
            ,left: "88dp"
        },
        facebookButton : {
            backgroundImage: "/images/facebook_icon.png"
            ,backgroundSelectedImage: "/images/facebook_icon_grey.png"
            ,backgroundColor: 'transparent'
            ,enabled: false
            ,width: "32dp"
            ,height: "32dp"
            ,left: "135dp"
        },
        toolbar : {
            /* グラデーションはエラーになるのでイメージで対応
               https://jira.appcelerator.org/browse/TIMOB-9819*/
            //backgroundImage: "/images/toolbarBackground.png"
            //,backgroundRepeat: true
            backgroundColor: config.color
            ,width: Ti.UI.FILL
            ,height: 50
            ,bottom: 0
        }
    }
};
