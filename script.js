
const startTime = new Date();
startTime.setHours(10, 0, 0, 0);
startTime.setDate(startTime.getDate() + 1);

const drivers = ["Johan", "Henrik", "Fredrik", "Benny", "Joacim"];
const schedule = [];
const scheduleDiv = document.getElementById("schedule");

function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

function renderSchedule() {
    scheduleDiv.innerHTML = "";
    let time = new Date(startTime);
    for (let i = 0; i < 24; i++) {
        const driver = drivers[i % drivers.length];
        const pass = {
            driver,
            start: new Date(time),
            lap1: null,
            lap2: null
        };
        schedule.push(pass);

        const passDiv = document.createElement("div");
        passDiv.className = "pass";
        passDiv.innerHTML = `
            <strong>${driver}</strong> – Start: ${formatTime(time)}<br>
            Varv 1: <input type="number" id="lap1-${i}" placeholder="min"> min
            <input type="number" id="sec1-${i}" placeholder="sek"> sek<br>
            Varv 2: <input type="number" id="lap2-${i}" placeholder="min"> min
            <input type="number" id="sec2-${i}" placeholder="sek"> sek<br>
        `;
        scheduleDiv.appendChild(passDiv);

        time.setMinutes(time.getMinutes() + 60);
    }
}

function calculateStats() {
    const totals = {};
    const bestLap = { time: Infinity, driver: "" };
    drivers.forEach(d => totals[d] = { time: 0, count: 0 });

    schedule.forEach((pass, i) => {
        const m1 = parseInt(document.getElementById("lap1-" + i)?.value || 0);
        const s1 = parseInt(document.getElementById("sec1-" + i)?.value || 0);
        const m2 = parseInt(document.getElementById("lap2-" + i)?.value || 0);
        const s2 = parseInt(document.getElementById("sec2-" + i)?.value || 0);
        const lapTimes = [m1 * 60 + s1, m2 * 60 + s2];

        lapTimes.forEach(t => {
            if (t > 0) {
                totals[pass.driver].time += t;
                totals[pass.driver].count++;
                if (t < bestLap.time) {
                    bestLap.time = t;
                    bestLap.driver = pass.driver;
                }
            }
        });
    });

    const labels = [];
    const data = [];
    drivers.forEach(d => {
        labels.push(d);
        const avg = totals[d].count ? (totals[d].time / totals[d].count) : 0;
        data.push(avg);
    });

    drawChart(labels, data);
    console.log("Snabbaste varv:", bestLap);
}

function drawChart(labels, data) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Snitttid (sekunder)',
                data,
            }]
        },
        options: {
            responsive: true
        }
    });
}

renderSchedule();
setInterval(calculateStats, 5000);

function updateLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    const allLaps = [];

    schedule.forEach((pass, i) => {
        const m1 = parseInt(document.getElementById("lap1-" + i)?.value || 0);
        const s1 = parseInt(document.getElementById("sec1-" + i)?.value || 0);
        const m2 = parseInt(document.getElementById("lap2-" + i)?.value || 0);
        const s2 = parseInt(document.getElementById("sec2-" + i)?.value || 0);
        const lapTimes = [
            { driver: pass.driver, time: m1 * 60 + s1 },
            { driver: pass.driver, time: m2 * 60 + s2 }
        ];

        lapTimes.forEach(lap => {
            if (lap.time > 0) {
                allLaps.push(lap);
            }
        });
    });

    allLaps.sort((a, b) => a.time - b.time);
    const topLaps = allLaps.slice(0, 5);
    leaderboard.innerHTML = "";
    topLaps.forEach((lap, index) => {
        const li = document.createElement("li");
        const minutes = Math.floor(lap.time / 60);
        const seconds = lap.time % 60;
        li.textContent = `${index + 1}. ${lap.driver} – ${minutes}m ${seconds}s`;
        leaderboard.appendChild(li);
    });
}

setInterval(updateLeaderboard, 5000);
