// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:'jiangzuoxiaozhushou-hicmf'
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("fuction");
  
  try {
    await db.collection("lectures").doc("184bc965-8b50-4dd8-8b5d-d8a94a77fd02"
  ).update({
    data: {
      'commentList.1.commentID': event.result
    },
    success: res => {
      console.log(res);
    }, fail: err => {
      console.log(err);
    }
  })
  } catch (e) {
    console.log(e);
  }
}
