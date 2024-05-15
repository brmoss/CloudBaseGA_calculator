function calculateSavings() {
    // Get the input values
    const numAircraft = parseFloat(document.getElementById('num-aircraft').value);
    const hirePrice = parseFloat(document.getElementById('hire-price').value);
    const maintenanceCost = parseFloat(document.getElementById('maintenance-cost').value);
    const flightsPerMonth = parseFloat(document.getElementById('flights-per-month').value);
    const currency = document.getElementById('currency').value;
    const hobbsMeterUsed = document.getElementById('hobbs-meter').checked;

    // Exchange rates (values in GBP)
    const exchangeRates = {
        GBP: 1,
        EUR: 1.17,
        AUD: 1.88,
        USD: 1.24
    };

    // Costs in GBP
    const costs = {
        highUse: { monthly: 25, perFlight: 0.75 },
        lowUse: { monthly: 12.50, perFlight: 1.50 }
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
    let usageType, monthlyCostPerAircraftGBP, flightCostGBP;
    if (totalFlightsPerYear > 200) {
        usageType = 'High Use';
        monthlyCostPerAircraftGBP = costs.highUse.monthly;
        flightCostGBP = costs.highUse.perFlight;
    } else {
        usageType = 'Low Use';
        monthlyCostPerAircraftGBP = costs.lowUse.monthly;
        flightCostGBP = costs.lowUse.perFlight;
    }

    // Convert costs to selected currency
    const exchangeRate = exchangeRates[currency];
    const currencySymbol = currency === 'GBP' ? '£' : (currency === 'EUR' ? '€' : '$');
    const monthlyCostPerAircraft = (monthlyCostPerAircraftGBP * exchangeRate).toFixed(2);
    const flightCost = (flightCostGBP * exchangeRate).toFixed(2);

    // Calculate product cost
    const productCostGBP = (monthlyCostPerAircraftGBP * numAircraft) + (flightCostGBP * numAircraft * flightsPerMonth);
    const productCostConverted = (productCostGBP * exchangeRate).toFixed(2);

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
        The <strong style="color:#0057e1;">CloudBaseGA</strong> system would cost your organisation ${currencySymbol}${monthlyCostPerAircraft} per month per aircraft and ${currencySymbol}${flightCost} per flight. Based on your fleet size and usage, this would total ${currencySymbol}${productCostConverted} per month.
        <br><br>
        However, at an invoiced hire rate of ${currencySymbol}${hirePrice} per hour brakes-off to brakes-on, an underreported blocks time of just ${hirePayback} seconds costs the same as the ${currencySymbol}${flightCost} flight charge.
    `;

    // Only include maintenance payback if maintenance cost is >= equivalent of £10
    if (maintenanceCost * exchangeRates.GBP / exchangeRate >= 10) {
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

    // Display the result
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>${narrative}</p>`;
}
