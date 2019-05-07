const dateInfo = new Date();
const year = dateInfo.getFullYear();
const month = dateInfo.getMonth() + 1; //As January is 0.
const today = dateInfo.getDate();
const dayOfTheWeek = dateInfo.getDay();
const dateDivs = document.getElementsByClassName('dateDiv');
let tbody;
let modal;
let addScheduleModal;
let scheduleName;
let changeScheduleModal;
let scheduleDate;
let scheduleOrder;

const dayOfTheWeekOf1st = () => {
  let result = dayOfTheWeek - Math.floor((today - 1) % 7);
  return (result < 0) ? result + 7 : result;
}

const lastDayOfThisMonth = () => {
  switch (month) {
    case 1: case 3: case 5: case 7: case 8: case 10: case 12:
      return 31;
    case 4: case 6: case 9: case 11:
      return 30;
    case 2:
      if (year % 400 == 0)
        return 29;
      if (year % 100 == 0)
        return 28;
      if (year % 4 == 0)
        return 29;
      default:
        return 32; // error
  }
}

const dateTableData = (date) => {
  let dateIndex = 0;
  let week = 0;
  let weekRow = tbody.rows[week];
  for (let i = dayOfTheWeekOf1st(); i < 7; i++) {
    if (++dateIndex == date)
      return weekRow.cells[i];
  }
  while (true) {
    weekRow = tbody.rows[++week];
    for (let i = 0; i < 7; i++) {
      if (++dateIndex == date)
        return weekRow.cells[i];
    }
  }
}

const dateIndex = (date) => {
  return dayOfTheWeekOf1st() + date - 1;
}

function setCalendar() {
  tbody = document.getElementById('tbody');
  modal = document.getElementById('modal');
  addScheduleModal = document.getElementById('addScheduleModal');
  scheduleName = document.getElementById('scheduleName');
  changeScheduleModal = document.getElementById('changeScheduleModal');
  scheduleDate = document.getElementById('scheduleDate');
  scheduleOrder = document.getElementById('scheduleOrder');

  closeAllModalWhenModalClick();

  setCalendarHeader(); //달력 요일부분 출력

  const lastDate = lastDayOfThisMonth();
  const firstLocation = dayOfTheWeekOf1st();
  for (let i = 1; i < lastDate; i++) {
    const td = dateTableData(i);
    printDates(firstLocation, i); // 날짜 찍기
    setBackgroundColor(td, i); // 날짜별 색깔 출력
    setAddScheduleModal(td, i); // 그 외 기능
  }
}

function closeAllModalWhenModalClick() {
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      addScheduleModal.style.display = "none";
      changeScheduleModal.style.display = "none";
    }
  }
}

function setCalendarHeader() {
  const calendarHeader = document.getElementById('year_month');
  calendarHeader.innerHTML = year + '年 ' + month + '月';
}

function printDates(firstLocation, date) {
  const dateDiv = dateDivs[firstLocation + date - 1];
  const dateText = document.createTextNode(date);
  dateDiv.appendChild(dateText);
}

function setBackgroundColor(td, date) {
  let color;
  if (date < today)
    color = '#e3e4ea'; // 1일부터 어제까지 회색
  else if (date == today)
    color = '#96e3ff'; // 오늘 파란색
  else
    color = '#d9e8ce'; // 내일부터 월말까지 녹색
  td.style.backgroundColor = color;
}

function setAddScheduleModal(td, date) {
  if (date < today)
    return;
  td.ondblclick = function() {
    setAddButton(td, date);
    showAddScheduleModal(date);
  }
}

function showAddScheduleModal(date) {
  addScheduleModal.firstElementChild.textContent = date + "日 일정 추가"
  scheduleName.value = '';
  modal.style.display = "block";
  addScheduleModal.style.display = "block";
}

function setAddButton(td, date) {
  const addButton = document.getElementById('addButton');
  addButton.onclick = function() {
    addSchedule(td);
    closeAddScheduleModal();
  }
}

function closeAddScheduleModal() {
  addScheduleModal.style.display = "none";
  modal.style.display = "none";
}

function addSchedule(td) {
  const div = addScheduleDomain();
  const mark = addChangeScheduleMark();
  const text = addScheduleText(div, mark);
  div.appendChild(text);
  div.appendChild(mark);
  td.appendChild(div);

  mark.onclick = function() { // mark 누르면 일정 변경 모달 설정
    setChangeScheduleMark(mark);
  }
}

const addScheduleDomain = () => {
  const div = document.createElement('div');
  div.setAttribute('class', 'schedule');

  return div;
}

const addScheduleText = (div, mark) => {
  const textDomain = document.createElement('span');
  textDomain.setAttribute('class', 'scheduleText');
  textDomain.innerHTML = scheduleName.value;
  textDomain.contentEditable = true;
  scheduleName.value = '';

  return textDomain;
}

const addChangeScheduleMark = () => {
  const mark = document.createElement('span');
  mark.setAttribute('class', 'changeMark');
  mark.innerHTML = '&times;';

  return mark;
}

function setChangeScheduleMark(mark) {
  const div = mark.parentNode;
  const td = div.parentNode;
  setChangeScheduleModal(td, div);
  showChangeScheduleModal();
}

function showChangeScheduleModal() {
  modal.style.display = 'block';
  changeScheduleModal.style.display = 'block';
}

function setChangeScheduleModal(td, div) {
  const orderValue = getScheduleIndex(div);
  const scheduleCount = td.childElementCount - 1;
  setScheduleDate(td); // 날짜 기본값 설정
  setScheduleOrder(scheduleCount, orderValue); // 일정 순서 기본값 설정

  const saveButton = document.getElementById('saveButton');
  saveButton.onclick = function() { // 저장
    saveChangesOfSchedule(td, div);
    closeChangeScheduleModal();
  }

  const deleteButton = document.getElementById('deleteButton');
  deleteButton.onclick = function() { // 삭제
    deleteSchedule(td, div);
    closeChangeScheduleModal();
  }
}

// 날짜 div 고려 ex)스케쥴 2개일 때, 2번째 스케쥴 i == 2
const getScheduleIndex = (scheduleDiv) => {
  let i = 0;
  while ( (scheduleDiv = scheduleDiv.previousSibling) != null)
    i++;
  return i;
}

function closeChangeScheduleModal() {
  changeScheduleModal.style.display = "none";
  modal.style.display = "none";
}

function setScheduleDate(td) {
  const monthSetting = (month < 10) ? `0${month}` : `${month}`;
  const rawDate = td.firstElementChild.textContent;
  const dateSetting = (rawDate < 10) ? `0${rawDate}` : `${rawDate}`;
  const dateValue = year + '-' + monthSetting + '-' + dateSetting;
  //scheduleDate.setAttribute('value', dateValue); // 쓰레기 코드
  scheduleDate.value = dateValue;

  scheduleDate.addEventListener('change', (event) => {
    if (scheduleDate.value != dateValue)
      scheduleOrder.disabled = true;
    else
      scheduleOrder.disabled = false;
  });
}

function setScheduleOrder(scheduleCount, orderValue) {
  const min = 1;
  const max = (scheduleCount > 1) ? scheduleCount : 1;
  const disabled = (max > 1) ? false : true;
  scheduleOrder.min = min;
  scheduleOrder.max = max
  //scheduleOrder.setAttribute('disalbed', disabled); // 쓰레기 코드
  scheduleOrder.disabled = disabled;
  //scheduleOrder.setAttribute('value', orderValue); // 바꾼 상태로 화면 끄면 적용 안 됨.
  scheduleOrder.value = orderValue;
}

function saveChangesOfSchedule(td, div) {
  if (scheduleOrder.disabled == true) {
    changeDate(td, div);
  } else {
    changeOrder(td, div);
  }
}

function changeDate(td, div) {
  const fullDate = new Date(scheduleDate.value);
  const changedMonth = fullDate.getMonth() + 1;
  const changedYear = fullDate.getFullYear();
  let changedDate = fullDate.getDate();
  if (changedMonth != month || changedYear != year) {
    alert('이번 달이 아닌 날로 이동이 불가능합니다')
    return;
  }
  if (changedDate < today) {
    alert('지난 날로 이동이 불가능합니다')
    return;
  }
  const newtd = dateTableData(changedDate);
  //td.removeChild(div); // 굳이 필요 없음. append가 알아서 해줌.
  newtd.appendChild(div);
}

function changeOrder(td, div) {
  const orderValue = scheduleOrder.valueAsNumber;
  const scheduleIndex = getScheduleIndex(div);
  if (orderValue == scheduleIndex)
    return;
  let nextNode;
  if (orderValue < scheduleIndex)
    nextNode = td.children[orderValue];
  else
    nextNode = td.children[orderValue+1];
  td.insertBefore(div, nextNode);
}

function deleteSchedule(td, div) {
  td.removeChild(div);
}
