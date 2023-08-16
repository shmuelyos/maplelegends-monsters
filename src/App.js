import React, {useState, useCallback, useMemo} from 'react';
import {Button, CircularProgress, Container, Link, Paper, TextField, Typography} from "@mui/material";

function App() {
    const [LEVEL_MIN, setLevelMin] = useState(1);
    const [LEVEL_MAX, setLevelMax] = useState(200);
    const [COUNT_THRESHOLD, setCountThreshold] = useState(1);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAndSort = useCallback(async (sortBy = 'EXP') => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/scrape?LEVEL_MIN=${LEVEL_MIN}&LEVEL_MAX=${LEVEL_MAX}&COUNT_THRESHOLD=${COUNT_THRESHOLD}&SORT_BY=${sortBy}`);
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD]);

    const sortByExp = useCallback(() => fetchAndSort('EXP'), [fetchAndSort]);
    const sortByLevel = useCallback(() => fetchAndSort('LEVEL'), [fetchAndSort]);

    const mobItems = useMemo(() => {
        return data.map((item, index) => (
            <Paper key={index} style={{margin: '20px', padding: '20px'}}>
                <Typography variant="h5">{item.name}</Typography>
                <img src={item.imageUrl} alt={item.name} />
                <Typography>Level: {item.level}</Typography>
                <Typography>EXP: {item.exp}</Typography>
                <Typography>HP: {item.hp}</Typography>
                <Typography>Count: {item.count}</Typography>
                <Link href={item.url} target="_blank" rel="noopener noreferrer">
                    More Info
                </Link>
            </Paper>
        ));
    }, [data]);

    return (
        <Container>
            <Typography variant="h2">Maplelegends - monster filter</Typography>
            <Typography variant="h4">filter mobs by lvl range and count</Typography>


            <TextField
                variant="outlined"
                type="number"
                label="Minimum Mob Level"
                value={LEVEL_MIN}
                onChange={e => setLevelMin(e.target.value)}
                fullWidth
                margin="normal"
            />

            <TextField
                variant="outlined"
                type="number"
                label="Maximum Mob Level"
                value={LEVEL_MAX}
                onChange={e => setLevelMax(e.target.value)}
                fullWidth
                margin="normal"
            />

            <TextField
                variant="outlined"
                type="number"
                label="Minimum Amount of Mobs (per map)"
                value={COUNT_THRESHOLD}
                onChange={e => setCountThreshold(e.target.value)}
                fullWidth
                margin="normal"
            />

            <Button
                variant="contained"
                color="primary"
                onClick={sortByExp}
            >
                Sort By EXP
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={sortByLevel}
            >
                Sort By Level
            </Button>
            {isLoading ? (
                <CircularProgress/>
            ) : data.length > 0 ? (
                mobItems
            ) : (
                <Typography>No data</Typography>
            )}
        </Container>
    );
}

export default App;
