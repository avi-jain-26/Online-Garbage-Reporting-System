document.getElementById('getLocationBtn').addEventListener('click', getAreaName);

async function getAreaName() {
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        const resultDiv = document.getElementById('result');

        if (!latitude || !longitude) {
            resultDiv.innerHTML = "Please enter both latitude and longitude";
            return;
        }

        try {
            resultDiv.innerHTML = "Fetching location...";
            
            const response = await fetch(

               `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

            );
            
            const data = await response.json();
            
            if (data.error) {
                resultDiv.innerHTML = "Location not found";
                return;
            }

            const address = data.address;
            const areaName = [
                address.neighbourhood,
                address.suburb,
                address.city_district,
                address.city,
                address.state,
                address.country
            ].filter(Boolean).join(", ");

            resultDiv.innerHTML = `
                <strong>Location Details:</strong><br>
                ${areaName}<br><br>
                <strong>Full Address:</strong><br>
                ${data.display_name}
            `;

        } catch (error) {
            console.error("Error:", error);
            resultDiv.innerHTML = "Error fetching location data";
        }
    }