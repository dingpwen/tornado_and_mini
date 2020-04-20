var hostvalue = 'http://192.168.20.42:7788',
  url = {
    host: hostvalue,
    submitFeedback:  hostvalue + "/suggestion/submitFeedback",
    uploadSalesData: hostvalue + "/sales/uploadSalesData",
    sendSmsCode:  hostvalue + "/auth/sendSmsCode",
    authSmsCodeLogin: hostvalue + "/auth/authSmsCodeLogin",
    getMobileNo:  hostvalue + "/user/getMobileNo",
    bindDeviceUUID:  hostvalue + "/cigarette/bindDeviceUUID",
    unbindDeviceUUID: hostvalue + "/cigarette/unbindDeviceUUID",
    getSmokeCount:  hostvalue + "/smoke/getSmokeCount",
    uploadSmokeData: hostvalue + "/smoke/uploadSmokeData",
    getSmokeDataByDate: hostvalue + "/smoke/getSmokeDataByDate",
    getSmokeData:  hostvalue + "/smoke/getSmokeData",
    getWXSession:  hostvalue + "/user/getWechatSession",
    getOtaFileUrl: hostvalue +"/ota/getOtaFileID"

  };
module.exports = url;