const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    title: '',  //讲座名称
    author: '',  //讲师姓名
    authorID: '', //讲师账号
    address: '', //讲座地点
    year: '',  //年
    month: '', //月
    day: '',  //日
    introduction: '',  //讲座简介
    chooseFile: false,  //是否选择文件
    fileType:'',  //文件类型的后缀
    filePath:'',  //文件临时路径
    url: '',  //文件类型对应相应的图标
    showModel:false
  },

  //获取讲座名称
  titleInput: function (e) {
    this.setData({
      title: e.detail.value.trim()
    })
    console.log(this.data.title);
  },

  //获取讲座讲师姓名
  authorInput: function (e) {
    this.setData({
      author: e.detail.value.trim()
    })
  },

  //获取讲座讲师姓名
  authorIDInput: function (e) {
    this.setData({
      authorID: e.detail.value.trim()
    })
  },

  //获取讲座地点
  addressInput: function (e) {
    this.setData({
      address: e.detail.value.trim()
    })
  },

  //获取讲座年份
  yearInput: function (e) {
    this.setData({
      year: e.detail.value
    })
  },

  //获取月份
  monthInput: function (e) {
    this.setData({
      month: e.detail.value
    })
  },

  //获取日期
  dayInput: function (e) {
    this.setData({
      day: e.detail.value.trim()
    })
  },

  //获取讲座简介
  introductionInput: function (e) {
    this.setData({
      introduction: e.detail.value.trim()
    })
    console.log(this.data.introduction);
  },

  //传文件获得文件相应路径
  uploadFiles: function () {
    var that = this;
    wx.chooseMessageFile({
      //能选择文件的数量
      count: 1,
      //能选择文件的类型,我这里只允许上传文件.还有视频,图片,或者都可以
      type: 'all',
      success(res) {
        var size = res.tempFiles[0].size;
        var filename = res.tempFiles[0].name;
        var filePath = res.tempFiles[0].path;

        console.log(res);
        console.log(size);
        console.log(filename);

        if (filename.indexOf(".doc") != -1) {
          that.setData({
            chooseFile: true,
            fileType:".doc",
            filePath: filePath,
            url: "WORD.png"
          })
        } else if (filename.indexOf(".xls") != -1) {
          that.setData({
            chooseFile: true,
            fileType: ".xlsx",
            filePath:filePath,
            url: "EXCEL.png"
          })
        } else if (filename.indexOf(".ppt") != -1) {
          that.setData({
            chooseFile: true,
            fileType: ".ppt",
            filePath: filePath,
            url: "PPT.png"
          })
        } else if (filename.indexOf(".pdf") != -1) {
          that.setData({
            chooseFile: true,
            fileType: ".pdf",
            filePath: filePath,
            url: "PDF.png"
          })
        } else if (filename.indexOf(".txt") != -1) {
          that.setData({
            chooseFile: true,
            fileType: ".txt",
            filePath: filePath,
            url: "TXT.png"
          })
        } else if (filename.indexOf(".jpg") != -1 || filename.indexOf(".png") != -1) {
          that.setData({
            chooseFile: true,
            fileType: ".png",
            filePath: filePath,
            url: "image.png"
          })
        } else {
          wx.showToast({
            title: '文件类型错误...',
            icon: 'loading',
            duration: 500
          })
        }
      }
    })
  },

  /**
   * 发表讲座
   */
  submit: function () {
    var that = this;
    var title = that.data.title;
    var author = that.data.author;
    var authorID = app.globalData.userID;
    var address = that.data.address;
    var year = that.data.year;
    var month = that.data.month;
    var day = that.data.day;
    var introduction = that.data.introduction;
    var chooseFile = that.data.chooseFile;
    var fileType = that.data.fileType;
    var filePath = that.data.filePath;
    var date = year + '.' + month + '.' + day;

    if (title == '' || author == '' || address == '' || year == '' || month == '' || day == '' || introduction == '') {  //如果未输入完整
      wx.showToast({
        title: '请完整输入！',
        icon: 'loading',
        duration: 500
      })
    } else if (!chooseFile) {  //如果未选择文件
      wx.showToast({
        title: '请上传文件！',
        icon: 'loading',
        duration: 500
      })
    } else if (!that.judgeDate(year,month,day)) { //检查日期是否正确输入
      wx.showToast({
        title: '日期输入有误！',
        icon: 'loading',
        duration: 500
      })
    } else {
      wx.showLoading({
        title: '正在发表...',
        mask:true
      })

      wx.cloud.uploadFile({
        cloudPath: title + fileType,
        filePath: filePath,
        success: res => {
          var fileID = res.fileID;

          wx.cloud.callFunction({
            name:'publishLecture',
            data: {
              userID:app.globalData.userID,
              title: title,
              author: author,
              authorID: authorID,
              address: address,
              date: date,
              introduction: introduction,
              fileID: fileID
            },
            success: res => {
              wx.hideLoading();
              console.log(res);

              var arr = res.result.split('&');
              if(arr[1] == 1) {
                wx.showToast({
                  title: '发表成功！',
                  icon: 'success',
                  duration: 1000
                })
                wx.redirectTo({
                  url: '../teacherPage/teacherPage',
                })
              } else {
                wx.showToast({
                  title: '发表失败...',
                  icon: 'loading',
                  duration: 1000
                })
              }
            }
          })
        },fail:err=>{
          console.log("上传文件失败" + err);
        }
      })
    }
  },
  

  /**
   * 判断日期是否合法
   */
  judgeDate: function (year, month, day) {
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (year < 2020 || year > 2100) return false;
    if (month > 12 || month < 1) return false;
    if (day > 31 || day < 1) return false;
    if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30) return false;
    if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) && day > 31) return false;
    if (month == 2) {
      if (day > 29) return false;
      if (!(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) && day > 28) return false;
    }
    return true;
  },

  /**
   * 弹窗
   */
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.hideModal();
    this.submit();
  }
})