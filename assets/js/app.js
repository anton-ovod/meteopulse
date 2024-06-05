import { fetchData, fetchImage, url } from "./api.js";
import * as module from "./module.js";


const defaultLocation = { lat: 51.1089776, lon: 17.0326689}; // Wroclaw

const searchTimeoutDuration = 300;

const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");

const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

const locationsSearchField = document.querySelector("[data-locations-search-field]");
const locationsSearchResult = document.querySelector("[data-locations-search-result]");
const locationsTagsContainer = document.querySelector("[data-locations-tags]");

const container = document.querySelector("[data-container]");
const formContainer = document.querySelector("[data-form-container]"); 
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const newsletterBtn = document.querySelector("[data-newsletter-btn]");
const backButton = document.querySelector(".back-arrow");

const currentWeatherSection = document.querySelector("[data-current-weather]");
const highlightSection = document.querySelector("[data-highlights]");
const hourlySection = document.querySelector("[data-hourly-forecast]");
const forecastSection = document.querySelector("[data-5-day-forecast]");

const carouselInner = document.querySelector('.carousel-inner');
const carouselItems = document.querySelectorAll('.carousel-item');
const indicators = document.querySelectorAll('.indicator');
let currentIndex = 0;
const interval = 3000;
const transitionDuration = 500;


const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
}

currentLocationBtn.addEventListener('click', function () {
    window.navigator.geolocation.getCurrentPosition(res => {
      const { latitude, longitude } = res.coords;
      currentLocationBtn.disabled = true;
      updateWeather(`lat=${latitude}`, `lon=${longitude}`);
    }, 
    err => {
        updateWeather(`lat=${defaultLocation.lat}`, `lon=${defaultLocation.lon}`);
        console.log(err);
    });
});

newsletterBtn.addEventListener('click', function () {
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");
  container.style.display = "none";
  searchView.style.display = "none";

  formContainer.style.overflowY = "overlay";
  formContainer.classList.add("fade-in");
  newsletterBtn.disabled = true;
  formContainer.style.display = "flex";
});

backButton.addEventListener("click", function () {
  formContainer.style.overflowY = "hidden";
  formContainer.classList.remove("fade-in");
  formContainer.style.display = "none";
  searchView.style.display = "flex";

  container.style.overflowY = "overlay";
  container.classList.add("fade-in");
  newsletterBtn.disabled = false;
  container.style.display = "block";
});

const toggleSearch = () => {
  searchView.classList.toggle("active");
  searchField.value = "";
  searchResult.innerHTML = "";
}

addEventOnElements(searchTogglers, "click", toggleSearch);

searchField.addEventListener("input", function () {
      if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
      } else {
        searchField.classList.add("searching");
      }

      if (searchField.value) {
        setTimeout(() => {
          fetchData(url.geo(searchField.value), function (locations) {
            console.log("Locations: ", locations);
            searchField.classList.remove("searching");
            searchResult.classList.add("active");

            searchResult.innerHTML = `<ul class="view-list" data-search-list></ul>`;

            if (locations.length === 0) {
              const searchItem = document.createElement("li");
              searchItem.classList.add("view-item");
              searchItem.innerHTML = `
                <p style="text-align: center; margin: auto;">No results found</p>
              `;
              searchResult.querySelector("[data-search-list]").appendChild(searchItem);
            } 
            else {

            for (const { name, lat, lon, country, state } of locations) {
              const searchItem = document.createElement("li");
              searchItem.classList.add("view-item");

              searchItem.innerHTML = `
                <span class="material-symbols-rounded">location_on</span>
                <div>
                  <p>${name}</p>
                  <p>${state || ""} ${country}</p>
                </div>
                <button class="item-link" aria-label="${name} weather" data-search-toggler></button>
              `;

              searchItem.querySelector("[data-search-toggler]").addEventListener("click", function () {
                let lastSearchedLocation = { lat: lat, lon: lon };
                localStorage.setItem('lastSearchedLocation', JSON.stringify(lastSearchedLocation));
                searchField.value = "";
                searchResult.classList.remove("active");
                searchView.classList.remove("active");
                currentLocationBtn.disabled = false;
                updateWeather(`lat=${lat}`, `lon=${lon}`);
              });

              searchResult.querySelector("[data-search-list]").appendChild(searchItem);
            }
            }
          });
        }, searchTimeoutDuration);
      }
});

locationsSearchField.addEventListener("input", function () {
  console.log("Input event triggered");
  if (!locationsSearchField.value) {
    locationsSearchResult.classList.remove("active");
    locationsSearchResult.innerHTML = "";
    locationsSearchField.classList.remove("searching");
  } else {
    locationsSearchField.classList.add("searching");
  }

  if (locationsSearchField.value) {
    setTimeout(() => {
      fetchData(url.geo(locationsSearchField.value), function (locations) {
        console.log("Fetch data callback triggered");
        locationsSearchField.classList.remove("searching");
        locationsSearchResult.classList.add("active");
        locationsSearchResult.innerHTML = `<ul class="view-list" data-locations-search-list></ul>`;

        if (locations.length === 0) {
          locationsSearchResult.innerHTML = `
            <p style="text-align: center; margin: 20px 0;">No results found</p>
          `;
        } else {
          for (const { name, country, state } of locations) {
            const searchItem = document.createElement("li");
            searchItem.classList.add("view-item");

            searchItem.innerHTML = `
              <span class="material-symbols-rounded">location_on</span>
              <div>
                <p class="item-title">${name}</p>
                <p class="item-subtitle">${state || ""} ${country}</p>
              </div>
              <button class="item-link" aria-label="${name}" data-tag-toggler></button>
            `;

            searchItem.querySelector("[data-tag-toggler]").addEventListener("click", function () {
              console.log("Search item clicked: ", name);
              addTag(name);
              locationsSearchResult.classList.remove("active");
              locationsSearchResult.innerHTML = "";
              locationsSearchField.value = "";
            });

            locationsSearchResult.querySelector("[data-locations-search-list]").appendChild(searchItem);
          }
        }
      });
    }, searchTimeoutDuration);
  }
});

function addTag(name) {
  console.log("addTag function called with name: ", name);
  const tag = document.createElement("div");
  tag.classList.add("tag");
  tag.innerHTML = `
    <span>${name}</span>
    <span class="remove-tag">&times;</span>
  `;

  tag.querySelector(".remove-tag").addEventListener("click", function () {
    locationsTagsContainer.removeChild(tag);
  });

  locationsTagsContainer.appendChild(tag);
}

const updateCarousel = (index) => {
    document.querySelector('.indicator.active').classList.remove('active');
    indicators[index % indicators.length].classList.add('active');
    
    carouselInner.style.transition = `transform ${transitionDuration}ms ease`;
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
};

const nextSlide = () => {
    currentIndex++;
    updateCarousel(currentIndex);

    if (currentIndex === carouselItems.length - 1) {
        setTimeout(() => {
            carouselInner.style.transition = 'none';
            carouselInner.style.transform = `translateX(0)`;
            currentIndex = 0;
            carouselInner.offsetHeight;
            carouselInner.style.transition = `transform ${transitionDuration}ms ease`;
        }, transitionDuration);
    }
};

const goToSlide = (index) => {
    currentIndex = index;
    updateCarousel(currentIndex);
};

indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        goToSlide(index);
    });
});

setInterval(nextSlide, interval);

const updateWeather = function (lat, lon) {

  loading.style.display = "grid";
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");

  currentWeatherSection.innerHTML = "";
  highlightSection.innerHTML = "";
  hourlySection.innerHTML = "";
  forecastSection.innerHTML = "";
  
  fetchData(url.currentWeather(lat, lon), function (currentWeather) {
    console.log(currentWeather);
    const {
      weather,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone
    } = currentWeather

    const [{ description, icon }] = weather;

    const card = document.createElement("div");
    card.classList.add("card", "card-lg", "current-weather-card");

    card.innerHTML = `
      <h2>${module.getDate(dateUnix, timezone)}</h2>
      <img class="location-image">
      <div class="wrapper">
        <div class="location-wrapper">
          <span class="material-symbols-rounded">location_on</span>
          <p data-location></p>
        </div>
        <div class="weather-wrapper">
          <img src="./assets/images/weather_icons/${icon}.svg" alt="${description}" class="weather-icon">
          <p class="">${parseInt(temp)}&deg;<sup>c</sup></p>
        </div>
      </div>
    `;

    fetchData(url.reverseGeo(lat, lon), function ([{ name }]) {
      console.log(lat, lon);
      card.querySelector("[data-location]").innerHTML = `${name}`;
      
      fetchImage(url.locationimage(name), function(object){
        const imageUrl = object.results[0].urls.regular;
        const locationImageElement = document.querySelector(".location-image");
        locationImageElement.src = imageUrl;
        locationImageElement.alt = `${name}`;
        
        // Ensure image is loaded before continuing
        locationImageElement.onload = function() {

          /* TODAY'S HIGHLIGHTS */
          fetchData(url.airPollution(lat, lon), function (airPollution) {
            console.log(airPollution);
            const [{
              main: { aqi },
              components: { no2, o3, so2, pm2_5 }
            }] = airPollution.list;

            const card = document.createElement("div");
            card.classList.add("card", "card-lg");

            card.innerHTML = `
            <h2>Todays Highlights</h2>
    
            <div class="highlight-list">
    
              <div class="card card-sm highlight-card one">
    
                <h3>Air Quality Index</h3>
    
                <div class="wrapper">
    
                  <span class="material-symbols-rounded">air</span>
    
                  <ul class="card-list">
    
                    <li class="card-item">
                      <p>${pm2_5.toPrecision(3)}</p>
    
                      <p>PM<sub>2.5</sub></p>
                    </li>
    
                    <li class="card-item">
                      <p>${so2.toPrecision(3)}</p>
    
                      <p>SO<sub>2</sub></p>
                    </li>
    
                    <li class="card-item">
                      <p>${no2.toPrecision(3)}</p>
    
                      <p>NO<sub>2</sub></p>
                    </li>
    
                    <li class="card-item">
                      <p>${o3.toPrecision(3)}</p>
    
                      <p>O<sub>3</sub></p>
                    </li>
    
                  </ul>
    
                </div>
    
                <span class="badge aqi-${aqi}" title="${module.aqiText[aqi].message}">
                  ${module.aqiText[aqi].level}
                </span>
    
              </div>
    
              <div class="card card-sm highlight-card two">
    
                <h3>Sunrise & Sunset</h3>
    
                <div class="card-list">
    
                  <div class="card-item">
                    <span class="material-symbols-rounded">clear_day</span>
    
                    <div>
                      <p>Sunrise</p>
    
                      <p>${module.getTime(sunriseUnixUTC, timezone)}</p>
                    </div>
                  </div>
    
                  <div class="card-item">
                    <span class="material-symbols-rounded">clear_night</span>
    
                    <div>
                      <p>Sunset</p>
    
                      <p>${module.getTime(sunsetUnixUTC, timezone)}</p>
                    </div>
                  </div>
    
                </div>
    
              </div>
    
              <div class="card card-sm highlight-card">
    
                <h3>Humidity</h3>
    
                <div class="wrapper">
                  <span class="material-symbols-rounded">humidity_percentage</span>
    
                  <p>${humidity}<sub>%</sub></p>
                </div>
    
              </div>
    
              <div class="card card-sm highlight-card">
    
                <h3>Pressure</h3>
    
                <div class="wrapper">
                  <span class="material-symbols-rounded">airwave</span>
    
                  <p>${pressure}<sub>hPa</sub></p>
                </div>
    
              </div>
    
              <div class="card card-sm highlight-card">
    
                <h3>Visibility</h3>
    
                <div class="wrapper">
                  <span class="material-symbols-rounded">visibility</span>
    
                  <p>${visibility / 1000}<sub>km</sub></p>
                </div>
    
              </div>
    
              <div class="card card-sm highlight-card">
    
                <h3>Feels Like</h3>
    
                <div class="wrapper">
                  <span class="material-symbols-rounded">thermostat</span>
    
                  <p>${parseInt(feels_like)}&deg;<sup>c</sup></p>
                </div>
    
              </div>
    
            </div>
          `;
    
            highlightSection.appendChild(card);
          });

          /* 24H FORECAST SECTION */
          fetchData(url.forecast(lat, lon), function (forecast) {
            console.log(forecast);
            const {
              list: forecastList,
              city: { timezone }
            } = forecast;

            hourlySection.innerHTML = `
              <h2>Today at</h2>
              <div class="slider-container">
                <ul class="slider-list" data-temp></ul>
                <ul class="slider-list" data-wind></ul>
              </div>
            `;

            for (const [index, data] of forecastList.entries()) {
              console.log([index, data]);
              if (index > 7) break;

              const {
                dt: dateTimeUnix,
                main: { temp },
                weather,
                wind: { deg: windDirection, speed: windSpeed }
              } = data

              const [{ icon, description }] = weather

              const tempLi = document.createElement("li");
              tempLi.classList.add("slider-item");

              tempLi.innerHTML = `
                <div class="card card-sm slider-card">
                  <p>${module.getHours(dateTimeUnix, timezone)}</p>
                  <img src="./assets/images/weather_icons/${icon}.svg" width="48" height="48" loading="lazy" alt="${description}"
                    class="weather-icon" title="${description}">
                  <p>${parseInt(temp)}&deg;</p>
                </div>
              `;
              hourlySection.querySelector("[data-temp]").appendChild(tempLi);

              const windLi = document.createElement("li");
              windLi.classList.add("slider-item");

              windLi.innerHTML = `
                <div class="card card-sm slider-card">
                  <p>${module.getHours(dateTimeUnix, timezone)}</p>
                  <img src="./assets/images/weather_icons/direction.svg" width="48" height="48" loading="lazy" alt="direction"
                    class="weather-icon" style="transform: rotate(${windDirection - 225}deg)">
                  <p>${parseInt(module.mps_to_kmh(windSpeed))} km/h</p>
                </div>
              `;

              hourlySection.querySelector("[data-wind]").appendChild(windLi);
            }

            forecastSection.innerHTML = `
              <div class="card card-lg forecast-card">
                <h2>Weather for 5 days</h2>
                <ul data-forecast-list></ul>
              </div>
            `;
            for (let i = 7, len = forecastList.length; i < len; i += 8) {
              const {
                main: { temp_max },
                weather,
                dt_txt
              } = forecastList[i];

              const [{ icon, description }] = weather
              const date = new Date(dt_txt);

              const li = document.createElement("li");
              li.classList.add("card-item");

              li.innerHTML = `
                <div class="icon-wrapper">
                  <p>${module.weekDayNames[date.getUTCDay()]}</p>
                  <p>${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</p>
                  <span class="span">
                    <p>${parseInt(temp_max)}&deg;</p>
                  </span>
                  <img src="./assets/images/weather_icons/${icon}.svg" width="36" height="36" alt="${description}"
                    class="weather-icon" title="${description}">
                </div>
              `;
              forecastSection.querySelector("[data-forecast-list]").appendChild(li);
            }

            // Finish loading process
            loading.style.display = "none";
            container.style.overflowY = "overlay";
            container.classList.add("fade-in");
          });
        };
      });
    });

    currentWeatherSection.appendChild(card);
  });
};


window.addEventListener("load", () => {
  const storedLocation = localStorage.getItem('lastSearchedLocation');

  if (storedLocation) {
      const lastSearchedLocation = JSON.parse(storedLocation);
      const { lat, lon } = lastSearchedLocation;
      updateWeather(`lat=${lat}`, `lon=${lon}`);
  } else {
      updateWeather(`lat=${defaultLocation.lat}`, `lon=${defaultLocation.lon}`);
  }
});

