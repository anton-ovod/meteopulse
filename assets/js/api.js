const api_key = "308d1f68b5ffa67c12a39043acbb6042";
const unsplash_key = "6HO3GiR7BkeYklfpOdcHAQelYMm-3dcpwnQogPmBYao";

export const fetchData = function (URL, callback) {
  fetch(`${URL}&appid=${api_key}`)
    .then(res => res.json())
    .then(data => callback(data))
    .catch(error => console.error(error));
}

export const fetchImage = function(URL, callback){
  fetch(`${URL}&client_id=${unsplash_key}`)
  .then(res => res.json())
  .then(data => callback(data))
  .catch(error => console.error(error));
}

export const url = {
  currentWeather(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`
  },
  forecast(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`
  },
  airPollution(lat, lon) {
    return `http://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`
  },
  reverseGeo(lat, lon) {
    return `http://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`
  },
  geo(query) {
    return `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`
  },
  locationimage(query){
    return `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&`
  }
}