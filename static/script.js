// ============ STATE ============
let currentPage = 'landing';
let currentDay = 'Mon';
let adminKitchenDay = 'Mon';
let menuApproved = false;
let loginType = '';
let currentUser = null;

const MOCK_DB = {
  abhay: {
    user: 'abhay', pass: '1234', name: 'Abhay', id: 'STU001', role: 'student',
    selections: {
      Mon: { breakfast: {option:0, portion:'Full'}, lunch: {option:0, portion:'Full'} },
      Tue: { breakfast: {option:1, portion:'Half'} },
      Wed: {},
      Thu: { lunch: {option:0, portion:'Full'}, dinner: {option:0, portion:'Half'} },
      Fri: {},
      Sat: { lunch: {option:1, portion:'Full'} },
      Sun: {}
    },
    wasteStats: [12, 8, 5, 75],
    wasteTrend: [20, 18, 15, 25, 22, 10, 12],
    history: [
      {meal:'Dinner',item:'Roasted Garlic Broccoli + Dal',portion:'Half',date:'Sun, 22 Mar',completion:'90%'},
      {meal:'Lunch',item:'Standard Veg Thali',portion:'Full',date:'Sun, 22 Mar',completion:'100%'}
    ]
  },
  tharun: {
    user: 'tharun', pass: '1234', name: 'Tharun', id: 'STU002', role: 'student',
    selections: {
      Mon: { lunch: {option:1, portion:'Half'} },
      Tue: { breakfast: {option:0, portion:'Full'}, lunch: {option:0, portion:'Full'} },
      Wed: { dinner: {option:1, portion:'Full'} },
      Thu: {},
      Fri: { lunch: {option:1, portion:'Half'}, snack: {option:0, portion:'Full'} },
      Sat: {},
      Sun: { breakfast: {option:1, portion:'Full'} }
    },
    wasteStats: [25, 10, 2, 63],
    wasteTrend: [35, 30, 28, 25, 20, 15, 18],
    history: [
      {meal:'Breakfast',item:'Oats & Fruits',portion:'Full',date:'Sat, 21 Mar',completion:'85%'},
      {meal:'Lunch',item:'Light Meal',portion:'Half',date:'Sat, 21 Mar',completion:'40%'}
    ]
  },
  goutham: {
    user: 'goutham', pass: '1234', name: 'Goutham', id: 'STU003', role: 'student',
    selections: {
      Mon: { breakfast: {option:0, portion:'Full'}, dinner: {option:0, portion:'Extra'} },
      Tue: {},
      Wed: { lunch: {option:0, portion:'Full'}, snack: {option:1, portion:'Full'} },
      Thu: { breakfast: {option:1, portion:'Half'}, lunch: {option:0, portion:'Full'} },
      Fri: { dinner: {option:1, portion:'Extra'} },
      Sat: { lunch: {option:0, portion:'Full'}, dinner: {option:0, portion:'Full'} },
      Sun: {}
    },
    wasteStats: [5, 2, 8, 85],
    wasteTrend: [10, 8, 5, 6, 4, 3, 5],
    history: [
      {meal:'Dinner',item:'Mutton Biryani',portion:'Extra',date:'Sat, 21 Mar',completion:'100%'}
    ]
  }
};

const USERS = {
  admin: [{user:'admin', pass:'admin123', name:'Admin'}]
};
// ============ NAV ============
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  currentPage = id;
  window.scrollTo(0,0);
}

// ============ LOGIN FUNCTION ============
function goToLogin(type) {
  loginType = type;
  document.getElementById('loginTitle').textContent = type === 'student' ? 'Student Login' : 'Admin Login';
  
  const btn = document.getElementById('loginSubmitBtn');
  if (type === 'student') {
    btn.className = 'btn btn-teal btn-full btn-lg';
    document.getElementById('loginUser').value = 'abhay';
    document.getElementById('loginPass').value = '1234';
  } else {
    btn.className = 'btn btn-amber btn-full btn-lg';
    document.getElementById('loginUser').value = USERS.admin[0].user;
    document.getElementById('loginPass').value = USERS.admin[0].pass;
  }
  
  document.getElementById('loginError').style.display = 'none';
  showPage('login');
}

function processLogin() {
  const user = document.getElementById('loginUser').value.toLowerCase();
  const pass = document.getElementById('loginPass').value;
  
  let validUser = null;
  if (loginType === 'student') {
    if (MOCK_DB[user] && MOCK_DB[user].pass === pass) validUser = MOCK_DB[user];
  } else {
    validUser = USERS.admin.find(u => u.user === user && u.pass === pass);
  }
  
  if (validUser) {
    currentUser = validUser;
    if (loginType === 'student') {
      document.getElementById('studentName').textContent = validUser.name;
      document.getElementById('studentAvatar').textContent = validUser.name[0];
      initStudentPage();
      showPage('student');
    } else {
      initAdminPage();
      showPage('admin');
    }
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function handleLoginKey(e) {
  if (e.key === 'Enter') processLogin();
}

function logout() { 
  currentUser = null;
  if (studentDonutChart) { studentDonutChart.destroy(); studentDonutChart = null; }
  if (studentLineChart) { studentLineChart.destroy(); studentLineChart = null; }
  studentChartsBuilt = false;
  showPage('landing'); 
}

// ============ STUDENT PAGE ============
const menuA = [
  {
    label:'Breakfast', time:'7:00 AM – 9:00 AM', emoji:'🌅', key:'breakfast',
    options:[
      {name:'Masala Dosa', desc:'South Indian, light', icon:'🥞'},
      {name:'Oats & Fruits', desc:'Healthy, vegan', icon:'🥣'}
    ]
  },
  {
    label:'Lunch', time:'12:30 PM – 2:30 PM', emoji:'☀️', key:'lunch',
    options:[
      {name:'Standard Veg Thali', desc:'Rice, Dal, Mixed Veg Curry, Chapati', icon:'🍛'},
      {name:'Light Meal', desc:'2 Chapatis, Dal, Salad', icon:'🥗'}
    ]
  },
  {
    label:'Evening Snack', time:'5:00 PM – 6:00 PM', emoji:'🌤️', key:'snack',
    options:[
      {name:'Samosa + Chai', desc:'Classic snack', icon:'🥟'},
      {name:'Bread Butter Jam', desc:'Light bite', icon:'🍞'}
    ]
  },
  {
    label:'Dinner', time:'7:30 PM – 9:30 PM', emoji:'🌙', key:'dinner',
    options:[
      {name:'Roasted Garlic Broccoli + Dal', desc:'Healthy, vegetarian', icon:'🥦'},
      {name:'Mutton Curry + Rice', desc:'Non-veg, heavy', icon:'🍖'}
    ]
  }
];

const menuB = [
  {
    label:'Breakfast', time:'7:00 AM – 9:00 AM', emoji:'🌅', key:'breakfast',
    options:[
      {name:'Aloo Paratha', desc:'North Indian, filling', icon:'🫓'},
      {name:'Idli Sambar', desc:'South Indian classic', icon:'🍲'}
    ]
  },
  {
    label:'Lunch', time:'12:30 PM – 2:30 PM', emoji:'☀️', key:'lunch',
    options:[
      {name:'Rajma Chawal', desc:'Comfort food', icon:'🍛'},
      {name:'Chicken Biryani', desc:'Rich and flavorful', icon:'🍗'}
    ]
  },
  {
    label:'Evening Snack', time:'5:00 PM – 6:00 PM', emoji:'🌤️', key:'snack',
    options:[
      {name:'Poha', desc:'Light and healthy', icon:'🥗'},
      {name:'Veg Cutlet', desc:'Crispy and warm', icon:'🧆'}
    ]
  },
  {
    label:'Dinner', time:'7:30 PM – 9:30 PM', emoji:'🌙', key:'dinner',
    options:[
      {name:'Paneer Butter Masala', desc:'Rich vegetarian', icon:'🧀'},
      {name:'Egg Curry + Rice', desc:'Protein packed', icon:'🥚'}
    ]
  }
];

const menuC = [
  {
    label:'Breakfast', time:'7:00 AM – 9:00 AM', emoji:'🌅', key:'breakfast',
    options:[
      {name:'Puri Bhaji', desc:'Fried goodness', icon:'🫓'},
      {name:'Fruit Bowl + Milk', desc:'Light and sweet', icon:'🥣'}
    ]
  },
  {
    label:'Lunch', time:'12:30 PM – 2:30 PM', emoji:'☀️', key:'lunch',
    options:[
      {name:'Chole Bhature', desc:'North Indian favorite', icon:'🥣'},
      {name:'Fish Curry + Rice', desc:'Coastal style', icon:'🐟'}
    ]
  },
  {
    label:'Evening Snack', time:'5:00 PM – 6:00 PM', emoji:'🌤️', key:'snack',
    options:[
      {name:'Bhel Puri', desc:'Tangy street food', icon:'🥗'},
      {name:'Tea + Biscuits', desc:'Simple classic', icon:'☕'}
    ]
  },
  {
    label:'Dinner', time:'7:30 PM – 9:30 PM', emoji:'🌙', key:'dinner',
    options:[
      {name:'Palak Paneer', desc:'Healthy green curry', icon:'🧀'},
      {name:'Chicken Tikka Masala', desc:'Spicy and rich', icon:'🍗'}
    ]
  }
];

const menuD = [
  {
    label:'Breakfast', time:'7:00 AM – 9:00 AM', emoji:'🌅', key:'breakfast',
    options:[
      {name:'Upma', desc:'Savory semolina', icon:'🥣'},
      {name:'Cheese Omelette', desc:'Protein packed', icon:'🥚'}
    ]
  },
  {
    label:'Lunch', time:'12:30 PM – 2:30 PM', emoji:'☀️', key:'lunch',
    options:[
      {name:'Veg Pulao + Raita', desc:'Light rice dish', icon:'🍛'},
      {name:'Mutton Biryani', desc:'Weekend special', icon:'🍖'}
    ]
  },
  {
    label:'Evening Snack', time:'5:00 PM – 6:00 PM', emoji:'🌤️', key:'snack',
    options:[
      {name:'Onion Pakora', desc:'Crispy fritters', icon:'🧆'},
      {name:'Coffee + Cake', desc:'Sweet treat', icon:'🍰'}
    ]
  },
  {
    label:'Dinner', time:'7:30 PM – 9:30 PM', emoji:'🌙', key:'dinner',
    options:[
      {name:'Dal Makhani + Naan', desc:'Creamy lentils', icon:'🫓'},
      {name:'Butter Chicken', desc:'Classic favorite', icon:'🍗'}
    ]
  }
];

const PORTIONS = ['Half','Full','Extra'];

function getMenuForDay(day) {
  if (day === 'Mon' || day === 'Thu') return menuA;
  if (day === 'Tue' || day === 'Fri') return menuB;
  if (day === 'Wed' || day === 'Sun') return menuC;
  if (day === 'Sat') return menuD;
  return menuA;
}

function selectDay(day, btnElem) {
  currentDay = day;
  
  if (btnElem) {
    document.querySelectorAll('.active-day').forEach(b => {
      b.classList.remove('active-day');
      b.style.border = 'none';
      b.style.color = '';
    });
    btnElem.classList.add('active-day');
    btnElem.style.border = '1px solid var(--teal)';
    btnElem.style.color = 'var(--teal)';
  }
  
  buildMealCards();
}

function initStudentPage() {
  buildMealCards();
  buildOrderHistory();
  setTimeout(()=>{ buildStudentCharts(); }, 200);
}

function buildMealCards() {
  const grid = document.getElementById('mealGrid');
  grid.innerHTML = '';
  const currentMenu = getMenuForDay(currentDay);
  
  currentMenu.forEach(meal => {
    // Initialize slot if not set
    if (currentUser.selections[currentDay][meal.key] === undefined) {
      currentUser.selections[currentDay][meal.key] = {option:0, portion:'Full'};
    }
    const sel = currentUser.selections[currentDay][meal.key];
    // Determine if this slot is currently skipped
    const isSkipped = sel === null;
    const card = document.createElement('div');
    card.className = 'meal-section';
    card.innerHTML = `
      <h3>${meal.emoji} ${meal.label}</h3>
      <div class="time"><i class="fa-regular fa-clock"></i> ${meal.time}</div>
      ${isSkipped
        ? `<div style="background:var(--rose-dim);border:1px solid rgba(244,63,94,0.3);border-radius:8px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:0.875rem;color:var(--rose);"><i class="fa-solid fa-ban"></i> This meal has been <strong>Skipped</strong>. <button class="btn btn-ghost" style="padding:0.25rem 0.75rem;font-size:0.75rem;margin-left:0.5rem;" onclick="unskipMeal('${meal.key}')">Undo</button></div>`
        : `<div class="meal-options" id="opts-${meal.key}">
          ${meal.options.map((o,i)=>`
            <div class="meal-option ${i===sel.option?'selected':''}" onclick="selectMeal('${meal.key}',${i})">
              <div class="meal-opt-left">
                <div class="dish-icon">${o.icon}</div>
                <div><div class="meal-opt-name">${o.name}</div><div class="meal-opt-desc">${o.desc}</div></div>
              </div>
              <div class="meal-radio ${i===sel.option?'selected':''}"></div>
            </div>`).join('')}
        </div>
        <div style="margin-bottom:0.5rem;font-size:0.8rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Portion</div>
        <div class="portion-row" id="port-${meal.key}">
          ${PORTIONS.map(p=>`<div class="portion-btn ${p===sel.portion?'selected':''}" onclick="selectPortion('${meal.key}','${p}')">${p}</div>`).join('')}
        </div>
        <div style="margin-top:1rem;">
          <button class="btn btn-ghost" style="font-size:0.78rem;color:var(--rose);border-color:rgba(244,63,94,0.3);" onclick="skipMealSlot('${meal.key}')">
            <i class="fa-solid fa-ban"></i> Skip ${meal.label}
          </button>
        </div>`}
    `;
    grid.appendChild(card);
  });

  // Skip Entire Day button (show once below all cards)
  if (!document.getElementById('skipEntireDayBtn')) {
    const skipDayBtn = document.createElement('div');
    skipDayBtn.id = 'skipEntireDayBtn';
    skipDayBtn.style.cssText = 'margin-top:1.5rem;';
    skipDayBtn.innerHTML = `<button class="btn btn-ghost btn-lg" style="color:var(--rose);border-color:rgba(244,63,94,0.3);" onclick="skipEntireDay()">
      <i class="fa-solid fa-calendar-xmark"></i> Skip Entire ${currentDay}
    </button>`;
    grid.parentElement.appendChild(skipDayBtn);
  } else {
    document.getElementById('skipEntireDayBtn').querySelector('button').innerHTML =
      `<i class="fa-solid fa-calendar-xmark"></i> Skip Entire ${currentDay}`;
  }
}

function selectMeal(key, idx) {
  if (currentUser.selections[currentDay][key] === null) return;
  currentUser.selections[currentDay][key].option = idx;
  buildMealCards();
}

function selectPortion(key, portion) {
  if (currentUser.selections[currentDay][key] === null) return;
  currentUser.selections[currentDay][key].portion = portion;
  buildMealCards();
}

// Task 5: Skip meal helpers
function skipMealSlot(key) {
  currentUser.selections[currentDay][key] = null;
  buildMealCards();
  showToast(`${key.charAt(0).toUpperCase()+key.slice(1)} skipped for ${currentDay}.`);
}

function unskipMeal(key) {
  currentUser.selections[currentDay][key] = {option:0, portion:'Full'};
  buildMealCards();
  showToast(`${key.charAt(0).toUpperCase()+key.slice(1)} re-added for ${currentDay}.`);
}

function skipEntireDay() {
  const menu = getMenuForDay(currentDay);
  menu.forEach(m => { currentUser.selections[currentDay][m.key] = null; });
  buildMealCards();
  showToast(`All meals for ${currentDay} have been skipped.`);
}

function confirmMeals() {
  const banner = document.getElementById('mealConfirmBanner');
  banner.style.display = 'flex';
  showToast('Meal selections confirmed! Kitchen notified.');
  
  const orders = currentUser.history;
  const today = new Date().toLocaleDateString('en-IN',{weekday:'short',month:'short', day:'numeric'});
  const currentMenu = getMenuForDay(currentDay);
  
  currentMenu.forEach(m => {
    const sel = currentUser.selections[currentDay][m.key];
    if (sel) {
      orders.unshift({
        meal: m.label,
        item: m.options[sel.option].name,
        portion: sel.portion,
        date: today + ' (' + currentDay + ')',
        completion: Math.floor(Math.random()*25+75) + '%'
      });
    }
  });
}

function buildOrderHistory() {
  const orders = currentUser.history || [];
  const list = document.getElementById('ordersList');
  if (orders.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem;">No past orders found.</p>';
    return;
  }
  list.innerHTML = orders.map(o=>`
    <div class="order-item">
      <div class="order-info">
        <h4>${o.meal} — ${o.item}</h4>
        <p>${o.date} &nbsp;·&nbsp; ${o.portion} Portion</p>
      </div>
      <div class="order-status">
        <div class="chip ${+o.completion.replace('%','')>=90?'chip-teal':+o.completion.replace('%','')>=75?'chip-amber':'chip-rose'}">${o.completion} eaten</div>
      </div>
    </div>`).join('');
}

function studentTab(name, key) {
  ['meals','stats','history'].forEach(n => {
    const btn = document.getElementById('snav-'+n);
    if(btn) btn.classList.toggle('active-snav', n===name);
  });
  document.querySelectorAll('#student .tab-content').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if (name==='stats') setTimeout(buildStudentCharts, 100);
  if (name==='history') buildOrderHistory();
}

let studentChartsBuilt = false;
let studentDonutChart = null;
let studentLineChart = null;

function buildStudentCharts() {
  if (studentChartsBuilt) return;
  studentChartsBuilt = true;
  
  const ctxDonut = document.getElementById('studentDonut').getContext('2d');
  studentDonutChart = new Chart(ctxDonut,{
    type:'doughnut',
    data:{
      labels:['Rice Wasted','Curry Wasted','Veg Wasted','Eaten'],
      datasets:[{data:currentUser.wasteStats,backgroundColor:['rgba(244,63,94,0.8)','rgba(245,158,11,0.8)','rgba(56,189,248,0.8)','rgba(45,212,191,0.8)'],borderWidth:0}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#647a99',font:{size:11}}}}}
  });
  
  const ctxLine = document.getElementById('studentLine').getContext('2d');
  studentLineChart = new Chart(ctxLine,{
    type:'line',
    data:{
      labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets:[{label:'Waste %',data:currentUser.wasteTrend,borderColor:'var(--teal)',backgroundColor:'rgba(45,212,191,0.1)',fill:true,tension:0.4,pointBackgroundColor:'var(--teal)'}]
    },
    options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,max:35,ticks:{color:'#647a99'},grid:{color:'rgba(255,255,255,0.05)'}},x:{ticks:{color:'#647a99'},grid:{display:false}}},plugins:{legend:{display:false}}}
  });
}

// ============ ADMIN PAGE ============
const WASTE_DATA = [
  {item:'Boiled Vegetables',cat:'Veg',waste:48,color:'#f43f5e'},
  {item:'White Rice',cat:'Grain',waste:20,color:'#f59e0b'},
  {item:'Sambar',cat:'Gravy',waste:18,color:'#38bdf8'},
  {item:'Roti / Chapati',cat:'Bread',waste:12,color:'#a78bfa'},
  {item:'Dal Fry',cat:'Protein',waste:10,color:'#2dd4bf'},
  {item:'Grilled Chicken',cat:'Protein',waste:6,color:'#10b981'},
  {item:'Paneer Curry',cat:'Protein',waste:8,color:'#fb923c'},
];

const MENU_CHANGES_BY_DAY = {
  Mon: [
    {meal:'Dinner',current:'Boiled Vegetables',replace:'Roasted Garlic Broccoli',waste:'48%',reason:'High dump rate',approved:false},
    {meal:'Lunch',current:'Plain Sambar',replace:'Tomato Rasam',waste:'32%',reason:'Low preference score',approved:false},
  ],
  Tue: [
    {meal:'Breakfast',current:'Plain Upma',replace:'Masala Upma',waste:'28%',reason:'Student survey feedback',approved:false},
  ],
  Wed: [
    {meal:'Dinner',current:'Aloo Gobi Dry',replace:'Stuffed Capsicum',waste:'35%',reason:'Consistently wasted',approved:false},
  ],
  Thu: [],
  Fri: [
    {meal:'Lunch',current:'Watery Dal',replace:'Dal Tadka',waste:'22%',reason:'Texture complaints',approved:false},
  ],
  Sat: [
    {meal:'Dinner',current:'Boiled Cabbage',replace:'Stir-fried Cabbage',waste:'45%',reason:'Students dislike boiled',approved:false},
  ],
  Sun: [],
};

const DAILY_PEAK_WASTE = [
  {day:'Monday',   item:'Aloo Gobi',     pct:32},
  {day:'Tuesday',  item:'Boiled Vegetables', pct:48},
  {day:'Wednesday',item:'White Rice',    pct:22},
  {day:'Thursday', item:'Sambar',        pct:18},
  {day:'Friday',   item:'Roti / Chapati',pct:14},
  {day:'Saturday', item:'Paneer Curry',  pct:10},
  {day:'Sunday',   item:'Dal Fry',       pct: 7},
];

let activeMenuDay = 'Mon';

const MENU_CHANGES = [
  {meal:'Dinner',current:'Boiled Vegetables',replace:'Roasted Garlic Broccoli',waste:'48%',reason:'High dump rate',approved:false},
  {meal:'Lunch',current:'Plain Sambar',replace:'Tomato Rasam',waste:'32%',reason:'Low preference score',approved:false},
  {meal:'Breakfast',current:'Plain Upma',replace:'Masala Upma',waste:'28%',reason:'Student survey feedback',approved:false},
];

const SURPLUS_ITEMS = [
  {item:'Rice',qty:'18 kg',status:'Dispatched',ngo:'Food for All NGO'},
  {item:'Dal',qty:'12 kg',status:'Pending Pickup',ngo:'City Food Bank'},
  {item:'Roti',qty:'80 pcs',status:'Alert Sent',ngo:'Hunger Free Initiative'},
  {item:'Sabzi',qty:'8 kg',status:'Composted',ngo:'—'},
];

let adminChartsBuilt = false;
let adminBarChartInst = null;
let liveDataInterval = null;

function initAdminPage() {
  buildWasteTable();
  buildMenuTable();
  buildDailyPeakWaste();
  setTimeout(() => {
    buildAdminCharts();
    startLiveWasteData();
  }, 200);
}

function adminNavClick(name) {
  ['overview','waste','menu','surplus','kitchen'].forEach(n => {
    const btn = document.getElementById('anav-'+n);
    if(btn) btn.classList.toggle('active-snav', n===name);
  });
  document.querySelectorAll('#admin .tab-content').forEach(t=>t.classList.remove('active'));
  document.getElementById('atab-'+name).classList.add('active');
  if (!adminChartsBuilt && (name==='overview'||name==='waste')) {
    setTimeout(buildAdminCharts, 100);
  }
  if (name==='kitchen') calculateKitchenPrep(adminKitchenDay);
}

function buildAdminCharts() {
  if (adminChartsBuilt) return;
  adminChartsBuilt = true;

  // Bar chart
  adminBarChartInst = new Chart(document.getElementById('adminBarChart').getContext('2d'),{
    type:'bar',
    data:{
      labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets:[
        {label:'Rice (kg)',data:[40,35,50,45,60,20,25],backgroundColor:'rgba(245,158,11,0.7)',borderRadius:4},
        {label:'Proteins (kg)',data:[15,10,25,20,15,30,10],backgroundColor:'rgba(244,63,94,0.7)',borderRadius:4},
        {label:'Veg (kg)',data:[50,45,60,55,40,35,30],backgroundColor:'rgba(45,212,191,0.7)',borderRadius:4}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,stacked:true,grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#647a99'}},x:{stacked:true,grid:{display:false},ticks:{color:'#647a99'}}},plugins:{legend:{labels:{color:'#647a99',font:{size:11}}}}}
  });

  // Demand donut
  new Chart(document.getElementById('demandDonut').getContext('2d'),{
    type:'doughnut',
    data:{
      labels:['Confirmed RSVP','Walkins (est.)','No-show (est.)'],
      datasets:[{data:[845,95,60],backgroundColor:['rgba(45,212,191,0.85)','rgba(56,189,248,0.7)','rgba(100,122,153,0.4)'],borderWidth:0}]
    },
    options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#647a99',font:{size:11}}}}}
  });

  // Waste horizontal bar
  new Chart(document.getElementById('wasteHBar').getContext('2d'),{
    type:'bar',
    data:{
      labels:WASTE_DATA.map(d=>d.item),
      datasets:[{label:'Waste %',data:WASTE_DATA.map(d=>d.waste),backgroundColor:WASTE_DATA.map(d=>d.color+'cc'),borderRadius:4}]
    },
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{x:{beginAtZero:true,max:60,ticks:{color:'#647a99'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#94a3b8',font:{size:11}},grid:{display:false}}},plugins:{legend:{display:false}}}
  });

  // Waste trend
  new Chart(document.getElementById('wasteTrend').getContext('2d'),{
    type:'line',
    data:{
      labels:['Wk 1','Wk 2','Wk 3','Wk 4','Wk 5','Wk 6'],
      datasets:[
        {label:'Total Waste (kg)',data:[420,390,350,310,280,260],borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.1)',fill:true,tension:0.4},
        {label:'Surplus Routed (kg)',data:[80,95,110,120,130,140],borderColor:'#2dd4bf',backgroundColor:'rgba(45,212,191,0.1)',fill:true,tension:0.4}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#647a99'}},x:{grid:{display:false},ticks:{color:'#647a99'}}},plugins:{legend:{labels:{color:'#647a99',font:{size:11}}}}}
  });

  // ngoChart removed — Surplus tab redesigned with static NGO cards (Task 4)
  const ngoEl = document.getElementById('ngoChart');
  if (ngoEl) {
    new Chart(ngoEl.getContext('2d'),{
      type:'bar',
      data:{
        labels:['Wk 1','Wk 2','Wk 3','Wk 4'],
        datasets:[{label:'Surplus Routed (kg)',data:[80,110,125,140],backgroundColor:'rgba(45,212,191,0.7)',borderRadius:6}]
      },
      options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#647a99'}},x:{grid:{display:false},ticks:{color:'#647a99'}}},plugins:{legend:{display:false}}}
    });
  }
}

function buildWasteTable() {
  document.getElementById('wasteTableBody').innerHTML = WASTE_DATA.map(d=>`
    <tr>
      <td><strong>${d.item}</strong></td>
      <td><span class="chip chip-sky" style="font-size:0.75rem">${d.cat}</span></td>
      <td style="color:${d.waste>=30?'var(--rose)':d.waste>=15?'var(--amber)':'var(--teal)'};font-weight:700">${d.waste}%</td>
      <td style="width:160px">
        <div class="progress-bar"><div class="progress-fill" style="width:${d.waste*2}%;background:${d.color}"></div></div>
      </td>
      <td>${d.waste>=30?'<span class="chip chip-rose" style="font-size:0.75rem">⚠ Flag for replacement</span>':d.waste>=15?'<span class="chip chip-amber" style="font-size:0.75rem">Monitor</span>':'<span class="chip chip-teal" style="font-size:0.75rem">✓ Good</span>'}</td>
    </tr>`).join('');
}

// Task 1: Day-specific menu revision
function selectMenuDay(day, btnElem) {
  activeMenuDay = day;
  document.querySelectorAll('.menu-day-btn').forEach(b => {
    b.classList.remove('active-menu-day');
    b.style.border = 'none';
    b.style.color = '';
  });
  if (btnElem) {
    btnElem.classList.add('active-menu-day');
    btnElem.style.border = '1px solid var(--amber)';
    btnElem.style.color = 'var(--amber)';
  }
  const dayNames = {Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'};
  const lbl = document.getElementById('menuDayLabel');
  if (lbl) lbl.textContent = dayNames[day] || day;
  buildMenuTable();
}

function buildMenuTable() {
  const changes = (MENU_CHANGES_BY_DAY[activeMenuDay] || []);
  const tbody = document.getElementById('menuTableBody');
  if (changes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:1.5rem;">No menu changes proposed for ${activeMenuDay}.</td></tr>`;
    return;
  }
  tbody.innerHTML = changes.map((c,i) => `
    <tr>
      <td><span class="chip chip-sky" style="font-size:0.75rem">${c.meal}</span></td>
      <td class="crossed">${c.current}</td>
      <td style="color:var(--teal);font-weight:600">${c.replace}</td>
      <td style="color:var(--rose);font-weight:700">${c.waste}</td>
      <td style="color:var(--muted);font-size:0.82rem">${c.reason}</td>
      <td><button class="btn btn-teal" style="padding:0.4rem 1rem;font-size:0.8rem;" onclick="approveMenuRow(${i})" id="menu-btn-${i}">${c.approved?'✓ Approved':'Approve'}</button></td>
    </tr>`).join('');
}

function approveMenuRow(i) {
  const changes = MENU_CHANGES_BY_DAY[activeMenuDay] || [];
  if (changes[i]) {
    changes[i].approved = true;
    buildMenuTable();
    showToast(`Approved: "${changes[i].replace}" replaces "${changes[i].current}" on ${activeMenuDay}`);
  }
}

function approveMenu() {
  (MENU_CHANGES_BY_DAY[activeMenuDay] || []).forEach(c => c.approved = true);
  buildMenuTable();
  showToast(`All menu revisions approved for ${activeMenuDay}!`);
}

function approveAllMenu() { approveMenu(); }
function approveAllMenuForDay() { approveMenu(); }

// Task 3: Highest Wasted Item by Day
function buildDailyPeakWaste() {
  const container = document.getElementById('dailyPeakWaste');
  if (!container) return;
  container.innerHTML = DAILY_PEAK_WASTE.map(d => {
    const color = d.pct >= 35 ? 'var(--rose)' : d.pct >= 20 ? 'var(--amber)' : 'var(--teal)';
    const emoji = d.pct >= 35 ? '🔴' : d.pct >= 20 ? '🟡' : '🟢';
    return `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:1rem;">
        <div style="font-size:0.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.35rem;">${d.day}</div>
        <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.2rem;">${d.item}</div>
        <div style="font-size:1.4rem;font-weight:800;font-family:var(--font-head);color:${color};">${d.pct}% ${emoji}</div>
      </div>
    `;
  }).join('');
}

function buildSurplusList() {
  document.getElementById('surplusList').innerHTML = SURPLUS_ITEMS.map((s,i)=>`
    <div class="surplus-item">
      <div class="surplus-info">
        <h4>${s.item} — ${s.qty}</h4>
        <p>Routed to: ${s.ngo}</p>
      </div>
      <div class="surplus-actions">
        <span class="chip ${s.status==='Dispatched'?'chip-teal':s.status==='Pending Pickup'?'chip-amber':s.status==='Alert Sent'?'chip-sky':'chip-rose'}">${s.status}</span>
        ${s.status==='Pending Pickup'||s.status==='Alert Sent'?`<button class="btn btn-teal" style="padding:0.4rem 0.9rem;font-size:0.8rem;" onclick="markDispatched(${i})">Mark Dispatched</button>`:''}
      </div>
    </div>`).join('');
}

function markDispatched(i) {
  SURPLUS_ITEMS[i].status = 'Dispatched';
  buildSurplusList();
  showToast(`${SURPLUS_ITEMS[i].item} marked as dispatched to ${SURPLUS_ITEMS[i].ngo}`);
}

function selectAdminKitchenDay(day, btnElem) {
  adminKitchenDay = day;
  // Update active button styling
  document.querySelectorAll('.kitchen-day-btn').forEach(b => {
    b.classList.remove('active-day');
    b.style.border = 'none';
    b.style.color = '';
  });
  if (btnElem) {
    btnElem.classList.add('active-day');
    btnElem.style.border = '1px solid var(--amber)';
    btnElem.style.color = 'var(--amber)';
  }
  const lbl = document.getElementById('kitchenDayLabel');
  if (lbl) lbl.textContent = day;
  calculateKitchenPrep(adminKitchenDay);
}

function calculateKitchenPrep(selectedDay) {
  const currentMenu = getMenuForDay(selectedDay);
  let liveOrdersHTML = '';
  const itemCounts = {};

  Object.values(MOCK_DB).forEach(student => {
    let studentOrdersHTML = '';
    const daySelections = student.selections && student.selections[selectedDay];

    currentMenu.forEach(m => {
      const sel = daySelections && daySelections[m.key];
      if (sel) {
        const itemName = m.options[sel.option].name;
        const portion = sel.portion;

        studentOrdersHTML += `<div style="margin-bottom:0.25rem;"><span class="chip chip-sky" style="font-size:0.65rem;padding:0.15rem 0.4rem;margin-right:0.4rem;">${m.label}</span> <strong>${itemName}</strong> (${portion})</div>`;

        const countKey = `${itemName} (${portion})`;
        itemCounts[countKey] = (itemCounts[countKey] || 0) + 1;
      }
    });

    if (!studentOrdersHTML) studentOrdersHTML = '<span style="color:var(--muted)">No meals selected.</span>';

    liveOrdersHTML += `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div class="avatar" style="width:30px;height:30px;font-size:0.8rem;">${student.name[0]}</div>
            <div>
              <div style="font-weight:600;font-size:0.9rem;">${student.name}</div>
              <div style="font-size:0.75rem;color:var(--muted);">${student.id}</div>
            </div>
          </div>
        </td>
        <td style="color:var(--muted);font-size:0.85rem;">${selectedDay}</td>
        <td style="font-size:0.85rem;">
          <div style="display:flex;flex-direction:column;gap:0.1rem;">
            ${studentOrdersHTML}
          </div>
        </td>
      </tr>
    `;
  });

  document.getElementById('kitchenLiveOrders').innerHTML = liveOrdersHTML;

  const aggContainer = document.getElementById('kitchenAggregatedSummary');
  if (Object.keys(itemCounts).length === 0) {
    aggContainer.innerHTML = '<div style="grid-column:span 3;color:var(--muted);text-align:center;padding:2rem;">No meals selected for this day.</div>';
    return;
  }

  aggContainer.innerHTML = Object.keys(itemCounts).map(key => `
    <div class="kpi" style="display:flex;flex-direction:column;justify-content:center;text-align:center;border-color:rgba(245,158,11,0.25);">
      <div class="val" style="color:var(--amber);margin-bottom:0.2rem;">${itemCounts[key]}x</div>
      <div class="lbl" style="font-size:0.85rem;color:var(--text);">${key}</div>
    </div>
  `).join('');
}

// ============ TOAST ============
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 3500);
}

// ============ LIVE DATA FETCHING ============
function startLiveWasteData() {
  if (liveDataInterval) clearInterval(liveDataInterval);
  fetchWasteData();
  liveDataInterval = setInterval(fetchWasteData, 2000);
}

async function fetchWasteData() {
  try {
    const res = await fetch('http://localhost:5000/api/waste_data');
    if (!res.ok) return;
    const data = await res.json();
    
    const riceNode = document.getElementById('live-rice-waste');
    if (riceNode) riceNode.innerHTML = `${data.rice_waste_pct}<span style="font-size:1.2rem">%</span>`;
    
    const dalNode = document.getElementById('live-dal-waste');
    if (dalNode) dalNode.innerHTML = `${data.dal_waste_pct}<span style="font-size:1.2rem">%</span>`;
    
    const totalNode = document.getElementById('live-total-waste');
    if (totalNode) totalNode.innerHTML = `${data.total_waste_kg}<span style="font-size:1.2rem">kg</span>`;
    
    if (adminBarChartInst) {
      // Update the current day's (index 6 for Sunday) waste data for visual feedback
      const riceWasteKg = data.total_waste_kg * (data.rice_waste_pct / 100);
      const dalWasteKg = data.total_waste_kg * (data.dal_waste_pct / 100);
      const otherWasteKg = data.total_waste_kg - riceWasteKg - dalWasteKg;

      adminBarChartInst.data.datasets[0].data[6] = riceWasteKg;
      adminBarChartInst.data.datasets[1].data[6] = dalWasteKg;
      adminBarChartInst.data.datasets[2].data[6] = otherWasteKg;
      
      adminBarChartInst.update();
    }
  } catch (err) {
    console.warn('Live data fetch failed:', err);
  }
}

