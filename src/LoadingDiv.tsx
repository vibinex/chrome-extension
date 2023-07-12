import exp from "constants";
import React from "react";

const LoadingDiv: React.FC<{}> = () => {
    return (
        <div id="loading-div" className="container">
			<div className="loader" />
		</div>
    );
};

export default LoadingDiv;