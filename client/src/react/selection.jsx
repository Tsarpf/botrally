import React from 'react'
import settings from '../settings.js'

const driverSelection = {
    driver: 'human'
}

const tutorial = [
'keyboard left/right arrow to turn when human selected, changes to driver from dropdown only affect next game.',
'game autorestarts at 60 seconds if no winners',
'there is a one second wait at beginning of the game',
'to add new bots: !+addbot botname <bot source code>. After a page refresh the bot is selectable from the dropdown menu',
`bot AI:s have no state, and should exit({ld: true/false, rd: true/false}) (ld/rd stands for leftDown/rightDown)`,

`bots have access to variables, for example:`,
`car = {x: 1.53, y: 1.57, rotation: 5.6, rotationDeg: 274} (rotationDeg wraps at 360, rotation never wraps)`,
`map = [{x: 0, y: 1, type:"road/end/start"}] (an array with just the )`,
`tileGrid = same as map, except sparse, so indexable at every position. 2d flattened to 1d so index with getIdx = (x, y, size) => {return y * size + x}`,
`xt = current tile x coordinate`,
`yt = current tile y coordinate`,
`t = type of current tile (undefined if not start/road/end)`,
`nt = next tile (undefined if current tile not start/road/end)`,
`degNext = degree angle from current tile to next tile`,
]

class Selection extends React.Component {
    constructor(props) {
        super(props)
        this.state = {bots: []}
    }
    componentDidMount() {
        const url = `${settings.backend}/bots`
        fetch(url)
            .then(response => response.json())
            .then(json => this.setState({bots: json}))
    }
    render() {
        const bots = this.state.bots
        return <div style={{top: '630px', position: 'absolute'}}>
                <select onChange={e=>driverSelection.driver = e.target.value}>
                {bots.map(bot =>
                    <option key={bot}> {bot} </option>
                )}
            </select>
            {tutorial.map(t => <p> {t} </p>)}
            <a href="https://cldup.com/23JvSbReOX.txt"> defaultbot source code</a>
        </div>

    }
}

export default Selection
// The exported selection can be read elsewhere... 
// but is that smart tho? 
// Mabby just make a socket file with a send
export {
    driverSelection, 
    Selection
}