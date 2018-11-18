'use strict'
import moment from 'moment'

/**
 * 輸出n個月份給使用者，也就是說當使用者目前在10月時，函式會輸出今年 11月、今年 12月、明年 1月、明年 2月等項目,value為YYYY-MM-DD
 * @param {number} num, 輸出可選月份的數量
 * @return {array} dates 輸出一連串包含label和value的物件陣列
*/
export default function (num) {
  // 不跑出後年的月份，因此限定在12以內
  if (num >= 12) { num = 12 }
  let nowYear = moment().format('YYYY')
  // 宣告下個月
  let next
  // 宣告容器
  let array = []
  for (let i = 1; i <= num; i++) {
    // 取得下個月的月份
    next = moment().add(i, 'months')
    // 取得下個月的值
    let value = next.format('YYYY-MM-01')
    let label = next.format('M')
    if (next.format('YYYY') === nowYear) {
      array.push({ value: value, label: `${next.format('YYYY')}年 ${label}月` })
    } else {
      array.push({ value: value, label: `${next.format('YYYY')}年 ${label}月` })
    }
  }
  return array
}
