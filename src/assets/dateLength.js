'use strict'
import $moment from 'moment'
/**
 * 計算從A日至B日的長度，排班/值班班表使用
 * @param {string} start 給予一個日期格式,例如 '2018-10-1'
 * @param {string} end 給予一個日期格式,例如 '2018-10-30'
 * @return {number} dateLength 輸出兩個日期中間共計的日數
 */
function dateLength (start, end) {
  let result = 0
  if (start && end) {
    let a = $moment(start)
    let b = $moment(end)
    // 取兩個日期的間距
    result = b.diff(a, 'days')
  } else {
    result = 0
  }

  return result + 1
}
export default dateLength
