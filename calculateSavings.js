document.addEventListener('DOMContentLoaded', () => {
    // Set initial default values when the page loads
    setDefaultValues();

    // Update defaults when the aircraft type changes
    document.getElementById('aircraft-type').addEventListener('change', setDefaultValues);
});

function setDefaultValues() {
    const aircraftType = document.getElementById('aircraft-type').value;
    const numAircraftInput = document.getElementById('num-aircraft');
    const hirePriceInput = document.getElementById('hire-price');
    const maintenanceCostInput = document.getElementById('maintenance-cost');

    // Set the number of aircraft to 1 regardless of aircraft type
    numAircraftInput.value = 1;

    // Set default values based on aircraft type
    if (aircraftType === 'fixed-wing') {
        hirePriceInput.value = 200;
        maintenanceCostInput.value = 50;
    } else if (aircraftType === 'rotary-wing') {
        hirePriceInput.value = 400;
        maintenanceCostInput.value = 100;
    }
}

function calculateSavings() {
    // Get the input values
    const numAircraft = parseFloat(document.getElementById('num-aircraft').value);
    const hirePrice = parseFloat(document.getElementById('hire-price').value);
    const maintenanceCost = parseFloat(document.getElementById('maintenance-cost').value);
    const flightsPerMonth = parseFloat(document.getElementById('flights-per-month').value);
    const currency = document.getElementById('currency').value;
    const hobbsMeterUsed = document.getElementById('hobbs-meter').checked;
    const advancedOption = document.getElementById('advanced-option').checked;
    const flightAccuracy = parseFloat(document.getElementById('flight-accuracy').value);
    const blocksAccuracy = parseFloat(document.getElementById('blocks-accuracy').value);
    const aircraftType = document.getElementById('aircraft-type').value;

    // Fixed costs for each currency
    const costs = {
        GBP: {
            highUse: { monthly: 25.00, perFlight: 0.75 },
            lowUse: { monthly: 12.50, perFlight: 1.50 }
        },
        USD: {
            highUse: { monthly: 30.00, perFlight: 1.00 },
            lowUse: { monthly: 15.00, perFlight: 2.00 }
        },
        EUR: {
            highUse: { monthly: 30.00, perFlight: 0.90 },
            lowUse: { monthly: 15.00, perFlight: 1.80 }
        },
        AUD: {
            highUse: { monthly: 50.00, perFlight: 1.50 },
            lowUse: { monthly: 25.00, perFlight: 3.00 }
        }
    };

    // Validate inputs
    if (numAircraft <= 0) {
        document.getElementById('result').innerHTML = `<p style="color: red;">Fleet size should be a positive number.</p>`;
        return;
    }

    if (hirePrice <= maintenanceCost) {
        document.getElementById('result').innerHTML = `<p style="color: red;">The invoiced cost of the aircraft can't be less than the maintenance cost!</p>`;
        return;
    }

    // Calculate total flights per year
    const totalFlightsPerYear = flightsPerMonth * 12;

    // Determine usage type and costs
    let usageType, monthlyCostPerAircraft, flightCost;
    if (totalFlightsPerYear > 200) {
        usageType = 'High Use';
    } else {
        usageType = 'Low Use';
    }

    // Define the cost key based on usage type
    const costKey = usageType === 'High Use' ? 'highUse' : 'lowUse';

    // Calculate multipliers
    const today = new Date();
    const increaseDate = new Date(2025, 3, 1); // April 1st, 2025
    const dateMultiplier = today >= increaseDate ? 1.20 : 1;
    const aircraftMultiplier = aircraftType === 'fixed-wing' ? 1 : 2;
    const totalMultiplier = dateMultiplier * aircraftMultiplier;

    // Get base costs and apply the total multiplier
    monthlyCostPerAircraft = costs[currency][costKey].monthly * totalMultiplier;
    flightCost = costs[currency][costKey].perFlight * totalMultiplier;

    const currencySymbol = currency === 'GBP' ? '£' : (currency === 'EUR' ? '€' : '$');

    // Calculate product cost
    const productCost = (monthlyCostPerAircraft * numAircraft) + (flightCost * numAircraft * flightsPerMonth);
    const productCostConverted = productCost.toFixed(2);

    // Calculate paybacks
    const hirePayback = Math.round((flightCost / hirePrice) * 3600);
    const maintenancePayback = Math.round((flightCost / maintenanceCost) * 60);

    // Calculate Hobbs cost if applicable
    let hobbsNarrative = '';
    if (hobbsMeterUsed) {
        const hobbsCost = (maintenanceCost * 0.1).toFixed(2);
        const hobbsCostPerMonth = (hobbsCost * numAircraft * flightsPerMonth).toFixed(2);
        hobbsNarrative = `
            As Hobbs times is being used to record maintenance intervals instead of airborne time, at least 12 mins of maintenance time is lost each flight. This is costing approximately ${currencySymbol}${hobbsCost} per flight.
        `;
        if (parseFloat(hobbsCostPerMonth) > parseFloat(productCostConverted)) {
            const estimatedSaving = (parseFloat(hobbsCostPerMonth) - parseFloat(productCostConverted)).toFixed(2);
            hobbsNarrative += `
                The estimated net saving with accurate flight records from using the <strong style="color:#0057e1;">CloudBaseGA</strong> system and AutoLog is ${currencySymbol}${estimatedSaving} per month.
            `;
        }
    }

    // Generate narrative
    let narrative = `
        As your aircraft average ${totalFlightsPerYear > 200 ? 'more than' : 'less than or equal to'} 200 flights per year, the ${usageType} option is the most cost-effective.
        <br><br>
        The <strong style="color:#0057e1;">CloudBaseGA</strong> system would cost your organisation ${currencySymbol}${monthlyCostPerAircraft.toFixed(2)} per month per aircraft and ${currencySymbol}${flightCost.toFixed(2)} per flight. Based on your fleet size and usage, this would total ${currencySymbol}${productCostConverted} per month.
        <br><br>
        However, at an invoiced hire rate of ${currencySymbol}${hirePrice} per hour brakes-off to brakes-on, an underreported blocks time of just ${hirePayback} seconds costs the same as the ${currencySymbol}${flightCost.toFixed(2)} flight charge.
    `;

    // Only include maintenance payback if maintenance cost is >= equivalent of £10
    if (maintenanceCost >= 10) {
        narrative += `
            <br><br>
            At a maintenance cost of ${currencySymbol}${maintenanceCost}, an over-reported flight time of just ${maintenancePayback} min will cost more than the flight charge in shorter-than-necessary maintenance intervals.
        `;
    }

    narrative += `
        <br><br>
        ${hobbsNarrative}
        <br><br>
        <small style="font-size: 12px; color: #666;">This is an estimate. For more information, please contact us.</small>
    `;

    // Calculate net savings if advanced option is selected
    let systemCost, savings;
    if (advancedOption) {
        systemCost = Math.round(productCost);
        savings = Math.round((flightsPerMonth * numAircraft / 60) * ((blocksAccuracy * hirePrice) + (flightAccuracy * maintenanceCost)));
    }

    // Display the result
    const resultDiv = document.getElementById('result');
    const resultContent = `<p>${narrative}</p>`;

    if (advancedOption) {
        resultDiv.innerHTML = `<canvas id="savings-chart"></canvas>` + resultContent;
        displayChart(systemCost, savings, currencySymbol);
    } else {
        resultDiv.innerHTML = resultContent;
    }
}

// Display chart
function displayChart(systemCost, savings, currencySymbol) {
    const ctx = document.getElementById('savings-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['System Cost', 'Expected Savings'],
            datasets: [{
                data: [systemCost, savings],
                backgroundColor: ['#FF6384', '#36A2EB'],
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Estimated Costs and Expected Savings'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = Math.round(tooltipItem.raw);
                            if (tooltipItem.label === 'System Cost') {
                                return `System cost: ${currencySymbol}${value}`;
                            } else {
                                return `Expected savings: ${currencySymbol}${value}`;
                            }
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: true // Maintain aspect ratio
        }
    });
}