
const drivers = ["Johan", "Henrik", "Fredrik", "Benny", "Joacim"];
const schedule = [];
const startTime = new Date();
startTime.setHours(10, 0, 0, 0);
startTime.setDate(startTime.getDate() + 1);

function toSeconds(val) {
    const parts = val.split(":");
    return parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 0;
}

function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

function updateSchedule() {
    let current = new Date(startTime);
    for (let i = 0; i < schedule.length; i++) {
        const lap1Input = document.getElementById(`lap1-${i}`);
        const lap2Input = document.getElementById(`lap2-${i}`);
        const lap1 = lap1Input.value;
        const lap2 = lap2Input.value;
        const totalSec = toSeconds(lap1) + toSeconds(lap2);
        const duration = totalSec > 0 ? totalSec : 60 * 60;
        schedule[i].lap1 = lap1;
        schedule[i].lap2 = lap2;
        schedule[i].start = new Date(current);
        current = new Date(current.getTime() + duration * 1000);
    }
    renderSchedule();
    updateStats();
}

function generateSchedule() {
    for (let i = 0; i < 24; i++) {
        schedule.push({
            driver: drivers[i % drivers.length],
            lap1: "",
            lap2: "",
            start: new Date()
        });
    }
    updateSchedule();
}

function renderSchedule() {
    const tbody = document.getElementById("schedule-body");
    tbody.innerHTML = "";
    schedule.forEach((s, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${s.driver}</td>
            <td>${formatTime(s.start)}</td>
            <td><input id="lap1-${i}" value="${s.lap1}" onchange="updateSchedule()" placeholder="mm:ss"></td>
            <td><input id="lap2-${i}" value="${s.lap2}" onchange="updateSchedule()" placeholder="mm:ss"></td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats() {
    const stats = {};
    drivers.forEach(d => stats[d] = { total: 0, count: 0 });

    schedule.forEach(s => {
        [s.lap1, s.lap2].forEach(val => {
            const sec = toSeconds(val);
            if (sec > 0) {
                stats[s.driver].total += sec;
                stats[s.driver].count++;
            }
        });
    });

    const sorted = drivers.map(d => ({
        driver: d,
        avg: stats[d].count ? stats[d].total / stats[d].count : Infinity
    })).sort((a, b) => a.avg - b.avg);

    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "";
    sorted.slice(0, 5).forEach((entry, i) => {
        const li = document.createElement("li");
        const emoji = ["🥇", "🥈", "🥉", "🏅", "🎖"][i] || "";
        li.textContent = `${emoji} ${entry.driver} – ${entry.avg === Infinity ? "-" : entry.avg.toFixed(1)} sek`;
        leaderboard.appendChild(li);
    });

    const ctx = document.getElementById("chart").getContext("2d");
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: drivers,
            datasets: [{
                label: "Snitttid (sek)",
                data: drivers.map(d => stats[d].count ? stats[d].total / stats[d].count : 0),
                backgroundColor: "crimson"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

generateSchedule();
