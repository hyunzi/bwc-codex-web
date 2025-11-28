const fruits = [
  { icon: "🍓", label: "딸기", color: "#f43f5e" },
  { icon: "🍎", label: "사과", color: "#ef4444" },
  { icon: "🍊", label: "오렌지", color: "#f97316" },
  { icon: "🍍", label: "파인애플", color: "#eab308" },
  { icon: "🍇", label: "포도", color: "#8b5cf6" },
  { icon: "🍉", label: "수박", color: "#10b981" },
];

const state = {
  selectedFruit: null,
  currentDate: new Date(),
  stamps: new Map(), // key: YYYY-MM-DD, value: array of fruit icons
};

const fruitPicker = document.getElementById("fruit-picker");
const calendar = document.getElementById("calendar");
const monthLabel = document.getElementById("current-month");
const helper = document.getElementById("helper");
const prevMonth = document.getElementById("prev-month");
const nextMonth = document.getElementById("next-month");

function formatKey(date) {
  return date.toISOString().slice(0, 10);
}

function setHelper(message) {
  helper.textContent = message;
}

function selectFruit(fruit) {
  state.selectedFruit = fruit;
  document
    .querySelectorAll(".fruit")
    .forEach((btn) => btn.classList.toggle("active", btn.dataset.label === fruit.label));
  setHelper(`${fruit.label}를 선택했어요. 달력의 날짜를 눌러 스탬프를 찍어보세요!`);
}

function renderFruits() {
  fruitPicker.innerHTML = "";
  fruits.forEach((fruit) => {
    const button = document.createElement("button");
    button.className = "fruit";
    button.type = "button";
    button.dataset.label = fruit.label;
    button.innerHTML = `<span class="icon">${fruit.icon}</span><span class="label">${fruit.label}</span>`;
    button.style.borderColor = `${fruit.color}33`;
    button.style.background = `${fruit.color}12`;
    button.addEventListener("click", () => selectFruit(fruit));
    fruitPicker.appendChild(button);
  });
}

function getMonthMatrix(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matrix = [];
  for (let i = 0; i < startOffset; i += 1) {
    matrix.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    matrix.push(new Date(year, month, day));
  }
  return matrix;
}

function createCell(dateObj) {
  const cell = document.createElement("div");
  cell.className = dateObj ? "cell" : "cell disabled";

  if (!dateObj) {
    return cell;
  }

  const key = formatKey(dateObj);
  const number = document.createElement("div");
  number.className = "date-number";
  number.textContent = dateObj.getDate();

  const stampWrap = document.createElement("div");
  stampWrap.className = "stamps";

  const stored = state.stamps.get(key) || [];
  stored.forEach((icon) => {
    const stamp = document.createElement("span");
    stamp.className = "stamp";
    stamp.textContent = icon;
    stampWrap.appendChild(stamp);
  });

  cell.appendChild(number);
  cell.appendChild(stampWrap);

  cell.addEventListener("click", () => {
    if (!state.selectedFruit) {
      setHelper("먼저 과일 아이콘을 선택해주세요!");
      return;
    }

    const current = state.stamps.get(key) || [];
    const updated = [...current, state.selectedFruit.icon];
    state.stamps.set(key, updated);

    const stamp = document.createElement("span");
    stamp.className = "stamp";
    stamp.textContent = state.selectedFruit.icon;
    stampWrap.appendChild(stamp);

    setHelper(`${key} 일정에 ${state.selectedFruit.label}를 추가했어요.`);
  });

  return cell;
}

function renderCalendar() {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  calendar.innerHTML = "";

  days.forEach((day) => {
    const head = document.createElement("div");
    head.className = "day";
    head.textContent = day;
    calendar.appendChild(head);
  });

  const matrix = getMonthMatrix(state.currentDate);
  matrix.forEach((dateObj) => calendar.appendChild(createCell(dateObj)));

  const formatter = new Intl.DateTimeFormat("ko", { year: "numeric", month: "long" });
  monthLabel.textContent = formatter.format(state.currentDate);
}

function shiftMonth(offset) {
  const current = state.currentDate;
  state.currentDate = new Date(current.getFullYear(), current.getMonth() + offset, 1);
  renderCalendar();
}

function init() {
  renderFruits();
  renderCalendar();
  prevMonth.addEventListener("click", () => shiftMonth(-1));
  nextMonth.addEventListener("click", () => shiftMonth(1));
}

document.addEventListener("DOMContentLoaded", init);
