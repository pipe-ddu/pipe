//app.js
import touch from 'pages/utils/touch.js' //新加
App({
  globalData: {
    userRelation: [],
    socketStatus: 'closed',
    openid: null,
    unReadLetter: 0,
    userinfo: null,
    //url:"https://127.0.0.1",
    url: "https://www.daydaypipe.top",
    //url:"http://127.0.0.1",
    fileurl:"http://www.daydaypipe.top:8051",
    authUser: false,
    nickName: ""
  },
  touch: new touch(), //实例化这个touch对象
  //渐入，渐出实现 
  show: function (that, param, opacity) {
    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 800,
      timingFunction: 'ease',
    });
    //var animation = this.animation
    animation.opacity(opacity).step()
    //将param转换为key
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    //设置动画
    that.setData(json)
  },

  //滑动渐入渐出
  slideupshow: function (that, param, px, opacity) {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.translateY(px).opacity(opacity).step()
    //将param转换为key
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    //设置动画
    that.setData(json)
  },

  //向右滑动渐入渐出
  sliderightshow: function (that, param, px, opacity) {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.translateX(px).opacity(opacity).step()
    //将param转换为key
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    //设置动画
    that.setData(json)
  },
  getOpenid: function () {
    var that = this;
    console.log("11112222222")
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: that.globalData.url + ':8874/fUser/wxapi/decryptCode?code=' + res.code,
            method: "POST",
            success(res) {
              console.log(res.data)
              that.globalData.openid = res.data.data;
              console.log("that.globalData.openid",that.globalData.openid)
              wx.request({
                url: that.globalData.url + ':8874/fUser/getMiniusers/' + that.globalData.openid,
                method: 'GET',
                success(resLogin) {
                  console.log("resLogin.data.data",resLogin.data)
                  console.log("resLogin.data.data",resLogin.data.data)
                  if(resLogin.data.code==200){
                  that.globalData.userRelation = resLogin.data.data;
                  var info = resLogin.data.data;
                  if (info != null)
                    for (var i = 0; i < info.length; i++) {
                      if (info[i].type == 0)
                        that.globalData.userinfo = info[i];
                    }
                  console.log("userRelation", that.globalData.userRelation);
                  console.log("info", that.globalData.userinfo);
                  that.globalData.authUser = true;
                  that.globalData.nickName = that.globalData.userinfo.names;
                  that.globalData.avatarUrl = that.globalData.userinfo.miniHead
                  var message = {};
                  message.did = that.globalData.userinfo.id;
                  /**
                   * 1:连接
                   * 2:心跳
                   * 7:好友添加
                   */
                  that.openSocket();
                  message.type = 1;
                  message = JSON.stringify(message)
                  console.log("message 的值", message)
                  that.sendMessage(message);
                
                }else {
                  wx.navigateTo({
                    url: '/pages/grantAuth/index',
                  })
                }
                
              }
              })
            },
            fail(data) {
              wx.showToast({
                title: '获取openid失败',
                icon: 'fail',
                duration: 2000
              })
            }
          })
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'fail',
            duration: 2000
          })
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  onLaunch: function () {
    var that = this;
    //先获取到用户的openid
    console.log("that.globalData.authUser",that.globalData.authUser)
    this.getOpenid();
    
  },

  //////websocket内容//////
  openSocket() {
    //打开时的动作
    wx.onSocketOpen(() => {
      console.log('WebSocket 已连接')
      this.globalData.socketStatus = 'connected';
      this.login();

    })
    //断开时的动作
    wx.onSocketClose(() => {
      console.log('WebSocket 已断开')
      this.globalData.socketStatus = 'closed'
    })
    //报错时的动作
    wx.onSocketError(error => {
      console.error('socket error:', error)
    })
    // 监听服务器推送的消息
    wx.onSocketMessage(message => {
      //把JSONStr转为JSON
      message = message.data.replace(" ", "");
      if (typeof message != 'object') {
        message = message.replace(/\ufeff/g, ""); //重点
        var jj = JSON.parse(message);
        message = jj;
      }
      console.log("【websocket监听到消息】内容如下：");
      console.log(message);
      //未读消息加一
      if (message.type == 7)
        this.globalData.unReadLetter = this.globalData.unReadLetter + 1;
    })
    // 打开信道
    wx.connectSocket({
      url: "wss://" + "www.daydaypipe.top:8884",
    })
  },

  //关闭信道
  closeSocket() {
    if (this.globalData.socketStatus === 'connected') {
      wx.closeSocket({
        success: () => {
          this.globalData.socketStatus = 'closed'
        }
      })
    }
  },

  //发送消息函数
  sendMessage(message) {
    if (this.globalData.socketStatus === 'connected') {
      //自定义的发给后台识别的参数 ，我这里发送的是name
      console.log("发送的消息", message)
      wx.sendSocketMessage({
        data: message
      })
    }
  },
  //登录的时候做连接的通信
  //暂时不做心跳
  login() {
    var that = this;
    console.log("===that.globalData.openid===", that.globalData.openid);
    console.log("that.globalData.avatarUrl",that.globalData.avatarUrl)
    //根据openid获取用户的id
    wx.request({
      url: that.globalData.url + ':8874/fUser/getMiniusers/' + that.globalData.openid,
      method: 'GET',
      success(res) {
        console.log("初始化时完成usr的获取", res.data.data);
        if (res.data.data == null) {
          console.log("未注册");
          //如果用户没有注册
          wx.request({
            url: that.globalData.url + ':8874/fUser/registermini',
            method: 'POST',
            data: {
              'openid': that.globalData.openid,
              'nickName': that.globalData.nickName,
              'miniHead': that.globalData.avatarUrl
            },
            success(resregister) {
              wx.request({
                url: that.globalData.url + ':8874/fUser/getMiniusers/' + that.globalData.openid,
                method: 'GET',
                success(resLogin) {
                  that.globalData.userRelation = resLogin.data.data;
                  var info = resLogin.data.data;
                  if (info != null)
                    for (var i = 0; i < info.length; i++) {
                      if (info[i].type == 0)
                        that.globalData.userinfo = info[i];
                    }
                  console.log("userRelation", that.globalData.userRelation);
                  console.log("info", that.globalData.userinfo);

                  var message = {};
                  message.did = that.globalData.userinfo.id;
                  /**
                   * 1:连接
                   * 2:心跳
                   * 7:好友添加
                   */
                  message.type = 1;
                  message = JSON.stringify(message)
                  console.log("message 的值", message)
                  that.sendMessage(message);
                }
              })
            }
          })
        } else {
          that.globalData.userRelation = res.data.data;
          var info = res.data.data;

          for (var i = 0; i < info.length; i++) {
            if (info[i].type == 0)
              that.globalData.userinfo = info[i];
          }
          console.log("userRelation", that.globalData.userRelation);
          console.log("info", that.globalData.userinfo);

          var message = {};
          message.did = that.globalData.userinfo.id;
          /**
           * 1:连接
           * 2:心跳
           * 7:好友添加
           */
          message.type = 1;
          message = JSON.stringify(message)
          console.log("message 的值", message)
          that.sendMessage(message);
        }

      }
    })


  },



  //app 全局属性监听
  watch: function (method) {
    var obj = this.globalData;
    var val = this.globalData.unReadLetter;
    Object.defineProperty(obj, "unReadLetter", {
      configurable: true,
      enumerable: true,
      set: function (value) {
        val = value;
        console.log('是否会被执行2', value)
        method();
      },
      get: function () {
        // 可以在这里打印一些东西，然后在其他界面调用getApp().globalData.name的时候，这里就会执行。
        return val;
      }
    })
  },
  /*startInter(){
    var that = this;
   setInterval(
        function () {
            // TODO 你需要无限循环执行的任务
            that.globalData.unReadLetter = that.globalData.unReadLetter + 1;
            console.log('setInterval 每过500毫秒执行一次任务')
        }, 500);    
  },*/
})