<template>
  <article>
    <div class="card">
      <div class="row no-gutters mt-3">
        <!-- 人員列表與拖曳區域 -->
        <div class="col-md-3 col-lg-2">
          <div class="px-2">
            <ul class="list-group">
              <li class="list-group-item active">
                <h4 class="my-0">排班成員</h4>
              </li>
              <li v-for="(member,index) in members"
                  :key="'memberToWork'+index"
                  :title="`${member.name} (可拖曳)`"
                  draggable="true"
                  @dragstart="handleDragstart($event,member)"
                  @dragend="handleDragend"
                  class="list-group-item list-group-item-action px-2"
                  style="cursor: grab;">
                <div class="d-flex align-items-center">
                  <i class="fa-fw fas fa-grip-vertical"
                     style="opacity:.3;"></i>
                  <span class="px-1">{{member.name}}</span>
                  <!-- <button @click="members.splice( index , 1 )"
                          title="移除人員"
                          type="button"
                          class="ml-auto clearBtn">
                    <i class="fa-fw fas fa-times"></i>
                  </button> -->
                </div>
              </li>
              <li v-if="statusAddMember"
                  class="list-group-item list-group-item-action px-2">
                <input v-focus
                       @keyup.enter="handleAddMember"
                       title="按下enter新增人員"
                       type="text"
                       class="w-100">
              </li>
              <li class="list-group-item list-group-item-action px-0 py-0">
                <button v-if="!statusAddMember"
                        @click="statusAddMember = !statusAddMember"
                        type="button"
                        class="text-success clearBtn px-2 py-3 text-left w-100">
                  <i class="fa-fw fas fa-user-plus"></i>
                  新增人員
                </button>

                <button v-else
                        @click="statusAddMember = !statusAddMember"
                        type="button"
                        class="clearBtn px-2 py-3 text-left w-100">
                  <i class="fa-fw fas fa-times"></i>
                  取消新增
                </button>
              </li>
            </ul>
          </div>
        </div>
        <!-- 當使用者選了第一天之後，日曆才會出現 -->
        <div class="col">
          <div class="mb-3">
            <select v-model="currentForm['start']"
                    @change="settingCalendar(currentForm['start'])"
                    class="form-control">
              <option v-for="(month,index) in nextMonths"
                      :key="'mon'+index"
                      :label="month.label"
                      :value="month.value"></option>
            </select>
          </div>
          <div class="scheduleGroup">
            <div class="d-flex">

              <button :class="{'active' : active.name === allClass.name}"
                      @click="active = allClass"
                      type="button"
                      class="scheduleGroup-item">{{allClass.name}}</button>
              <button v-for="(work,index) in workSchedules"
                      :class="{'active' : active.name === work.name}"
                      @click="active = work"
                      :key="'workSchedules'+index"
                      type="button"
                      class="scheduleGroup-item">{{work.name}}</button>

              <!-- <button v-if="!statusAddWork"
                      @click="statusAddWork = !statusAddWork"
                      type="button"
                      class="scheduleGroup-item">
                <i class="fa-fw fas fa-plus text-success"></i>
              </button>
              <button v-else
                      @click="statusAddWork = !statusAddWork"
                      type="button"
                      class="scheduleGroup-item">
                <i class="fa-fw fas fa-times"></i>
              </button> -->
            </div>
            <transition name="el-fade-in-linear">
              <p class="scheduleGroup-intro">{{active.info}}</p>
            </transition>
          </div>

          <div class="custCalendar">
            <div class="d-flex flex-wrap">
              <!-- 預設的星期 -->
              <div v-for="(week,index) in weeks"
                   :key="'week'+index"
                   class="week">{{week}}</div>

              <template v-if="startDay">
                <!-- 依使用者選擇的起始星期做空格 -->
                <div v-for="(day,index) in (startDay % 7)"
                     :key="'unUseDays'+index"
                     class="bg-grey days daysBlock nullBlcok">
                </div>

                <!-- 依set_data陣列排出日期 -->
                <div v-for="(day,index) in currentForm.set_data"
                     :key="'day'+index"
                     class="days daysBlock active">
                  <!-- 顯示該日日期 -->
                  <div class="dayDate text-center">
                    {{getDate(index)}}
                  </div>
                  <!-- 顯示該日的班別，會因頁籤的啟用與否而消失 -->
                  <section v-for="(wClass,i) in day.workSchedules"
                           v-if="(active.name === '全部' || wClass.name === active.name)"
                           :key="'workSchedules'+i"
                           @dragenter="dragEffect"
                           @dragleave="dragEffect"
                           @dragover="dropover"
                           @drop="handleDroped($event,index,i)"
                           class="workSchedules">
                    <h5 :title="`${wClass.name} (可拖曳)`"
                        draggable="true"
                        @dragstart="scheduleDragstart($event,wClass,index,i)"
                        @dragend="handleDragend"
                        class="background">
                      <div class="worksName">
                        <i class="fa-fw fas fa-arrows-alt"></i>
                        {{wClass.name}}
                      </div>
                      <!-- 顯示該日的工作人員 -->
                      <div class="memberBlock">
                        <div v-for="(member,i) in wClass.member"
                             :key="`member${index}${i}`"
                             :title="`${member.name} (可拖曳)`"
                             draggable="true"
                             @dragstart="handleDragstart($event,member)"
                             @dragend="scheduleMemberDragend(wClass.member, member)"
                             style="cursor: grab;"
                             class="member">
                          <span class="name">
                            <i class="fa-fw fas fa-grip-vertical"></i>
                            {{member.name}}
                          </span>
                        </div>
                      </div>
                    </h5>
                  </section>

                </div>

                <!-- 後置日: 為使用者湊齊一整周之後，為後面的格子上色。 -->
                <div v-for="(day,index) in (7 - (startDay + currentForm.set_data.length) % 7)"
                     :key="'unUseDays2'+index"
                     class="bg-grey days daysBlock nullBlcok">
                </div>

              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { weeks, dragDrop, dateLength, lastDate, nextMonths } from './module.js'
import workSchedules from './workSchedules.json'
import members from './members.json'

import $moment from 'moment'
$moment.locale('zh-tw')
export default {
  directives: {
    focus: {
      // directive definition
      inserted: function (el) {
        el.focus()
      }
    }
  },
  methods: {

    /** 開始移動排班成員列表中，成員的效果 */
    handleDragstart (ev, data) {
      return dragDrop.memberDragstart(ev, data)
    },
    handleDragend (dayIndex) {
      return dragDrop.removeGhost()
    },
    scheduleDragstart (ev, mySchedule, dayIndex, scheduleIndex) {
      return dragDrop.scheduleDragstart(ev, mySchedule, dayIndex, scheduleIndex)
    },
    // 班表內的人員移動後，從群體中強制移除自身
    scheduleMemberDragend (group, member) {
      return dragDrop.scheduleMemberDragend(group, member)
    },
    // 移入/移出到格子時產生效果
    dragEffect (ev) {
      return dragDrop.dragEffect(ev)
    },
    // 控制移動到格子上時的觸發效果，允許其被產生效果
    dropover (ev) {
      ev.preventDefault()
    },
    // 移動後的行為
    handleDroped (ev, dayIndex, scheduleIndex) {
      ev.preventDefault()
      // 將函式所需要的值與vm內的值做結合並進行計算
      dragDrop.workSchedules = this.currentForm.set_data[dayIndex].workSchedules
      return dragDrop.handleDroped(ev, dayIndex, scheduleIndex)
    },

    // 返回一個日期，其為選擇日的加上日*i後取得的日期
    getDate (i) {
      let dateStart = this.currentForm['start']
      let dateComputer = $moment(dateStart).add(i, 'days')
      let format = 'MM/DD'
      return dateComputer.format(format)
    },
    /** 設定班表的開始與結束 */
    settingCalendar (start) {
      let end = lastDate(start)
      // 取得開始與結束日期的長度
      let length = dateLength(start, end)
      /** 取得目前的資料 */
      let current = this.currentForm.set_data
      // 宣告每天的班別
      let workSchedules = this.workSchedules
      // 假如目前set_data長度大於區間，就把日期加上去，否則一路扣回來
      if (current.length < length) {
        for (let i = current.length; i < length; i++) {
          let obj = {}
          obj.workSchedules = workSchedules
          current.push(JSON.parse(JSON.stringify(obj)))
        }
      } else {
        for (let i = current.length; i > length; i--) {
          current.pop()
        }
      }
    },
    /** 功能，新增人員 */
    handleAddMember (e) {
      let name = e.target.value
      e.target.value = ''
      const array = this.members
      const newMember = { name }
      array.push(newMember)
      this.statusAddMember = false
    }
  },
  mounted () {
    // 初始化: 進行次月的班表規劃
    this.currentForm.start = $moment().add(1, 'months').format('YYYY-MM-01')
    this.settingCalendar(this.currentForm.start)
    // 初始化，顯示全部的班表
    this.active = this.allClass
  },
  computed: {
    // 取得使用者選擇的日期為當周第幾日
    startDay () {
      return $moment(this.currentForm['start']).isoWeekday() || 0
    },
    nextMonths () {
      return nextMonths(6)
    }
  },
  data () {
    /** 綁定，讓外部的js能夠依此啟用$forceUpdate */
    dragDrop.vm = this
    return {
      weeks, // 預設用的星期
      // 編輯用的表格
      currentForm: {
        'start': '',
        'end': '',
        set_data: []
      },
      members, // 可選的人員們
      active: {}, // 啟用中的班別
      // 預設固定功能，顯示全部的班別
      allClass: {
        name: '全部',
        info: '顯示所有班別'
      },
      workSchedules, // 其他使用的班別
      statusAddMember: false, // 新增人員的開關trigger
      statusAddWork: false // 新增班表的trigger
    }
  }
}
</script>

<style lang="scss" src="../assets/basic.scss"></style>
<style lang="scss" src="../assets/dragDrop.scss"></style>

<style scoped>
.clearBtn {
  border: 0;
  background-color: transparent;
}
</style>
