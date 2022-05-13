import React, { Component } from 'react';
import {
    BrowserRouter as Router, 
    Routes,
    Route,
    Link,
	useParams
} from 'react-router-dom';

function WeatherComponent(props) {
	const { name } = useParams();
	var days = Object.keys(props.forecast);
	let rows = [];
	/* - for some reason puts the next months days before the previous month's
	   - e.g. May 1 before April
	   - >= 27 because february ends on 28th */
	var index = 0;
	if (days[days.length - 1] >= 27) {
		for (let i = 0; i < days.length; i++) {
			// stop when we get to April 2Xth to get the index
			if (days[i] > 20) {
				index = i;
				break;
			}
		}
	}
	// start from the previous month's day (e.g. April)
	for (let j = index; j < days.length; j++) {
		rows.push(<WeatherRowComponent day={days[j]} data={props.forecast[days[j]]} />);
	}
	// then push the days of the next month (e.g. May)
	for (let k = 0; k < index; k++){
		rows.push(<WeatherRowComponent day={days[k]} data={props.forecast[days[k]]} />);
	}
		
	// current weather
	return (
			<div id="WeatherContainer" className="cardStyleContainer">
                <div className="cardStyleContainer subtitle">City: {props.cityName}</div>
                <div id="currentWeatherContainer" className="cardStyleContainer">
                    <div id="WeatherTodayTitle1">Current {props.cityName} weather as of:</div>
                    <div id="WeatherTodayTitle2">{props.current.tAsOf}</div>
                    <div id="currentUpper">
                        <div><img src={props.current.tIconAddress} alt="icon"/></div>
                        <div id="WeatherTodayTemperature">{props.current.tTemperature}</div>
                    </div>
                        <div id="WeatherTodayDescription">{props.current.tDescription}</div>
                    <div id="currentLower">
                            <div className="currentLowerColumn">
                                <div id="WeatherTodayFeelsLike">Feels Like: {props.current.tFeelsLike}</div>
                                <div id="WeatherTodayMax">City Max: {props.current.tMax}</div>
                                <div id="WeatherTodayMin">City Min: {props.current.tMin}</div>
                            </div>
                            <div className="currentLowerColumn">
                                <div id="WeatherTodayHumidity">Humidity: {props.current.tHumidity}</div>
                                <div>Wind: {props.current.tWindDirection} {props.current.tWindSpeed}</div>
                            </div>
                    </div>
                </div>
				<div id="forecastCountryTitle" className="cardStyleContainer"> Weather forecast: {props.cityName}</div>
				<div id="WeatherForecastCardArea">
					<div className="WeatherCard" ></div>
					<div>{rows}</div>
				</div>
			</div>
	);
}

function WeatherRowComponent(props) {
	if (props.data.day == "N/A") {
		return (
		<div className="weatherRowOuterContainer" className="cardStyleContainer">
			<div className="dateContainer">{props.data.dayOfTheWeek} {props.data.month} {props.day} </div>
			<div className="dayNightContainer">
				<div className="titleAndImage">
					<div className="dayNightTitle">Night | {props.data.night.description}</div>
					<div><img className="descriptionImage" src={props.data.night.iconAddress} alt="icon"/></div>
				</div>
				<div className="informationBox">
					<div className="nightTemperature">Average: {props.data.night.averageTemperature}</div>
					<div className="nightFeelsLike">Feels Like: {props.data.night.averageFeelsLike}</div>
				</div>
				<div className="informationBox">
					<div className="nightHumidity">Humidity: {props.data.night.averageHumidity}</div>
					<div className="nightPOP">Precipitation: {props.data.night.averagePOP}</div>
					<div className="nightWind">Wind: {props.data.night.averageWindDirection} {props.data.night.averageWindSpeed}</div>
				</div>
			</div>
		</div>
		);
	} else {
		return (
			<div className="weatherRowOuterContainer" className="cardStyleContainer">
				<div className="dateContainer">{props.data.dayOfTheWeek} {props.data.month} {props.day} </div>
				<div className="overallContainer">Daily High: {props.data.high} | Daily Low: {props.data.low}</div>
				<div className="dayNightRow">
					<div className="dayNightContainer">
					    <div className="titleAndImage">
							<div className="dayNightTitle">Day | {props.data.day.description}</div>
							<div><img className="descriptionImage" src={props.data.day.iconAddress} alt="icon"/></div>
						</div>
						<div className="informationBox">
							
							<div className="temperature">Average: {props.data.day.averageTemperature}</div>
							<div className="dayFeelsLike">Feels Like: {props.data.day.averageFeelsLike}</div>
						</div>
						<div className="informationBox">
							<div className="dayHumidity">Humidity: {props.data.day.averageHumidity}</div>
							<div className="dayPOP">Precipitation: {props.data.day.averagePOP}</div>
							<div className="dayWind">Wind: {props.data.day.averageWindDirection} {props.data.day.averageWindSpeed}</div>
						</div>
					</div>
					<div className="dayNightContainer">
						<div className="titleAndImage">
							<div className="dayNightTitle">Night | {props.data.night.description}</div>
							<div><img className="descriptionImage" src={props.data.night.iconAddress} alt="icon"/></div>
						</div>
						<div className="informationBox">
							<div className="nightTemperature">Average: {props.data.night.averageTemperature}</div>
							<div className="nightFeelsLike">Feels Like: {props.data.night.averageFeelsLike}</div>
						</div>
						<div className="informationBox">
							<div className="nightHumidity">Humidity: {props.data.night.averageHumidity}</div>
							<div className="nightPOP">Precipitation: {props.data.night.averagePOP}</div>
							<div className="nightWind">Wind: {props.data.night.averageWindDirection} {props.data.night.averageWindSpeed}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default WeatherComponent;