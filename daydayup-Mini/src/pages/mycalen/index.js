import initCalendar, {
  getSelectedDay,
  jumpToToday,
  setTodoLabels,
  clearTodoLabels,
  tapDayItem
} from '../../template/calendar/index';

// pages/list/list.js
const App = getApp();

var days = [];
var testallTasks = [];
var tasks = [];
//var nav_centent_list = ['lina', 'sister', 'brother', 'mom'];

const promisic = function (func) {
  return function (params = {}) {
    return new Promise((resolve, reject) => {
      const args = Object.assign(params, {
        success: (res) => {
          resolve(res);
        },
        fail: (error) => {
          reject(error);
        }
      });
      func(args);
    });
  };
};

class Http {
  // 同步Http请求
  static async asyncRequest(url, method, data, backMethod) {
    let res = await promisic(wx.request)({
      url: url,
      method: method,
      data: data,
    })
    backMethod(res)
  }
}

function setGetAllTasks(currentSelect) {
  tasks = [];
  testallTasks.forEach((item) => {
    // console.log("========item=======",item);
    if (item.year === currentSelect.year && item.month === currentSelect.month && item.day === currentSelect.day) {
      item.isTouchMove = false;
      tasks.push(item);
    }
  });
}
const conf = {


  data: {
    taskList: [],
    index: 1,
    unReadLetter: 0,
    showModalStatus: false,

    isSubmit: false,
    phone: "",
    warn: "",
    name: "",
    //表示表单现在表单内容
    location: 1,
    backgroundcolorOne: "white",
    backgroundcolorTwo: "#0899f99e",
    'showMenu': false,
    nav_centent: null,
    changeName: false

  },

  detailPage: function (e) {
    try {
      //console.log("taskId", e.currentTarget.dataset.taskid);
      wx.setStorageSync('taskId', e.currentTarget.dataset.taskid);
    } catch (e) {
      console.log(e);
    }
    testallTasks = [];
    //调用路由api
    wx.redirectTo({
      url: '../../pages/detail/detail',
    })
  },

  info() {
    var that = this;


    let nickName = App.globalData.nickName
    console.log("========nickName========", nickName)
    var localNickName = that.data.nickName;
    var choseUsr = {}
    if(that.data.usr_centent_list!=null)
    for(var i =0 ;i<that.data.usr_centent_list.length;i++){
      if(that.data.usr_centent_list[i].names == localNickName){
        wx.setStorage({
          key: 'choseUsr',
          data: that.data.usr_centent_list[i]
        })
        choseUsr = that.data.usr_centent_list[i]
        
        console.log("当前选择的是：",choseUsr)
      }
    }
    if (that.data.nickName == null) {
      //console.log("========nickName========", nickName)
      
      localNickName = nickName;
    }
    //不管空不空都是重新存储到本地
    wx.setStorage({
      key: 'nickName',
      data: localNickName
    })
    that.setData({
      'nickName': localNickName
    })
    //console.log("==========localNickName==================",localNickName)



    var userInfo = {};

    
    userInfo.openid = App.globalData.openid;
    that.setData({
      'openid': App.globalData.openid
    })
    wx.setStorage({
      key: 'openid_usr',
      data: App.globalData.openid
    })
    if(choseUsr!=null){
      if(choseUsr.type==2)
        that.setData({
          'openid': choseUsr.userId
        })
    }
    Http.asyncRequest(
        App.globalData.url + ':8874/oneDayTask/getTasks/' + that.data.openid + '?' + 'nickName=' + that.data.nickName,
        'POST', {},
        res => {
          //先清空标记

          //请求成功之后，把openid放到储存里面

          wx.setStorage({
            key: 'openid',
            data: res.data.data.role
          })

          var oldDays = that.data.days;
          if (oldDays != null) {

            for (var i = 0; i < oldDays.length; i++) {
              oldDays[i].hasTodo = false;
              oldDays[i].dotColor = "";
            }
            that.setData({
              'days': oldDays
            })
            console.log(oldDays)
            for (var i = 0; i < days.length; i++) {
              days[i].hasTodo = false;
              days[i].dotColor = "";
            }
          }
          that.setData({
            'days': []
          })
          days = [];
          testallTasks = [];
          var taskList = res.data.data.task;
          var k = 0;
          if (taskList != null) {
            for (var i = 0; i < taskList.length; i++) {
              var startDate = taskList[i].startDate;

              var endDate = taskList[i].deadLine;

              //算相差的天数
              var startN = new Date(startDate.replace(/-/g, "/"));

              var taskStartYear = startN.getFullYear();
              var taskStartMonth = startN.getMonth();
              var taskStartDay = startN.getDate();

              // console.log("===============taskStartMonth=====================",taskStartMonth)

              var endN = new Date(endDate.replace(/-/g, "/"));
              var endStartYear = endN.getFullYear();
              var endStartMonth = endN.getMonth();
              var endStartDay = endN.getDate();

              var continueDays = parseInt((endN.getTime() - startN.getTime()) / (1000 * 60 * 60 * 24));

              for (var j = 0; j <= continueDays; j++) {
                console.log("continuedays", continueDays);
                var startYear = startN.getFullYear();
                var startMonth = parseInt(startN.getMonth() + 1);
                var startDay = startN.getDate();

                //天数的设置   task存在的天数
                var tmpday = {
                  year: "",
                  month: "",
                  day: ""
                }

                tmpday.year = startYear;
                tmpday.month = startMonth;
                tmpday.day = startDay;
                days.push(tmpday);

                //任务的设置  需要修改用户的手机号为   微信号  或者微信名称
                var tmptask = {
                  id: "",
                  taskName: "",
                  year: "",
                  month: "",
                  day: "",
                  startDate: "",
                  deadLine: "",
                  startTime: "",
                  endTime: "",
                  tskTime: "",
                  alert: "",
                  ifNew: ""
                }
                tmptask.id = taskList[i].id;
                tmptask.taskName = taskList[i].taskName;

                tmptask.year = startYear;
                tmptask.month = startMonth;
                tmptask.day = startDay;

                tmptask.startDate = taskList[i].startDate;

                tmptask.deadLine = taskList[i].deadLine;

                tmptask.startTime = tmptask.startDate.substring(11, 16);
                tmptask.endTime = tmptask.deadLine.substring(11, 16);

                tmptask.alert = taskList[i].alert;

                tmptask.tskTime = startYear + "-" + startMonth + "-" + startDay;

                //日期格式化
                var tskTime = new Date(tmptask.tskTime.replace(/-/g, "/"));
                var now_date = new Date();
                //转成毫秒数，两个日期相减
                var ms = now_date.getTime() - tskTime.getTime();
                //转换成天数
                var day = parseInt(ms / (1000 * 60 * 60 * 24));
                //do something
                if (day > 0)
                  tmptask.ifNew = 1;
                else
                  tmptask.ifNew = 0;

                testallTasks.push(tmptask);


                startN.setTime(startN.getTime() + 24 * 60 * 60 * 1000);
                k++;
              }
            }

            /*var tmptask = {
              id: "111",
              taskName: "test",
              year: 2022,
              month: 7,
              day: 8,
              startDate: "2022-09-08 12:00:00",
              deadLine: "2022-09-08 13:00:00",
              startTime: "12:00:00",
              endTime: "13:00:00",
              tskTime: "2022-09-08",
              alert: "",
              ifNew: 0
            }
            testallTasks.push(tmptask);*/

            that.setData({
              'taskList': testallTasks
            });

            // console.log("===========taskList========", that.data.taskList);

            var tmpday = {
              year: 2022,
              month: 9,
              day: 8
            }
            var timestamp = Date.parse(new Date());
            var date = new Date(timestamp);
            //获取年份  
            var Y = date.getFullYear();
            //获取月份  
            var M = date.getMonth() + 1;
            //获取当日日期 
            var D = date.getDate();
            console.log("当前时间：" + Y + '年' + M + '月' + D + '日');
            tmpday.year = Y;
            tmpday.month = M;
            tmpday.day = D;
            days.push(tmpday);
            that.setData({
              'days': days,
              'calendar.todoLabels': days
            });

            /*var tmpday = {
              year: 2022,
              month: 9,
              day: 8
            }
            //days.push(tmpday);
            that.setData({
              'days': days
            });*/
            // console.log("days",days);
            //console.log("tasks",testallTasks);
            initCalendar({
              // multi: true, // 是否开启多选,
              // disablePastDay: true, // 是否禁选过去日期
              /**
               * 选择日期后执行的事件
               * @param { object } currentSelect 当前点击的日期
               * @param { array } allSelectedDays 选择的所有日期（当mulit为true时，才有allSelectedDays参数）
               */
              afterTapDay: (currentSelect, allSelectedDays) => {
                console.log('===============================');
                console.log('当前点击的日期', currentSelect);
                console.log('当前点击的日期是否有事件标记: ', currentSelect.hasTodo || false);
                //console.log(tasks.length);
                if (currentSelect.hasTodo) {
                  setGetAllTasks(currentSelect);
                } else {
                  tasks = [];
                  that.setData({
                    'tasks': tasks
                  });
                }
                //console.log('==============allTasks=================',allTasks);
                that.setData({
                    'tasks': tasks
                  }),
                  //console.log('==============allTasks=================', that.data);


                  allSelectedDays && console.log('选择的所有日期', allSelectedDays);
                //console.log('getSelectedDay方法', getSelectedDay());
              },
              /**
               * 日期点击事件（此事件会完全接管点击事件）
               * @param { object } currentSelect 当前点击的日期
               * @param { object } event 日期点击事件对象
               */
              // onTapDay(currentSelect, event) {
              //   console.log(currentSelect);
              //   console.log(event);
              // },
              /**
               * 日历初次渲染完成后触发事件，如设置事件标记
               */
              afterCalendarRender() {

                //console.log("========dayslength======",that.data.days);

                setTodoLabels({
                  pos: 'bottom',
                  dotColor: '#40',
                  days: that.data.days,
                });
              }


            });
            that.setData({
              location: 1,
              backgroundcolorOne: "#0899f95c",
              backgroundcolorTwo: "#0899f99e"
            });
            setGetAllTasks(that.data.calendar.selectedDay[0]);
            //console.log("that.data.calendar.selectedDay", that.data.calendar.selectedDay[0]);

            //console.log('==============allTasks=================', that.data.taskList);

          };
          var tmptask = {
            id: "111",
            taskName: "test",
            year: 2022,
            month: 7,
            day: 8,
            startDate: "2022-09-04 12:00:00",
            deadLine: "2022-09-04 13:00:00",
            startTime: "12:00:00",
            endTime: "13:00:00",
            tskTime: "2022-09-04",
            alert: "",
            ifNew: 0
          }
          testallTasks.push(tmptask);

          that.setData({
            'taskList': testallTasks
          });

          var tmpday = {
            year: 2022,
            month: 7,
            day: 8
          }
          days.push(tmpday);
          var tmpday = {
            year: 2022,
            month: 8,
            day: 8
          }
          days.push(tmpday);
          that.setData({
            'days': days,
            'chdays': days
          });

          initCalendar({
            // multi: true, // 是否开启多选,
            // disablePastDay: true, // 是否禁选过去日期
            /**
             * 选择日期后执行的事件
             * @param { object } currentSelect 当前点击的日期
             * @param { array } allSelectedDays 选择的所有日期（当mulit为true时，才有allSelectedDays参数）
             */
            afterTapDay: (currentSelect, allSelectedDays) => {
              console.log('===============================');
              console.log('当前点击的日期', currentSelect);
              console.log('当前点击的日期是否有事件标记: ', currentSelect.hasTodo || false);
              //console.log(tasks.length);
              if (currentSelect.hasTodo) {
                setGetAllTasks(currentSelect);
              } else {
                tasks = [];
                that.setData({
                  'onedaytasks': tasks
                });
              }
              //console.log('==============allTasks=================',allTasks);
              that.setData({
                  'onedaytasks': tasks
                }),
                //console.log('==============allTasks=================', that.data);


                allSelectedDays && console.log('选择的所有日期', allSelectedDays);
              //console.log('getSelectedDay方法', getSelectedDay());
            },
            /**
             * 日期点击事件（此事件会完全接管点击事件）
             * @param { object } currentSelect 当前点击的日期
             * @param { object } event 日期点击事件对象
             */
            // onTapDay(currentSelect, event) {
            //   console.log(currentSelect);
            //   console.log(event);
            // },
            /**
             * 日历初次渲染完成后触发事件，如设置事件标记
             */
            afterCalendarRender() {

              console.log("========dayslength======", that.data.days);

              setTodoLabels({
                pos: 'bottom',
                dotColor: '#40',
                days: that.data.days,
              });
            }


          });
          that.setData({
            location: 1,
            backgroundcolorOne: "#0899f95c",
            backgroundcolorTwo: "#0899f99e"
          });
          setGetAllTasks(that.data.calendar.selectedDay[0]);
          console.log("that.data.calendar.selectedDay", that.data.calendar.selectedDay[0]);
          var e = {}
          var currentTarget = {}
          var dataset = {}
          dataset.idx = that.data.calendar.selectedDay[0].day - 1
          dataset.disable = false
          currentTarget.dataset = dataset
          e.currentTarget = currentTarget
          that.tapDayItem(e);
          console.log('==============allTasks=================', that.data.taskList);
        }
      )
      if(that.data.openid == App.globalData.openid){
      Http.asyncRequest(
        App.globalData.url + ':8874/fUser/getMiniusers/' + that.data.openid,
        'GET', {},
        res => {
          var usr_centent_list = [];
          usr_centent_list = res.data.data;
          that.setData({
            'usr_centent_list': usr_centent_list
          })
          //请求成功之后，把openid放到储存里面

          var usr;
          if(usr_centent_list!=null)
            for (var i = 0; i < usr_centent_list.length; i++) {
              usr_centent_list[i].isTouchMove = false;
              if (usr_centent_list[i].type == 0)
                usr = usr_centent_list[i];
            }

          wx.setStorage({
            key: 'usr_centent_list',
            data: usr_centent_list
          })

          wx.setStorage({
            key: 'usr',
            data: usr
          })

          that.setData({
            'usr': usr
          })

          console.log("====usr_centent_list=====", usr_centent_list);
        }
      )
  }




  },

  //请求获取到task

  onLoad: function () {
    this.showComponent();
    var that = this;
    that.setData({
      'authUser': App.globalData.authUser
    })
    console.log("that.data.authUser", that.data.authUser)
    if (!that.data.authUser) {
      /** wx.showModal({
        title: '提示',
        content: '需要用户授予昵称',
        success(res) {
          if (res.confirm) {
            wx.getUserProfile({
              desc: '用于完善用户资料',
              //成功后会返回
              success: (resdata) => {
                console.log("======", resdata);
                that.setData({
                  authUser: true
                })
                App.globalData.authUser = true;
                App.globalData.nickName = resdata.userInfo.nickName;

                console.log("======", App.globalData.nickName);
                App.openSocket();
                getApp().watch(that.readLetter); // 设置监听

                //不是改变的话就去获取用户名字
                that.info();
                //这里初始化最开始每天的日程
                //console.log("=======that======",that)
                //console.log("字符串转日期", new Date("2022-03-18 12:12:12".replace(/-/g,"/")).getDate());
                //console.log("=========days=========",that.days);

                wx.getSystemInfo({
                  success: (result) => {
                    let screenHeight = wx.getSystemInfoSync().windowHeight;

                    //通过query 获取其他盒子的高度
                    let query = wx.createSelectorQuery().in(that);
                    query.select('.calendar-wrap').boundingClientRect();
                    query.select('.content').boundingClientRect();

                    //通过query.exec 返回的数组 进行减法 同时去除margin和border的
                    query.exec(res => {
                      let h1 = res[0].height;
                      let h2 = res[1].height;

                      let scrollHeight = screenHeight - h1 - h2;
                      //console.log(scrollHeight, 'scrollHeight');
                      that.setData({
                        clientHeight: scrollHeight,

                      });
                    });

                  },
                })
              }

            })

          } else if (res.cancel) {
            console.log('用户点击拒绝')
            wx.showToast({
              title: '拒绝',
              icon: 'error',
              duration: 2000,
              success: function () {
                setTimeout(() => {
                  wx.switchTab({
                    url: '../index/index',
                  })
                }, 2000);
              }
            })
          }
        }
      })*/
      wx.navigateTo({
        url: '/pages/grantAuth/index',
      })
    } else {
      getApp().watch(that.readLetter); // 设置监听

      //不是改变的话就去获取用户名字
      that.info();

      //console.log("字符串转日期", new Date("2022-03-18 12:12:12".replace(/-/g,"/")).getDate());
      //console.log("=========days=========",that.days);

      wx.getSystemInfo({
        success: (result) => {
          let screenHeight = wx.getSystemInfoSync().windowHeight;

          //通过query 获取其他盒子的高度
          let query = wx.createSelectorQuery().in(that);
          query.select('.calendar-wrap').boundingClientRect();
          query.select('.content').boundingClientRect();

          //通过query.exec 返回的数组 进行减法 同时去除margin和border的
          query.exec(res => {
            let h1 = res[0].height;
            let h2 = res[1].height;

            let scrollHeight = screenHeight - h1 - h2;
            //console.log(scrollHeight, 'scrollHeight');
            that.setData({
              clientHeight: scrollHeight,
              
            });
          });

        },
      })
    }




  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    //console.log('==============allTasks=================', that.data);


  },



  onShow: function () {
    var that = this


    if (typeof that.getTabBar === 'function' && that.getTabBar()) {
      that.getTabBar().setData({
        selected: 1 //0,1，2 0-导航一  1-导航二  2-个人中心
      })
    }
    that.onLoad();
  },

  /**
   * 跳转至今天
   */
  jump() {
    var that = this;
    jumpToToday();
    
  },

  searchTask: function () {
    var taskList = this.data.taskList;
    wx.navigateTo({
      url: '../../pages/searchBar/searchBar',
      title: "文本输入"
    })
    console.log("searchTask")
  },

  changeLocationToOne: function () {
    var that = this
    console.log(this.data);
    that.setData({
      location: 1,
      backgroundcolorOne: "#0899f95c",
      backgroundcolorTwo: "#0899f99e"
    })
    return;
  },
  changeLocationToTwo: function () {
    var that = this
    that.setData({
      location: 2,
      backgroundcolorOne: "#0899f99e",
      backgroundcolorTwo: "#0899f95c"
    })
    return;
  },

  //做两个提交  
  /**
   * 提交需要判断
   */
  formSubmit: function (e) {

    var that = this

    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    let {
      phone,
      name,
      nameusr
    } = e.detail.value;
    if (that.data.location == 1) {
      if (!phone) {
        this.setData({
          warn: "微信号为空！",
          isSubmit: true
        })
        return;
      }
      var addMsg = {};
      addMsg.fid = App.globalData.userinfo.id;
      addMsg.tname = e.detail.value.phone;
      console.log("====addMsg====发送好友添加请求=====", addMsg);
      Http.asyncRequest(
        App.globalData.url + ':8874/fUser/add',
        'POST', addMsg,
        res => {
          //console.log('=====nameusr======', nameusr);
          if (res.data.code == 200)
            wx.showToast({
              title: "已发送请求",
              icon: 'success',
              duration: 2000, //持续的时间
            })
          if (res.data.code == 400)
            wx.showToast({
              title: "error",
              icon: 'error',
              duration: 2000, //持续的时间
            })
        }
      )
    } else if (that.data.location == 2) {
      Http.asyncRequest(
        App.globalData.url + ':8874/fUser/createMiniChild/' + that.data.openid + '/' + nameusr,
        'POST', {},
        res => {
          console.log('=====nameusr======', nameusr);
          if (res.data.code == 200) {
            var usr_centent_list = that.data.usr_centent_list;
            usr_centent_list.push(res.data.data);
            that.setData({
              'nav_centent': usr_centent_list, //每点击一次就取反
            });
          }
        }
      )

    }
    that.setData({
      warn: "",
      isSubmit: true,
      phone,
      name,
      nameusr
    })
  },

  click_nav: function (e) {
    var that = this;
    //console.log("=-====click_nav ====");
    var usr_centent_list = that.data.usr_centent_list;


    if (!that.data.showMenu) {

      that.setData({
        'nav_centent': usr_centent_list, //每点击一次就取反
        'showMenu': true,
      });
      console.log('====nav_centent===', that.data.nav_centent);

    } else {
      that.setData({
        'nav_centent': null, //每点击一次就取反
        'showMenu': false,
      });
    }
  },
  click_item: function (e) {
    console.log("=====choseitem====", e.currentTarget.dataset.choseitem);
    this.setData({
      nickName: e.currentTarget.dataset.choseitem.names,
      changeName: true,
      onedaytasks: []
    })
    clearTodoLabels();
    this.onLoad();
  },
  powerDrawer: function (e) {
    var that = this
    console.log("testestest======================powerDrawer", e.currentTarget.dataset.statu);
    var currentStatu = e.currentTarget.dataset.statu;
    that.util(currentStatu);
    //console.log("testestest======================powerDrawer", that);

  },

  closefrom: function(e){
    this.setData({
      showModalStatus: false
    });
  },

  util: function (currentStatu) {
    console.log("=================被调用了=================");
    var that = this
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation = wx.createAnimation({
      duration: 200, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });

    // 第2步：这个动画实例赋给当前的动画实例  
    that.animation = animation;

    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存  
    that.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function () {

      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      that.setData({
        animationData: animation
      })

      //关闭  
      if (currentStatu == "close") {
        that.setData({
          showModalStatus: false
        });
      }
    }.bind(that), 200)

    // 显示  
    if (currentStatu == "open") {

      that.setData({
        showModalStatus: true
      });
    }


  },
  touchstart: function (e) {
    console.log('touchstart');
    //开始触摸时 重置所有删除
    let data = App.touch._touchstart(e, this.data.nav_centent) //将修改过的list setData
    this.setData({
      nav_centent: data
    })
  },

  touchstartTask: function (e) {
    console.log('touchstart');
    //开始触摸时 重置所有删除
    let data = App.touch._touchstart(e, this.data.onedaytasks) //将修改过的list setData
    this.setData({
      onedaytasks: data
    })
  },
  //滑动事件处理
  touchmoveTask: function (e) {
    console.log('touchmove');
    console.log(e.currentTarget.dataset.id);
    console.log(this.data.onedaytasks);
    let data = App.touch._touchmove(e, this.data.onedaytasks, 'id') //将修改过的list setData
    console.log(this.data.onedaytasks);
    this.setData({
      onedaytasks: data
    })
  },
  touchmove: function (e) {
    console.log('touchmove');

    let data = App.touch._touchmove(e, this.data.nav_centent, 'userId') //将修改过的list setData
    this.setData({
      nav_centent: data
    })
  },
  touchdeletetask:function (e) {
    console.log("要删除的id", e.currentTarget.dataset.chosedelete);
    var deleteId = e.currentTarget.dataset.chosedelete;
    var that = this
    console.log(deleteId)
   
    wx.showModal({
      title: '提示',
      content: '确定要删除此日程吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');
          Http.asyncRequest(
            App.globalData.url+":8874/oneDayTask/deleteTask/"+deleteId,
            'POST',{},
            res => {
               console.log('=====deleteResult======', res.data);
              if (res.data.code == 200){
                wx.showToast({
                  title: '成功删除',
                  icon: 'success',
                  duration: 2000, //持续的时间
                })
                var oneDayTasks = that.data.onedaytasks
                var tasks = []
                for(var i = 0;i<oneDayTasks.length;i++){
                  if(oneDayTasks[i].id != deleteId)
                     tasks.push(oneDayTasks[i])
                }
                that.setData({
                  "onedaytasks": tasks
                })
              }
              else if (res.data.code == 400)
                wx.showToast({
                  title: res.data.msg,
                  icon: 'error',
                  duration: 2000, //持续的时间
      
                })
            }
          )
        
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
      }
    })
    console.log(deleteId)
  },
  //删除用户
  touchdelete: function (e) {
    console.log("要删除的id", e.currentTarget.dataset.chosedelete);
    var deleteId = e.currentTarget.dataset.chosedelete;
    var user_list = this.data.nav_centent;
    var new_user_list = [];
    var goalUser = {};
    for (var i = 0; i < user_list.length; i++) {
      if (user_list[i].userId != deleteId)
        new_user_list.push(user_list[i]);
      else goalUser = user_list[i];
    }

    console.log("new_user_list", new_user_list);
    this.setData({
      "nav_centent": new_user_list,
      'usr_centent_list': new_user_list
    });

    var deleteType = 1;
    var openid = this.data.openid;
    console.log("===要删除的好友===", goalUser)
    Http.asyncRequest(
      App.globalData.url + ':8874/fUser/deleteMiniUser/' + openid,
      'DELETE', goalUser,
      res => {
        // console.log('=====deleteResult======', res.data.data);
        if (res.data.code == 200)
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000, //持续的时间
          })
        else if (res.data.code == 400)
          wx.showToast({
            title: res.data.msg,
            icon: 'error',
            duration: 2000, //持续的时间

          })
      }
    )
  },
  //websocket监控
  /**
   * 设置监听器  当App.unReadLetter通过setdata发生变化
   * 对自己的值进行更新
   */


  readLetter: function () {

    console.log("===", this.data.unReadLetter, App.globalData.unReadLetter)
    this.setData({
      'unReadLetter': App.globalData.unReadLetter
    })

  },

  //点击之后清空App.globalData.unReadLetter
  //点击进入之后获取到所有的未处理请求  --处理过的消息不在展示
  //先把一条路走通过去   接收好友请求  +  处理好友请求
  addGlobal: function () {
    var unReadLetter = App.globalData.unReadLetter;
    console.log(unReadLetter);
    console.log("调用了add方法，点击清空未读信件");
    App.globalData.unReadLetter = 0;
    Http.asyncRequest(
      App.globalData.url + ':8874/fUser/getAllRequest',
      'GET', {
        'tId': App.globalData.userinfo.id
      },
      res => {
        console.log('=====getAllRequest======', res.data.data);
        App.globalData.requests = res.data.data;
        console.log('=====App.globalData.requests======', App.globalData.requests);
        //进行跳转
        wx.navigateTo({
          url: '../userRequest/userRequest',
        })
      }
    )
  },
  mangeRole: function(e){
    //显示好友列表 分为角色和好友两栏
    //跳转
    let dataList = JSON.stringify(this.data.usr_centent_list)
    wx.navigateTo({
      url: '../mangerole/index?dataList='+dataList+'&openid=' +this.data.openid,
    })
  },
  onReady: function () {
    //  页面初次渲染完成后，使用选择器选择组件实例节点，返回匹配到组件实例对象  
    
    //console.log("myComponent")
  },
  //实现点击任何地方 收回底部组件的方法
  showComponent: function () {
    this.myComponent = this.selectComponent('#tabbar')
    console.log("111111111")
    let myComponent = this.myComponent
    
    myComponent.takeback()  // 调用自定义组件中的方法
 },
 

};
Page(conf);