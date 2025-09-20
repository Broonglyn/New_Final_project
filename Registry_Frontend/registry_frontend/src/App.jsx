import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Adjust the path as needed
import AppWrapper from './AppWrapper'; // Your main app component
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppWrapper />
            </AuthProvider>
        </Router>
    );
}

export default App;