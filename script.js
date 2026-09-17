const students = [
	"IVAN RACHMAD ADITYA", "MUKHAMMAD AZRIL ANSORI", "MUKHAMMAD ROBITH SYAHRUL SYA'BANA", "NOVIA DWI ARIANI", "NUR HANIF ROBBYANZA", "NUR SYFAUL LATHIFAH", "NURUL LAILATUL AHAIDIAH", "NURUL QOIDATUR ROHMAH", "PUTRI FEBRIANTI", "QWYNZA DYANDRA PUTRI ALLANA", "RACHEL AMALIA PUTRI WIBOWO", "RAFA DWI PUTRA ANANTA", "RASYA PRATAMA PUTRA RACHMAN", "RAYENDRA FAREL MAHRUZ AL FAREZA", "REIHANA TSABITA QOLBY", "RENYTA MEI PUSPITA PUTRI", "RIDHO ARDIANSYAH PRATAMA", "RIDLO MAULANA WAHYUDI", "RIZKY ADI DERMAWAN", "RIZKY ALIF MAULANA", "SABRINA DELAROSA", "SAFIN AGIM NASTIAR", "SAMIR NASRI", "SEFRIL FITRIA RAMADANI", "SHEVAZELDA ERLANGGA", "SIFA ROMADHONIA", "SITI SAFRINA INDAH YANI", "SONY BRILLIANT ERLANDO", "SYAFAAT HIDAYATULLOH", "ULYATUL MURTASYIDAH", "VENNA MELINDA", "YONATAN ABNER NUSANTARA", "ZAEN ADITYA WAHYU PRATAMA", "ZAZA NUR RAHMA"
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageTransitionDuration = reducedMotion ? 0 : 300;
window.addEventListener("pageshow", () => document.body.classList.remove("page-leaving"));
document.addEventListener("click", event => {
	const link = event.target instanceof Element ? event.target.closest("a") : null;
	if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank" || link.hasAttribute("download")) return;
	const destination = new URL(link.href, window.location.href);
	if (destination.origin !== window.location.origin || destination.href === window.location.href || (destination.hash && destination.pathname === window.location.pathname)) return;
	event.preventDefault();
	document.body.classList.add("page-leaving");
	window.setTimeout(() => { window.location.href = destination.href; }, pageTransitionDuration);
});

const menuToggle = document.querySelector(".menu-toggle");
const sidebar = document.querySelector(".sidebar");
if (menuToggle && sidebar) {
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("menu-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
	});
	document.addEventListener("click", event => {
		if (!sidebar.contains(event.target)) {
			sidebar.classList.remove("menu-open");
			menuToggle.setAttribute("aria-expanded", "false");
		}
	});
	document.addEventListener("keydown", event => {
		if (event.key === "Escape" && sidebar.classList.contains("menu-open")) menuToggle.click();
	});
}

const initials = name => name.split(" ").map(word => word[0]).slice(0, 2).join("");
const studentList = document.querySelector("#studentList");
const emptyState = document.querySelector("#emptyState");
const renderStudents = (query = "") => {
	const filtered = students.filter(name => name.toLowerCase().includes(query.toLowerCase()));
	studentList.innerHTML = filtered.map(name => `<a class="student" href="detail-siswa.html?nama=${encodeURIComponent(name)}"><div class="avatar">${initials(name)}</div><div><strong>${name}</strong><span>Absen ${String(students.indexOf(name) + 1).padStart(2, "0")}</span></div></a>`).join("");
	emptyState.style.display = filtered.length ? "none" : "block";
};

const search = document.querySelector("#search");

const attendanceRate = document.querySelector("#attendanceRate");
const attendanceDate = document.querySelector("#attendanceDate");
const attendanceList = document.querySelector("#attendanceList");
const attendanceSummary = document.querySelector("#attendanceSummary");
const attendanceSave = document.querySelector("#attendanceSave");
const homeAttendanceList = document.querySelector("#homeAttendanceList");
const homeAttendanceSummary = document.querySelector("#homeAttendanceSummary");
const attendanceLiveDate = document.querySelector("#attendanceLiveDate");
const attendanceStorageKey = "xi-tkj-3-attendance";
const getDateKey = date => date.toISOString().slice(0, 10);
const getAttendanceData = () => JSON.parse(localStorage.getItem(attendanceStorageKey) || "{}");
const saveAttendanceData = data => localStorage.setItem(attendanceStorageKey, JSON.stringify(data));
const getSelectedDate = () => attendanceDate ? attendanceDate.value : getDateKey(new Date());
const getRecordsForDate = date => ({ ...Object.fromEntries(students.map(name => [name, "belum-hadir"])), ...(getAttendanceData()[date] || {}) });
const calculateAttendanceRate = records => Math.round((Object.values(records).filter(status => status === "hadir").length / students.length) * 100);
const attendanceLabels = { "belum-hadir": "Belum hadir", hadir: "Hadir", izin: "Izin", sakit: "Sakit", alpa: "Alpa" };
const attendanceStatusClass = status => `status-${status || "belum-hadir"}`;

const updateHomepageAttendance = () => {
	const records = getRecordsForDate(getDateKey(new Date()));
	if (attendanceRate) attendanceRate.textContent = `${calculateAttendanceRate(records)}%`;
	if (!homeAttendanceList || !homeAttendanceSummary) return;
	if (attendanceLiveDate) attendanceLiveDate.textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
	homeAttendanceList.innerHTML = students.map((name, index) => {
		const status = records[name] || "belum-hadir";
		return `<div class="home-attendance-row"><span class="attendance-number">${String(index + 1).padStart(2, "0")}</span><div class="attendance-student"><div class="avatar">${initials(name)}</div><strong>${name}</strong></div><span class="home-status ${attendanceStatusClass(status)}">${attendanceLabels[status]}</span></div>`;
	}).join("");
	const counts = Object.values(records).reduce((result, status) => ({ ...result, [status]: (result[status] || 0) + 1 }), {});
	homeAttendanceSummary.innerHTML = Object.entries(attendanceLabels).map(([status, label]) => `<span class="summary-${status}"><strong>${counts[status] || 0}</strong>${label}</span>`).join("");
};

const renderAttendance = () => {
	if (!attendanceList || !attendanceSummary) return;
	const records = getRecordsForDate(getSelectedDate());
	attendanceList.innerHTML = students.map((name, index) => `<div class="attendance-row"><span class="attendance-number">${String(index + 1).padStart(2, "0")}</span><div class="attendance-student"><div class="avatar">${initials(name)}</div><strong>${name}</strong></div><select class="attendance-status" data-student="${name}" aria-label="Status kehadiran ${name}">${Object.entries(attendanceLabels).map(([value, label]) => `<option value="${value}" ${records[name] === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>`).join("");
	const counts = Object.values(records).reduce((result, status) => ({ ...result, [status]: (result[status] || 0) + 1 }), {});
	attendanceSummary.innerHTML = Object.entries(attendanceLabels).map(([status, label]) => `<span><strong>${counts[status] || 0}</strong> ${label}</span>`).join("");
};

if (attendanceList && attendanceDate) {
	attendanceDate.value = getDateKey(new Date());
	attendanceDate.addEventListener("change", renderAttendance);
	attendanceSave.addEventListener("click", () => {
		const data = getAttendanceData();
		data[getSelectedDate()] = Object.fromEntries([...document.querySelectorAll(".attendance-status")].map(select => [select.dataset.student, select.value]));
		saveAttendanceData(data);
		renderAttendance();
		updateHomepageAttendance();
		attendanceSave.textContent = "Tersimpan";
		setTimeout(() => { attendanceSave.textContent = "Simpan absensi"; }, 1800);
	});
	renderAttendance();
}

updateHomepageAttendance();
window.addEventListener("storage", event => {
	if (event.key === attendanceStorageKey) {
		renderAttendance();
		updateHomepageAttendance();
	}
});

const today = document.querySelector("#today");
const liveClock = document.querySelector("#liveClock");
const updateClock = () => {
	const now = new Date();
	const dateFormatter = new Intl.DateTimeFormat("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	const timeFormatter = new Intl.DateTimeFormat("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
	if (today) today.textContent = dateFormatter.format(now);
	if (liveClock) liveClock.textContent = `${timeFormatter.format(now)} WIB`;
};

if (today || liveClock) {
	updateClock();
	setInterval(updateClock, 1000);
}

if (studentList && emptyState && search) {
	search.addEventListener("input", event => renderStudents(event.target.value));
	renderStudents();
}
