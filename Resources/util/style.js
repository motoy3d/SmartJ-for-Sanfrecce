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
		backgroundColor: config.backgroundColor,
		mainTextColor : config.mainTextColor,
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
        tabsBackgroundColor: config.backgroundColor
        ,activeTabBackgroundColor: "white"
    },
	news : {
        listView : {
            separatorColor: '#666'
            ,allowsSelection: true
            ,backgroundColor: config.backgroundColor
            ,top: 0 //80
        },
        listViewTemplate : [
            {
                type: 'Ti.UI.View',
                bindId: 'contentView',
                properties: {
                    top: 10
                    ,left: 6
                    ,right: 6
                    ,height: Ti.UI.SIZE
                },
                childTemplates: [
                    {
                        type: 'Ti.UI.ImageView',
                        bindId: 'image',    //画像
                        properties: {
                            top: 3
                            ,left: 3
                            ,width: 200
                            //,height: 100
                            ,borderRadius: 1
                            ,backgroundColor: config.backgroundColor
                            ,defaultImage: ""
                        }
                        ,events: {
                            //load: function(e){Ti.API.info('■■■image loaded. ');},	//何故かエラーになる
                            error: function(e){
                                var util = require("/util/util").util;
                                Ti.API.error('■■■画像読み込みエラー　 ' + util.toString(e.source));
                            }
                        }
                    },
                    {
                        // iOSではLabelにリンクがつけられない
                        type: 'Ti.UI.Label',
                        bindId: 'title',    //タイトルラベル
                        properties: {
                            color: config.mainTextColor
                            ,font: {fontSize: 16}
                            ,top: 0
                            ,left: 150
                            //,bottom: 260
                            ,bottom: 36
                            //,height: Ti.UI.SIZE
                        }
                    },
                ],
            },
            {
                type: 'Ti.UI.Label',
                bindId: 'siteNameAndDatetime',    //サイト名＋日時ラベル
                properties: {
                    color: '#A3A3A3'
                    ,font: {fontSize: 14}
                    ,bottom: 10
                    ,right: 4
                }
            }
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
                    backgroundImage: "/images/th.png",
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
		visitedBgColor : config.visitedBgColor,
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
            ,backgroundColor: config.backgroundColor
            ,navTintColor: config.tintColor
            ,tintColor: config.tintColor
            ,titleAttributes: {
                color: config.tintColor
            }
        },
        tableView : {
            backgroundColor: config.backgroundColor
            ,separatorColor: '#888'
            //,separatorColor: 'black'
            ,allowsSelection: true
            ,scrollable: false
            ,top: 0
            ,width: Ti.UI.FILL
            ,height: Ti.UI.SIZE
        },
        lineRow : {
            title: "友達にLINEですすめる💚"
            ,color: config.mainTextColor
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 55
        },
        mailRow : {
            title: "友達にメールですすめる📩"
            ,color: config.mainTextColor
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 55
        },
        twitterRow : {
            title: "twitterでつぶやく🔵"
            ,color: config.mainTextColor
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 55
        },
        fbRow : {
            title: "facebookでシェア💙"
            ,color: config.mainTextColor
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 55
        },
        appReviewRow : {
            title: "レビューを書く（お願い🌟）"
            ,color: config.mainTextColor
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 55
        },
        mailToDeveloperRow : {
            title: "開発元にメールする📩"
            ,color: config.mainTextColor
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 55
        },
        ruleRow : {
            title: "利用規約"
            ,color: config.mainTextColor
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 55
        }
    },
	results : {
	    table : {
	        backgroundColor: config.backgroundColor,
	        separatorColor: 'gray',
	        allowsSelection: false
	    },
		tableViewRow : {
			height : 'auto',
			backgroundColor : config.backgroundColor,
//			backgroundSelectedColor : "#f66",
			className : 'resultsTableRow',
			type: 'CONTENT'
		},
        buttonBar : {
            backgroundColor: config.color
            ,tintColor: config.color
            ,width: 140
        },
		dateLabel : {
			width : 150,
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
			color : config.mainTextColor,
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
			color : config.mainTextColor,
			font : {fontSize : 25},
			height : "auto",
			top : 48,
			// bottom : 10,
			right : 10			
		},
        scoreLabelSmall : {
			color : config.mainTextColor,
            font : {fontSize : 15},
            height : "auto",
            top : 48,
            // bottom : 10,
            right : 10          
        },
		ticketButton : {
			title: "チケット",
			backgroundColor : config.resultsDetailBtnBgColorActive,
			color : config.resultsDetailBtnColorActive,
			font : {fontSize : 15, fontWeight: "bold"},
			borderRadius : 6,
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 214
		},
		detailButton : {
			title: "試合詳細",
			backgroundColor : config.resultsDetailBtnBgColorActive,
			color : config.resultsDetailBtnColorActive,
			font : {fontSize : 15, fontWeight: "bold"},
			borderRadius : 6,
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 112 //元々90
		},
		movieButton : {
			title: "動画検索",
			backgroundColor : config.resultsDetailBtnBgColorActive,
			color : config.resultsDetailBtnColorActive,
			font : {fontSize : 15, fontWeight: "bold"},
			borderRadius : 6,
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 10
		},
		otherTeamBtnAndroid : {
		    title: "他チーム日程"
            ,color: "white"
            ,borderWidth: 1
            ,backgroundColor: config.color
            ,borderRadius: 8
            ,height: 36
            ,width: 150
            ,top: 5		    
		}
	},
	standings : {
	    backgroundColor : config.standingsBgcolor,
	    teamFontColor : config.standingsTeamFontColor,
	    standingsViewiPhone : {
	        top : 0
	        ,backgroundColor: config.backgroundColor
	    },
        standingsViewAndroid : {
            top : 0
            ,bottom: 46
            ,backgroundColor: config.backgroundColor
        },
	    table : {
            top: 37
            ,allowsSelection: false
            ,separatorColor: '#666'
            ,backgroundColor: config.backgroundColor
	    },
	    headerView : {
	        top: 0
	        ,backgroundColor: config.backgroundColor
	    },
	    headerLabel : {
            height: 33,
            top : 1,
            backgroundColor: config.backgroundColor,
            color: config.mainTextColor
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
            ,color: config.mainTextColor
            ,backgroundColor: config.backgroundColor
            ,className: "standingsTableRow"
	    },
	    compeButtonBar : {
	        backgroundColor: config.color
            ,tintColor: config.color
            ,width: 200
	    },
        sortButtonAndroid : {
            title: "ソート"
            ,color: "white"
            //,borderColor: "#902020"
            ,borderWidth: 1
//            ,backgroundImage: "/images/toolbarBackground.png"
            ,backgroundColor: config.color
            ,borderRadius: 8
            ,height: 36
            ,width: 70
//            ,top: 5
        },
        jButtonAndroid : {
            color: "lightgray"
            ,font: {fontSize: 15, fontWeight: "bold"}
            ,borderWidth: 1
            ,backgroundColor: config.color
            ,borderRadius: 8
            ,height: 36
            ,width: 70
            ,top: 5
        },
        aclNabiscoButtonAndroid : {
            color: "white"
            ,opacity: 1.0
            //,borderColor: "#902020"
            ,borderWidth: 1
//            ,backgroundImage: "/images/toolbarBackground.png"
            ,backgroundColor: config.color
            ,borderRadius: 8
            ,enabled: true
            ,height: 36
            ,width: 70
            ,top: 5
        }
	},
	twitter : {
        webWindow : {
            backgroundColor: config.backgroundColor
            ,barColor: config.color
            ,navTintColor: config.tintColor
//            navBarHidden: true  
        },
        webWindowToolbar : {
            bottom: 0
            ,borderTop: true
            ,borderBottom: true
            ,backgroundColor: config.color        
        },
        listView : {
            separatorColor: '#666'
            ,allowsSelection: true
            ,backgroundColor: config.backgroundColor
        },
        listViewTemplate : [
            {
                type: 'Ti.UI.Label',
                bindId: 'userName',    //名前ラベル
                properties: {
                    color: config.mainTextColor
                    ,backgroundColor: config.backgroundColor
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
                    ,backgroundColor: config.backgroundColor
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
                    ,backgroundColor: config.backgroundColor
                },
                childTemplates: [
                    {
                        // iOSではLabelにリンクがつけられない
                        type: 'Ti.UI.Label',
                        bindId: 'content',
                        properties: {
                            color: config.mainTextColor
                            ,backgroundColor: config.backgroundColor
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
                            ,backgroundColor: config.backgroundColor
                        },
                        events: {
                            load: function(e){var util = require("/util/util").util; Ti.API.info('■■■image loaded. ' + util.toString(e.source));},
                            error: function(e){
                                var util = require("/util/util").util;
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
                    ,backgroundColor: config.backgroundColor
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
