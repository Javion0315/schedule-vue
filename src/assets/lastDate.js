// 輸出當月的最後一日，因此使用者指定月份後，此程式輸出當月最後一日
// 不可做出從前年度的班表，因此若指定的月份小於目前月份，程式直接跳到下一年度

// 因此實際套用的部分為: 使用當月1日與31日做出一份初始化calendar

/**
計算該月擁有的所有日期，輸出當月最後一日，若選擇過去的月份，則自動跳至未來月份
@param {string} targetDate YYYY-MM-DD, 輸入該天日期
@return {string} date, 31 30 or 28 29 輸出該年當月最後一日
 */

function lastDate (targetDate) {
  if (!targetDate) { return }
  let year = (targetDate.split('-')[0])
  let month = Number(targetDate.split('-')[1])
  if (Number(month) < 10) { month = '0' + month }
  // 宣告現在
  // let now = new Date()
  // 取得目前年份
  // let year = now.getFullYear()
  // 取得目前月份，純js取得的值和moment會差一，純js的1月為0
  // let nowMonth = now.getMonth() + 1
  // 選擇的月份若為過去月份，年份自動加一
  // if (month <= nowMonth) { year += 1 }
  var date = new Date(year, month, 0).getDate()
  return `${year}-${month}-${date}`
}

export default lastDate
