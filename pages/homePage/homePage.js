const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    identify:0,
    isOnShowDetail:false,
    lectures:[]
  },
  
  onLoad: function (options) {
    var that = this;
    var userID = app.globalData.userID;
    var password = app.globalData.password;

    //调试输出，检测是否传递成功
    console.log(userID);
    console.log(password);
    console.log(app.globalData.identify);
    //登录者身份 0为学生，1为老师
    var identify = 0;  //默认身份为学生
    if (app.globalData.identify == "teacher") { //如果身份为老师
      identify = 1;
    }

    that.setData({
      identify: identify
    })
    
    db.collection('lectures').get({
      success: res => {
        console.log(res.data);
        //获取讲座列表
        var lecs = res.data;
        that.setData({
          lectures:lecs
        })
      }
    });
  },

  join: function () {
    wx.showToast({
      title: '报名成功',
      icon: 'success',
      duration: 1000
    })
    
  },

  addLecture:function() {
    wx.navigateTo({
      url: '../addLecture/addLecture',
    })
  },

  onview:function(e){
    var index = e.currentTarget.dataset.index;
    var str = 'lectures[' + index + '].isOnShowDetail';
    this.setData({
      [str]:true
    })
    console.log("on it");
  },

  outview:function(e){
    var index = e.currentTarget.dataset.index;
    var str = 'lectures[' + index + '].isOnShowDetail';
    this.setData({
      [str]: false
    })
    console.log("out it");
  },

  onShow:function(){
    this.onLoad();
  }
})