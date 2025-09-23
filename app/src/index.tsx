import React from 'react';
import ReactDOM from 'react-dom';
import { Model } from './model/model';
import './index.css';

const App = () => (
    <React.Fragment>
        <div className="app-header">
            <h1 className="app-title">Feature Identification</h1>
            <p className="app-subtitle">Pocket Detection System</p>
        </div>
        <Model />
    </React.Fragment>
);

ReactDOM.render(
    <App />,
    document.getElementById('root')
);