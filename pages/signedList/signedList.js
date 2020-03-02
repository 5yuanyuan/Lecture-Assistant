const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lectureID:'',
    signedList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var lectureID = options.lectureID;
    var available = options.available;
    var signedList = [];

    db.collection('lectures').doc(lectureID).get({
      success:res=>{
        signedList = res.signedList;

        that.setData({
          lectureID:lectureID,
          signedList:signedList,
          available:available
        })    
      }
    })
  },
  
  /**
   * 取消签到 
   */
  cancelsign: function() {
    var that = this;
    var available = that.data.available;

    wx.showLoading({
      title: 'loading',
      mask:true
    })
    
    if (available) {
      wx.cloud.callFunction({
        name: 'stopSign',
        data: {
          lectureID: that.data.lectureID
        },
        success: res => {
          wx.hideLoading();
          console.log(res);

          that.setData({
            available: false
          })
          wx.showToast({
            title: '签到已停止..',
            icon: 'loading',
            duration: 1000
          })
        },
        fail: err => {
          console.log(err);
          wx.showToast({
            title: '取消失败...',
            icon: 'loading',
            duration: 1000
          })
        }
      })
    } else {
      wx.hideLoading();

      wx.showToast({
        title: '已取消签到..',
        icon: 'loading',
        duration: 1000,
        mask: true
      })
    }
  }

})