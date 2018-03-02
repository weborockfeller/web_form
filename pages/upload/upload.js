var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    logo: null,
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      // url: '../logs/logs'
      // url: '../load/load'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      console.log(userInfo);
      that.setData({
        userInfo: userInfo,
        logo: userInfo.logo
      })
    })
  },
  upload : function (page,path) {
    console.log(page);
    console.log(path);
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    }),
    wx.uploadFile({
        url: constant.SERVER_URL + "/FileUploadServlet",
        filePath: path[0],
        name: 'file',
        header: { "Content-Type": "multipart/form-data" },
        formData: {
          //和服务器约定的token, 一般也可以放在header中
          'session_token': wx.getStorageSync('session_token')
        },
        success: function (res) {
          console.log(res);
          if (res.statusCode != 200) {
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
            return;
          }
          var data = res.data
          page.setData({  //上传成功修改显示头像
            src: path[0]
          })
        },
        fail: function (e) {
          console.log(e);
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
        },
        complete: function () {
          wx.hideToast();  //隐藏Toast
        }
      })
  },
  //用来显示一个选择图片和拍照的弹窗，用到了微信的一个页面交互的api showActionSheet　
  chooseImageTap: function () {
    let _this = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            _this.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera')
          }
        }
      }
    })
  },
  //主要是用来选择图片以及接收图片路径回调的监听
  chooseWxImage: function (type) {
    let _this = this;
    wx.chooseImage({
      sizeType: ['original','compressed'],
      sourceType: [type],
      success: function (res) {
        var tempFilePath = res.tempFilePaths[0];
        _this.setData({
          logo: tempFilePath
        });
        _this.upload(_this, tempFilePath);
      }
    })
  },
  onShareAppMessage: function (res) {
    console.log(res);
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res)
    }
    return {
      title: '自定义转发标题',
      path: '/pages/form/form',
      success: function (res) {
        console.log(res);
        // 转发成功
      },
      fail: function (res) {
        console.log("失败："+res);
        // 转发失败
      }
    }
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})

/**
 * 后端代码
 * 后端开始用了一些框架接收上传的图片，出现了各种问题，后来使用了纯粹的Servlet就没有了问题, 把代码贴出来省的以后麻烦了
 * public class FileUploadServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static Logger logger = LoggerFactory.getLogger(FileUploadServlet.class);

    public FileUploadServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        JsonMessage<Object> message = new JsonMessage<Object>();
        EOSResponse eosResponse = null;
        String sessionToken = null;
        FileItem file = null;
        InputStream in = null;
        ByteArrayOutputStream swapStream1 = null;
        try {
            request.setCharacterEncoding("UTF-8");

            //1、创建一个DiskFileItemFactory工厂
            DiskFileItemFactory factory = new DiskFileItemFactory();
            //2、创建一个文件上传解析器
            ServletFileUpload upload = new ServletFileUpload(factory);

            //解决上传文件名的中文乱码
            upload.setHeaderEncoding("UTF-8");
            // 1. 得到 FileItem 的集合 items
            List<FileItem> items = upload.parseRequest(request);
            logger.info("items:{}", items.size());
            // 2. 遍历 items:
            for (FileItem item : items) {
                String name = item.getFieldName();
                logger.info("fieldName:{}", name);
                // 若是一个一般的表单域, 打印信息
                if (item.isFormField()) {
                    String value = item.getString("utf-8");
                    if("session_token".equals(name)){
                        sessionToken = value;
                    }
                }else {
                    if("file".equals(name)){
                        file = item;
                    }
                }
            }
            //session校验
            if(StringUtils.isEmpty(sessionToken)){
                message.setStatus(StatusCodeConstant.SESSION_TOKEN_TIME_OUT);
                message.setErrorMsg(StatusCodeConstant.SESSION_TOKEN_TIME_OUT_MSG);
            }
            String userId = RedisUtils.hget(sessionToken,"userId");
            logger.info("userId:{}", userId);
            if(StringUtils.isEmpty(userId)){
                message.setStatus(StatusCodeConstant.SESSION_TOKEN_TIME_OUT);
                message.setErrorMsg(StatusCodeConstant.SESSION_TOKEN_TIME_OUT_MSG);
            }
            //上传文件
            if(file == null){
            }else{
                swapStream1 = new ByteArrayOutputStream();

                in = file.getInputStream();
                byte[] buff = new byte[1024];
                int rc = 0;
                while ((rc = in.read(buff)) > 0) {
                    swapStream1.write(buff, 0, rc);
                }

                Usr usr = new Usr();
                usr.setObjectId(Integer.parseInt(userId));

                final byte[] bytes = swapStream1.toByteArray();

                eosResponse= ServerProxy.getSharedInstance().saveHeadPortrait(usr, new RequestOperation() {

                    @Override
                    public void addValueToRequest(EOSRequest request) {
                        request.addMedia("head_icon_media", new EOSMediaData(EOSMediaData.MEDIA_TYPE_IMAGE_JPEG, bytes));
                    }
                });

                // 请求成功的场合
                if (eosResponse.getCode() == 0) {
                    message.setStatus(ConstantUnit.SUCCESS);
                } else {
                    message.setStatus(String.valueOf(eosResponse.getCode()));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally{
            try {
                if(swapStream1 != null){
                    swapStream1.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                if(in != null){
                    in.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        PrintWriter out = response.getWriter();
        out.write(JSONObject.toJSONString(message));
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

}
 */