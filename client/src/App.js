
import React, { Component, useState, useRef, useEffect } from 'react';
import {
    BrowserRouter as Router, 
    Routes,
    Route,
    Link,
	Navigate,
	useNavigate,
	useParams
} from 'react-router-dom';

import WeatherComponent from './components/WeatherComponent';
import logo from './logo.svg';
import './App.css';
import CelsiusFahrenheitToggleComponent from './components/CelsiusFahrenheitToggleComponent';
import ErrorComponent from './components/ErrorComponent';


function Root(props){
	
const [cityName, setName] = useState('');
const [current, setCurrent] = useState({});
const [forecast, setForecast] = useState({});
// true = metric, false = imperial
const [cOrF, setUnit] = useState(true);
const formInput = useRef(null);
const navigate = useNavigate();
const [ready, setReady] = useState(true);
  

  
  const handleSubmit = async event => {
	  event.preventDefault();
	  var res = await getCityForecast(formInput.current.value);
	  await setName( res.name );
      await cleanState();
      await setCurrent(current => ({...current, ...res.current }));
	  await setForecast(forecast => ({...forecast, ...res.forecast }));
	  setReady(true);
	  navigate("/city/" + res.name);
      
  }
    // Used in useEffect() after a user submits a new URL (and triggers a render)
	// GET requests for the city with name as URL parameter ":name" if the URL matches "/city/:name"
	const handleExternalRouting = async (path) => {
		var cityUrlName = "toronto";
		if (path != "/") {
			const urlTerms = path.split("/");
			// this condition suffices for the purposes of this assignment
			if (urlTerms.length != 3) {
                await setName( "Sorry, that is an invalid URL. e.g. Try localhost:3000/city/toronto" );
                await cleanState();
                setReady(true);
                navigate("/error");
				return;
			}
			if (urlTerms[1] != "city") {
                await setName( "Sorry, that is an invalid URL. e.g. Try localhost:3000/city/toronto" );
                await cleanState();
                setReady(true);
                navigate("/error");
				return;
			}
			cityUrlName = urlTerms[2];
		}
		var res = await getCityForecast(cityUrlName);
		await setName( res.name );
        cleanState();
		await setCurrent(current => ({...current, ...res.current }));
		await setForecast(forecast => ({...forecast, ...res.forecast }));
		setReady(true);
	}	
	// Called after every render(), (when a new URL is submitted)
	// Also listens to cOrF state change (by the toggle)
	useEffect(() => {
		setReady(false);
		handleExternalRouting(window.location.pathname);
	}, [cOrF]);
	
	
	const cleanState = async () => {
        await setCurrent({});
        await setForecast({});
    };

  const getCityForecast = async (city) => {
	var unitType;
	if (cOrF) {
		// C
		unitType = "metric";
	} else {
		// F
		unitType = "imperial";
	}
	
	const response = await fetch(`/city/${city}/` + unitType);
	
    if (response.status !== 200) {
        await setName( "Sorry, we could not find that city." );
        await cleanState();
        setReady(true);
        navigate("/error");
    }
    
    const body = await response.json();

    
    return body;
  };
  
    return (
        	
			<div id="rootBody">
				<div className="App-header">
					<div id="title">City Weather Forecast</div>
					<form id="searchForm" onSubmit={handleSubmit}>
							<input id="searchBox" type="text" name="name" placeholder="Search by City" ref={formInput} />
							<button id="searchButton" type="submit"><img src={require("./assets/searchIcon.png")}/></button>
					</form>
					<CelsiusFahrenheitToggleComponent  id="toggleSwitch" checked={cOrF} onChange={setUnit} />
				</div>
				<div id="appBody">
					{ ready && 
					<Routes>
						<Route
							 path="/"
							 element={<WeatherComponent cityName={cityName} current={current} forecast={forecast}/>}></Route>
						
						<Route path='/city/:name' element={<WeatherComponent cityName={cityName} current={current} forecast={forecast}/>}></Route>
                        <Route path='/error' element={<ErrorComponent error={cityName}/>}></Route>
					 </Routes>
					}
				</div>
			</div> 
			
			
	
    );
}

function App() {
  return (
    <Router>
      <Root />
    </Router>
  );
}


export default App;
