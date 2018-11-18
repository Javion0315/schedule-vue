'use strict'

/**
 * dragDrop是一則用來幫助使用者拖曳並且排班的函式
 * 需要人員列表、目標列表、以及編輯用的陣列
 */
export default {
  /**
   * 班別的拖曳事件，使用 @dragstart進行觸發
   * **/
  scheduleDragstart (ev, data, dayIndex, scheduleIndex) {
    // 必須設定dataTransfer攜帶資料，否則無法在FF上觸發drag效果
    let memberData = JSON.stringify(data)
    // set和getData時，若使用text會導致資料外洩在input內
    ev.dataTransfer.setData('scheduleData', memberData)
    // 額外增設條件，日期，用來確定當日內的班別成員移動與人員移動(必定為移動事件而非複製)
    ev.dataTransfer.setData('scheduleDay', dayIndex)
    // 額外條件，傳送該日的該班別index
    ev.dataTransfer.setData('schedule', scheduleIndex)
  },
  /**
   * 成員的拖曳事件 @dragstart進行觸發
   * **/
  memberDragstart (ev, data) {
    // 必須設定dataTransfer攜帶資料，否則無法在FF上觸發drag效果
    let memberData = JSON.stringify(data)
    // set和getData時，若使用text會導致資料外洩在input內
    ev.dataTransfer.setData('userData', memberData)
    var crt = ev.currentTarget.cloneNode(true)
    crt.className = 'hangingMan ghost'

    crt.style.position = 'fixed'; crt.style.top = '-100%'; crt.style.right = '-100%'
    document.body.appendChild(crt)
    ev.dataTransfer.setDragImage(crt, 0, 0)
  },
  /**
   * 當目標被拖曳至目標旁，會產生hover效果  使用在@dragenter,@dragleave
   * @param {any} ev 指向$event
   * **/
  dragEffect (ev) {
    ev.preventDefault()
    // 指定的樣式名稱，以此作為依據做出特效
    let className = 'workSchedules'
    let day = ev.currentTarget.classList
    // 只有該項目具有daysBlock樣式時，才進行效果
    if (!day.contains(className)) { return false }
    day.toggle('focused')
  },
  /**
   * 拖曳結束之後，若放在正確的目標上，會將目標放入該班別
   * **/
  scheduleMemberDragend (group, member) {
    this.removeGhost()
    // 取得該員在當日該班別成員中的index
    let index = group.map(e => e.name).indexOf(member.name)
    group.splice(index, 1)
    this.vm.$forceUpdate()
  },
  /**
   * 當完成放置後，移除掉特效所產生的copy鬼影 使用@dragend
   * */
  removeGhost () {
    let ghost = document.getElementsByClassName('ghost')
    while (ghost.length > 0) {
      ghost[0].parentNode.removeChild(ghost[0])
    }
  },
  /**
   * 用於給handleDroped提供資料，引用之後請覆蓋在vue內的 this.currentForm.set_data[dayIndex].workSchedules
   * */
  workSchedules: [],
  /**
   * 拖曳後，放下時的handle @drop.prevent
   * @param {any} ev 宣告給$event，會自動導向物件
   * @param {number} dayIndex 代表該日於整個日程表中的位置
   * @param {number} scheduleIndex 代表該工作時段於當日的位置
   * */
  handleDroped (ev, dayIndex, scheduleIndex) {
    let self = this.vm
    let data = ev.dataTransfer
    let day = ev.currentTarget.classList
    // 樣式修改
    if (day.contains('focused')) { day.remove('focused') }
    // 決定資料的模式 true則為user資料傳遞 false則為該班資料傳遞
    let userData = data.getData('userData')
    let scheduleData = data.getData('scheduleData')

    // 防止將隨意的反白資料填入，若沒有格式:userData的物件被放入，程式停止進一步動作
    if (!userData && !scheduleData) { return false }
    // 定義同日事件: 當sameDate為true，代表目前的物件都是從同一個日期移動的
    // 不管是成員移動或是群體調班，皆為移動，不可為複製
    let sameDate = Number(data.getData('scheduleDay')) === (dayIndex)
    // 來源日期的班別index
    let fromScheduleIndex = Number(data.getData('schedule'))

    // 將drag時挾帶的資料塞入格子後，會依資料類型進行填入，同時userData將作為成員or班別移動的依據
    let myData
    if (userData) { myData = JSON.parse(userData) } else { myData = JSON.parse(scheduleData) }
    // 宣告該工作日
    let workSchedules = this.workSchedules
    // 宣告該工作日的工作班別
    let target = workSchedules[scheduleIndex]
    // 加入延遲，當使用者將該員工在同班別移入移出時，先進行移除，再進行放入，以配合classDragend()的時間差
    setTimeout(function () {
      if (!target.member) {
        target.member = []
      } else if (target.member && target.member.map(e => e.name).indexOf(myData.name) !== -1) {
        // 當該班表內的人員重複時，阻止其動作並提出警告
        alert('人員重複')
        return false
      }
      // 將人員推入當日班別，並強制更新畫面
      // 若帶有使用者資料，則將使用者資料push進該班的人員群組
      // 若為同一日且為群組模式，額外再移除原生成員
      // 否則進入班別覆蓋模式，將該班別的成員通通取代
      if (userData) {
        workSchedules[scheduleIndex].member.push(myData)
      } else {
        workSchedules[scheduleIndex].member = myData.member
        // 確認是否為當日事件，若為當日事件，且目標並非為自班別，原有的成員列表會清空
        if (sameDate && (fromScheduleIndex !== scheduleIndex)) { workSchedules[fromScheduleIndex].member = [] }
      }

      self.$forceUpdate()
    }, 1)
  },
  /** 這套函式需要用到vue內的$forceupdate，因此需要將vm(也就是this)導向給這個物件，否則會產生畫面不更新的結果 */
  vm () {
    if (process.env.NODE_ENV === 'development') { alert('請綁定至vue內的this，例:dragDrop.vm = this') } else { alert('controller.js錯誤') }
  }
}
