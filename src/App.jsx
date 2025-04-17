import { useState } from 'react';
import axios from 'axios';
import './App.css';



function App() {
    
    const [location , setLocation] = useState('');
    const [date, setDate] = useState('');
    const [interest, setInterest] = useState('');
    const [weather, setWeather] = useState(null);
    const [activities, setActivites] = useState([]);
    const [loading, setLoading] = useState(false);
    
    {/* Fetches lat and lon values using location input */}
    const fetchLatLon = async () => {
        
        if (!location) {
            alert('Location is required');
            return;
        }
        if (!date) {
            alert('Date is required');
            return;
        }
        try {
          const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`);
          const result = res.data.results?.[0];
          if (result) {
            const { latitude, longitude } = result;
            await fetchWeather(latitude, longitude, date);
            await fetchEventData(latitude, longitude);
          }
        } catch (error) {
          console.error('Error fetching location data:', error);
        }
      };
      {/* Fetches weather data using lat and lon values */}
      const fetchWeather = async (lat, lon, date) => {
        if (!lat || !lon) {
          console.error('Missing lat/lon for weather fetch');
          return;
        }
      
        try {
          const res = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
            params: {
              latitude: lat,
              longitude: lon,
              daily: ['precipitation_sum', 'temperature_2m_max', 'temperature_2m_min'],
              timezone: 'auto',
              temperature_unit: 'fahrenheit',
              precipitation_unit: 'inch',
              start_date: date,
                end_date: date,
            },
          });
      
          const weatherData = {
            tempMax: res.data.daily?.temperature_2m_max?.[0],
            tempMin: res.data.daily?.temperature_2m_min?.[0],
            precipitation: res.data.daily?.precipitation_sum?.[0],
          };
      
          setWeather(weatherData);
        } catch (error) {
          console.error('Error fetching weather data:', error.response?.data || error.message);
        }
      };
      {/* Fetches events near area using lat and lon values */}
   const fetchEventData = async (lat, lon) => {
    try{
        setLoading(true);
        const res = await axios.get ('https://api.opentripmap.com/0.1/en/places/radius',{
            params: {
               radius: 10000,
                 lon,
                 lat,
                rate: 2,
                format: 'json',
                apikey: '5ae2e3f221c38a28845f05b64d431d271f877cdbec98ef626a0d3687' 
            },
        });
        const filteredActivities = res.data.filter((item) => {
            const kinds = item.kinds || '';
            if (interest === 'outdoor') return kinds.includes('natural');
            if (interest === 'music') return kinds.includes('music');
            if (interest === 'food') return kinds.includes('foods');
            if (interest === 'art') return kinds.includes('museums');
            return true;
          });
        setActivites(filteredActivities.slice(0, 5));
        
    }
    catch (error) {
        console.error('Error fetching event data:', error);
    } finally {
        setLoading(false);
    }
   }

   return (
    <>
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" >

        <div className="overlay text-center">
          <header className="mb-5">
            <h1 className="fw-bold">Adventure Day Planner</h1>
            <p className="lead">Plan your perfect day based on weather and interests!</p>
          </header>
  
          {/* Form Section */}
          {!weather && !loading && (
            <div className="card shadow p-5">
              <h2 className="card-title mb-4">Enter Your Preferences</h2>
              <p className="card-text mb-4">
                Enter your location, date, and interests to get personalized recommendations.
              </p>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter location (e.g., San Diego)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="input-group mb-3">
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  min = {new Date().toISOString().split('T')[0]}
                  max = {new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="input-group mb-3">
                <select
                  className="form-select"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                >
                  <option value="">Select an interest</option>
                  <option value="outdoor">Outdoor Activities</option>
                  <option value="music">Live Music</option>
                  <option value="food">Food & Drink</option>
                  <option value="art">Art & Museums</option>
                </select>
              </div>
  
              <button className="btn btn-primary w-100 mt-3" onClick={fetchLatLon}>
                Plan My Day
              </button>
            </div>
          )}
  
          {/* Loading Section */}
          {loading && (
            <div className="card shadow p-5">
              <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <p className="mt-3">Loading your adventure...</p>
            </div>
          )}
  
          {/* Results Section */}
          {weather && !loading && (
            <div className="card shadow p-5">
              <h2 className="card-title mb-4">Your next adventure!</h2>
  
              {/* Weather Info */}
              <div className="mb-4 p-4 rounded shadow-sm" >
                        <h4 className="mb-3">Weather Forecast</h4>
                    <div className="d-flex justify-content-around">
                        <div className="text-center">
                         <h5>🌦️ Precipitation</h5>
                          <p className="mb-0">{weather.precipitation?.toFixed(2)} in</p>
                        </div>
                      <div className="text-center">
                         <h5>☀️ High</h5>
                            <p className="mb-0">{weather.tempMax?.toFixed(1)}°F</p>
                        </div>
                        <div className="text-center">
                            <h5>❄️ Low</h5>
                            <p className="mb-0">{weather.tempMin?.toFixed(1)}°F</p>
                    </div>
                </div>
            </div>
  
              {/* Activities */}
              {activities.length > 0 && (
                <div>
                  <h4>Recommended Adventures</h4>
                  <ul className="list-group">
                    {activities.map((item, index) => (
                        
                      <li key={index} className="list-group-item mb-2">
                        <div className='activity-card'>
                        <h5>{item.name}</h5>
                        <p>{item.description}</p>
                        {item.point &&(
                            <a href={`https://www.google.com/maps/search/?api=1&query=${item.point.lat},${item.point.lon}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">📍View on Map</a>
                        )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}  

export default App;
