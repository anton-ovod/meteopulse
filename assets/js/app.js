import { fetchData, fetchImage, url } from "./api.js";
import * as module from "./module.js";


const defaultLocation = { lat: 51.1089776, lon: 17.0326689}; // Wroclaw

const searchTimeoutDuration = 300;
let currentIndex = 0;
const interval = 3000;
const transitionDuration = 500;

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

const subscribeButton = document.querySelector('.btn-primary[type="button"]');
const dailyRadio = document.getElementById('Daily');
const weeklyRadio = document.getElementById('Weekly');  
const storedLocation = localStorage.getItem('lastSearchedLocation');  

const dayOfWeekSelect = document.getElementById('DayOfWeek');

const footerElement = document.querySelector(".footer");


// EVENT LISTENERS

function addEventOnElements(elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
}

currentLocationBtn.addEventListener('click', function () {
    window.navigator.geolocation.getCurrentPosition(res => {
      const { latitude, longitude } = res.coords;
      backButton.dispatchEvent(new Event('click'));
      currentLocationBtn.disabled = true;
      updateWeather(`lat=${latitude}`, `lon=${longitude}`);

    }, 
    err => {
        updateWeather(`lat=${defaultLocation.lat}`, `lon=${defaultLocation.lon}`);
        console.log(err);
    });
});

subscribeButton.addEventListener('click', validateForm);
dailyRadio.addEventListener('change', toggleDayOfWeekSelect);
weeklyRadio.addEventListener('change', toggleDayOfWeekSelect);

newsletterBtn.addEventListener('click', function () {
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");
  container.style.display = "none";
  searchView.style.display = "none";

  formContainer.style.overflowY = "overlay";
  formContainer.classList.add("fade-in");
  newsletterBtn.disabled = true;
  currentLocationBtn.disabled = false;
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


window.addEventListener("DOMContentLoaded", () => {
  if (storedLocation) {
      const lastSearchedLocation = JSON.parse(storedLocation);
      const { lat, lon } = lastSearchedLocation;
      updateWeather(`lat=${lat}`, `lon=${lon}`);
  } else {
      updateWeather(`lat=${defaultLocation.lat}`, `lon=${defaultLocation.lon}`);
  }
});

// 

// SEARCH INTEGRATION

function toggleSearch(){
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
  const existingTags = Array.from(locationsTagsContainer.querySelectorAll('.location-name')).map(tag => tag.textContent.trim());


  if (existingTags.includes(name)) {
    alert('Location already added.');
    return;
  }

  const tag = document.createElement("div");
  tag.classList.add("tag");
  tag.innerHTML = `
    <span class="location-name">${name}</span>
    <span class="remove-tag">&times;</span>
  `;

  tag.querySelector(".remove-tag").addEventListener("click", function () {
    locationsTagsContainer.removeChild(tag);
  });

  locationsTagsContainer.appendChild(tag);
}

//


//CAROUSEL HANDLERS 

function updateCarousel(index){
    document.querySelector('.indicator.active').classList.remove('active');
    indicators[index % indicators.length].classList.add('active');
    
    carouselInner.style.transition = `transform ${transitionDuration}ms ease`;
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
};

function nextSlide(){
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

function goToSlide(index){
    currentIndex = index;
    updateCarousel(currentIndex);
};

indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        goToSlide(index);
    });
});

setInterval(nextSlide, interval);
//

// MAIN FUNCTION

function updateWeather(lat, lon) {
  loading.style.display = "grid";
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");
  footerElement.display = "none";

  currentWeatherSection.innerHTML = "";
  highlightSection.innerHTML = "";
  hourlySection.innerHTML = "";
  forecastSection.innerHTML = "";
  

  fetchData(url.reverseGeo(lat, lon), function ([{ name }]) {
    fetchImage(url.locationimage(name), function(object) {
      const imageUrl = object.results[0].urls.regular;
      const locationImageElement = document.createElement("img");
      locationImageElement.classList.add("location-image");
      locationImageElement.src = imageUrl;
      locationImageElement.alt = `${name}`;

      locationImageElement.onload = function() {
        fetchData(url.currentWeather(lat, lon), function (currentWeather) {
          const {
            weather,
            dt: dateUnix,
            sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
            main: { temp, feels_like, pressure, humidity },
            visibility,
            timezone
          } = currentWeather;

          const [{ description, icon }] = weather;

          const card = document.createElement("div");
          card.classList.add("card", "card-lg", "current-weather-card");

          card.innerHTML = `
            <h2>${module.getDate(dateUnix, timezone)}</h2>
            <img class="location-image">
            <div class="wrapper">
              <div class="location-wrapper">
                <span class="material-symbols-rounded">location_on</span>
                <p data-location>${name}</p>
              </div>
              <div class="weather-wrapper">
                <img src="./assets/images/weather_icons/${icon}.svg" alt="${description}" class="weather-icon">
                <p>${parseInt(temp)}&deg;<sup>c</sup></p>
              </div>
            </div>
          `;
          card.querySelector(".location-image").replaceWith(locationImageElement);
          currentWeatherSection.appendChild(card);
        

        fetchData(url.airPollution(lat, lon), function (airPollution) {
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
      });

        fetchData(url.forecast(lat, lon), function (forecast) {
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

          forecastList.slice(0, 8).forEach(data => {
            const {
              dt: dateTimeUnix,
              main: { temp },
              weather,
              wind: { deg: windDirection, speed: windSpeed }
            } = data;
            const [{ icon, description }] = weather;

            const tempLi = document.createElement("li");
            tempLi.classList.add("slider-item");
            tempLi.innerHTML = `
              <div class="card card-sm slider-card">
                <p>${module.getHours(dateTimeUnix, timezone)}</p>
                <img src="./assets/images/weather_icons/${icon}.svg" width="48" height="48" loading="lazy" alt="${description}" class="weather-icon" title="${description}">
                <p>${parseInt(temp)}&deg;</p>
              </div>
            `;
            hourlySection.querySelector("[data-temp]").appendChild(tempLi);

            const windLi = document.createElement("li");
            windLi.classList.add("slider-item");
            windLi.innerHTML = `
              <div class="card card-sm slider-card">
                <p>${module.getHours(dateTimeUnix, timezone)}</p>
                <img src="./assets/images/weather_icons/direction.svg" width="48" height="48" loading="lazy" alt="direction" class="weather-icon" style="transform: rotate(${windDirection - 225}deg)">
                <p>${parseInt(module.mps_to_kmh(windSpeed))} km/h</p>
              </div>
            `;
            hourlySection.querySelector("[data-wind]").appendChild(windLi);
          });

          forecastSection.innerHTML = `
            <div class="card card-lg forecast-card">
              <h2>Weather for 5 days</h2>
              <ul data-forecast-list></ul>
            </div>
          `;

          for (let i = 7; i < forecastList.length; i += 8) {
            const {
              main: { temp_max },
              weather,
              dt_txt
            } = forecastList[i];
            const [{ icon, description }] = weather;
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
                <img src="./assets/images/weather_icons/${icon}.svg" width="36" height="36" alt="${description}" class="weather-icon" title="${description}">
              </div>
            `;
            forecastSection.querySelector("[data-forecast-list]").appendChild(li);
          }

          loading.style.display = "none";
          container.style.overflowY = "overlay";
          container.classList.add("fade-in");
          footerElement.display = "flex";
        });
      };
    });
  });
};

//

// FORM VALIDATION

function validateForm() {
  let isValid = true;
  const userName = document.getElementById('user-name').value.trim();
  const userEmail = document.getElementById('user-email').value.trim();
  const frequency = document.querySelector('input[name="Frequency"]:checked');
  const dayOfWeek = document.getElementById('DayOfWeek').value;
  const timeOfDay = document.getElementById('TimeOfDay').value;
  const locationTags = Array.from(document.querySelectorAll('.locations-tags-container .tag .location-name')).map(tag => tag.textContent.trim());
  const weatherElements = Array.from(document.querySelectorAll('input[name="WeatherElements"]:checked'))
  .map(el => el.value);

  if (!validateName(userName)) {
    isValid = false;
    document.getElementById('name-error').textContent = "Name is required and must be valid.";
    document.getElementById('name-error').style.display = 'block';
  } else {
    document.getElementById('name-error').style.display = 'none';
  }

  if (userEmail === "") {
    isValid = false;
    document.getElementById('email-error').textContent = "Email is required.";
    document.getElementById('email-error').style.display = 'block';
  } else if (!validateEmail(userEmail)) {
    isValid = false;
    document.getElementById('email-error').textContent = "Invalid email format.";
    document.getElementById('email-error').style.display = 'block';
  } else {
    document.getElementById('email-error').style.display = 'none';
  }

  if (!frequency) {
    isValid = false;
    document.getElementById('frequency-error').textContent = "Frequency is required.";
    document.getElementById('frequency-error').style.display = 'block';
  } else {
    document.getElementById('frequency-error').style.display = 'none';
  }

  if (locationTags.length === 0) {
    isValid = false;
    document.getElementById('locations-error').textContent = "At least one location is required.";
    document.getElementById('locations-error').style.display = 'block';
  } else {
    document.getElementById('locations-error').style.display = 'none';
  }

  if (weatherElements.length === 0) {
    isValid = false;
    document.getElementById('weatherelements-error').textContent = "At least one weather element is required.";
    document.getElementById('weatherelements-error').style.display = 'block';
  } else {
    document.getElementById('weatherelements-error').style.display = 'none';
  }

  if (isValid) {
    let confirmationMessage = `
      Please confirm your subscription details:
      Name: ${userName}
      Email: ${userEmail}
      Frequency: ${frequency.value}
      Time of Day: ${timeOfDay}
      Locations: ${locationTags.join(', ')}
      Weather Elements: ${weatherElements.join(', ')}
    `;

    if (frequency.value !== 'Daily') {
      confirmationMessage += `Day of the Week: ${dayOfWeek}`;
    }

    if (confirm(confirmationMessage)) {
      sessionStorage.setItem('subscriptionDetails', JSON.stringify({
        userName,
        userEmail,
        frequency: frequency.value,
        dayOfWeek: frequency.value !== 'Daily' ? dayOfWeek : null,
        timeOfDay,
        locationTags,
        weatherElements
      }));
      alert('Subscription confirmed!');
    }
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateName(name) {
  const re = /^[a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ]+$/;
  return re.test(name);
}

function toggleDayOfWeekSelect() {
  const everydayOption = document.querySelector('#DayOfWeek option[value="Everyday"]');
  if (dailyRadio.checked) {
    if (!everydayOption) {
      const newEverydayOption = document.createElement('option');
      newEverydayOption.value = 'Everyday';
      newEverydayOption.textContent = 'Everyday';
      dayOfWeekSelect.appendChild(newEverydayOption);
    }
    dayOfWeekSelect.value = 'Everyday';
    dayOfWeekSelect.disabled = true;
  } else {
    if (everydayOption) {
      dayOfWeekSelect.removeChild(everydayOption);
    }
    dayOfWeekSelect.disabled = false;
    dayOfWeekSelect.value = "Monday";
  }
}

//


