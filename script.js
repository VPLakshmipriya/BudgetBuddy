let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;
let monthlyChart;
window.onload = function () {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");

        const switchBtn = document.getElementById("themeSwitch");
        if (switchBtn) switchBtn.checked = true;
    }

    
    if (document.getElementById("expenseChart")) initDashboard();
    if (document.getElementById("expense-list")) renderExpenses();
    if (document.getElementById("delete-list")) renderDeletePage();
};


function addExpense() {
    const description = document.getElementById("description").value.trim();
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!description || !amount || !date) {
        alert("Fill all fields!");
        return;
    }

    expenses.push({
        id: Date.now(),
        description,
        amount: Number(amount),
        category,
        date
    });

    localStorage.setItem("expenses", JSON.stringify(expenses));

    alert("Expense Added Successfully!");

  
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
}


function renderExpenses() {
    const list = document.getElementById("expense-list");
    const totalDisplay = document.getElementById("total");

    if (!list || !totalDisplay) return;

    list.innerHTML = "";
    let total = 0;

    expenses.forEach(expense => {
        total += expense.amount;

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${expense.description}</strong><br>
                ₹${expense.amount} | ${expense.category}<br>
                <small>${expense.date}</small>
            </div>
        `;
        list.appendChild(li);
    });

    totalDisplay.textContent = total.toFixed(2);
}


function renderDeletePage() {
    const list = document.getElementById("delete-list");

    if (!list) return;

    list.innerHTML = "";

    expenses.forEach(expense => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${expense.description}</strong> - ₹${expense.amount}
            </div>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        list.appendChild(li);
    });
}

function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderDeletePage();
}

function initDashboard() {
    renderChart(expenses);
    renderMonthlyChart();
    calculateTotal(expenses);
}


function calculateTotal(data) {
    let total = 0;
    data.forEach(exp => total += exp.amount);

    const totalElement = document.getElementById("total");
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}

function renderChart(data) {
    const canvas = document.getElementById("expenseChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const categoryTotals = {};

    data.forEach(exp => {
        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += exp.amount;
    });

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: [
                    "#6a11cb",
                    "#2575fc",
                    "#ff758c",
                    "#43cea2",
                    "#f7971e"
                ]
            }]
        },
        options: {
            responsive: true,
            animation: {
                animateScale: true
            }
        }
    });
}
function renderMonthlyChart() {
    const canvas = document.getElementById("monthlyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const monthlyTotals = {};

    expenses.forEach(exp => {
        const month = exp.date.slice(0, 7);

        if (!monthlyTotals[month]) {
            monthlyTotals[month] = 0;
        }

        monthlyTotals[month] += exp.amount;
    });

    const months = Object.keys(monthlyTotals).sort();
    const totals = months.map(month => monthlyTotals[month]);

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: months,
            datasets: [{
                label: "Total Spending",
                data: totals,
                backgroundColor: "#6a11cb"
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1500
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

}
function filterByMonth() {
    const selectedMonth = document.getElementById("monthFilter").value;

    if (!selectedMonth) {
        renderChart(expenses);
        calculateTotal(expenses);
        return;
    }

    const filtered = expenses.filter(exp =>
        exp.date.startsWith(selectedMonth)
    );

    renderChart(filtered);
    calculateTotal(filtered);
}


function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateCharts();
}
function updateCharts() {
    if (chart) chart.destroy();
    if (monthlyChart) monthlyChart.destroy();

    if (document.getElementById("expenseChart")) {
        renderChart(expenses);
        renderMonthlyChart();
    }
}
