// Tab Switching Logic
const tabs = document.querySelectorAll('.calc-type-btn');
const panels = document.querySelectorAll('.calculator-panel');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.add('hidden'));

        tab.classList.add('active');
        const type = tab.getAttribute('data-type');
        document.getElementById(`${type}-calculator`).classList.remove('hidden');
    });
});

// Utility: Format Currency
function fmt(num) {
    return '₹' + parseFloat(num).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 1. Simple Interest (SI) - Month Based
function calculateSimpleInterest() {
    const p = parseFloat(document.getElementById('si-principal').value) || 0;
    const r = parseFloat(document.getElementById('si-rate').value) || 0;
    const m = parseFloat(document.getElementById('si-time').value) || 0;

    if (p <= 0 || r <= 0 || m <= 0) return alert("Please enter valid values.");

    // Formula: SI = (P * R * T_years) / 100
    // T_years = Months / 12
    const si = (p * r * (m / 12)) / 100;
    const total = p + si;

    document.getElementById('si-interest').textContent = fmt(si);
    document.getElementById('si-total').textContent = fmt(total);
    document.getElementById('si-result').classList.remove('hidden');

    document.getElementById('si-breakdown').innerHTML = `
        For a principal of <strong>${fmt(p)}</strong> at <strong>${r}%</strong> interest for <strong>${m} months</strong>:<br>
        • Interest per month: ${fmt(si / m)}<br>
        • Total Interest: <strong>${fmt(si)}</strong>
    `;
}

// 2. Compound Interest (CI) - Month Based
function calculateCompoundInterest() {
    const p = parseFloat(document.getElementById('ci-principal').value) || 0;
    const r = parseFloat(document.getElementById('ci-rate').value) || 0;
    const m = parseFloat(document.getElementById('ci-time').value) || 0;
    const n = parseInt(document.getElementById('ci-frequency').value) || 1;

    if (p <= 0 || r <= 0 || m <= 0) return alert("Please enter valid values.");

    // Formula: A = P(1 + r/n)^(nt)
    // t = m / 12 (years)
    const t = m / 12;
    const rate_dec = r / 100;
    const amount = p * Math.pow((1 + rate_dec / n), (n * t));
    const ci = amount - p;

    document.getElementById('ci-interest').textContent = fmt(ci);
    document.getElementById('ci-total').textContent = fmt(amount);
    document.getElementById('ci-result').classList.remove('hidden');

    // Schedule (Monthly projection)
    let scheduleHtml = '<table><thead><tr><th>SR. NO.</th><th>Bgn Balance</th><th>Interest</th><th>End Balance</th></tr></thead><tbody>';
    let currentBalance = p;
    // For projection, we approximate monthly CI
    const monthlyRate = Math.pow(1 + rate_dec / n, n / 12) - 1;

    for (let i = 1; i <= m; i++) {
        let monthlyInt = currentBalance * monthlyRate;
        let endBalance = currentBalance + monthlyInt;
        scheduleHtml += `<tr><td>${i}</td><td>${fmt(currentBalance)}</td><td>${fmt(monthlyInt)}</td><td>${fmt(endBalance)}</td></tr>`;
        currentBalance = endBalance;
    }
    scheduleHtml += '</tbody></table>';
    document.getElementById('ci-schedule').innerHTML = scheduleHtml;
}

// 3. EMI Calculator (Standard PMT)
function calculateEMI() {
    const p = parseFloat(document.getElementById('emi-principal').value) || 0;
    const r = parseFloat(document.getElementById('emi-rate').value) / 100 / 12; // monthly rate
    const n = parseFloat(document.getElementById('emi-tenure').value) || 0;

    if (p <= 0 || r <= 0 || n <= 0) return alert("Please enter valid values.");

    // EMI = [P x r x (1+r)^n] / [((1+r)^n)-1]
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emi * n;
    const totalInt = totalPay - p;

    document.getElementById('emi-amount').textContent = fmt(emi);
    document.getElementById('emi-interest').textContent = fmt(totalInt);
    document.getElementById('emi-total').textContent = fmt(totalPay);
    document.getElementById('emi-result').classList.remove('hidden');

    // Amortization Schedule
    let schHtml = '<table><thead><tr><th>SR. NO.</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>';
    let bal = p;
    for (let i = 1; i <= n; i++) {
        let intPart = bal * r;
        let priPart = emi - intPart;
        bal -= priPart;
        if (bal < 0) bal = 0;
        schHtml += `<tr><td>${i}</td><td>${fmt(emi)}</td><td>${fmt(priPart)}</td><td>${fmt(intPart)}</td><td>${fmt(bal)}</td></tr>`;
    }
    schHtml += '</tbody></table>';
    document.getElementById('emi-schedule').innerHTML = schHtml;
}

// 4. Reducing EMI (Fixed Principal)
function calculateReducingEMI() {
    const p = parseFloat(document.getElementById('red-principal').value) || 0;
    const annualR = parseFloat(document.getElementById('red-rate').value) || 0;
    const n = parseFloat(document.getElementById('red-tenure').value) || 0;

    if (p <= 0 || annualR <= 0 || n <= 0) return alert("Please enter valid values.");

    const fixedPri = p / n;
    const monthlyR = (annualR / 100) / 12;

    let totalInt = 0;
    let schHtml = '<table><thead><tr><th>SR. NO.</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>';
    let bal = p;
    let firstEMI = 0, lastEMI = 0;

    for (let i = 1; i <= n; i++) {
        let intPart = bal * monthlyR;
        let emi = fixedPri + intPart;
        totalInt += intPart;
        bal -= fixedPri;
        if (i === 1) firstEMI = emi;
        if (i === n) lastEMI = emi;
        schHtml += `<tr><td>${i}</td><td>${fmt(emi)}</td><td>${fmt(fixedPri)}</td><td>${fmt(intPart)}</td><td>${fmt(Math.max(0, bal))}</td></tr>`;
    }
    schHtml += '</tbody></table>';

    document.getElementById('red-emi-first').textContent = fmt(firstEMI);
    document.getElementById('red-emi-last').textContent = fmt(lastEMI);
    document.getElementById('red-interest').textContent = fmt(totalInt);
    document.getElementById('red-total').textContent = fmt(p + totalInt);
    document.getElementById('red-schedule').innerHTML = schHtml;
    document.getElementById('red-result').classList.remove('hidden');
}

// 5. Daywise Interest
function calculateDaywiseInterest() {
    const p = parseFloat(document.getElementById('dw-principal').value) || 0;
    const r = parseFloat(document.getElementById('dw-rate').value) || 0;
    const startStr = document.getElementById('dw-start-date').value.trim();
    const endStr = document.getElementById('dw-current-date').value.trim();

    if (!startStr || !endStr || p <= 0) return alert("Enter valid dates and principal.");

    // Parse dd/mm/yyyy format
    const d1 = parseDDMMYYYY(startStr);
    const d2 = parseDDMMYYYY(endStr);

    if (!d1 || !d2) return alert("Invalid date format. Please use dd/mm/yyyy format.");

    // Inclusive difference
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const interest = (p * r * diffDays) / (100 * 365);

    document.getElementById('dw-total-days').textContent = diffDays;
    document.getElementById('dw-days-display').value = diffDays;
    document.getElementById('dw-interest').textContent = fmt(interest);
    document.getElementById('dw-total').textContent = fmt(p + interest);
    document.getElementById('dw-result').classList.remove('hidden');

    // Update breakdown with formatted dates
    document.getElementById('dw-breakdown').innerHTML = `
        From <strong>${startStr}</strong> to <strong>${endStr}</strong>:<br>
        • Total Days: <strong>${diffDays}</strong><br>
        • Daily Interest: ${fmt(interest / diffDays)}
    `;
}

// Helper function to parse dd/mm/yyyy format
function parseDDMMYYYY(dateStr) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;

    // JavaScript Date uses 0-indexed months
    const date = new Date(year, month - 1, day);

    // Validate the date is real (e.g., not 31/02/2024)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        return null;
    }

    return date;
}

// 6. RD Calculator (Quarterly Compounding)
function calculateRD() {
    const p = parseFloat(document.getElementById('rd-deposit').value) || 0;
    const r = parseFloat(document.getElementById('rd-rate').value) || 0;
    const m = parseInt(document.getElementById('rd-tenure').value) || 0;

    if (p <= 0 || r <= 0 || m <= 0) return alert("Enter valid values.");

    // Standard Bank RD Formula (Quarterly Compounding)
    // Maturity Value (M) =  P * [(1 + i)^n - 1] / [1 - (1 + i)^(-1/3)]
    // i = annual_rate / 400 (quarterly interest rate)
    // n = tenure_in_months / 3 (number of quarters)

    const i = r / 400; // quarterly rate
    const n = m / 3;   // number of quarters

    // Final Maturity Value
    const maturityValue = p * (Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3));
    const totalInvested = p * m;
    const totalInterest = maturityValue - totalInvested;

    document.getElementById('rd-total-investment').textContent = fmt(totalInvested);
    document.getElementById('rd-total-interest').textContent = fmt(totalInterest);
    document.getElementById('rd-maturity-value').textContent = fmt(maturityValue);
    document.getElementById('rd-result').classList.remove('hidden');

    // Monthly Investment Schedule
    let schHtml = '<table><thead><tr><th>SR. NO.</th><th>Monthly Deposit</th><th>Total Invested</th><th>Interest (Accrued)</th><th>Balance</th></tr></thead><tbody>';

    let currentBalance = 0;
    let accumulatedInterest = 0;
    let totalInvestedProgress = 0;

    // For the schedule, we iterate month by month.
    // Interest is compounded quarterly (every 3 months).
    for (let month = 1; month <= m; month++) {
        totalInvestedProgress += p;
        currentBalance += p;

        // At the end of every quarter (or at maturity), interest is added to balance
        // Note: Banks usually calculate interest quarterly.
        if (month % 3 === 0 || month === m) {
            // This is a simplified monthly view matching maturity final output
        }

        // To show a meaningful monthly growth, we apply a small monthly equivalent of the quarterly rate
        // However, it's more accurate to show the total maturity growth
        const currentM = p * (Math.pow(1 + i, month / 3) - 1) / (1 - Math.pow(1 + i, -1 / 3));
        const intForThisMonth = currentM - totalInvestedProgress;

        schHtml += `<tr><td>${month}</td><td>${fmt(p)}</td><td>${fmt(totalInvestedProgress)}</td><td>${fmt(intForThisMonth)}</td><td>${fmt(currentM)}</td></tr>`;
    }

    schHtml += '</tbody></table>';
    document.getElementById('rd-schedule').innerHTML = schHtml;
}

// 7. High-Fidelity PDF Report (Native Print Engine)
function generatePDF(panelId) {
    const panel = document.getElementById(panelId);
    const title = panel.querySelector('h2').textContent;
    const results = panel.querySelector('.result-grid').innerHTML;
    const breakdown = panel.querySelector('.breakdown') ? panel.querySelector('.breakdown').innerHTML : "";
    const schedule = panel.querySelector('.schedule-table') ? panel.querySelector('.schedule-table').innerHTML : "";

    const reportNo = 'FIN-' + Date.now().toString().slice(-6);
    const dateStr = new Date().toLocaleDateString('en-IN');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>${title} - ${reportNo}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                h1 { margin: 0; color: #6366f1; font-size: 24px; text-transform: uppercase; }
                .report-meta { text-align: right; font-size: 16px; color: #1e293b; background: #f1f5f9; padding: 10px; border-radius: 5px; }
                .report-meta strong { color: #6366f1; }
                .result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
                .result-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; background: #f8fafc; }
                .result-label { display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; font-weight: 600; }
                .result-value { font-size: 18px; font-weight: 700; color: #1e293b; }
                .breakdown { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #6366f1; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #6366f1; color: white; padding: 10px; text-align: left; font-size: 13px; }
                td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                tr:nth-child(even) { background: #f8fafc; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                @media print { @page { size: portrait; margin: 15mm; } }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <div class="header">
                <div><h1>${title}</h1></div>
                <div class="report-meta">
                    <strong>Report No:</strong> ${reportNo}<br>
                    <strong>Date:</strong> ${dateStr}
                </div>
            </div>

            <div class="result-grid">${results}</div>
            
            ${breakdown ? `<div class="breakdown">${breakdown}</div>` : ''}
            
            ${schedule ? `<h3>Payment Schedule</h3>${schedule}` : ''}

            <div class="footer">
                Financial Report generated by Master Interest Calculator | Built by Vasant Bhor
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// 8. Loan Cutting Calculator
function calculateLoanCutting() {
    const inputAmount = parseFloat(document.getElementById('lc-amount').value) || 0;
    if (inputAmount <= 0) return alert("Please enter a valid Loan Amount.");

    // Round to nearest 100 (e.g., 250 → 300, 350 → 400)
    const p = Math.ceil(inputAmount / 100) * 100;

    let sharesPct, depositPct, procFeePct, bldgFundPct, stationary;

    // Stationary Logic: 240 (<=1L), 360 (1L-5L), 600 (>5L)
    if (p <= 100000) {
        stationary = 240;
    } else if (p <= 500000) {
        stationary = 360;
    } else {
        stationary = 600;
    }

    // Logic based on 25 Lac (2,500,000) threshold
    if (p < 2500000) {
        sharesPct = 0.05;   // 5%
        depositPct = 0.02;  // 2%
        procFeePct = 0.005; // 0.5%
        bldgFundPct = 0.005;// 0.5%
    } else {
        sharesPct = 0.025;  // 2.5%
        depositPct = 0.035; // 3.5%
        procFeePct = 0.0025;// 0.25%
        bldgFundPct = 0.0025;// 0.25%
    }

    // Round only shares to nearest 100
    const shares = Math.ceil((p * sharesPct) / 100) * 100;
    const deposit = p * depositPct;
    const procFee = p * procFeePct;
    const bldgFund = p * bldgFundPct;
    const totalDeduction = shares + deposit + procFee + bldgFund + stationary;
    const netDisbursal = p - totalDeduction;

    document.getElementById('lc-net-disbursal').textContent = fmt(netDisbursal);
    document.getElementById('lc-total-deduction').textContent = fmt(totalDeduction);
    document.getElementById('lc-result').classList.remove('hidden');

    // Populate Details Table
    let tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Rate / Value</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Shares</td><td>${(sharesPct * 100).toFixed(2)}%</td><td>${fmt(shares)}</td></tr>
                <tr><td>Fixed Deposit</td><td>${(depositPct * 100).toFixed(2)}%</td><td>${fmt(deposit)}</td></tr>
                <tr><td>Processing Fee</td><td>${(procFeePct * 100).toFixed(2)}%</td><td>${fmt(procFee)}</td></tr>
                <tr><td>Building Fund</td><td>${(bldgFundPct * 100).toFixed(2)}%</td><td>${fmt(bldgFund)}</td></tr>
                <tr><td>Stationary</td><td>Fixed</td><td>${fmt(stationary)}</td></tr>
                <tr style="font-weight: bold; background: rgba(99, 102, 241, 0.1);">
                    <td colspan="2">TOTAL DEDUCTION</td>
                    <td>${fmt(totalDeduction)}</td>
                </tr>
            </tbody>
        </table>
    `;
    document.getElementById('lc-details-table').innerHTML = tableHtml;
}

// Auto-update days in Daywise
document.getElementById('dw-start-date').addEventListener('input', handleDateInput);
document.getElementById('dw-current-date').addEventListener('input', handleDateInput);

// Auto-format date input (converts 20122025 to 20/12/2025)
function handleDateInput(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
        value = value.substring(0, 5) + '/' + value.substring(5);
    }
    if (value.length > 10) {
        value = value.substring(0, 10);
    }

    e.target.value = value;
    updateDays();
}

function updateDays() {
    const s = document.getElementById('dw-start-date').value.trim();
    const e = document.getElementById('dw-current-date').value.trim();
    if (s && e) {
        const d1 = parseDDMMYYYY(s);
        const d2 = parseDDMMYYYY(e);
        if (d1 && d2) {
            const diff = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
            document.getElementById('dw-days-display').value = diff;
        } else {
            document.getElementById('dw-days-display').value = '';
        }
    }
}

// 9. Vehicle Loan Calculator
function calculateVehicleLoan() {
    // Get inputs
    const inputAmount = parseFloat(document.getElementById('vl-amount').value) || 0;
    const type = document.getElementById('vl-type').value;

    if (inputAmount <= 0) return alert("Please enter a valid Loan Amount.");

    // Based on requirements:
    // Shares: 5%
    // Deposit: 2%
    // Processing: 0.5%
    // Building Fund: 0.5%
    // Stationery: 830 (2-wheeler) or 1180 (4-wheeler)

    // Round input amount to nearest 100 (Consistent with Loan Cutting)
    const p = Math.ceil(inputAmount / 100) * 100;

    // Rates
    const sharesPct = 0.05;   // 5%
    const depositPct = 0.02;  // 2%
    const procFeePct = 0.005; // 0.5%
    const bldgFundPct = 0.005;// 0.5%

    let stationary = 0;
    if (type === '2-wheeler') {
        stationary = 830;
    } else {
        stationary = 1180;
    }

    // Calculations
    const shares = Math.ceil((p * sharesPct) / 100) * 100; // Round to nearest 100
    // For other components, simple multiplication since rates are now decimals
    const deposit = p * depositPct;
    const procFee = p * procFeePct;
    const bldgFund = p * bldgFundPct;

    const totalDeduction = shares + deposit + procFee + bldgFund + stationary;
    const netDisbursal = p - totalDeduction;

    // Display Results
    document.getElementById('vl-net-disbursal').textContent = fmt(netDisbursal);
    document.getElementById('vl-total-deduction').textContent = fmt(totalDeduction);
    document.getElementById('vl-result').classList.remove('hidden');

    // Populate Breakdown Table
    let tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Rate / Value</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Shares</td><td>${(sharesPct * 100).toFixed(2)}%</td><td>${fmt(shares)}</td></tr>
                <tr><td>Deposit</td><td>${(depositPct * 100).toFixed(2)}%</td><td>${fmt(deposit)}</td></tr>
                <tr><td>Processing Fee</td><td>${(procFeePct * 100).toFixed(2)}%</td><td>${fmt(procFee)}</td></tr>
                <tr><td>Building Fund</td><td>${(bldgFundPct * 100).toFixed(2)}%</td><td>${fmt(bldgFund)}</td></tr>
                <tr><td>Stationery (${type === '2-wheeler' ? '2 Wheeler' : '4 Wheeler'})</td><td>Fixed</td><td>${fmt(stationary)}</td></tr>
                <tr style="font-weight: bold; background: rgba(99, 102, 241, 0.1);">
                    <td colspan="2">TOTAL DEDUCTION</td>
                    <td>${fmt(totalDeduction)}</td>
                </tr>
            </tbody>
        </table>
    `;
    document.getElementById('vl-breakdown-table').innerHTML = tableHtml;
}
