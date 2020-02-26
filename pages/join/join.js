const app = getApp();
const db = wx.cloud.database({
  env: 'jiangzuoxiaozhushou-hicmf'
});

Page({
  data: {
    //未开始讲座
    unjoinLec: [],

    //已经结束的讲座
    joinedLec: [],

  },

  onLoad: function (options) {
    var that = this;
    var unjoinLectures = [];
    var joinedLectures = [];

    //获取讲座列表并将其分类
    db.collection('lectures').get({
      success: res => {
        console.log(res.data);
        //获取讲座列表
        var lecs = res.data;
        //通过讲座类别将讲座进行分类
        for (var i = 0; i < lecs.length; i++) {
          if (lecs[i].lecturetype == 'joinedLecture') {
            //已结束的讲座
            joinedLectures.push(lecs[i]);
          } else {
            //未开始的讲座
            unjoinLectures.push(lecs[i]);
          }
        }
        //设置全局变量
        app.globalData.unjoinLectures = unjoinLectures;
        app.globalData.joinedLectures = joinedLectures;
        //设置本页面的讲座列表
        that.setData({
          unjoinLec: unjoinLectures,
          joinedLec: joinedLectures
        })
      }
    });
  },

  download_File: function (e) {
    //获取相应的fileID
    var fileID = e.currentTarget.dataset.fileid;
    //从云环境下载文件
    wx.cloud.downloadFile({
      fileID: fileID,
      success: function (res) {
        console.log("下载成功");

        wx.showToast({
          title: '下载成功',
          icon: 'success',
          duration: 1000
        })

        console.log(res.tempFilePath)
        //文件下载路径
        const filePath = res.tempFilePath;
        //打开文件
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
      },
      fail: function (res) {
        console.log("下载失败", res);
      }
    })
  },

  wantToAsk: function (e) {
    var id = e.currentTarget.dataset.id;
    var lecturetype = e.currentTarget.dataset.lecturetype;
    wx.navigateTo({
      url: '../ask/ask?id=' + id + '&lecturetype=' + lecturetype
    })
  },

  onShow:function(){
    this.onLoad();
  }
})