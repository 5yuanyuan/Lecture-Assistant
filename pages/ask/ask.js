const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    question: '',   //问题
    lecturetype: "",  //传入讲座类型
    id: "",     //传入讲座的_id
    commentList: []   //该讲座的评论列表
  },

  //页面初始化
  onLoad: function (options) {
    wx.showLoading({
      title: 'loading...',
      mask:true
    })
    var that = this;
    var id = options.id;     //讲座id
    var lecturetype = options.lecturetype; //讲座类型
    console.log(id + ' ' + lecturetype);

    var comments = [];
    that.setData({  //动态修改界面元素
      lecturetype: lecturetype,
      id: id
    })
    db.collection('lectures').doc(id).get({  //获取该讲座类型的集合
      success: res => {
        comments = res.data.commentList;
        console.log(comments);

        var likeCommentIDList = []
        db.collection('users').where({
          'userID': app.globalData.userID
        }).get({
          success: res => {
            console.log("HI");
            console.log(res.data[0].LikeComments);
            //用户点赞的评论列表
            var arr = res.data[0].LikeComments;
            if (arr.length != 0) {  //如果用户有点赞的评论
              for (var i = 0; i < arr.length; i++) {
                //得到用户点赞的评论列表
                likeCommentIDList.push(arr[i].commentID);
              }
              //对讲座评论列表进行遍历
              //在点赞列表里查询 是否点赞评论列表中的评论
              comments.forEach(item => {
          console.log(likeCommentIDList.indexOf(item.commentID));
                //如果点赞列表里存在该评论
            if (likeCommentIDList.indexOf(item.commentID) > -1) {
                  item.url = 'goodAfterChoose.png';
                  item.isGood = true;
                } else {
                  item.url = 'good.png';
                  item.isGood = false;
                }
                console.log(item);
              })
            } else {  //如果没有用户点赞的评论
              comments.forEach(item => {
                item.url = 'good.png';
                item.isGood = false;
                console.log(item);
              })
            }
            //修改commentList元素
            that.setData({
              commentList: comments
            })
            wx.hideLoading();
          },
          fail: err => {
            console.log("Not Found!", err);
          }
        })
      }
    })
  },

  questionInput: function (e) {
    this.setData({
      question: e.detail.value
    })
  },

  change: function (e) {
    var that = this;
    //评论的id
    var commentID = e.currentTarget.dataset.commentid;  
    //评论在讲座评论列表中的位置
    var index = e.currentTarget.dataset.index;  
    //当前讲座的评论列表
    var commentList = that.data.commentList;
    var tag = 0; //判断为点赞还是取消点赞
    console.log(that.data.commentList);
    console.log(commentID);
    console.log(index);
    
    if (!commentList[index].isGood) {  //没有被点赞
      commentList[index].goodNumber += 1;
      commentList[index].url = 'goodAfterChoose.png';
      commentList[index].isGood = true;
      tag = 1;
    } else {   //取消点赞
      commentList[index].goodNumber -= 1;
      commentList[index].url = 'good.png';
      commentList[index].isGood = false;
      tag = -1;
    }

    that.setData({  //重置评论信息
      commentList: commentList
    })

    var likeComments = [];  //用户点赞的评论列表
    db.collection("users").where({
      'userID': app.globalData.userID
    }).get({
      success: res => {
        console.log(res);
        likeComments = res.data[0].LikeComments;
        var i = (likeComments || []).findIndex((likeComments) => likeComments.commentID == commentID);
        likeComments.splice(i,1);
        console.log(likeComments);
        //调用云函数更新数据库
        wx.cloud.callFunction({
          name: "good",
          data: {
            commentID: commentID,
            id: that.data.id,
            tag: tag,
            index: index,
            userID: app.globalData.userID,
            NickName:app.globalData.NickName,
            likeComments: likeComments
          },
          success: res => {
            console.log("修改成功", res);
          }
        })
      }
    })
  },

  handIn: function () {
    var that = this;

    if (this.data.question.length == 0) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'loading',
        duration: 500
      })
    } else {
      wx.showLoading({
        title: '正在发表',
        mask:true
      })
      //将提问添加到数据库中
      var content = this.data.question;
      var askerID = app.globalData.userID;
      console.log(app.globalData.userID);

      wx.cloud.callFunction({
        name: 'submitComment',
        data: {
          id: that.data.id,
          asker: askerID,
          content: content,
          time: app.getTime(),
          commentID: app.guid()
        },
        success: res => {
          console.log("提交", res);
          // 这里修改成跳转的页面
          wx.hideLoading();

          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 500
          })
          wx.switchTab({
            url: '../myAsk/myAsk'
          });
        }
      })
    }
  }
})