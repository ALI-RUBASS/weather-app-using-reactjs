import React, { useEffect, useState } from 'react';
import L, { marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
    const [selectedPoint, setSelectedPoint] = useState({ lat: 32.49146, lng: 74.54539 });
    const [weatherData, setWeatherData] = useState(null);
    const apiKey = "weatherapikey";

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const apiKey2 = "geoapifykey";

    const handleSearch = async () => {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `https://api.geoapify.com/v1/geocode/autocomplete?text=${searchQuery}&apiKey=${apiKey2}`, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        setSuggestions(data.features);
                    } else {
                        console.error('Error fetching suggestions:', xhr.statusText);
                    }
                }
            };
            xhr.send();
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };
    

    const handleSelectPlace = (place) => {
        setSelectedPoint({
            lat: place.properties.lat,
            lng: place.properties.lon
        });
        setSuggestions([]);
    };




    useEffect(() => {
        if (!selectedPoint) return;

        const { lat, lng } = selectedPoint;

        const xhr = new XMLHttpRequest();
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`;

        xhr.open("GET", url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    const weatherDescription = response.weather[0].main;
                    const icon = response.weather[0].icon;
                    const temperature = (response.main.temp - 273.15).toFixed(1);
                    const temperature_min = (response.main.temp_min - 273.15).toFixed(1);
                    const temperature_max = (response.main.temp_max - 273.15).toFixed(1);
                    const cityName = response.name;
                    const humidity = response.main.humidity;
                    const wind = response.wind.speed;
                    const visibility = response.visibility / 1000;

                    const unixTimestampInSeconds = response.dt;
                    const milliseconds = unixTimestampInSeconds * 1000;


                    const date = new Date(milliseconds);



                    const padZero = (num) => {
                        return (num < 10 ? '0' : '') + num;
                    };


                    const monthNames = [
                        "Jan", "Feb", "Mar",
                        "Apr", "May", "Jun", "Jul",
                        "Aug", "Sep", "Oct",
                        "Nov", "Dec"
                    ];



                    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]}, ${date.getFullYear()} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;







                    setWeatherData({
                        location: cityName,
                        weather: weatherDescription,
                        temperature: temperature,
                        temperature_min: temperature_min,
                        temperature_max: temperature_max,
                        humidity: humidity,
                        wind: wind,
                        visibility: visibility,
                        date: formattedDate,
                        time: formattedDate,
                        icon: icon
                    });
                } else {
                    console.error("Error:", xhr.statusText);
                    setWeatherData({
                        location: "Error fetching weather data.",
                        weather: "",
                        temperature: "",
                        temperature_min: "",
                        temperature_max: "",
                        humidity: "",
                        wind: "",
                        visibility: "",
                        date: "",
                        time: "",
                        icon: ""
                    });
                }
            }
        };

        xhr.send();
    }, [selectedPoint]);

    useEffect(() => {
        const map = L.map('map-container').setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        map.zoomControl.remove();

        // Change cursor to pointer when hovering over the map
        map.getContainer().style.cursor = 'pointer';

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setSelectedPoint({ lat, lng });
            setSuggestions([]); // Clear suggestions when user clicks on the map

            // Clear existing popups
            map.closePopup();

            // Create and display popup at the selected point

            L.popup()
                .setLatLng([lat, lng])
                .setContent(`
          <p><b>Latitude</b> ${lat.toFixed(5)}</p>
          <p><b>Longitude</b> ${lng.toFixed(5)}</p>
        `)
                .openOn(map);
        });

        return () => {
            map.remove();
        };
    }, []);


    useEffect(() => {
        if (searchQuery !== "")
            handleSearch();
    }, [searchQuery]);


    return (
        <div className="bg-white">

         

            <div className=' mt-6 mb-4 flex justify-center items-center flex-col'>
                <div className='items-center flex'>
                    <input
                        type="text"
                        placeholder="Search for a place..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => setTimeout(() => setSuggestions([]), 100)}
                        className='py-2 px-4 rounded-full border-4'
                    />
                </div>
                {suggestions.length > 0 && (
                    <div className="w-screen p-4"> 
                        <ul className=" bg-gray-100 rounded-md p-2 ">
                        {suggestions.map((place) => (
                            <li
                                key={place.properties.id}
                                onClick={() => handleSelectPlace(place)}
                                className="cursor-pointer hover:bg-gray-200 rounded-md p-1"
                            >
                                {place.properties.formatted}
                            </li>
                        ))}
                    </ul>

                    </div>
                    
                )}
            </div>





            <div className="flex flex-col-reverse lg:flex-row">
                <div className="lg:w-screen h-screen p-4 z-10">
                    <div id="map-container" className="h-full rounded-lg"></div>
                </div>
                <div className="lg:w-1/3 rounded-lg m-4 lg:absolute lg:left-0 z-50 lg:bg-gradient-to-r lg:from-gray-800 lg:to-transparent">
                    <div>



                        <div class="sm:min-h-screen flex items-center justify-center">
                            <div class="flex flex-col bg-white rounded-lg shadow-sm p-4 w-full max-w-xs md:-mt-32">
                                <div className="font-bold text-xl">
                                    {weatherData && weatherData.location ? weatherData.location : "Location not available"}
                                </div>

                                <div class="text-sm text-gray-500">                                            {weatherData && weatherData.date ? weatherData.date : "NaN"}
                                </div>
                                <div className="mt-6 text-6xl self-center inline-flex items-center justify-center rounded-lg  h-24 w-24">
                                    <img src={`https://openweathermap.org/img/wn/${weatherData && weatherData.icon ? weatherData.icon : "NaN"}@2x.png`} alt="Weather Icon" />
                                </div>

                                <div class="flex flex-row items-center justify-center mt-6">
                                    <div class="font-medium text-6xl">
                                        {weatherData && weatherData.temperature ? weatherData.temperature : "NaN"}
                                        °C</div>
                                    <div class="flex flex-col items-center ml-6">
                                        <div>{weatherData && weatherData.weather ? weatherData.weather : "NaN"}</div>
                                        <div class="mt-1">
                                            <span class="text-sm"><i class="far fa-long-arrow-up"></i></span>
                                            <span class="text-sm font-light text-gray-500">
                                                {weatherData && weatherData.temperature_max ? weatherData.temperature_max : "NaN"}
                                                °C</span>
                                        </div>
                                        <div>
                                            <span class="text-sm"><i class="far fa-long-arrow-down"></i></span>
                                            <span class="text-sm font-light text-gray-500">
                                                {weatherData && weatherData.temperature_min ? weatherData.temperature_min : "NaN"}
                                                °C</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-row justify-between mt-6">
                                    <div class="flex flex-col items-center">
                                        <div class="font-medium text-sm">Wind</div>
                                        <div class="text-sm text-gray-500">
                                            {weatherData && weatherData.wind ? weatherData.wind : "NaN"}
                                            m/s</div>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <div class="font-medium text-sm">Humidity</div>
                                        <div class="text-sm text-gray-500">                                    {weatherData && weatherData.humidity ? weatherData.humidity : "NaN"}
                                            %</div>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <div class="font-medium text-sm">Visibility</div>
                                        <div class="text-sm text-gray-500">                                    {weatherData && weatherData.visibility ? weatherData.visibility : "NaN"}
                                            km
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>
                </div>
            </div>

       

        </div>
    );
};

export default Map;
