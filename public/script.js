let events = [];

let editingEventId = null;
let selectedEventColor = "#7c5cff";
let selectedModalEventId = null;


/* =====================================
   THEME COLORS
===================================== */

const colorThemes = {

  purple: {
    accent: "#7c5cff",
    accent2: "#5d8cff",
    rgb: "124, 92, 255"
  },

  blue: {
    accent: "#3478f6",
    accent2: "#55a0ff",
    rgb: "52, 120, 246"
  },

  cyan: {
    accent: "#12b8c4",
    accent2: "#34d6c9",
    rgb: "18, 184, 196"
  },

  green: {
    accent: "#32c878",
    accent2: "#66db94",
    rgb: "50, 200, 120"
  },

  orange: {
    accent: "#ff8a3d",
    accent2: "#ffb04f",
    rgb: "255, 138, 61"
  },

  pink: {
    accent: "#e950a4",
    accent2: "#ff75bf",
    rgb: "233, 80, 164"
  }

};


/* =====================================
   DOM
===================================== */

const titleInput =
  document.getElementById("titleInput");

const categoryInput =
  document.getElementById("categoryInput");

const startInput =
  document.getElementById("startDate");

const endInput =
  document.getElementById("endDate");

const addEventButton =
  document.getElementById("addEventButton");

const cancelEditButton =
  document.getElementById("cancelEditButton");

const formTitle =
  document.getElementById("formTitle");

const themeToggle =
  document.getElementById("themeToggle");

const colorButton =
  document.getElementById("colorButton");

const colorMenu =
  document.getElementById("colorMenu");

const eventColorButtons =
  document.querySelectorAll(".event-color");

const modalOverlay =
  document.getElementById("modalOverlay");

const modalClose =
  document.getElementById("modalClose");

const modalEditButton =
  document.getElementById("modalEditButton");

const modalDeleteButton =
  document.getElementById("modalDeleteButton");


/* =====================================
   API - LOAD EVENTS
===================================== */

async function loadEvents() {

  try {

    const response =
      await fetch("/api/events");


    if (!response.ok) {

      throw new Error(
        "Unable to load events."
      );

    }


    events =
      await response.json();


    setDatabaseStatus(true);

    renderDashboard();

    renderTimeline();

  }

  catch (error) {

    console.error(
      "Load events error:",
      error
    );


    setDatabaseStatus(false);


    showToast(
      "DB에서 이벤트를 불러오지 못했습니다."
    );

  }

}


/* =====================================
   DATABASE STATUS
===================================== */

function setDatabaseStatus(connected) {

  const status =
    document.getElementById(
      "databaseStatus"
    );


  if (!status) {
    return;
  }


  status.classList.toggle(
    "connected",
    connected
  );


  status.classList.toggle(
    "disconnected",
    !connected
  );


  status.innerHTML =
    connected
      ? "<span></span> Neon connected"
      : "<span></span> Database offline";

}


/* =====================================
   DATE HELPERS
===================================== */

function parseDate(value) {

  const [
    year,
    month,
    day
  ] =
    value
      .split("-")
      .map(Number);


  return new Date(
    year,
    month - 1,
    day
  );

}


function todayDate() {

  const now =
    new Date();


  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

}


function diffDays(from, to) {

  const oneDay =
    1000 * 60 * 60 * 24;


  return Math.round(
    (to - from) / oneDay
  );

}


function formatDate(value) {

  return parseDate(value)
    .toLocaleDateString(
      "en-CA",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );

}


/* =====================================
   STATUS
===================================== */

function getEventStatus(event) {

  const today =
    todayDate();


  const start =
    parseDate(
      event.startDate
    );


  if (!event.endDate) {

    const days =
      diffDays(
        today,
        start
      );


    if (days > 0) {

      return {
        type: "future",
        text: `D-${days}`
      };

    }


    if (days < 0) {

      return {
        type: "past",
        text:
          `${Math.abs(days)} days ago`
      };

    }


    return {
      type: "today",
      text: "TODAY"
    };

  }


  const end =
    parseDate(
      event.endDate
    );


  if (today < start) {

    return {
      type: "future",
      text:
        `Starts in ${diffDays(today, start)} days`
    };

  }


  if (today > end) {

    return {
      type: "past",
      text:
        `Ended ${diffDays(end, today)} days ago`
    };

  }


  return {
    type: "active",
    text:
      `${diffDays(today, end)} days left`
  };

}


/* =====================================
   PROGRESS
===================================== */

function getProgress(event) {

  if (!event.endDate) {

    return null;

  }


  const start =
    parseDate(
      event.startDate
    );


  const end =
    parseDate(
      event.endDate
    );


  const today =
    todayDate();


  const total =
    diffDays(
      start,
      end
    );


  if (total <= 0) {

    return 100;

  }


  if (today <= start) {

    return 0;

  }


  if (today >= end) {

    return 100;

  }


  const elapsed =
    diffDays(
      start,
      today
    );


  return Math.round(
    (elapsed / total) * 100
  );

}


/* =====================================
   ADD / UPDATE EVENT
===================================== */

async function submitEvent() {

  const title =
    titleInput
      .value
      .trim();


  const category =
    categoryInput.value;


  const startDate =
    startInput.value;


  const endDate =
    endInput.value;


  if (!title) {

    showToast(
      "이벤트 이름을 입력하세요."
    );

    titleInput.focus();

    return;

  }


  if (!startDate) {

    showToast(
      "시작 날짜를 선택하세요."
    );

    return;

  }


  if (
    endDate &&
    endDate < startDate
  ) {

    showToast(
      "종료 날짜는 시작 날짜보다 뒤여야 합니다."
    );

    return;

  }


  const data = {

    title,

    category,

    startDate,

    endDate,

    color:
      selectedEventColor

  };


  try {

    let response;


    if (editingEventId) {

      response =
        await fetch(
          `/api/events/${editingEventId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(data)
          }
        );

    }

    else {

      response =
        await fetch(
          "/api/events",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(data)
          }
        );

    }


    if (!response.ok) {

      const errorData =
        await response
          .json()
          .catch(() => null);


      throw new Error(
        errorData?.error ||
        "Save failed."
      );

    }


    showToast(
      editingEventId
        ? "이벤트를 수정했습니다."
        : "이벤트를 추가했습니다."
    );


    resetForm();


    await loadEvents();

  }

  catch (error) {

    console.error(
      "Submit event error:",
      error
    );


    showToast(
      "이벤트 저장에 실패했습니다."
    );

  }

}


/* =====================================
   DELETE EVENT
===================================== */

async function deleteEvent(id) {

  try {

    const response =
      await fetch(
        `/api/events/${id}`,
        {
          method:
            "DELETE"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Delete failed."
      );

    }


    closeModal();


    showToast(
      "이벤트를 삭제했습니다."
    );


    await loadEvents();

  }

  catch (error) {

    console.error(
      "Delete error:",
      error
    );


    showToast(
      "이벤트 삭제에 실패했습니다."
    );

  }

}


/* =====================================
   EDIT EVENT
===================================== */

function editEvent(id) {

  const event =
    events.find(
      event =>
        event.id === id
    );


  if (!event) {
    return;
  }


  editingEventId =
    id;


  titleInput.value =
    event.title;


  categoryInput.value =
    event.category || "Personal";


  startInput.value =
    event.startDate;


  endInput.value =
    event.endDate || "";


  setSelectedEventColor(
    event.color || "#7c5cff"
  );


  formTitle.textContent =
    "이벤트 수정";


  addEventButton.textContent =
    "Save Changes";


  cancelEditButton
    .classList
    .remove("hidden");


  closeModal();


  window.scrollTo({
    top: 420,
    behavior: "smooth"
  });

}


/* =====================================
   RESET FORM
===================================== */

function resetForm() {

  editingEventId =
    null;


  titleInput.value =
    "";


  categoryInput.value =
    "Personal";


  startInput.value =
    "";


  endInput.value =
    "";


  setSelectedEventColor(
    "#7c5cff"
  );


  formTitle.textContent =
    "새 이벤트";


  addEventButton.textContent =
    "+ Add Event";


  cancelEditButton
    .classList
    .add("hidden");

}


/* =====================================
   EVENT COLOR
===================================== */

function setSelectedEventColor(color) {

  selectedEventColor =
    color;


  eventColorButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.eventColor === color
      );

    }
  );

}


eventColorButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        setSelectedEventColor(
          button.dataset.eventColor
        );

      }
    );

  }
);


/* =====================================
   DASHBOARD
===================================== */

function renderDashboard() {

  const totalStat =
    document.getElementById(
      "totalStat"
    );

  const upcomingStat =
    document.getElementById(
      "upcomingStat"
    );

  const activeStat =
    document.getElementById(
      "activeStat"
    );

  const nextEventTitle =
    document.getElementById(
      "nextEventTitle"
    );

  const nextEventDday =
    document.getElementById(
      "nextEventDday"
    );


  if (
    !totalStat ||
    !upcomingStat ||
    !activeStat ||
    !nextEventTitle ||
    !nextEventDday
  ) {

    return;

  }


  const today =
    todayDate();


  let upcoming =
    0;


  let active =
    0;


  const futureEvents =
    [];


  events.forEach(
    event => {

      const start =
        parseDate(
          event.startDate
        );


      const end =
        event.endDate
          ? parseDate(
              event.endDate
            )
          : null;


      if (start > today) {

        upcoming++;

        futureEvents.push(
          event
        );

      }


      if (
        end &&
        today >= start &&
        today <= end
      ) {

        active++;

      }

    }
  );


  futureEvents.sort(
    (a, b) =>
      parseDate(a.startDate) -
      parseDate(b.startDate)
  );


  const nextEvent =
    futureEvents[0] || null;


  totalStat.textContent =
    events.length;


  upcomingStat.textContent =
    upcoming;


  activeStat.textContent =
    active;


  if (nextEvent) {

    const days =
      diffDays(
        today,
        parseDate(
          nextEvent.startDate
        )
      );


    nextEventTitle.textContent =
      nextEvent.title;


    nextEventDday.textContent =
      `D-${days}`;

  }

  else {

    nextEventTitle.textContent =
      "No upcoming events";


    nextEventDday.textContent =
      "—";

  }

}


/* =====================================
   SAFE HTML
===================================== */

function escapeHtml(text) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


/* =====================================
   TIME GAP
===================================== */

function humanTimeGap(days) {

  const absolute =
    Math.abs(days);


  if (absolute < 30) {

    return `${absolute} days`;

  }


  if (absolute < 365) {

    const months =
      Math.floor(
        absolute / 30
      );


    const rest =
      absolute % 30;


    return rest
      ? `${months} months ${rest} days`
      : `${months} months`;

  }


  const years =
    Math.floor(
      absolute / 365
    );


  const remainingDays =
    absolute % 365;


  const months =
    Math.floor(
      remainingDays / 30
    );


  return months
    ? `${years} years ${months} months`
    : `${years} years`;

}


/* =====================================
   TODAY MARKER
===================================== */

function createTodayMarker() {

  const marker =
    document.createElement(
      "div"
    );


  marker.className =
    "today-marker";


  marker.innerHTML =
    "<span>TODAY</span>";


  return marker;

}


/* =====================================
   GAP MARKER
===================================== */

function createGap(days) {

  const gap =
    document.createElement(
      "div"
    );


  gap.className =
    "time-gap";


  gap.innerHTML =
    `<span>↕ ${humanTimeGap(days)}</span>`;


  return gap;

}


/* =====================================
   RENDER TIMELINE
===================================== */

function renderTimeline() {

  const root =
    document.getElementById(
      "timeline"
    );


  const counter =
    document.getElementById(
      "eventCount"
    );


  counter.textContent =
    `${events.length} ${
      events.length === 1
        ? "event"
        : "events"
    }`;


  root.innerHTML =
    "";


  if (!events.length) {

    root.innerHTML = `

      <div class="empty">

        <div class="empty-icon">
          ◷
        </div>

        <h3>
          아직 Timeline이 비어 있습니다.
        </h3>

        <p>
          첫 번째 이벤트를 등록해보세요.
        </p>

      </div>

    `;

    return;

  }


  const timeline =
    document.createElement(
      "div"
    );


  timeline.className =
    "timeline";


  const line =
    document.createElement(
      "div"
    );


  line.className =
    "timeline-line";


  timeline.appendChild(
    line
  );


  const sorted =
    [...events].sort(
      (a, b) =>
        parseDate(a.startDate) -
        parseDate(b.startDate)
    );


  const today =
    todayDate();


  let todayInserted =
    false;


  sorted.forEach(
    (event, index) => {

      const start =
        parseDate(
          event.startDate
        );


      if (
        !todayInserted &&
        start >= today
      ) {

        timeline.appendChild(
          createTodayMarker()
        );


        todayInserted =
          true;

      }


      if (index > 0) {

        const previous =
          sorted[index - 1];


        const previousDate =
          previous.endDate
            ? parseDate(
                previous.endDate
              )
            : parseDate(
                previous.startDate
              );


        const gap =
          diffDays(
            previousDate,
            start
          );


        if (gap > 0) {

          timeline.appendChild(
            createGap(gap)
          );

        }

      }


      const status =
        getEventStatus(
          event
        );


      const progress =
        getProgress(
          event
        );


      const item =
        document.createElement(
          "div"
        );


      item.className =
        `timeline-item ${
          index % 2 === 0
            ? "left"
            : "right"
        }`;


      item.style.setProperty(
        "--event-color",
        event.color || "#7c5cff"
      );


      let dateText =
        formatDate(
          event.startDate
        );


      if (event.endDate) {

        dateText +=
          ` → ${formatDate(event.endDate)}`;

      }


      let progressHTML =
        "";


      if (progress !== null) {

        progressHTML = `

          <div class="progress-section">

            <div class="progress-info">

              <span>
                Progress
              </span>

              <span>
                ${progress}%
              </span>

            </div>

            <div class="progress-bar">

              <div
                class="progress-fill"
                style="width:${progress}%"
              ></div>

            </div>

          </div>

        `;

      }


      item.innerHTML = `

        <div class="timeline-dot"></div>

        <div
          class="card"
          onclick="openModal(${event.id})"
          style="--event-color:${event.color || "#7c5cff"}"
        >

          <div class="card-category">
            ${escapeHtml(event.category || "Personal")}
          </div>

          <div class="card-date">
            ${dateText}
          </div>

          <div class="card-title">
            ${escapeHtml(event.title)}
          </div>

          <div class="meta-row">

            <span
              class="badge ${status.type}"
            >
              ${status.text}
            </span>

          </div>

          ${progressHTML}

        </div>

      `;


      timeline.appendChild(
        item
      );

    }
  );


  if (!todayInserted) {

    timeline.appendChild(
      createTodayMarker()
    );

  }


  root.appendChild(
    timeline
  );

}


/* =====================================
   MODAL
===================================== */

function openModal(id) {

  const event =
    events.find(
      event =>
        event.id === id
    );


  if (!event) {
    return;
  }


  selectedModalEventId =
    id;


  document.getElementById(
    "modalTitle"
  ).textContent =
    event.title;


  const status =
    getEventStatus(
      event
    );


  const progress =
    getProgress(
      event
    );


  let date =
    formatDate(
      event.startDate
    );


  if (event.endDate) {

    date +=
      ` → ${formatDate(event.endDate)}`;

  }


  document.getElementById(
    "modalInfo"
  ).innerHTML = `

    <div>
      <strong>Category</strong><br>
      ${escapeHtml(event.category || "Personal")}
    </div>

    <div>
      <strong>Date</strong><br>
      ${date}
    </div>

    <div>
      <strong>Status</strong><br>
      ${status.text}
    </div>

    ${
      progress !== null
        ? `
          <div>
            <strong>Progress</strong><br>
            ${progress}%
          </div>
        `
        : ""
    }

  `;


  modalOverlay
    .classList
    .add("show");

}


function closeModal() {

  modalOverlay
    .classList
    .remove("show");


  selectedModalEventId =
    null;

}


/* =====================================
   THEME
===================================== */

function applyTheme(theme) {

  const light =
    theme === "light";


  document.body
    .classList
    .toggle(
      "light",
      light
    );


  themeToggle.textContent =
    light
      ? "☾"
      : "☀";


  localStorage.setItem(
    "timelineTheme",
    theme
  );

}


/* =====================================
   GLOBAL ACCENT COLOR
===================================== */

function applyColor(name) {

  const theme =
    colorThemes[name];


  if (!theme) {
    return;
  }


  const root =
    document.documentElement;


  root.style.setProperty(
    "--accent",
    theme.accent
  );


  root.style.setProperty(
    "--accent-2",
    theme.accent2
  );


  root.style.setProperty(
    "--accent-rgb",
    theme.rgb
  );


  localStorage.setItem(
    "timelineColor",
    name
  );

}


/* =====================================
   TODAY CHIP
===================================== */

function renderTodayChip() {

  const todayChip =
    document.getElementById(
      "todayChip"
    );


  if (!todayChip) {
    return;
  }


  const text =
    new Date()
      .toLocaleDateString(
        "en-CA",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );


  todayChip.textContent =
    `Today · ${text}`;

}


/* =====================================
   TOAST
===================================== */

let toastTimeout;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimeout
  );


  toastTimeout =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },

      2200
    );

}


/* =====================================
   LISTENERS
===================================== */

addEventButton.addEventListener(
  "click",
  submitEvent
);


cancelEditButton.addEventListener(
  "click",
  resetForm
);


titleInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      submitEvent();

    }

  }
);


modalClose.addEventListener(
  "click",
  closeModal
);


modalOverlay.addEventListener(
  "click",
  event => {

    if (
      event.target === modalOverlay
    ) {

      closeModal();

    }

  }
);


modalEditButton.addEventListener(
  "click",
  () => {

    if (selectedModalEventId) {

      editEvent(
        selectedModalEventId
      );

    }

  }
);


modalDeleteButton.addEventListener(
  "click",
  () => {

    if (selectedModalEventId) {

      deleteEvent(
        selectedModalEventId
      );

    }

  }
);


themeToggle.addEventListener(
  "click",
  () => {

    const isLight =
      document.body
        .classList
        .contains("light");


    applyTheme(
      isLight
        ? "dark"
        : "light"
    );

  }
);


colorButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();


    colorMenu
      .classList
      .toggle("show");

  }
);


document
  .querySelectorAll(
    ".color-option"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          applyColor(
            button.dataset.color
          );


          colorMenu
            .classList
            .remove("show");

        }
      );

    }
  );


document.addEventListener(
  "click",
  () => {

    colorMenu
      .classList
      .remove("show");

  }
);


/* =====================================
   START
===================================== */

applyTheme(
  localStorage.getItem(
    "timelineTheme"
  ) || "dark"
);


applyColor(
  localStorage.getItem(
    "timelineColor"
  ) || "purple"
);


renderTodayChip();

loadEvents();