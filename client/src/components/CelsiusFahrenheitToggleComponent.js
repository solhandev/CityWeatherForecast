import React, { Component } from 'react';

import './CelsiusFahrenheitToggle.css';

const CelsiusFahrenheitToggleComponent = (props) => (
	    <label className="switch">
			<input type="checkbox" checked={props.checked} onChange={e => props.onChange(e.target.checked)}/>
			<div className="slider">
				<span className="celsius">Metric</span>
				<span className="fahrenheit">Imperial</span>
			</div>
		</label>
);	

export default CelsiusFahrenheitToggleComponent;


