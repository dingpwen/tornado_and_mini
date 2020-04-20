var event = require('/event.js');

const TIME_SEARCH_BLE_TIMEOUT = 40000  // 40s
const EVENT_BLE_STATUS_CHANGED = 'BleStatusChanged'

const bleStatus = {
  CREATE_BLE_CONNECTION : 0,
  GET_BLE_DEVICE_SERVICES : 1,
  GET_BLE_DEVICE_CHARACTERISTICS : 2,
  TIME_OUT : 3,
  GET_DEVICES_LIST : 4,
  STOP_DISCOVER : 5,
  INITIALIZE_SUCCESS: 6,
  WRITE_BLE_CHARACTERISTIC_VALUE: 7,
  READ_BLE_CHARACTERISTIC_VALUE: 8,
  SHOW_BIND_LOADING : 9
};

function emitBleStatusEventData(res) {
  console.log("emitBleStatusEventData-:" + JSON.stringify(res))
  event.emit(EVENT_BLE_STATUS_CHANGED, res);
};
function emitBleStatusEvent(bleStatus, res) {
  res.etype = bleStatus;
  console.log("emitBleStatusEvent--:" + JSON.stringify(res))
  event.emit(EVENT_BLE_STATUS_CHANGED, res);
};


module.exports = {
  TIME_SEARCH_BLE_TIMEOUT,
  EVENT_BLE_STATUS_CHANGED,
  bleStatus,
  emitBleStatusEventData: emitBleStatusEventData,
  emitBleStatusEvent: emitBleStatusEvent,
};