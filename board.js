import {
  DataReportMode,
  InputReport,
  ReportMode,
} from './src/const.js'

import { numbersToBuffer } from './src/helpers.js'


let device
let calibration = [
  [10000.0, 10000.0, 10000.0, 10000.0],
  [10000.0, 10000.0, 10000.0, 10000.0],
  [10000.0, 10000.0, 10000.0, 10000.0]
]

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep() {
  await timeout(3000);
}


async function reportHandler(event){
  try {    
    var { data } = event;

    console.log('heard data', event.reportId, data)


    switch (event.reportId) {
      case InputReport.STATUS:
        console.log("status");
        break;
      
      case InputReport.READ_MEM_DATA:
        // calibration data
        console.log("calibration data");
        WeightCalibrationDecoder(data);
        break;
      
      case DataReportMode.EXTENSION_8BYTES:
        // weight data

        // button data
        BTNDecoder(...[0, 1].map(i => data.getUint8(i)));

        // raw weight data
        WeightDecoder(data);

        // weight listener
        break;
      
      default:
        console.log(`event of unused report id ${event.reportId}`);
        break;
    }
  } catch (error) {
    console.error(error)
  }
}


async function sendReport(mode, data){
  try {
    console.log('sending report', mode, data)

    const result = await device.sendReport(
      mode,
      numbersToBuffer(data)
    )
    
    console.log('sent report', result)

    return result
  } catch (error) {
      console.error(error)
  }
}


function WeightCalibrationDecoder(data) {
  const length = data.getUint8(2) / 16 + 1;
  if (length == 16) {
    [0, 1].forEach(i => {
      calibration[i] = [0, 1, 2, 3].map(j =>
        data.getUint16(4 + i * 8 + 2 * j, true)
      );
    });
  } else if (length == 8) {
    calibration[2] = [0, 1, 2, 3].map(j =>
      data.getUint16(4 + 2 * j, true)
    );
  }
}


function WeightDecoder(data) {
  const weights = [0, 1, 2, 3].map(i => {
    const raw = data.getUint16(2 + 2 * i, false);
    //return raw;
    if (raw < calibration[0][i]) {
      return 0;
    } else if (raw < calibration[1][i]) {
      return (
        17 *
        ((raw - calibration[0][i]) /
          (calibration[1][i] - calibration[0][i]))
      );
    } else {
      return (
        17 +
        17 *
          ((raw - calibration[1][i]) /
            (calibration[2][i] - calibration[1][i]))
      );
    }
  });
  
  for (let position in WiiBalanceBoardPositions) {
    const index = WiiBalanceBoardPositions[position];
    weights[position] = weights[index];
  }
      
  if (WeightListener) {
    WeightListener(weights);
  }
}


export async function connect() {
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }]
    })
    
    device = devices[0]
  
    device.addEventListener('inputreport', reportHandler)
    // device.oninputreport = reportHandler
  
    console.log('device', device)
  
  
    await device.open()    
  } catch (error) {
    console.error(error)
  }
}


export async function getStatus() {
  try {
    await sendReport(ReportMode.STATUS_INFO_REQ, [0x00])
  } catch (error) {
    console.error(error)
  }
}


export async function initData() {
  try {
    const dataMode = DataReportMode.EXTENSION_8BYTES
    
    await sendReport( ReportMode.DATA_REPORTING, [0x00, dataMode])
  } catch (error) {
    console.error(error)
  }
}


export async function readMemory() {
  try {
    await sendReport(ReportMode.MEM_REG_READ, [
      0x04,
      0xa4,
      0x00,
      0x24,
      0x00,
      0x18
    ])
  } catch (error) {
    console.error(error)
  }
}