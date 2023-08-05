// import React, {useEffect, useState} from 'react';
//
// function App() {
//     const [items, setItems] = useState([]);
//     useEffect(() => {
//         fetch('http://localhost:5000/scrape')
//             .then(res => res.json())
//             .then(data => setItems(data));
//     }, []);
//
//   return (
//       <div className="App">
//         {items.map((item, index) => (
//             <div key={index} style={{margin: '20px', padding: '20px', border: '1px solid #ddd'}}>
//               <h2>{item.name}</h2>
//                 <p>Level: {item.level}</p>
//                 <p>Count: {item.count}</p>
//                 <p>HP: {item.hp}</p>
//                 <p>EXP: {item.exp}</p>
//               <a href={item.url} target="_blank" rel="noopener noreferrer">More Info</a>
//             </div>
//         ))}
//       </div>
//   );
// }
//
// export default App;
import React, {useState} from 'react';

function App() {
    const [LEVEL_MIN, setLevelMin] = useState(40);
    const [LEVEL_MAX, setLevelMax] = useState(50);
    const [COUNT_THRESHOLD, setCountThreshold] = useState(20);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/scrape?LEVEL_MIN=${LEVEL_MIN}&LEVEL_MAX=${LEVEL_MAX}&COUNT_THRESHOLD=${COUNT_THRESHOLD}`);
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Scrape Data</h1>

            <input type="number" value={LEVEL_MIN} onChange={e => setLevelMin(e.target.value)}
                   placeholder="Minimum Level"/>
            <input type="number" value={LEVEL_MAX} onChange={e => setLevelMax(e.target.value)}
                   placeholder="Maximum Level"/>
            <input type="number" value={COUNT_THRESHOLD} onChange={e => setCountThreshold(e.target.value)}
                   placeholder="Count Threshold"/>

            <button onClick={fetchData}>Fetch Data</button>

            {isLoading ? (
                <p>Loading...</p>
            ) : data ? (

                data.map((item, index) => (
                    <div key={index} style={{margin: '20px', padding: '20px', border: '1px solid #ddd'}}>
                        <h2>{item.name}</h2>
                        <p>Level: {item.level}</p>
                        <p>EXP: {item.exp}</p>
                        <p>HP: {item.hp}</p>
                        <p>Count: {item.count}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">More Info</a>
                    </div>
                ))) : (
                <p>No data</p>
            )}

        </div>
    );
}

export default App;
