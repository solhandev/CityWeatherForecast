import React, { Component } from 'react';

function ErrorComponent(props) {
	return (
        <div className="cardStyleContainer subtitle">{props.error}</div>
    )
}
export default ErrorComponent;