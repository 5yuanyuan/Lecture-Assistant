const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    userID: '',
    password: ''
  },

  // 获取输入账号
  IDInput: function (e) {
    this.setData({
      userID: e.detail.value
    })
  },

  // 获取输入密码
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  login: function () {
    var that = this;
    var userID = that.data.userID;
    var password = that.data.password;
    if (userID.length == 0 || password.length == 0) {
      wx.showToast({
        title: '请完整输入！',
        icon: 'loading',
        duration: 500
      })
    } else {
      db.collection('users').where({
        'userID': userID
      }).get({
        success: res => {
          if (res.data.length != 0) {
            var user = res.data[0];
            if (password.trim() != user.password) {
              wx.showToast({
                title: '密码错误',
                icon: 'loading',
                duration: 1000
              })
            } else {
              //为homePage传递参数
              app.globalData.userID = that.data.userID;
              app.globalData.password = that.data.password;
              app.globalData.identify = user.identify;
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1000
              })

              wx.switchTab({
                url: '../homePage/homePage'
              });
            }
          } else {
            wx.showToast({
              title: '用户不存在',
              icon: 'loading',
              duration: 1000
            })
          }
        }
      })
    }
  }
})