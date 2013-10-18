function mypageCtrl($scope) {

    var TEXT_CONFIRM = "確定";
    var TEXT_OK = "◯";
    var TEXT_NG = "×";
    var TEXT_TMP = "候補";

    var TYPE_NG = 0;

    var CLASS_SCHEDULE = ".btn-schedule";

    var BTN_CONFIRM = "btn-danger disabled";
    var BTN_NG = "disabled";
    var BTN_OK = "";
    var BTN_TMP = "btn-primary";

    var STATUS_CONFIRM = "sts_confirmed";
    var STATUS_NG = "sts_ng";
    var STATUS_OK = "sts_ok";
    var STATUS_TMP = "sts_tmp";

    var TMP_OTHER = "tmp_other";
    var CONFIRMED = "confirmed";


    $(function () {

        var json = getEventList();

        // スケジュールをクリックした後でその日とその人の
        $(CLASS_SCHEDULE).die("click").live("click", function (e) {
            e.preventDefault();
            var clickedSchedule = $(this);

            // NGの場合は場合は何もしない。
            if (clickedSchedule.hasClass(BTN_NG)) {
                return;
            }

            var idx = clickedSchedule.parents("tr").find("td").index(clickedSchedule.parents("td"));

            // クリックした人のその日のステータスを変更
            changeStatus(clickedSchedule);


            if (clickedSchedule.hasClass(STATUS_TMP)) {
                // クリックした日の縦のステータスを変更
                clickedSchedule.parents("tr").find(CLASS_SCHEDULE).each(function () {
                    var each = $(this);
                    if (each.hasClass(STATUS_OK)) {
                        each.removeClass(BTN_NG).addClass(BTN_NG);
                    }
                });
                // クリックした人の横のステータスを変更
                $("table tr").each(function () {
                    var each = $(this).find("td:eq(" + idx + ")").find(CLASS_SCHEDULE);
                    if (each.hasClass(STATUS_OK)) {
                        each.removeClass(BTN_NG).addClass(BTN_NG);
                    }
                });
            } else {
                // クリックした日の縦のステータスを変更
                clickedSchedule.parents("tr").find(CLASS_SCHEDULE).each(function () {
                    var each = $(this);
                    if (!each.parents("td").hasClass(TMP_OTHER) && each.hasClass(STATUS_OK)) {
                        each.removeClass(BTN_NG);
                    }
                });
                // クリックした人の横のステータスを変更
                $("table tr").each(function () {
                    var each = $(this).find("td:eq(" + idx + ")").find(CLASS_SCHEDULE);
                    if (!$(this).hasClass(TMP_OTHER) && each.hasClass(STATUS_OK)) {
                        each.removeClass(BTN_NG);
                    }
                });
            }

        });

        // url
        $("#show-url-btn").popover();
        $("#show-url-btn").die("click").live("click", function (e) {
            e.preventDefault();
        });

        // datepicker
        $("#newDateArea").datepicker({
            format: 'yyyy/mm/dd'
        });

        $('#myModal').modal({
            show: false
        });

        // timepicker
        // http://jdewit.github.io/bootstrap-timepicker/
        $('#newTimeArea').timepicker({
            minuteStep: 10,
//            template: false,
            showInputs: false,
            showSeconds: false,
            defaultTime: '10:00',
            showMeridian: false,
            modalBackdrop: true
        });

        $("#newDateArea").keypress(function () {
            return false;
        });
        $("#newTimeArea").keypress(function () {
            return false;
        });


        $("#addEventBtn").die("click").live("click", function () {
            var title = $("#newEventTitle").val();
            if (isNull(title)) {
                return;
            }

            addEvent(title);
        });

    });

    var getEventList = function() {
        // alert("start!");
        $.ajax({
            url:"http://ec2-54-248-64-73.ap-northeast-1.compute.amazonaws.com/api/events/view/1.json",
            // url:"http://padule.me/api/events/view/1.json?jsoncallback=?",
            dataType:"jsonp",
            success:function() {
                alert("hoge");
            }
        });
//        $.getJSON("http://padule.me/api/events/view/1.json?jsoncallback=?", function(result) {
//            alert("hoge");
//        });
    }

    $scope.addDateTime = function() {
        var newDate = $("#newDateArea").val();
        var newTime = $("#newTimeArea").val();
        if (isNull(newDate) || isNull(newTime)) {
            alert("日付・開始時間を入力してください。")
            return;
        }
        // 日付
        var newDateTime = stringToDateYYYYMMDDHHMM(newDate + " " + newTime);

//        $scope.thisSchedules.push({"datetime": dateformatyyyyMMddWhhmmss(newDateTime), "fixed_job_seeker_id": 0, "id": $scope.thisSchedules.length + 1});
        alert("日程が追加されます。");

        $scope.changeSchedule(null, $scope.active_event_id);

    }

    $scope.eventHover = function () {
        $scope.eventHoverClass = "event-hover";
    }

    $scope.addEvent = function (title) {
        // TODO
        var events = getEvents();
        var event_id = events.length + 1;

        var newEvent = {
            "id": event_id,
            "title": title,
            "url": "http://padule.me/events/event/"
        }

        $scope.eventList.push(newEvent);
        $scope.changeSchedule(null, event_id);
        $('#myModal').modal('hide')
    }


    var isNull = function (obj) {
        return obj === null || obj === undefined || obj === "";
    }


    $scope.changeSchedule = function (e, event_id) {
        var result = true;
        if (e !== null && e !== undefined) {
            e.preventDefault();
            // 「OK」時の処理開始 ＋ 確認ダイアログの表示
            if (canSubmit()) {
                if (window.confirm('編集した内容は保存されません。よろしいですか？')) {
                    result = true;
                } else {
                    result = false;
                }
            }
        }

        if (result) {
            $scope.active_event_id = event_id;
            $scope.eventList = getEvents();
            var eventDetail = getEventDetail(event_id);
            if (isNull(eventDetail)) {
                $scope.jobSeekers = null;
                $scope.thisEvent = null;
                $scope.thisSchedules = null;
                return;
            }
            $scope.jobSeekers = eventDetail.JobSeekers;
            $scope.thisEvent = eventDetail.Event;
            $scope.thisSchedules = getSchedule(eventDetail);
        }
    }


    $scope.isActive = function (event_id) {
        if ($scope.active_event_id == event_id) {
            return "active"
        }
        return "";
    }


    // １スケジュールの１人ごとに状態を確認してテキストや色を変える
    $scope.checkStatus = function (schedule, jobSeeker) {
        // 確定済みの人がいたら確定済にして終わり
        if (schedule.fixed_job_seeker_id == jobSeeker.id) {
            $scope.status_text = TEXT_CONFIRM;
            $scope.btn_status = BTN_CONFIRM;
            $scope.status = STATUS_CONFIRM;
            return;
        }

        var schedules = jobSeeker.Locks;
        var each_schedule = schedules[schedule.id - 1];

        // 候補日がOKかNGか判定
        if (each_schedule.type == TYPE_NG) {
            $scope.btn_status = BTN_NG;
            $scope.status_text = TEXT_NG;
            $scope.status = STATUS_NG;
        } else {
            $scope.btn_status = BTN_OK;
            $scope.status_text = TEXT_OK;
            $scope.status = STATUS_OK;
        }

        // すでに確定済みの日がある人ならDisabledにして終わり
        var scheduleList = $scope.thisSchedules;
        for (i = 0; i < scheduleList.length; i++) {
            if (jobSeeker.id == scheduleList[i].fixed_job_seeker_id) {
                $scope.btn_status = BTN_NG;
                $scope.status = STATUS_CONFIRM;
                return;
            }
        }

        // すでに確定済みの人がいるならDisabledにして終わり
        if (schedule.fixed_job_seeker_id > 0) {
            $scope.btn_status = BTN_NG;
            $scope.status = STATUS_CONFIRM;
            return;
        }

    }

    $scope.checkConfirmed = function (schedule) {
        if (schedule.fixed_job_seeker_id > 0) {
            $scope.confirmed = CONFIRMED;
        } else {
            $scope.confirmed = ""
        }
    }

    var changeStatus = function (clickedSchedule) {
        var idx = clickedSchedule.parents("tr").find("td").index(clickedSchedule.parents("td"));

        if (clickedSchedule.hasClass(STATUS_OK)) {
            // OKの日をクリックしたら候補に変更
            clickedSchedule.parents("tr").addClass(TMP_OTHER);
            clickedSchedule.removeClass(STATUS_OK).removeClass(BTN_OK).removeClass(BTN_NG)
                .addClass(STATUS_TMP).addClass(BTN_TMP);
            clickedSchedule.text(TEXT_TMP);

            $("table tr").each(function () {
                var each = $(this).find("td:eq(" + idx + ")");
                each.removeClass(TMP_OTHER).addClass(TMP_OTHER);
            });

        } else if (clickedSchedule.hasClass(STATUS_TMP)) {
            clickedSchedule.parents("tr").removeClass(TMP_OTHER);
            // 候補の日をクリックしたらOKに変更
            clickedSchedule.removeClass(STATUS_TMP).removeClass(BTN_TMP).removeClass(BTN_NG)
                .addClass(STATUS_OK).addClass(BTN_OK);
            clickedSchedule.text(TEXT_OK);

            $("table tr").each(function () {
                var each = $(this).find("td:eq(" + idx + ")");
                each.removeClass(TMP_OTHER);
            });
        }

        canSubmit();
    }

    var canSubmit = function () {
        if ($("table").find("." + STATUS_TMP).length > 0) {
            $("#confirm-btn").removeClass("disabled");
            return true;
        } else {
            $("#confirm-btn").addClass("disabled");
            return false;
        }
    }


    var getEvents = function () {
        // TODO
        return EVENT_LIST.Events;
    }

    var getEventDetail = function (event_id) {
        // TODO
        return EVENT_DETAILS[event_id - 1];
    }

    var getSchedule = function (eventDetail) {
        var schedules = eventDetail.Schedules;
        for (idx = 0; idx < schedules.length; idx++) {
            var schedule = schedules[idx]

            var dateFormat = new DateFormat("yyyy-MM-dd HH:mm:ss");
            var date = dateFormat.parse(schedule.datetime); // StringをDateに変換
            schedule.datetime_f = dateformatyyyyMMddWhhmm(date);
        }
        return schedules;
    }

}

function dateformatyyyyMMddWhhmm(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var M = date.getMinutes();
    var w = date.getDay();
    var wNames = ['日', '月', '火', '水', '木', '金', '土'];

    if (m < 10) {
        m = '0' + m;
    }
    if (d < 10) {
        d = '0' + d;
    }
    if (h < 10) {
        h = '0' + h;
    }
    if (M < 10) {
        M = '0' + M;
    }
    return y + "/" + m + "/" + d + "(" + wNames[w] + ") " + h + ":" + M;
}

function dateformatyyyyMMddWhhmmss(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var M = date.getMinutes();
    var w = date.getDay();

    if (m < 10) {
        m = '0' + m;
    }
    if (d < 10) {
        d = '0' + d;
    }
    if (h < 10) {
        h = '0' + h;
    }
    if (M < 10) {
        M = '0' + M;
    }
    return y + "-" + m + "-" + d + " " + h + ":" + M;
}


function stringToDateYYYYMMDDHHMM(stringdate) {
    var dateFormat = new DateFormat("yyyy/MM/dd HH:mm");
    var date = dateFormat.parse(stringdate);
    return date;
}


// Test datas -------------------------------------------------------------
var EVENT_LIST =
{
    "Events": [
        {
            "id": 1,
            "title": "官公庁事業部 営業職１次面接",
            "url": "http://padule.me/events/event/aaabbbbccccddddd"
        },
        {
            "id": 2,
            "title": "秘書２次面接",
            "url": "http://padule.me/events/event/aaabbbbccccddddd"
        },
        {
            "id": 3,
            "title": "こにふぁー嫁面接",
            "url": "http://padule.me/events/event/aaabbbbccccddddd"
        }
    ]
}

var EVENT_DETAILS =
    [
        {
            "Event": {
                "id": 1,
                "title": "官公庁事業部 営業職１次面接",
                "url": "http://padule.me/events/event/aaabbbbccccddddd"
            },
            "JobSeekers": [
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1 //0=☓,1=◯
                        },
                        {
                            "schedule_id": 2,
                            "type": 1
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 1
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "月曜日が第一希望です。",
                    "id": 1,
                    "mail": "",
                    "username": "小西 裕介"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "火曜日が第一希望です。",
                    "id": 2,
                    "mail": "",
                    "username": "高橋 華子"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "水曜日が第一希望です。",
                    "id": 3,
                    "mail": "",
                    "username": "羽淵 あきひろ"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "木曜日が第一希望です。",
                    "id": 4,
                    "mail": "",
                    "username": "諸見里 一道"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "土日はいやです。",
                    "id": 5,
                    "mail": "",
                    "username": "佐藤 ふみのり"
                }
            ],
            "Schedules": [
                {
                    "datetime": "2013-03-20 10:00:00",
                    "fixed_job_seeker_id": 1, //確定済み求職者ID
                    "id": 1
                },
                {
                    "datetime": "2013-03-20 11:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 2
                },
                {
                    "datetime": "2013-03-20 12:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 3
                },
                {
                    "datetime": "2013-03-20 13:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 4
                },
                {
                    "datetime": "2013-03-20 14:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 5
                }
            ]

        },


        {
            "Event": {
                "id": 2,
                "title": "秘書２次面接",
                "url": "http://padule.me/events/event/aaabbbbccccddddd"
            },
            "JobSeekers": [
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1 //0=☓,1=◯
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 0
                        },
                        {
                            "schedule_id": 4,
                            "type": 1
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "月曜日が第一希望です。",
                    "id": 1,
                    "mail": "",
                    "username": "こにふぁー１"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 0
                        },
                        {
                            "schedule_id": 4,
                            "type": 1
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "火曜日が第一希望です。",
                    "id": 2,
                    "mail": "",
                    "username": "こにふぁー２"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 1
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 1
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "水曜日が第一希望です。",
                    "id": 3,
                    "mail": "",
                    "username": "こにふぁー３"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 1
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 1
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "木曜日が第一希望です。",
                    "id": 4,
                    "mail": "",
                    "username": "こにふぁー４"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 1
                        },
                        {
                            "schedule_id": 2,
                            "type": 1
                        },
                        {
                            "schedule_id": 3,
                            "type": 1
                        },
                        {
                            "schedule_id": 4,
                            "type": 1
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "土日はいやです。",
                    "id": 5,
                    "mail": "",
                    "username": "こにふぁー５"
                }
            ],
            "Schedules": [
                {
                    "datetime": "2013-03-20 10:00:00",
                    "fixed_job_seeker_id": 2, //確定済み求職者ID
                    "id": 1
                },
                {
                    "datetime": "2013-03-20 11:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 2
                },
                {
                    "datetime": "2013-03-20 12:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 3
                },
                {
                    "datetime": "2013-03-20 13:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 4
                },
                {
                    "datetime": "2013-03-20 14:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 5
                }
            ]

        },


        {
            "Event": {
                "id": 3,
                "title": "こにふぁー嫁面接",
                "url": "http://padule.me/events/event/aaabbbbccccddddd"
            },
            "JobSeekers": [
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 0 //0=☓,1=◯
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 0
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "月曜日が第一希望です。",
                    "id": 1,
                    "mail": "",
                    "username": "テスト１"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 0
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 0
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "火曜日が第一希望です。",
                    "id": 2,
                    "mail": "",
                    "username": "テスト２"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 0
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 0
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "水曜日が第一希望です。",
                    "id": 3,
                    "mail": "",
                    "username": "テスト３"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 0
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 0
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "木曜日が第一希望です。",
                    "id": 4,
                    "mail": "",
                    "username": "テスト４"
                },
                {
                    "Locks": [
                        {
                            "schedule_id": 1,
                            "type": 0
                        },
                        {
                            "schedule_id": 2,
                            "type": 0
                        },
                        {
                            "schedule_id": 3,
                            "type": 0
                        },
                        {
                            "schedule_id": 4,
                            "type": 0
                        },
                        {
                            "schedule_id": 5,
                            "type": 1
                        }
                    ],
                    "comment": "土日はいやです。",
                    "id": 5,
                    "mail": "",
                    "username": "テスト５"
                }
            ],
            "Schedules": [
                {
                    "datetime": "2013-03-20 10:00:00",
                    "fixed_job_seeker_id": 0, //確定済み求職者ID
                    "id": 1
                },
                {
                    "datetime": "2013-03-20 11:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 2
                },
                {
                    "datetime": "2013-03-20 12:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 3
                },
                {
                    "datetime": "2013-03-20 13:00:00",
                    "fixed_job_seeker_id": 0,
                    "id": 4
                },
                {
                    "datetime": "2013-03-20 14:00:00",
                    "fixed_job_seeker_id": 3,
                    "id": 5
                }
            ]

        }

    ]


var EVENT_DETAIL =
{"events":
    [
        {
            "Event":
            {
                "id":"1",
                "user_id":"4",
                "title":"\u25ef\u25ef\u9762\u63a5",
                "text":"\u3053\u306e\u5ea6\u306f\u3001\u5f0a\u793e\u306b\u3054\u5fdc\u52df\u3044\u305f\u3060\u304d\u3001\u8aa0\u306b\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3057\u305f\u3002\r\n\u662f\u975e\u4e00\u5ea6\u3054\u9762\u63a5\u306e\u6a5f\u4f1a\u3092\u8a2d\u3051\u3055\u305b\u3066\u3044\u305f\u3060\u304d\u305f\u304f\u5b58\u3058\u4e0a\u3052\u307e\u3059\u3002\u3064\u304d\u307e\u3057\u3066\u306f\u3001\u9762\u63a5\u5185\u5bb9\u3092\u3054\u78ba\u8a8d\u306e\u3046\u3048\u3001\u3054\u90fd\u5408\u306e\u826f\u3044\u65e5\u6642\u306b\u3054\u4e88\u7d04\u3044\u305f\u3060\u3051\u307e\u3059\u3088\u3046\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u81f4\u3057\u307e\u3059\u3002\r\n\r\n\u3010\u5185\u5bb9\u3011\u25cb\u25cb\u3068\u306e\u500b\u4eba\u9762\u63a5\u300060\u5206\r\n\r\n\u3010\u6240\u8981\u6642\u9593\u3011\u300030\u5206\uff5e60\u5206\r\n\u3010\u6301\u3061\u7269\u3011\u3000\u5c65\u6b74\u66f8\uff08\u5199\u771f\u8cbc\u4ed8\uff09\u3001\u7b46\u8a18\u7528\u5177\r\n\r\n\u9078\u8003\u3092\u901a\u3057\u3066\u3001\u5f53\u793e\u3078\u306e\u7406\u89e3\u3092\u3088\u308a\u6df1\u3081\u3066\u3044\u305f\u3060\u3051\u307e\u3059\u3068\u5e78\u3044\u3067\u3059\u3002\r\n\u305d\u308c\u3067\u306f\u3054\u4e88\u7d04\u3092\u304a\u5f85\u3061\u3057\u3066\u304a\u308a\u307e\u3059\uff01\r\n",
                "url":"\/locks\/add\/aa",
                "enabled":null,
                "created":"2013-03-11 17:15:27",
                "modified":"2013-03-11 17:15:27"
            }
        },
        {
            "Event":
            {
                "id":"2",
                "user_id":"4",
                "title":"\u25ef\u25ef\u9762\u63a5",
                "text":"\u3053\u306e\u5ea6\u306f\u3001\u5f0a\u793e\u306b\u3054\u5fdc\u52df\u3044\u305f\u3060\u304d\u3001\u8aa0\u306b\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3057\u305f\u3002\r\n\u662f\u975e\u4e00\u5ea6\u3054\u9762\u63a5\u306e\u6a5f\u4f1a\u3092\u8a2d\u3051\u3055\u305b\u3066\u3044\u305f\u3060\u304d\u305f\u304f\u5b58\u3058\u4e0a\u3052\u307e\u3059\u3002\u3064\u304d\u307e\u3057\u3066\u306f\u3001\u9762\u63a5\u5185\u5bb9\u3092\u3054\u78ba\u8a8d\u306e\u3046\u3048\u3001\u3054\u90fd\u5408\u306e\u826f\u3044\u65e5\u6642\u306b\u3054\u4e88\u7d04\u3044\u305f\u3060\u3051\u307e\u3059\u3088\u3046\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u81f4\u3057\u307e\u3059\u3002\r\n\r\n\u3010\u5185\u5bb9\u3011\u25cb\u25cb\u3068\u306e\u500b\u4eba\u9762\u63a5\u300060\u5206\r\n\r\n\u3010\u6240\u8981\u6642\u9593\u3011\u300030\u5206\uff5e60\u5206\r\n\u3010\u6301\u3061\u7269\u3011\u3000\u5c65\u6b74\u66f8\uff08\u5199\u771f\u8cbc\u4ed8\uff09\u3001\u7b46\u8a18\u7528\u5177\r\n\r\n\u9078\u8003\u3092\u901a\u3057\u3066\u3001\u5f53\u793e\u3078\u306e\u7406\u89e3\u3092\u3088\u308a\u6df1\u3081\u3066\u3044\u305f\u3060\u3051\u307e\u3059\u3068\u5e78\u3044\u3067\u3059\u3002\r\n\u305d\u308c\u3067\u306f\u3054\u4e88\u7d04\u3092\u304a\u5f85\u3061\u3057\u3066\u304a\u308a\u307e\u3059\uff01\r\n",
                "url":"\/locks\/add\/cc",
                "enabled":null,
                "created":"2013-03-11 17:16:34",
                "modified":"2013-03-11 17:16:34"
            }
        },
        {
            "Event":
            {
                "id":"3",
                "user_id":"4",
                "title":"\u25ef\u25ef\u9762\u63a5",
                "text":"\u3053\u306e\u5ea6\u306f\u3001\u5f0a\u793e\u306b\u3054\u5fdc\u52df\u3044\u305f\u3060\u304d\u3001\u8aa0\u306b\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3057\u305f\u3002\r\n\u662f\u975e\u4e00\u5ea6\u3054\u9762\u63a5\u306e\u6a5f\u4f1a\u3092\u8a2d\u3051\u3055\u305b\u3066\u3044\u305f\u3060\u304d\u305f\u304f\u5b58\u3058\u4e0a\u3052\u307e\u3059\u3002\u3064\u304d\u307e\u3057\u3066\u306f\u3001\u9762\u63a5\u5185\u5bb9\u3092\u3054\u78ba\u8a8d\u306e\u3046\u3048\u3001\u3054\u90fd\u5408\u306e\u826f\u3044\u65e5\u6642\u306b\u3054\u4e88\u7d04\u3044\u305f\u3060\u3051\u307e\u3059\u3088\u3046\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u81f4\u3057\u307e\u3059\u3002\r\n\r\n\u3010\u5185\u5bb9\u3011\u25cb\u25cb\u3068\u306e\u500b\u4eba\u9762\u63a5\u300060\u5206\r\n\r\n\u3010\u6240\u8981\u6642\u9593\u3011\u300030\u5206\uff5e60\u5206\r\n\u3010\u6301\u3061\u7269\u3011\u3000\u5c65\u6b74\u66f8\uff08\u5199\u771f\u8cbc\u4ed8\uff09\u3001\u7b46\u8a18\u7528\u5177\r\n\r\n\u9078\u8003\u3092\u901a\u3057\u3066\u3001\u5f53\u793e\u3078\u306e\u7406\u89e3\u3092\u3088\u308a\u6df1\u3081\u3066\u3044\u305f\u3060\u3051\u307e\u3059\u3068\u5e78\u3044\u3067\u3059\u3002\r\n\u305d\u308c\u3067\u306f\u3054\u4e88\u7d04\u3092\u304a\u5f85\u3061\u3057\u3066\u304a\u308a\u307e\u3059\uff01\r\n",
                "url":"\/locks\/add\/cc",
                "enabled":null,
                "created":"2013-03-11 17:17:32",
                "modified":"2013-03-11 17:17:32"
            }
        },
        {
            "Event":
            {
                "id":"4",
                "user_id":"4",
                "title":"title",
                "text":null,
                "url":"\/locks\/add\/14ac3d17e72099aa4577e",
                "enabled":null,
                "created":"2013-03-29 15:31:21",
                "modified":"2013-03-29 15:31:21"
            }
        },
        {
            "Event":
            {
                "id":"5",
                "user_id":"4",
                "title":"title",
                "text":null,
                "url":"\/locks\/add\/9a32686d8f9f81f44ae3f",
                "enabled":null,
                "created":"2013-03-29 15:32:36",
                "modified":"2013-03-29 15:32:36"
            }
        }
    ],
    "env":
    {
        "success":true
    }
}