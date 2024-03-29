var app = getApp()
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
const App = getApp();
Page({
  data: {
    navbar: ['好友', '角色'],
    currentTab: 0,
    userList: [],
    roleList: []
  },
  //初始化好友列表
  onLoad: function (options) {
    let list = JSON.parse(options.dataList)
    this.setData({
      datalist: list,
      openid: options.openid
    })
    console.log(list, this.data.openid)
    //进行分类  好友类和角色类
    var userList = []
    var roleList = []
    for (var i = 0; i < list.length; i++) {
      if (list[i].type == 2)
        userList.push(list[i])
      else if (list[i].type == 1)
        roleList.push(list[i])
    }
    this.setData({
      userList: userList,
      roleList: roleList
    })
    console.log("userList:", this.data.userList, "roleList:", roleList)

  },
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  sendusrmsg: function (e) {
    wx.showToast({
      title: '尽请期待',
      icon: 'success',
      duration: 1000, //持续的时间
    })
  },
  touchdelete: function (e) {
    var that = this
    wx.getStorage({
      key: 'choseUsr',
      success: function (res) {
        that.setData({
          choseUsrid_del: res.data.userId,
        })
        console.log("要删除的id", App.globalData.userinfo.userId);
        console.log("要删除的id", that.data.choseUsrid_del);
        if (that.data.choseUsrid_del != App.globalData.userinfo.userId) {
          wx.showToast({
            title: '切换管理员进行操作！',
            icon: 'fail',
            duration: 2000
          })
        } else {
          var deleteId = e.currentTarget.dataset.idx;
          var user_list = that.data.datalist;
          var new_user_list = [];
          var goalUser = {};
          for (var i = 0; i < user_list.length; i++) {
            if (user_list[i].userId != deleteId)
              new_user_list.push(user_list[i]);
            else goalUser = user_list[i];
          }

          console.log("new_user_list", new_user_list);
          that.setData({
            "datalist": new_user_list
          });

          //进行分类  好友类和角色类
          var userList = []
          var roleList = []
          for (var i = 0; i < new_user_list.length; i++) {
            if (new_user_list[i].type == 2)
              userList.push(new_user_list[i])
            else if (new_user_list[i].type == 1)
              roleList.push(new_user_list[i])
          }
          that.setData({
            userList: userList,
            roleList: roleList
          })

          var deleteType = 1;
          var openid = that.data.openid;
          console.log("===要删除的好友===", goalUser)
          Http.asyncRequest(
            App.globalData.url + ':8874/fUser/deleteMiniUser/' + openid,
            'DELETE', goalUser,
            res => {
              console.log('=====deleteResult======', res.data.data);
              if (res.data.code == 200)
                wx.showToast({
                  title: "成功删除",
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
        }
      }
    })
  },
})