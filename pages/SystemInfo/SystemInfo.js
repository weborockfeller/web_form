// SystemInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  getSystemInfo : function(){
     wx.getSystemInfo({
       success: function(res) {
         console.log(res)
       },
     })
  },
  begin:function(){
    wx.showToast({
      title: '开始监听数据',
      icon: 'success',
      duration: 2000
    })
    wx.onCompassChange(function (res) {
      console.log("角度："+res.direction)
    })
    wx.onAccelerometerChange(function (res) {
      console.log("x："+res.x)
      console.log("y："+res.y)
      console.log("z："+res.z)
      if(x>2){
        wx.showToast({
          title: '摇一摇成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  stop:function(){
    wx.stopCompass()
    wx.stopAccelerometer()
  },
  speed:function(){
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        var autitude = res.altitude
        console.log("纬度：" + latitude);
        console.log("经度：" + longitude);
        console.log("速度：" + speed);
        console.log("精度：" + accuracy);
        console.log("高度：" + autitude);
      }
    })
  },
  preview : function (){
    wx.previewImage({
      current: '../image/2.png', // 当前显示图片的http链接
      urls:['http://test.50ren.com/test/form/storage/qrcode/form_1504864544YTCKqe.png'] // 需要预览的图片http链接列表
    })
  }
})