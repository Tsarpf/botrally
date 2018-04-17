import React from 'react'
import settings from '../settings.js'

const driverSelection = {
    driver: 'human'
}

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
        return <select onChange={e=>driverSelection.driver = e.target.value}>
            {bots.map(bot =>
                <option key={bot}> {bot} </option>
            )}
        </select>

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