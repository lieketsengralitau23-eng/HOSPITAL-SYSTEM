/* Bophelo Link - script.js
   One script file used by every page.
   PART 1: data, rules and helper functions (used by patient pages AND staff pages)
   PART 2: patient pages
   PART 3: staff pages
   Everything is saved in the browser with localStorage, so the patient pages and the staff pages
   share the same appointments. (This is a prototype - there is no real server or real SMS.) */

var TODAY = "2026-11-09";   // the "current day" for the demo (a Monday)
var DOCTORS = [
  { id: "pm", name: "Dr. Margrett Massa", initials: "PM", specialty: "Cardiology",      room: "Clinic Room 4, Maseru" },
  { id: "tl", name: "Dr. Agnes Ralitau",    initials: "TL", specialty: "Paediatrics",     room: "Clinic Room 2, Maseru" },
  { id: "lm", name: "Dr. Precious Mosola",    initials: "LM", specialty: "General Practice", room: "Clinic Room 1, Maseru" }
];
var TIMES = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var DOWFULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---------- dates ----------
function toDate(s) { return new Date(s + "T00:00:00"); }
function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
// the five weekdays (Mon-Fri) of the demo week; offset 1 = next week, -1 = last week
function weekDays(offset) {
  var out = [], start = toDate(TODAY);
  start.setDate(start.getDate() + 7 * (offset || 0));
  for (var i = 0; i < 5; i++) { var d = new Date(start); d.setDate(start.getDate() + i); out.push(iso(d)); }
  return out;
}
function dayShort(s) { var d = toDate(s); return DOW[d.getDay()] + " " + d.getDate(); }              // Mon 9
function dateShort(s) { var d = toDate(s); return DOW[d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()]; }   // Tue, 10 Nov
function dateLong(s) { var d = toDate(s); return DOW[d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
function dateFull(s) { var d = toDate(s); return DOWFULL[d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
function time12(t) { var h = Number(t.slice(0, 2)), m = t.slice(3); return (h > 12 ? h - 12 : h) + ":" + m + " " + (h >= 12 ? "PM" : "AM"); }
function daysFromToday(s) { return Math.round((toDate(s) - toDate(TODAY)) / 86400000); }

// ---------- saving and loading ----------
function get(key) { var t = localStorage.getItem("bl_" + key); return t === null ? null : JSON.parse(t); }
function put(key, value) { localStorage.setItem("bl_" + key, JSON.stringify(value)); }
function seed() {
  if (get("appts") === null) {
    put("appts", [
      { id: 1,  pid: "debug", patient: "Debug Tau",        doc: "pm", date: "2026-11-10", time: "10:30", status: "Confirmed",   reason: "Cardiology review" },
      { id: 2,  pid: "mk",    patient: "Katleho Lithakong",       doc: "pm", date: "2026-11-09", time: "09:00", status: "Confirmed",   reason: "Check-up" },
      { id: 3,  pid: "ls",    patient: "Leronti Sebata",    doc: "tl", date: "2026-11-10", time: "11:30", status: "Pending",     reason: "Follow-up" },
      { id: 4,  pid: "tr",    patient: "Miles Morale",    doc: "pm", date: "2026-11-10", time: "08:00", status: "Confirmed",   reason: "Consultation" },
      { id: 5,  pid: "nl",    patient: "Lebo Senka",  doc: "pm", date: "2026-11-11", time: "11:00", status: "Confirmed",   reason: "Consultation" },
      { id: 6,  pid: "debug", patient: "Debug Tau",        doc: "tl", date: "2026-11-13", time: "09:00", status: "Rescheduled", reason: "Paediatric check" },
      { id: 7,  pid: "debug", patient: "Debug Tau",        doc: "lm", date: "2026-11-03", time: "10:00", status: "Completed",   reason: "General check-up" },
      { id: 8,  pid: "pn",    patient: "Katleho Lithakong",     doc: "pm", date: "2026-11-12", time: "09:00", status: "Confirmed",   reason: "Check-up" },
      { id: 9,  pid: "lt",    patient: "Lineo Molauli",      doc: "pm", date: "2026-11-13", time: "10:00", status: "Confirmed",   reason: "Follow-up" },
      { id: 10, pid: "rm",    patient: "Nthakong Katli", doc: "pm", date: "2026-11-12", time: "12:00", status: "Pending",     reason: "Consultation" },
      { id: 11, pid: "tm",    patient: "Teboho Mofolo",    doc: "pm", date: "2026-11-11", time: "11:30", status: "Cancelled",   reason: "Consultation" },
      { id: 12, pid: "km",    patient: "Tanki Motsoari",  doc: "pm", date: "2026-11-09", time: "11:00", status: "Confirmed",   reason: "Check-up" }
    ]);
    put("nextId", 13);
  }
  if (get("notes") === null) {
    put("notes", [
      { pid: "debug", kind: "reminder", title: "Appointment reminder", msg: "Visit with Dr. Palesa Mokoena on Tue 10 Nov at 10:30 AM.", when: "2h ago", unread: true },
      { pid: "debug", kind: "change",   title: "Appointment time changed", msg: "Dr. Thabo Letsie moved your visit to Fri 13 Nov, 09:00 AM.", when: "1d ago", unread: true },
      { pid: "debug", kind: "ok",       title: "Booking confirmed", msg: "Your appointment with Dr. Palesa Mokoena is confirmed.", when: "3d ago", unread: false },
      { pid: "debug", kind: "settings", title: "Reminder settings saved", msg: "You will get SMS and app reminders 1 day before.", when: "1w ago", unread: false }
    ]);
  }
  if (get("users") === null) put("users", [{ id: "debug", name: "Debug Tau", phone: "+26650000000", password: "1234" }]);
}
seed();
function resetDemoData() { resetDemo(); toast("Demo data was reset."); }
function resetDemo() { ["appts", "notes", "users", "nextId", "session", "staff"].forEach(function (k) { localStorage.removeItem("bl_" + k); }); seed(); }

// ---------- rules ----------
function doctor(id) { for (var i = 0; i < DOCTORS.length; i++) { if (DOCTORS[i].id === id) { return DOCTORS[i]; } } }
// Is this doctor already booked at this date and time?  (ignoreId lets an appointment be moved without clashing with itself)
function isBooked(doc, date, time, ignoreId) {
  var list = get("appts");
  for (var i = 0; i < list.length; i++) {
    var a = list[i];
    if (a.doc === doc && a.date === date && a.time === time && a.status !== "Cancelled" && a.status !== "Completed" && a.id !== ignoreId) { return a; }
  }
  return null;
}
function freeTimes(doc, date, ignoreId) {
  var out = [];
  for (var i = 0; i < TIMES.length; i++) { if (!isBooked(doc, date, TIMES[i], ignoreId)) { out.push(TIMES[i]); } }
  return out;
}
function nextFree(doc) {                                   // first free slot from today onwards
  var days = weekDays(0);
  for (var d = 0; d < days.length; d++) {
    if (days[d] < TODAY) { continue; }
    var f = freeTimes(doc, days[d]);
    if (f.length) { return { date: days[d], time: f[0] }; }
  }
  return null;
}
function addNote(pid, kind, title, msg) {
  var notes = get("notes");
  notes.unshift({ pid: pid, kind: kind, title: title, msg: msg, when: "Just now", unread: true });
  put("notes", notes);
}
function newId() { var id = get("nextId"); put("nextId", id + 1); return id; }
function idFromName(name) { return name.toLowerCase().replace(/[^a-z0-9]/g, ""); }

// ---------- small UI helpers ----------
function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
var ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16 5a3.5 3.5 0 0 1 0 7M18 15c2.5.6 4 2.2 4 5"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  check: '<path d="M5 13l4 4L19 7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  pin: '<path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  doctor: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>',
  warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-5h6v5M9 8h.01M15 8h.01M9 12h.01M15 12h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'
};
function icon(name, size) { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"' + (size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '') + '>' + ICONS[name] + '</svg>'; }
// The Bophelo Link logo: a heartbeat line ("bophelo" means health / life in Sesotho)
function logoSvg() {
  return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 26h9l5-12 7 24 5-16 3 4h9"/></svg>';
}
// A pop-up dialog. opts: title, text, icon, tone ("ok" or ""), free (list of times), onFree(time), confirmText, onConfirm, cancelText, onCancel
function showModal(opts, host) {
  closeModal();
  var box = document.createElement("div"); box.className = "overlay"; box.id = "modalBox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  var h = '<div class="modal"><div class="mi ' + (opts.tone || "") + '">' + icon(opts.icon || "warn", 26) + '</div><h2 class="t">' + esc(opts.title) + '</h2><p>' + esc(opts.text) + '</p>';
  if (opts.free) {
    h += '<p><b>Next free slots</b></p><div class="free">';
    opts.free.forEach(function (t) { h += '<button data-t="' + t + '">' + time12(t) + '</button>'; });
    h += '</div>';
  }
  var staff = !!document.querySelector(".staffwrap");
  var bc = staff ? "sbtn" : "btn", bo = staff ? "sbtn outline" : "btn outline";
  h += '<button class="' + bc + '" id="mOk" style="width:100%;justify-content:center;margin-top:10px">' + esc(opts.confirmText || "OK") + '</button>';
  if (opts.cancelText) { h += '<button class="' + bo + '" id="mNo" style="width:100%;justify-content:center;margin-top:8px">' + esc(opts.cancelText) + '</button>'; }
  box.innerHTML = h + '</div>';
  (host || document.querySelector(".phone, .staffwrap") || document.body).appendChild(box);
  document.getElementById("mOk").onclick = function () { closeModal(); if (opts.onConfirm) { opts.onConfirm(); } };
  if (opts.cancelText) { document.getElementById("mNo").onclick = function () { closeModal(); if (opts.onCancel) { opts.onCancel(); } }; }
  if (opts.free) { var bs = box.querySelectorAll(".free button"); for (var i = 0; i < bs.length; i++) { bs[i].onclick = function () { var t = this.getAttribute("data-t"); closeModal(); if (opts.onFree) { opts.onFree(t); } }; } }
  document.getElementById("mOk").focus();
}
function closeModal() { var m = document.getElementById("modalBox"); if (m) { m.parentNode.removeChild(m); } }
function toast(msg, host) {
  var old = document.getElementById("toastBox"); if (old) { old.parentNode.removeChild(old); }
  var t = document.createElement("div"); t.className = "toast"; t.id = "toastBox"; t.setAttribute("role", "status"); t.textContent = msg;
  (host || document.querySelector(".phone, .staffwrap") || document.body).appendChild(t);
  setTimeout(function () { if (t.parentNode) { t.parentNode.removeChild(t); } }, 3200);
}

// ---------- helpers used on many pages ----------
function params() {                       // reads  page.html?doc=pm&edit=3  into {doc:"pm", edit:"3"}
  var out = {}, q = window.location.search.replace("?", "");
  if (!q) { return out; }
  var pairs = q.split("&");
  for (var i = 0; i < pairs.length; i++) { var kv = pairs[i].split("="); out[kv[0]] = decodeURIComponent(kv[1] || ""); }
  return out;
}
function byId(id) { return document.getElementById(id); }
function findAppt(id) { var list = get("appts"); for (var i = 0; i < list.length; i++) { if (list[i].id === Number(id)) { return list[i]; } } return null; }
function saveAppt(appt) { var list = get("appts"); for (var i = 0; i < list.length; i++) { if (list[i].id === appt.id) { list[i] = appt; } } put("appts", list); }
function isActive(a) { return a.status !== "Cancelled" && a.status !== "Completed"; }
function sortByTime(list) { return list.sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; }); }
function toastNextPage(msg) { sessionStorage.setItem("bl_toast", msg); }
function showPendingToast() { var m = sessionStorage.getItem("bl_toast"); if (m) { sessionStorage.removeItem("bl_toast"); toast(m); } }
function togglePassword(inputId, btn) {
  var box = byId(inputId);
  if (box.type === "password") { box.type = "text"; btn.textContent = "Hide"; btn.setAttribute("aria-label", "Hide password"); }
  else { box.type = "password"; btn.textContent = "Show"; btn.setAttribute("aria-label", "Show password"); }
}
function showError(text) { var e = byId("error"); e.textContent = text; }
function setLogo() { var l = document.querySelectorAll(".logo"); for (var i = 0; i < l.length; i++) { l[i].innerHTML = logoSvg(); } }

/* =====================================================================
   PART 2 - PATIENT PAGES
   ===================================================================== */

// ---------- who is logged in ----------
function currentUser() {
  var id = sessionStorage.getItem("bl_session") || localStorage.getItem("bl_session");
  if (!id) { return null; }
  var users = get("users");
  for (var i = 0; i < users.length; i++) { if (users[i].id === id) { return users[i]; } }
  return null;
}
function requireLogin() {
  var u = currentUser();
  if (!u) { window.location.href = "index.html"; }
  return u;
}
function logout() {
  sessionStorage.removeItem("bl_session"); localStorage.removeItem("bl_session");
  window.location.href = "index.html";
}

// ---------- login page ----------
function loadLogin() { setLogo(); if (currentUser()) { window.location.href = "home.html"; } showPendingToast(); }
function doLogin() {
  var who = byId("who").value.trim().toLowerCase();
  var pw = byId("password").value;
  var digits = who.replace(/[^0-9]/g, "");
  var users = get("users"), found = null;
  for (var i = 0; i < users.length; i++) {
    var u = users[i], phone = u.phone.replace(/[^0-9]/g, "");
    var sameId = (u.id === who);
    var samePhone = (digits.length >= 8 && phone.slice(-digits.length) === digits);
    if ((sameId || samePhone) && u.password === pw) { found = u; }
  }
  if (!found) { showError("We could not find that phone number or patient ID with that password. Please check and try again."); byId("who").focus(); return false; }
  if (byId("remember").checked) { localStorage.setItem("bl_session", found.id); } else { sessionStorage.setItem("bl_session", found.id); }
  window.location.href = "home.html";
  return false;
}

// ---------- create account page ----------
function passwordScore(pw) {
  var score = 0;
  if (pw.length >= 8) { score++; }
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) { score++; }
  if (pw.length >= 10 || /[^a-zA-Z0-9]/.test(pw)) { score++; }
  return score;
}
function showStrength() {
  var score = passwordScore(byId("password").value);
  var bars = byId("meter").getElementsByTagName("i");
  for (var i = 0; i < bars.length; i++) { bars[i].className = (i < score) ? "on" : ""; }
  var words = ["Too short", "Weak", "Good", "Strong"];
  byId("strengthText").textContent = byId("password").value ? "Password strength: " + words[score] : "Use at least 8 characters";
}
function doRegister() {
  var name = byId("fullname").value.trim(), phone = byId("phone").value.trim();
  var email = byId("email").value.trim(), pw = byId("password").value;
  var digits = phone.replace(/[^0-9]/g, "");
  if (name.length < 2) { showError("Please type your full name."); byId("fullname").focus(); return false; }
  if (digits.length < 8) { showError("Please type a phone number with at least 8 digits."); byId("phone").focus(); return false; }
  if (email && email.indexOf("@") < 1) { showError("That email address does not look right. You can also leave it empty."); byId("email").focus(); return false; }
  if (pw.length < 8) { showError("Your password needs at least 8 characters."); byId("password").focus(); return false; }
  if (!byId("terms").checked) { showError("Please tick the box to agree to the Terms and Privacy Policy."); byId("terms").focus(); return false; }
  var users = get("users");
  for (var i = 0; i < users.length; i++) {
    if (users[i].phone.replace(/[^0-9]/g, "").slice(-8) === digits.slice(-8)) { showError("An account with that phone number already exists. Try logging in."); return false; }
  }
  var id = idFromName(name);
  for (var j = 0; j < users.length; j++) { if (users[j].id === id) { id = id + digits.slice(-4); } }
  users.push({ id: id, name: name, phone: phone, email: email, password: pw });
  put("users", users);
  sessionStorage.setItem("bl_session", id);
  toastNextPage("Welcome, " + name + "! Your patient ID is " + id + ".");
  window.location.href = "home.html";
  return false;
}

// ---------- reset password page (3 steps on one page) ----------
var resetUserId = null;
var resendTimer = null;
function loadReset() { setLogo(); showStep(1); }
// counts down from 30 seconds, then lets the user ask for a new code
function startCountdown() {
  var left = 30, text = byId("resendText");
  if (resendTimer) { clearInterval(resendTimer); }
  function tick() {
    if (left > 0) { text.innerHTML = "Resend code in 00:" + (left < 10 ? "0" : "") + left; left--; }
    else { clearInterval(resendTimer); text.innerHTML = '<button type="button" class="linkbtn" onclick="resendCode()">Resend code</button>'; }
  }
  tick(); resendTimer = setInterval(tick, 1000);
}
function resendCode() { toast("A new code was sent. (Demo code: 123456)"); startCountdown(); }
function showStep(n) {
  for (var i = 1; i <= 3; i++) { byId("step" + i).className = (i === n) ? "" : "hidden"; }
  showError("");
  var first = byId("step" + n).querySelector("input"); if (first) { first.focus(); }
}
function sendCode() {
  var digits = byId("phone").value.replace(/[^0-9]/g, "");
  var users = get("users"); resetUserId = null;
  for (var i = 0; i < users.length; i++) { if (digits.length >= 8 && users[i].phone.replace(/[^0-9]/g, "").slice(-8) === digits.slice(-8)) { resetUserId = users[i].id; } }
  if (!resetUserId) { showError("We could not find an account with that phone number."); return false; }
  showStep(2); startCountdown();
  return false;
}
function codeTyped(box, index) {
  box.value = box.value.replace(/[^0-9]/g, "");
  box.className = box.value ? "filled" : "";
  var boxes = byId("codeBoxes").getElementsByTagName("input");
  if (box.value && index < boxes.length - 1) { boxes[index + 1].focus(); }
}
function codeKey(e, box, index) {
  if (e.key === "Backspace" && !box.value && index > 0) { byId("codeBoxes").getElementsByTagName("input")[index - 1].focus(); }
}
function verifyCode() {
  var boxes = byId("codeBoxes").getElementsByTagName("input"), code = "";
  for (var i = 0; i < boxes.length; i++) { code += boxes[i].value; }
  if (code !== "123456") { showError("That code is not right. Please try again. (Demo code: 123456)"); return false; }
  showStep(3);
  return false;
}
function saveNewPassword() {
  var pw = byId("newpass").value;
  if (pw.length < 8) { showError("Your new password needs at least 8 characters."); return false; }
  var users = get("users");
  for (var i = 0; i < users.length; i++) { if (users[i].id === resetUserId) { users[i].password = pw; } }
  put("users", users);
  toastNextPage("Password changed. Please log in with your new password.");
  window.location.href = "index.html";
  return false;
}

// ---------- shared pieces for patient pages ----------
function greeting() { var h = new Date().getHours(); return h < 12 ? "Good morning," : (h < 18 ? "Good afternoon," : "Good evening,"); }
function unreadCount(pid) { var n = 0, notes = get("notes"); for (var i = 0; i < notes.length; i++) { if (notes[i].pid === pid && notes[i].unread) { n++; } } return n; }
function showAlertCount(pid) {
  var n = unreadCount(pid), badge = byId("alertCount"), dot = byId("bellDot");
  if (badge) { badge.textContent = n; badge.className = n ? "count" : "hidden"; badge.setAttribute("aria-label", n + " unread alerts"); }
  if (dot) { dot.className = n ? "dot" : "hidden"; }
}
function myAppointments(pid) {
  var all = get("appts"), mine = [];
  for (var i = 0; i < all.length; i++) { if (all[i].pid === pid) { mine.push(all[i]); } }
  return sortByTime(mine);
}
function appointmentCard(a, showButtons) {
  var d = doctor(a.doc);
  var h = '<article class="card"><div class="head"><div class="avatar" aria-hidden="true">' + d.initials + '</div><div class="grow"><h2 class="t">' + esc(d.name) + '</h2><span class="muted">' + esc(d.specialty) + '</span></div><span class="badge ' + a.status + '">' + a.status + '</span></div>';
  h += '<div class="meta"><span>' + icon("calendar", 16) + dateLong(a.date) + '</span><span>' + icon("clock", 16) + time12(a.time) + '</span></div>';
  if (showButtons) {
    h += '<div class="row split"><a class="btn outline small" style="margin:0" href="book.html?edit=' + a.id + '" aria-label="Reschedule appointment with ' + esc(d.name) + '">Reschedule</a>' +
         '<button class="btn danger small" style="margin:0" onclick="askCancel(' + a.id + ')" aria-label="Cancel appointment with ' + esc(d.name) + '">Cancel</button></div>';
  }
  return h + '</article>';
}
function askCancel(id) {
  var a = findAppt(id), d = doctor(a.doc);
  showModal({
    title: "Cancel this appointment?", text: "Your visit with " + d.name + " on " + dateLong(a.date) + " at " + time12(a.time) + " will be cancelled.",
    icon: "warn", confirmText: "Yes, cancel it", cancelText: "No, keep it",
    onConfirm: function () {
      a.status = "Cancelled"; saveAppt(a);
      addNote(a.pid, "change", "Appointment cancelled", "Your visit with " + d.name + " on " + dateLong(a.date) + " was cancelled.");
      toast("Appointment cancelled.");
      if (byId("apptList")) { loadAppointments(); } else { loadHome(); }
    }
  });
}

// ---------- home page ----------
function loadHome() {
  var user = requireLogin(); if (!user) { return; }
  setLogo();
  byId("hello").textContent = greeting(); byId("userName").textContent = user.name;
  showAlertCount(user.id);
  var next = null, mine = myAppointments(user.id);
  for (var i = 0; i < mine.length; i++) { if (isActive(mine[i]) && mine[i].date >= TODAY) { next = mine[i]; break; } }
  if (next) {
    byId("upcoming").innerHTML = appointmentCard(next, true);
    var d = daysFromToday(next.date), when = d === 0 ? "today" : (d === 1 ? "tomorrow" : "in " + d + " days");
    var r = next.remind;
    byId("reminderCard").innerHTML = '<span class="ic">' + icon("bell", 20) + '</span><div><b>Reminder set</b><br><span class="muted">Visit ' + when + '. ' +
      (r ? "We will remind you " + r.when + " by " + channelText(r) + "." : "We will remind you the day before by SMS.") + '</span></div>';
    byId("reminderCard").className = "card help";
  } else {
    byId("upcoming").innerHTML = '<div class="card empty">You have no upcoming appointments.<br>Tap <b>Book an appointment</b> to make one.</div>';
    byId("reminderCard").className = "hidden";
  }
  showPendingToast();
}
function channelText(r) {
  var c = []; if (r.sms) { c.push("SMS"); } if (r.app) { c.push("app notification"); } if (r.email) { c.push("email"); }
  return c.length ? c.join(" and ") : "no channel";
}
function homeSearch() { var q = byId("homeSearch").value.trim(); window.location.href = "doctors.html" + (q ? "?q=" + encodeURIComponent(q) : ""); return false; }

// ---------- find a doctor page ----------
var chosenSpecialty = "All", sortMode = "soonest";
function loadDoctors() {
  var user = requireLogin(); if (!user) { return; }
  showAlertCount(user.id);
  var q = params().q; if (q) { byId("search").value = q; }
  showDoctors();
}
function chooseSpecialty(spec, btn) {
  chosenSpecialty = spec;
  var chips = document.querySelectorAll(".chip");
  for (var i = 0; i < chips.length; i++) { chips[i].className = "chip"; chips[i].setAttribute("aria-pressed", "false"); }
  btn.className = "chip on"; btn.setAttribute("aria-pressed", "true");
  showDoctors();
}
function changeSort() { sortMode = byId("sort").value; showDoctors(); }
function showDoctors() {
  var text = byId("search").value.trim().toLowerCase(), found = [];
  for (var i = 0; i < DOCTORS.length; i++) {
    var d = DOCTORS[i];
    var textOk = !text || d.name.toLowerCase().indexOf(text) >= 0 || d.specialty.toLowerCase().indexOf(text) >= 0;
    var specOk = chosenSpecialty === "All" || d.specialty === chosenSpecialty;
    if (textOk && specOk) { found.push(d); }
  }
  found.sort(function (a, b) {
    if (sortMode === "name") { return a.name < b.name ? -1 : 1; }
    var fa = nextFree(a.id), fb = nextFree(b.id);
    return ((fa ? fa.date + fa.time : "9")) < ((fb ? fb.date + fb.time : "9")) ? -1 : 1;
  });
  byId("count").textContent = found.length + (found.length === 1 ? " doctor available" : " doctors available");
  var h = "";
  for (var j = 0; j < found.length; j++) {
    var doc = found[j], nf = nextFree(doc.id);
    h += '<article class="card"><div class="head"><div class="avatar" aria-hidden="true">' + doc.initials + '</div><div class="grow"><h2 class="t">' + esc(doc.name) + '</h2><span class="muted">' + esc(doc.specialty) + '</span><br><span class="muted">' + esc(doc.room) + '</span></div></div>' +
         '<div class="row" style="justify-content:space-between;margin-top:10px"><div><small class="muted">Next available</small><br><b>' + (nf ? dateShort(nf.date) + ", " + time12(nf.time) : "No free slots this week") + '</b></div>' +
         (nf ? '<a class="btn small" href="book.html?doc=' + doc.id + '" aria-label="Book an appointment with ' + esc(doc.name) + '">Book</a>' : '') + '</div></article>';
  }
  if (!found.length) { h = '<div class="card empty">No doctors match that search.<br>Try a different name or choose <b>All</b>.</div>'; }
  byId("doctorList").innerHTML = h;
}

// ---------- book appointment page (step 2 of 3) ----------
var bookDoc = null, bookDate = null, bookTime = null, bookEditId = null;
function loadBook() {
  var user = requireLogin(); if (!user) { return; }
  var p = params();
  if (p.edit) {
    var a = findAppt(p.edit);
    if (!a || a.pid !== user.id) { window.location.href = "appointments.html"; return; }
    bookEditId = a.id; bookDoc = a.doc; bookDate = a.date; bookTime = a.time;
    byId("pageTitle").textContent = "Reschedule appointment";
  } else if (p.doc && doctor(p.doc)) {
    bookDoc = p.doc; var nf = nextFree(bookDoc); bookDate = nf ? nf.date : weekDays(0)[0]; bookTime = null;
  } else { window.location.href = "doctors.html"; return; }
  var d = doctor(bookDoc);
  byId("docCard").innerHTML = '<div class="head"><div class="avatar" aria-hidden="true">' + d.initials + '</div><div class="grow"><h2 class="t">' + esc(d.name) + '</h2><span class="muted">' + esc(d.specialty) + '</span><br><span class="muted">' + icon("pin", 14) + ' ' + esc(d.room) + '</span></div></div>';
  byId("month").textContent = MON[toDate(bookDate).getMonth()] + " " + toDate(bookDate).getFullYear();
  drawDates(); drawTimes();
}
function drawDates() {
  var days = weekDays(0), h = "";
  for (var i = 0; i < days.length; i++) {
    var on = days[i] === bookDate, parts = dayShort(days[i]).split(" ");
    h += '<button type="button" class="' + (on ? "on" : "") + '" aria-pressed="' + on + '" onclick="chooseDate(\'' + days[i] + '\')" aria-label="' + dateFull(days[i]) + '">' + parts[0].toUpperCase() + '<br>' + parts[1] + '</button>';
  }
  byId("dates").innerHTML = h;
}
function drawTimes() {
  var h = "";
  for (var i = 0; i < TIMES.length; i++) {
    var t = TIMES[i], taken = isBooked(bookDoc, bookDate, t, bookEditId), on = (t === bookTime);
    if (taken) { h += '<button type="button" disabled aria-label="' + t + ', already booked">' + t + '</button>'; }
    else { h += '<button type="button" class="' + (on ? "on" : "") + '" aria-pressed="' + on + '" onclick="chooseTime(\'' + t + '\')" aria-label="' + t + ', available">' + t + '</button>'; }
  }
  byId("times").innerHTML = h;
  updateBottomBar();
}
function chooseDate(d) { bookDate = d; if (bookTime && isBooked(bookDoc, bookDate, bookTime, bookEditId)) { bookTime = null; } drawDates(); drawTimes(); }
function chooseTime(t) { bookTime = t; drawTimes(); }
function updateBottomBar() {
  byId("choice").textContent = bookTime ? dateLong(bookDate) + " - " + time12(bookTime) : "Choose a time to continue";
  byId("continueBtn").disabled = !bookTime;
}
function continueBooking() {
  if (!bookTime) { return; }
  sessionStorage.setItem("bl_draft", JSON.stringify({ doc: bookDoc, date: bookDate, time: bookTime, editId: bookEditId }));
  window.location.href = "confirm.html";
}

// ---------- confirm booking page (step 3 of 3) ----------
var draft = null;
function loadConfirm() {
  var user = requireLogin(); if (!user) { return; }
  var t = sessionStorage.getItem("bl_draft");
  if (!t) { window.location.href = "doctors.html"; return; }
  draft = JSON.parse(t);
  var d = doctor(draft.doc);
  byId("summary").innerHTML =
    '<div class="head"><div class="avatar" aria-hidden="true">' + d.initials + '</div><div class="grow"><h2 class="t">' + esc(d.name) + '</h2><span class="muted">' + esc(d.specialty) + '</span></div></div>' +
    '<div style="margin-top:8px"><div class="sumrow"><span>Date</span><b>' + dateFull(draft.date) + '</b></div><div class="sumrow"><span>Time</span><b>' + time12(draft.time) + '</b></div><div class="sumrow"><span>Place</span><b>' + esc(d.room) + '</b></div></div>';
  if (draft.editId) { byId("pageTitle").textContent = "Confirm new time"; byId("confirmBtn").textContent = "Confirm new time"; }
}
function confirmBooking() {
  var user = currentUser(), d = doctor(draft.doc);
  var clash = isBooked(draft.doc, draft.date, draft.time, draft.editId);
  if (clash) {
    showModal({ title: "That time was just taken", text: "Another patient booked " + dateLong(draft.date) + " at " + time12(draft.time) + " a moment ago. Please choose another time.", free: freeTimes(draft.doc, draft.date, draft.editId).slice(0, 3),
      confirmText: "Choose another time", onConfirm: function () { window.location.href = "book.html?" + (draft.editId ? "edit=" + draft.editId : "doc=" + draft.doc); }, onFree: function (t) { draft.time = t; sessionStorage.setItem("bl_draft", JSON.stringify(draft)); loadConfirm(); } });
    return;
  }
  var remind = { sms: byId("remSms").checked, app: byId("remApp").checked, email: byId("remEmail").checked, when: byId("remWhen").value };
  if (draft.editId) {
    var a = findAppt(draft.editId); a.date = draft.date; a.time = draft.time; a.status = "Rescheduled"; a.remind = remind; saveAppt(a);
    addNote(user.id, "change", "Appointment time changed", "Your visit with " + d.name + " is now on " + dateLong(a.date) + " at " + time12(a.time) + ".");
    toastNextPage("Appointment rescheduled.");
  } else {
    var list = get("appts");
    list.push({ id: newId(), pid: user.id, patient: user.name, doc: draft.doc, date: draft.date, time: draft.time, status: "Confirmed", reason: "Appointment", remind: remind });
    put("appts", list);
    addNote(user.id, "ok", "Booking confirmed", "Your appointment with " + d.name + " on " + dateLong(draft.date) + " at " + time12(draft.time) + " is confirmed.");
    toastNextPage("Appointment booked.");
  }
  if (remind.sms || remind.app || remind.email) { addNote(user.id, "settings", "Reminder settings saved", "You will get " + channelText(remind) + " reminders " + remind.when + "."); }
  sessionStorage.removeItem("bl_draft");
  window.location.href = "appointments.html";
}

// ---------- my appointments page ----------
var apptTab = "upcoming";
function loadAppointments() {
  var user = requireLogin(); if (!user) { return; }
  showAlertCount(user.id);
  var mine = myAppointments(user.id), up = [], past = [];
  for (var i = 0; i < mine.length; i++) { if (isActive(mine[i]) && mine[i].date >= TODAY) { up.push(mine[i]); } else { past.push(mine[i]); } }
  byId("tabUp").textContent = "Upcoming (" + up.length + ")"; byId("tabPast").textContent = "Past (" + past.length + ")";
  byId("tabUp").className = apptTab === "upcoming" ? "on" : ""; byId("tabPast").className = apptTab === "past" ? "on" : "";
  byId("tabUp").setAttribute("aria-pressed", apptTab === "upcoming"); byId("tabPast").setAttribute("aria-pressed", apptTab === "past");
  var list = apptTab === "upcoming" ? up : past.reverse(), h = "";
  for (var j = 0; j < list.length; j++) { h += appointmentCard(list[j], apptTab === "upcoming"); }
  if (!list.length) { h = '<div class="card empty">' + (apptTab === "upcoming" ? "You have no upcoming appointments." : "No past appointments yet.") + '</div>'; }
  byId("apptList").innerHTML = h;
  showPendingToast();
}
function chooseTab(t) { apptTab = t; loadAppointments(); }

// ---------- notifications page ----------
function loadNotifications() {
  var user = requireLogin(); if (!user) { return; }
  var notes = get("notes"), h = "", icons = { reminder: "bell", change: "calendar", ok: "check", settings: "bell" };
  for (var i = 0; i < notes.length; i++) {
    var n = notes[i]; if (n.pid !== user.id) { continue; }
    var tone = n.kind === "ok" ? "ok" : (n.kind === "change" ? "change" : "");
    h += '<article class="note' + (n.unread ? "" : " read") + '"><span class="ic ' + tone + '">' + icon(icons[n.kind] || "bell", 20) + '</span><div><h2 class="t">' + esc(n.title) + (n.unread ? ' <span class="sr">(new)</span>' : '') + '</h2><p>' + esc(n.msg) + '</p><small>' + esc(n.when) + '</small></div>' + (n.unread ? '<span class="unread" aria-hidden="true"></span>' : '') + '</article>';
  }
  byId("noteList").innerHTML = h || '<div class="card empty">You have no notifications yet.</div>';
  showAlertCount(user.id);
}
function markAllRead() {
  var user = currentUser(), notes = get("notes");
  for (var i = 0; i < notes.length; i++) { if (notes[i].pid === user.id) { notes[i].unread = false; } }
  put("notes", notes); loadNotifications(); toast("All notifications marked as read.");
}

// ---------- need help booking page ----------
function loadHelp() { var u = currentUser(); byId("backLink").href = u ? "home.html" : "index.html"; }
function requestCallback() {
  var phone = byId("cbPhone").value.trim(), when = byId("cbTime").value;
  if (phone.replace(/[^0-9]/g, "").length < 8) { showError("Please type the phone number we should call (at least 8 digits)."); byId("cbPhone").focus(); return false; }
  var list = get("callbacks") || []; list.push({ phone: phone, when: when, made: new Date().toISOString() }); put("callbacks", list);
  showError(""); toast("Request sent. A staff member will call you " + when.toLowerCase() + ".");
  byId("cbPhone").value = "";
  return false;
}
function shareLink() {
  var link = window.location.href.replace("help.html", "index.html");
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(link).then(function () { toast("Booking link copied. Send it to someone you trust."); }, function () { window.prompt("Copy this link:", link); }); }
  else { window.prompt("Copy this link:", link); }
}

/* =====================================================================
   PART 3 - STAFF PAGES
   ===================================================================== */
function requireStaff() {
  if (!(sessionStorage.getItem("bl_staff") || localStorage.getItem("bl_staff"))) { window.location.href = "staff-login.html"; return false; }
  setLogo(); return true;
}
function loadStaffLogin() { setLogo(); if (sessionStorage.getItem("bl_staff") || localStorage.getItem("bl_staff")) { window.location.href = "staff-schedule.html"; } }
function staffLogin() {
  var id = byId("staffId").value.trim().toLowerCase(), pw = byId("password").value;
  if ((id === "staff" || id === "kn-0142") && pw === "1234") {
    if (byId("keep").checked) { localStorage.setItem("bl_staff", "KN"); } else { sessionStorage.setItem("bl_staff", "KN"); }
    window.location.href = "staff-schedule.html"; return false;
  }
  showError("We could not find that staff ID with that password. Please check and try again.");
  byId("staffId").focus();
  return false;
}
function staffLogout() { sessionStorage.removeItem("bl_staff"); localStorage.removeItem("bl_staff"); window.location.href = "staff-login.html"; }
function staffForgot() {
  showModal({ title: "Forgot your password?", text: "For your safety, staff passwords are reset by the hospital IT desk. Please contact them and they will help you.", icon: "help", tone: "ok", confirmText: "OK" });
}
function shortDoctor(id) { var n = doctor(id).name.split(" "); return n[0] + " " + n[1].charAt(0) + ". " + n[2]; }   // Dr. P. Mokoena
function patientName(pid) {
  var users = get("users"), appts = get("appts");
  for (var i = 0; i < users.length; i++) { if (users[i].id === pid) { return users[i].name; } }
  for (var j = 0; j < appts.length; j++) { if (appts[j].pid === pid) { return appts[j].patient; } }
  return pid;
}
function initials(name) { var p = name.split(" "); return (p[0].charAt(0) + (p[1] ? p[1].charAt(0) : "")).toUpperCase(); }
function doctorOptions(selected) {
  var h = ""; for (var i = 0; i < DOCTORS.length; i++) { h += '<option value="' + DOCTORS[i].id + '"' + (DOCTORS[i].id === selected ? " selected" : "") + '>' + esc(DOCTORS[i].name) + '</option>'; }
  return h;
}
function twoWeeks() { return weekDays(0).concat(weekDays(1)); }
function dateOptions(selected) {
  var days = twoWeeks(), h = ""; for (var i = 0; i < days.length; i++) { h += '<option value="' + days[i] + '"' + (days[i] === selected ? " selected" : "") + '>' + dateLong(days[i]) + '</option>'; }
  return h;
}
function timeOptions(doc, date, selected, ignoreId) {
  var h = ""; for (var i = 0; i < TIMES.length; i++) {
    var taken = isBooked(doc, date, TIMES[i], ignoreId);
    h += '<option value="' + TIMES[i] + '"' + (TIMES[i] === selected ? " selected" : "") + (taken ? " disabled" : "") + '>' + time12(TIMES[i]) + (taken ? " (booked)" : "") + '</option>';
  }
  return h;
}
// the "this slot is already booked" warning, shared by the reschedule panel and the new booking form
function warnDoubleBooking(doc, date, time, other, onPick, onChoose, onCancel) {
  var free = freeTimes(doc, date, other.id).slice(0, 3);
  showModal({
    title: "This time slot is already booked",
    text: "Another patient is assigned to " + dateShort(date) + " at " + time12(time) + " with " + shortDoctor(doc).replace("Dr. ", "Dr. ") + ".",
    free: free.length ? free : null, onFree: onPick,
    confirmText: "Choose another slot", onConfirm: onChoose,
    cancelText: "Cancel", onCancel: onCancel
  });
}

// ---------- weekly schedule page ----------
var weekOffset = 0, schedDoc = "pm";
function loadSchedule() {
  if (!requireStaff()) { return; }
  weekOffset = Number(sessionStorage.getItem("bl_week") || 0); schedDoc = sessionStorage.getItem("bl_sdoc") || "pm";
  byId("docSelect").innerHTML = doctorOptions(schedDoc);
  drawSchedule(); showPendingToast();
}
function changeDoctor() { schedDoc = byId("docSelect").value; sessionStorage.setItem("bl_sdoc", schedDoc); drawSchedule(); }
function changeWeek(step) { weekOffset += step; sessionStorage.setItem("bl_week", weekOffset); drawSchedule(); }
function drawSchedule() {
  var days = weekDays(weekOffset), all = get("appts"), booked = 0, cancelled = 0;
  byId("weekLabel").textContent = toDate(days[0]).getDate() + " - " + toDate(days[4]).getDate() + " " + MON[toDate(days[4]).getMonth()] + " " + toDate(days[4]).getFullYear();
  byId("subtitle").textContent = "Mon " + toDate(days[0]).getDate() + " - Fri " + toDate(days[4]).getDate() + " " + MON[toDate(days[4]).getMonth()] + " " + toDate(days[4]).getFullYear();
  for (var i = 0; i < all.length; i++) {
    var a = all[i]; if (a.doc !== schedDoc || days.indexOf(a.date) < 0) { continue; }
    if (a.status === "Cancelled") { cancelled++; } else if (a.status !== "Completed") { booked++; }
  }
  byId("statBooked").textContent = booked; byId("statFree").textContent = days.length * TIMES.length - booked; byId("statCancelled").textContent = cancelled;
  var h = '<thead><tr><td class="time"><span class="sr">Time</span></td>';
  for (var d = 0; d < days.length; d++) { h += '<th scope="col">' + dayShort(days[d]) + '</th>'; }
  h += '</tr></thead><tbody>';
  for (var t = 0; t < TIMES.length; t++) {
    h += '<tr><th scope="row" class="time">' + TIMES[t] + '</th>';
    for (var c = 0; c < days.length; c++) {
      var live = isBooked(schedDoc, days[c], TIMES[t]), cancel = null;
      if (!live) { for (var k = 0; k < all.length; k++) { if (all[k].doc === schedDoc && all[k].date === days[c] && all[k].time === TIMES[t] && all[k].status === "Cancelled") { cancel = all[k]; } } }
      var label = dateShort(days[c]) + " at " + TIMES[t];
      if (live) { h += '<td><button class="slot ' + live.status + '" onclick="window.location.href=\'staff-appointments.html?reschedule=' + live.id + '\'" aria-label="' + esc(live.patient) + ', ' + live.status + ', ' + label + '. Open to reschedule or cancel."><b>' + esc(live.patient) + '</b>' + live.status + '</button></td>'; }
      else if (cancel) { h += '<td><button class="slot Cancelled" onclick="newBookingAt(\'' + days[c] + '\',\'' + TIMES[t] + '\')" aria-label="Cancelled booking for ' + esc(cancel.patient) + ', ' + label + '. Slot is free. Open to book."><b>' + esc(cancel.patient) + '</b>Cancelled</button></td>'; }
      else { h += '<td><button class="slot free" onclick="newBookingAt(\'' + days[c] + '\',\'' + TIMES[t] + '\')" aria-label="Free slot, ' + label + '. Book it.">+ Book</button></td>'; }
    }
    h += '</tr>';
  }
  byId("grid").innerHTML = h + '</tbody>';
}
function newBookingAt(date, time) { window.location.href = "staff-booking.html?doc=" + schedDoc + "&date=" + date + "&time=" + time; }

// ---------- appointments page ----------
var staffFilter = "All", reschedId = null;
function loadStaffAppointments() {
  if (!requireStaff()) { return; }
  drawAppointments(); showPendingToast();
  var p = params(); if (p.reschedule) { openReschedule(Number(p.reschedule)); }
}
function setFilter(f, btn) {
  staffFilter = f; var chips = document.querySelectorAll(".chip");
  for (var i = 0; i < chips.length; i++) { chips[i].className = "chip"; chips[i].setAttribute("aria-pressed", "false"); }
  btn.className = "chip on"; btn.setAttribute("aria-pressed", "true"); drawAppointments();
}
function drawAppointments() {
  var all = sortByTime(get("appts")), text = byId("staffSearch").value.trim().toLowerCase(), rows = "", shown = 0;
  byId("chipAll").textContent = "All (" + all.length + ")";
  for (var i = 0; i < all.length; i++) {
    var a = all[i], d = doctor(a.doc);
    var inText = !text || a.patient.toLowerCase().indexOf(text) >= 0 || d.name.toLowerCase().indexOf(text) >= 0;
    var inFilter = staffFilter === "All" || (staffFilter === "Today" && a.date === TODAY && a.status !== "Cancelled") ||
      (staffFilter === "Upcoming" && isActive(a) && a.date >= TODAY) || (staffFilter === "Cancelled" && a.status === "Cancelled");
    if (!inText || !inFilter) { continue; }
    shown++;
    rows += '<tr' + (a.id === reschedId ? ' class="sel"' : '') + '><td data-label="Patient"><div class="who"><span class="avatar" aria-hidden="true">' + initials(a.patient) + '</span>' + esc(a.patient) + '</div></td><td data-label="Doctor">' + esc(shortDoctor(a.doc)) + '</td><td data-label="Date and time">' + dateShort(a.date) + ', ' + a.time + '</td><td data-label="Status"><span class="badge ' + a.status + '">' + a.status + '</span></td><td data-label="Actions">' +
      (isActive(a) ? '<button class="sbtn outline sm" onclick="openReschedule(' + a.id + ')" aria-label="Reschedule ' + esc(a.patient) + '">Reschedule</button> <button class="sbtn danger sm" onclick="staffCancel(' + a.id + ')" aria-label="Cancel ' + esc(a.patient) + '">Cancel</button>' : '<span class="muted">No actions</span>') + '</td></tr>';
  }
  if (!shown) { rows = '<tr><td colspan="5" class="empty">No appointments match. Try another filter or search.</td></tr>'; }
  byId("apptRows").innerHTML = rows;
}
function openReschedule(id) {
  var a = findAppt(id); if (!a) { return; }
  reschedId = id; byId("reschedPanel").className = "panel";
  byId("reschedName").textContent = a.patient;
  byId("newDate").innerHTML = dateOptions(a.date); byId("newTime").innerHTML = timeOptions(a.doc, a.date, a.time, a.id);
  byId("reason").value = ""; byId("notify").checked = true;
  drawAppointments();
  byId("reschedPanel").scrollIntoView({ behavior: "smooth", block: "center" });
  byId("newDate").focus();
}
function reschedDateChanged() { var a = findAppt(reschedId); byId("newTime").innerHTML = timeOptions(a.doc, byId("newDate").value, "", a.id); }
function discardReschedule() { reschedId = null; byId("reschedPanel").className = "hidden"; drawAppointments(); }
function saveReschedule() {
  var a = findAppt(reschedId), date = byId("newDate").value, time = byId("newTime").value;
  if (!time) { showError("Please choose a new time."); byId("newTime").focus(); return; }
  showError("");
  var other = isBooked(a.doc, date, time, a.id);
  if (other) {
    warnDoubleBooking(a.doc, date, time, a,
      function (t) { byId("newTime").innerHTML = timeOptions(a.doc, date, t, a.id); },
      function () { byId("newTime").focus(); }, function () { discardReschedule(); });
    return;
  }
  var why = byId("reason").value.trim();
  a.date = date; a.time = time; a.status = "Rescheduled"; if (why) { a.note = why; } saveAppt(a);
  if (byId("notify").checked) { addNote(a.pid, "change", "Appointment time changed", doctor(a.doc).name + " moved your visit to " + dateShort(a.date) + ", " + time12(a.time) + "." + (why ? " Reason: " + why + "." : "")); }
  toast(byId("notify").checked ? "Saved. " + a.patient + " was notified." : "Saved. The patient was not notified.");
  reschedId = null; byId("reschedPanel").className = "hidden"; drawAppointments();
}
function staffCancel(id) {
  var a = findAppt(id);
  showModal({ title: "Cancel this appointment?", text: a.patient + " with " + doctor(a.doc).name + " on " + dateShort(a.date) + " at " + time12(a.time) + ". The patient will be notified.", icon: "warn", confirmText: "Yes, cancel it", cancelText: "No, keep it",
    onConfirm: function () {
      a.status = "Cancelled"; saveAppt(a);
      addNote(a.pid, "change", "Appointment cancelled", "Your visit with " + doctor(a.doc).name + " on " + dateShort(a.date) + " at " + time12(a.time) + " was cancelled by the hospital.");
      toast("Appointment cancelled and patient notified."); if (reschedId === id) { discardReschedule(); } else { drawAppointments(); }
    } });
}

// ---------- new booking page ----------
function loadNewBooking() {
  if (!requireStaff()) { return; }
  var p = params(), users = get("users"), names = "";
  for (var i = 0; i < users.length; i++) { names += '<option value="' + esc(users[i].name) + '">'; }
  byId("patientNames").innerHTML = names;
  var doc = p.doc && doctor(p.doc) ? p.doc : "pm", date = twoWeeks().indexOf(p.date) >= 0 ? p.date : weekDays(0)[0];
  byId("bDoctor").innerHTML = doctorOptions(doc); byId("bDate").innerHTML = dateOptions(date);
  byId("bTime").innerHTML = '<option value="">Choose a time</option>' + timeOptions(doc, date, p.time || "");
}
function refreshTimes() { byId("bTime").innerHTML = '<option value="">Choose a time</option>' + timeOptions(byId("bDoctor").value, byId("bDate").value, ""); }
function bookForPatient() {
  var name = byId("bPatient").value.trim(), doc = byId("bDoctor").value, date = byId("bDate").value, time = byId("bTime").value, why = byId("bReason").value.trim();
  if (name.length < 2) { showError("Please type the patient's name."); byId("bPatient").focus(); return false; }
  if (!time) { showError("Please choose a time."); byId("bTime").focus(); return false; }
  showError("");
  var other = isBooked(doc, date, time);
  if (other) {
    warnDoubleBooking(doc, date, time, other,
      function (t) { byId("bTime").innerHTML = '<option value="">Choose a time</option>' + timeOptions(doc, date, t); },
      function () { byId("bTime").focus(); }, function () { window.location.href = "staff-schedule.html"; });
    return false;
  }
  var pid = idFromName(name), users = get("users");
  for (var i = 0; i < users.length; i++) { if (users[i].name.toLowerCase() === name.toLowerCase()) { pid = users[i].id; name = users[i].name; } }
  var list = get("appts");
  list.push({ id: newId(), pid: pid, patient: name, doc: doc, date: date, time: time, status: "Confirmed", reason: why || "Appointment" });
  put("appts", list);
  addNote(pid, "ok", "Booking confirmed", "The hospital booked you with " + doctor(doc).name + " on " + dateLong(date) + " at " + time12(time) + ".");
  toastNextPage("Booked " + name + " with " + doctor(doc).name + ". The patient was notified.");
  window.location.href = "staff-schedule.html";
  return false;
}

// ---------- patients and notifications pages ----------
function loadStaffPatients() {
  if (!requireStaff()) { return; }
  var all = sortByTime(get("appts")), seen = {}, order = [];
  for (var i = 0; i < all.length; i++) { var a = all[i]; if (!seen[a.pid]) { seen[a.pid] = { name: a.patient, total: 0, next: null }; order.push(a.pid); }
    seen[a.pid].total++; if (isActive(a) && a.date >= TODAY && !seen[a.pid].next) { seen[a.pid].next = a; } }
  var h = "";
  for (var j = 0; j < order.length; j++) {
    var p = seen[order[j]];
    h += '<tr><td data-label="Patient"><div class="who"><span class="avatar" aria-hidden="true">' + initials(p.name) + '</span>' + esc(p.name) + '</div></td><td data-label="Appointments">' + p.total + '</td><td data-label="Next appointment">' + (p.next ? dateShort(p.next.date) + ', ' + p.next.time + ' with ' + esc(shortDoctor(p.next.doc)) : '<span class="muted">None booked</span>') + '</td></tr>';
  }
  byId("patientRows").innerHTML = h;
}
function loadStaffNotes() {
  if (!requireStaff()) { return; }
  var notes = get("notes"), h = "";
  for (var i = 0; i < notes.length; i++) { var n = notes[i];
    h += '<tr><td data-label="Patient">' + esc(patientName(n.pid)) + '</td><td data-label="Message"><b>' + esc(n.title) + '</b><br><span class="muted">' + esc(n.msg) + '</span></td><td data-label="Sent">' + esc(n.when) + '</td></tr>'; }
  byId("noteRows").innerHTML = h || '<tr><td colspan="3" class="empty">No messages sent yet.</td></tr>';
}
