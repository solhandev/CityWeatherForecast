const express = require('express');
const app = express();
const path = require('path');
const htmlDir = path.join(__dirname, '/html');
const request = require('request');
const apiKey = 'a94ace9be7994ce0beb8b5e27cefcd7b';

app.get('/city/:name/:unit', async (req, res) => {
	let city = req.params.name;
	let unitType = req.params.unit;
	var temperatureUnit;
	var speedUnit;
	if (unitType == "imperial"){
		temperatureUnit = " °F";
		speedUnit = " mph";
	} else {
		temperatureUnit = " °C";
		speedUnit = " m/s";
	}
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unitType}&appid=${apiKey}`
	let urlToday = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unitType}&appid=${apiKey}`;
	const allBodies = await Promise.all([
			  promiseRequest(urlToday),
			  promiseRequest(urlForecast)
	]);
	let todayWeatherData = JSON.parse(allBodies[0]);
    let forecastWeatherData = JSON.parse(allBodies[1]);
    console.log(forecastWeatherData);
    if (todayWeatherData.cod != "200" || forecastWeatherData .cod != "200") {
        res.sendStatus(404);
        return;
	}
	var cityName = todayWeatherData.name + ", " + todayWeatherData.sys.country;
	var todayDescription = todayWeatherData.weather[0].description;
	var todayIconAddress = `http://openweathermap.org/img/wn/${todayWeatherData.weather[0].icon}@2x.png`;
    var todayTemperature = todayWeatherData.main.temp + temperatureUnit;
	var todayFeelsLike = todayWeatherData.main.feels_like + temperatureUnit;
	var todayMin = todayWeatherData.main.temp_min + temperatureUnit;
    var todayMax = todayWeatherData.main.temp_max + temperatureUnit;
	var todayHumidity = todayWeatherData.main.humidity + "%";
    var todayWindDirection = convertDegreesToCompass(todayWeatherData.wind.deg);
    var todayWindSpeed = todayWeatherData.wind.speed + speedUnit;
	var localTimeOffset = (todayWeatherData.timezone)/3600;
	// will already have "-" if negative
	var plusOrMinus = "";
    if (localTimeOffset >= 0) {
		plusOrMinus = "+";
	}
	var today = new Date();
	today.setHours(today.getHours() + localTimeOffset);
	var utcDate = today.getUTCDate();
	var utcDateTime = today.toUTCString();
	var asOfTime = utcDateTime + plusOrMinus + localTimeOffset;
	
	let forecastList = forecastWeatherData.list;
	var forecastToReturn = {};
	var forecastByUtcDate = {};
	for (let i = 0; i < forecastList.length; i++) {
		var forecastDescription = forecastList[i].weather[0].description;
		var iconAddress = `http://openweathermap.org/img/wn/${forecastList[i].weather[0].icon}@2x.png`;
		var forecastTemperature = forecastList[i].main.temp;
		var forecastFeelsLike = forecastList[i].main.feels_like;
		var forecastHumidity = forecastList[i].main.humidity;
		var dtMilliseconds = forecastList[i].dt*1000;
		// day or night
		var partOfDay = forecastList[i].sys.pod;
		var forecastWindSpeed = forecastList[i].wind.speed;
		// degrees (0-360)
		var forecastWindDirection = forecastList[i].wind.deg;
		var forecastPOP = forecastList[i].pop;
		var forecastDateTime = convertUnixTimeToCityLocalTime(dtMilliseconds, localTimeOffset);		
		var hour = forecastDateTime.getUTCHours();
		var month = forecastDateTime.getUTCMonth();
		var dayOfTheWeek = forecastDateTime.getUTCDay();
		var hourString = hour.toString();
		var utcForecastDate = forecastDateTime.getUTCDate();
		var utcForecastDateString = utcForecastDate.toString();
		// check if key exists, initialize if it does not
		if (!(utcForecastDateString in forecastByUtcDate)) {
			forecastByUtcDate[utcForecastDateString] = {
				"month": month,
                "dayOfTheWeek": dayOfTheWeek,
				"day": {},
				"night": {},
				"high": forecastTemperature,
				"low": forecastTemperature
			}
			if (partOfDay == "d") {
				forecastByUtcDate[utcForecastDateString]["day"] = {
					"description": forecastDescription,
					"iconAddress": iconAddress,
					"temperatureSum": forecastList[i].main.temp,
					"feelsLikeSum": forecastFeelsLike,
					"humiditySum": forecastHumidity,
					"windSum": forecastWindSpeed,
					"windDirectionSum": forecastWindDirection,
					"popSum": forecastPOP,
					"count": 1	
				};
				forecastByUtcDate[utcForecastDateString]["night"] = {
					"description": forecastDescription,
					"iconAddress": iconAddress,
					"temperatureSum": 0,
					"feelsLikeSum": 0,
					"humiditySum": 0,
					"windSum": 0,
					"windDirectionSum": 0,
					"popSum": 0,
					"count": 0	
				};
			} else {
				forecastByUtcDate[utcForecastDateString]["night"] = {
					"description": forecastDescription,
					"iconAddress": iconAddress,
					"temperatureSum": forecastList[i].main.temp,
					"feelsLikeSum": forecastFeelsLike,
					"humiditySum": forecastHumidity,
					"windSum": forecastWindSpeed,
					"windDirectionSum": forecastWindDirection,
					"popSum": forecastPOP,
					"count": 1	
				};
				forecastByUtcDate[utcForecastDateString]["day"] = {
					"description": forecastDescription,
					"iconAddress": iconAddress,
					"temperatureSum": 0,
					"feelsLikeSum": 0,
					"humiditySum": 0,
					"windSum": 0,
					"windDirectionSum": 0,
					"popSum": 0,
					"count": 0	
				};
			}
	    // e.g. date = 20th, hour = 10 (daytime)
		} else {
			forecastByUtcDate[utcForecastDateString]["high"] = Math.max(forecastByUtcDate[utcForecastDateString]["high"], forecastTemperature);
			forecastByUtcDate[utcForecastDateString]["low"] = Math.min(forecastByUtcDate[utcForecastDateString]["low"], forecastTemperature);
			if (partOfDay == "d") {
				// use a timestamp from 10 - 14 as the description
				if (hour < 14 && hour > 10) {
					forecastByUtcDate[utcForecastDateString]["day"]["description"] = forecastDescription;
					forecastByUtcDate[utcForecastDateString]["day"]["iconAddress"] = iconAddress;
				}					
				forecastByUtcDate[utcForecastDateString]["day"]["temperatureSum"] += forecastTemperature;
				forecastByUtcDate[utcForecastDateString]["day"]["feelsLikeSum"] += forecastFeelsLike;
				forecastByUtcDate[utcForecastDateString]["day"]["humiditySum"] += forecastHumidity;
				forecastByUtcDate[utcForecastDateString]["day"]["windSum"] += forecastWindSpeed;
				forecastByUtcDate[utcForecastDateString]["day"]["windDirectionSum"] += forecastWindDirection;
				forecastByUtcDate[utcForecastDateString]["day"]["popSum"] += forecastPOP;
				forecastByUtcDate[utcForecastDateString]["day"]["count"] += 1;
			} else {
				// use a timestamp from 00 - 03 as the description
				if (hour <= 3) {
					forecastByUtcDate[utcForecastDateString]["day"]["description"] = forecastDescription;
					forecastByUtcDate[utcForecastDateString]["day"]["iconAddress"] = iconAddress;
				}
				forecastByUtcDate[utcForecastDateString]["night"]["temperatureSum"] += forecastTemperature;
				forecastByUtcDate[utcForecastDateString]["night"]["feelsLikeSum"] += forecastFeelsLike;
				forecastByUtcDate[utcForecastDateString]["night"]["humiditySum"] += forecastHumidity;
				forecastByUtcDate[utcForecastDateString]["night"]["windSum"] += forecastWindSpeed;
				forecastByUtcDate[utcForecastDateString]["night"]["windDirectionSum"] += forecastWindDirection;
				forecastByUtcDate[utcForecastDateString]["night"]["popSum"] += forecastPOP;
				forecastByUtcDate[utcForecastDateString]["night"]["count"] += 1;
			}
			
		}

		var utcForecastDateTime = forecastDateTime.toUTCString();
		var forecastAsOfTime = utcForecastDateTime + plusOrMinus + localTimeOffset;
	}
	
	Object.keys(forecastByUtcDate).forEach(key => {
		  var dayCount = forecastByUtcDate[key]["day"]["count"];
		  var nightCount = forecastByUtcDate[key]["night"]["count"];
          convertDegreesToCompass(forecastByUtcDate[key]["day"]["windDirectionSum"]/dayCount);
		  var compassDayWindDirectionAverage = convertDegreesToCompass(forecastByUtcDate[key]["day"]["windDirectionSum"]/dayCount);
		  var compassNightWindDirectionAverage = convertDegreesToCompass(forecastByUtcDate[key]["night"]["windDirectionSum"]/nightCount);
		  forecastToReturn[key] = {
			  "month": months[forecastByUtcDate[key]["month"]],
			  "dayOfTheWeek": days[forecastByUtcDate[key]["dayOfTheWeek"]] + ", ",
			  "high": roundToTwoDecimals(forecastByUtcDate[key]["high"]) + temperatureUnit,
			  "low": roundToTwoDecimals(forecastByUtcDate[key]["low"]) + temperatureUnit,
			  "day": {
				  "description": forecastByUtcDate[key]["day"]["description"],
				  "iconAddress": forecastByUtcDate[key]["day"]["iconAddress"],
				  "averageTemperature": roundToTwoDecimals(forecastByUtcDate[key]["day"]["temperatureSum"]/dayCount) + temperatureUnit,
				  "averageFeelsLike": roundToTwoDecimals(forecastByUtcDate[key]["day"]["feelsLikeSum"]/dayCount) + temperatureUnit,
				  "averageHumidity": roundToTwoDecimals(forecastByUtcDate[key]["day"]["humiditySum"]/dayCount) + "%",
				  "averageWindSpeed": roundToTwoDecimals(forecastByUtcDate[key]["day"]["windSum"]/dayCount) + speedUnit,
				  "averagePOP": roundToTwoDecimals(forecastByUtcDate[key]["day"]["popSum"]/dayCount * 100) + "%",
				  "averageWindDirection": compassDayWindDirectionAverage
			  },
			  "night": {
				  "description": forecastByUtcDate[key]["night"]["description"],
				  "iconAddress": forecastByUtcDate[key]["night"]["iconAddress"],
				  "averageTemperature": roundToTwoDecimals(forecastByUtcDate[key]["night"]["temperatureSum"]/nightCount) + temperatureUnit,
				  "averageFeelsLike": roundToTwoDecimals(forecastByUtcDate[key]["night"]["feelsLikeSum"]/nightCount) + temperatureUnit,
				  "averageHumidity": roundToTwoDecimals(forecastByUtcDate[key]["night"]["humiditySum"]/nightCount) + "%",
				  "averageWindSpeed": roundToTwoDecimals(forecastByUtcDate[key]["night"]["windSum"]/nightCount) + speedUnit,
				  "averagePOP": roundToTwoDecimals(forecastByUtcDate[key]["night"]["popSum"]/nightCount * 100) + "%",
				  "averageWindDirection": compassNightWindDirectionAverage
			  }
			  
		  }
		  if(dayCount == 0) {
			  forecastToReturn[key].day = "N/A";
		  }
		});
	
	res.send({ 
	           name: cityName,
			   current: {
					tDescription: todayDescription,
				    tIconAddress: todayIconAddress,
					tTemperature: todayTemperature,
					tFeelsLike: todayFeelsLike,
					tMin: todayMin,
					tMax: todayMax,
					tHumidity: todayHumidity,
                    tWindDirection: todayWindDirection,
                    tWindSpeed: todayWindSpeed,
					tAsOf: asOfTime
			   },
			   forecast: forecastToReturn
	});
});

const http = require('http');
const PORT = 5000;

function promiseRequest(url) {
  return new Promise(resolve => {
    request(url, function(err, response, body) {
      resolve(body);
    });
  });
}
function roundToTwoDecimals(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

function convertDegreesToCompass(degrees) {
    let compassDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    return compassDirections[(degrees / 22.5).toFixed(0)];
}

const convertUnixTimeToCityLocalTime = (milliseconds, localOffset) => {
	var forecastDateTime = new Date(milliseconds);
	forecastDateTime.setHours(forecastDateTime.getHours() + localOffset);
	return forecastDateTime;
}

http.createServer(app).listen(PORT, function (err) {
	if (err) console.log(err);
	else console.log("HTTP server on http://localhost:%s", PORT);
});
