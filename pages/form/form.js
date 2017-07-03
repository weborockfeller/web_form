// form.js
//获取不同颜色的函数
//更改的内容
function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}
Page({

  /**
   * 页面的初始数据
   */
  inputValue: '',
  data: {
    pageData: null,
    src: '',
    danmuList: [
      {
        text: '第 1s 出现的弹幕',
        color: '#ff0000',
        time: 1
      },
      {
        text: '第 3s 出现的弹幕',
        color: '#ff00ff',
        time: 3
      }],
    tip: '',
    userName: '',
    psw: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'http://127.0.0.1:8888/' + new Date().getTime(), //仅为示例，并非真实的接口地址
      success: function (res) {
        console.log(res.data);
        that.data.pageData = res.data;
        that.setData({
          pageData: res.data
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindInputBlur: function (e) {
    this.inputValue = e.detail.value
  },
  bindButtonTap: function () {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: ['front', 'back'],
      success: function (res) {
        console.log(res);
        that.setData({
          src: res.tempFilePath
        })
      }
    })
  },
  bindSendDanmu: function () {
    this.videoContext.sendDanmu({
      text: this.inputValue,
      color: getRandomColor()
    })
  },
  showToast: function () {
    wx.showToast({
      title: '这是提示框',
    })
    wx.showLoading({
      title: '等待中',
    })
    wx.showModal({
      title: '提示框的内容',
      content: '',
    })
    wx.showActionSheet({
      itemList: ["111", "222", "333"]
    })
    wx.setNavigationBarTitle({
      title: '本页面标题',
    })
    wx.showNavigationBarLoading({

    })
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  terryfry: function (e) {
    //判断用户输入的是否为小写字母
    var regLowerCase = new RegExp('[a-z]', 'g');
    //判断用户输入的是否为大写字母
    var regCapitalLetter = new RegExp('[A-Z]', 'g');
    //判断用户输入的是否为数字
    var regNum = new RegExp('[0-9]', 'g');
    //测试数据，不为小写字母则返回null
    var rsLowerCase = regLowerCase.exec(e.detail.value);
    //测试数据，不为大写字母则返回null
    var rsCapitalLetter = regCapitalLetter.exec(e.detail.value);
    //测试数据，不为数字则返回null
    var rsNum = regNum.exec(e.detail.value);
    var objexp = /^[1-8]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))(([0|1|2][1-9])|3[0-1])((\d{4})|\d{3}[A-Z])$/;
    console.log(e);
    console.log("触发了input的事件");
    console.log(objexp.exec(e.detail.value));
    if (objexp.exec(e.detail.value)){
      this.setData({ tip: "" });
    }else{
      this.setData({tip:"请输入正确的身份证号"});
    }
  }
})