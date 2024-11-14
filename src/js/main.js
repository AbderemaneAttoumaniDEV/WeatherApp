document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '822f6551e40cbf77ffe455d6620933e3'; // Clé API OpenWeatherMap
    const cityInput = document.getElementById('cityInput');
    const suggestionsList = document.getElementById('suggestionsList');

    let map; // Déclaration de la carte
    let marker; // Déclaration du marqueur

    // Fonction pour récupérer les suggestions de villes
    function getCitySuggestions(query) {
        if (query.length < 3) {
            suggestionsList.classList.add('hidden');
            return;
        }

        const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=20&appid=${apiKey}&lang=fr`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const cities = data.list;
                suggestionsList.innerHTML = '';

                if (cities.length > 0) {
                    suggestionsList.classList.remove('hidden');
                    const filteredCities = cities.filter(city => city.name.toLowerCase().startsWith(query.toLowerCase()));

                    filteredCities.forEach(city => {
                        const listItem = document.createElement('li');
                        listItem.classList.add('px-4', 'py-2', 'text-white', 'cursor-pointer', 'hover:bg-blue-500', 'rounded-lg');
                        listItem.textContent = `${city.name}, ${city.sys.country}`;
                        listItem.addEventListener('click', () => {
                            cityInput.value = listItem.textContent;
                            suggestionsList.classList.add('hidden');
                            fetchWeatherData(city.name);
                        });

                        suggestionsList.appendChild(listItem);
                    });

                    if (filteredCities.length === 0) {
                        suggestionsList.classList.add('hidden');
                    }
                } else {
                    suggestionsList.classList.add('hidden');
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des suggestions de ville', error);
                suggestionsList.classList.add('hidden');
            });
    }

    // Fonction pour récupérer les données météo d'une ville
    function fetchWeatherData(cityName) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=fr`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod !== 200) {
                    showErrorPopup(data.message);
                    return;
                }

                const { name, sys, weather, main, wind, clouds, visibility, dt } = data;

                // Remplir les données météo
                document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
                document.getElementById('weatherCondition').textContent = weather[0].description;
                document.getElementById('temperature').textContent = `${main.temp} °C`;
                document.getElementById('humidity').textContent = `${main.humidity} %`;
                document.getElementById('tempMin').textContent = `${main.temp_min} °C`;
                document.getElementById('tempMax').textContent = `${main.temp_max} °C`;
                document.getElementById('windSpeed').textContent = `${wind.speed} m/s`;
                document.getElementById('pressure').textContent = `${main.pressure} hPa`;
                document.getElementById('visibility').textContent = `${visibility / 1000} km`;
                document.getElementById('cloudCoverage').textContent = `${clouds.all} %`;

                // Afficher l'heure locale
                const localTime = new Date(dt * 1000).toLocaleTimeString();
                document.getElementById('localTime').textContent = `Heure locale : ${localTime}`;

                // Changer l'icône météo
                const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
                document.getElementById('weatherIcon').src = iconUrl;

                // Afficher les données météo
                document.getElementById('weatherData').classList.remove('hidden');
                
                // Initialiser et afficher la carte
                if (map) {
                    map.remove(); // Supprimer la carte existante si elle existe
                }
                map = L.map('map').setView([data.coord.lat, data.coord.lon], 13);
                
                // Ajouter le fond de carte
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                // Ajouter un marqueur sur la carte
                marker = L.marker([data.coord.lat, data.coord.lon]).addTo(map)
                    .bindPopup(`<b>${name}</b><br>${weather[0].description}`).openPopup();
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données météo', error);
                showErrorPopup('Impossible de récupérer les données météo.');
            });
    }

    // Fonction pour afficher une erreur
    function showErrorPopup(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        document.getElementById('errorPopup').classList.remove('hidden');
    }

    // Fonction pour fermer le pop-up d'erreur
    document.getElementById('closeErrorPopup').addEventListener('click', () => {
        document.getElementById('errorPopup').classList.add('hidden');
    });

    // Gestion de l'entrée utilisateur
    cityInput.addEventListener('input', () => {
        getCitySuggestions(cityInput.value);
    });

    // Recherche de la météo lorsqu'on clique sur le bouton
    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            fetchWeatherData(cityName);
            suggestionsList.classList.add('hidden');  // Cacher les suggestions
        }
    });

    // Cacher les suggestions lors du pressage de la touche Entrée
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cityName = cityInput.value.trim();
            if (cityName) {
                fetchWeatherData(cityName);
                suggestionsList.classList.add('hidden');  // Cacher les suggestions
            }
        }
    });
});
