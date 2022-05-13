Table of Contents:
1. Setting up
2. Features
3. Known Issues


1. Setting up:
You will need:
	-module (version I used)-
	npm (8.8.0),
	node.js (16.15.0)
	internet connection
      browser (google chrome)
	two terminals (Windows terminal)
Set up steps:
	a) unzip the project files to directory x
      b) in terminal 1: cd to x/WeatherApp/client
		- this terminal will be for the client/frontend
	c) run this command: npm install
		- this will install needed dependencies for the client
	d) in terminal 2: cd to x/WeatherApp
		- here you will see the server.js file 
	e) run this command: npm install
		- this will install needed dependencies for the server/backend (separately)
      f) run this command: node server.js
		- starts the server/backend
		- you should see "HTTP server on http://localhost:5000"
	g) back to terminal 1: run this command: npm start
		- starts the client/frontend
            - it should automatically open localhost:3000 on your browser
		- at this point you should see Toronto weather landing page
      
2. Features
	- written in React.js + Express.js
      - backend is a REST api (although only one GET route)
	- does not use a database layer (no data persistence)
      - backend fetches data from OpenWeatherMapAPI and parses/formats
      - frontend populates using functional react components
	- reactive design using CSS media queries (displays well on most resolutions, smartphone -> desktop)
      - metric/imperial conversion (C to F and m/s to mph)
      - current weather data at the top (City Max/Min refers to the max/min temparature in the city, not to be confused with daily high/low).
      - 5 day forecast below current data, separated into Day and Night, along with a daily high/low
	- all dates/times are in the city's LOCAL time e.g. San Francisco will display 20:00 and Toronto will display 23:00
      - routing can be done directly using url e.g. localhost:3000/city/toronto
      - error handling if the user enters an invalid path, or the city is not tracked by the API

3. Known Issues:
	- since data points are pulled in at 3 hour intervals, the last day of the forecast list may display the same values for averages
        and the daily high/low because there may be only a single data point
	- sometimes data points for the daytime will come from the API as null, in this case, the Day section is simply not displayed