Page({
  data: {
    x: 0,
    y: 0
  },
  tap: function (e) {
    this.setData({
      x: 500,
      y: 300
    });
  }
})