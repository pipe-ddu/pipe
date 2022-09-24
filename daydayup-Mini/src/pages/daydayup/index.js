Page({
    data: {
        imgUrls: [
          'cloud://cloud1-1g8sc3r1b2f88adf.636c-cloud1-1g8sc3r1b2f88adf-1309460885/images/hero-bg2.jpg',
          'cloud://cloud1-1g8sc3r1b2f88adf.636c-cloud1-1g8sc3r1b2f88adf-1309460885/images/hero-bg_2.jpg',
          'cloud://cloud1-1g8sc3r1b2f88adf.636c-cloud1-1g8sc3r1b2f88adf-1309460885/images/hero-bg.jpg'
        ],
        indicatorDots: true,  //是否显示面板指示点
        autoplay: true,      //是否自动切换
        interval: 3000,       //自动切换时间间隔
        duration: 1000,       //滑动动画时长
        inputShowed: false,
        inputVal: "",
        index: 0 ,
      },
      onShow: function () {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
          this.getTabBar().setData({
            selected: 0 //0,1，2 0-导航一  1-导航二  2-个人中心
          })
        }
      },
      info(){
        var that = this;
        wx.getUserInfo({
          //成功后会返回
          success:(res)=>{
            console.log(res);
            // 把你的用户信息存到一个变量中方便下面使用
            let userInfo= res.userInfo
            //获取openId（需要code来换取）这是用户的唯一标识符
            // 获取code值
            wx.login({
              //成功放回
              success:(res)=>{
                console.log(res);
                let code=res.code
                // 通过code换取openId
                wx.request({
                  url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wxc9c73915eeb63d6c&secret=83ac589ce417001b23c7191d3cb2fc4e&js_code=' + res.code + '&grant_type=authorization_code',
                  method:'POST',
                  success:(res)=>{
                    console.log(res);
                    userInfo.openid=res.data.openid;
                    
                    //请求成功之后，把openid放到储存里面
                      wx.setStorage({
                        key: 'openid',
                        data: userInfo.openid
                      })
                }
              })
             
    
          }
        })
      },
        })
      },
      onLoad:function(){
        this.info
      },

      redirectToPhoto: function(){
        wx.redirectTo({
          url: '/pages/photo/index',
        })
        
      },
      redirectToVoice: function(){
        wx.redirectTo({
          url: '/pages/voice/index',
        })
      },
      redirectToIndex: function(){
        wx.redirectTo({
          url: '/pages/calendarTemplate/index',
        })
      },

      introdata: function(){
        wx.redirectTo({
          url: '/pages/introData/introdata',
        })
      },
      intromulti: function(){
        wx.redirectTo({
          url: '/pages/introMulti/intromulti',
        })
      },
      introinput: function(){
        wx.redirectTo({
          url: '/pages/introInput/introinput',
        })
      },


});