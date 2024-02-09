/**
 * League Panel
 *
 * Just an example panel for creating new panels/popups
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

// League room with panel

class LeagueRoom extends PSRoom {
	readonly classType: string = 'league';
	constructor(options: RoomOptions) {
		super(options);
	}
}

class LeaguePanel extends PSRoomPanel<LeagueRoom> {
	render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<div class="mainmessage"><p>Loading...</p></div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['league'] = {
	Model: LeagueRoom,
	Component: LeaguePanel,
};

// League panel with no room

class LeagueViewPanel extends PSRoomPanel {
	render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<div class="mainmessage"><p>Loading...</p></div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['leagueview'] = {
	Component: LeagueViewPanel,
};
