(function ($) {

	this.RoomsRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'rooms',
		title: 'Rooms',
		events: {
			'change select[name=sections]': 'refresh'
		},
		isSideRoom: true,
		initialize: function () {
			this.focusedSection = '';

			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="closeHide"><i class="fa fa-caret-right"></i> Hide</button>';
			buf += '<div class="roomlisttop"></div><p><select name="sections" class="button"><option value="all">(All rooms)</option></select></p>';
			buf += '<div class="roomlist"><p><em style="font-size:20pt">Loading...</em></p></div><div class="roomlist"></div>';
			buf += '<p><button name="toggleMoreRooms" class="button">Show more rooms</button><p>';
			buf += '<p><button name="joinRoomPopup" class="button">Join other room</button></p></div>';
			this.$el.html(buf);
			app.on('response:rooms', this.update, this);
			var settings = Dex.prefs('serversettings');
			if (settings) app.send('/updatesettings ' + JSON.stringify(settings));
			app.send('/cmd rooms');
			app.user.on('change:named', this.updateUser, this);
			this.update();
			this.chatroomInterval = setInterval(function () {
				if (app.curSideRoom && app.curSideRoom.id === 'rooms') {
					app.send('/cmd rooms');
				}
			}, 20 * 1000);
		},
		initSectionSelection: function () {
			var buf = ['<option value="">(All rooms)</option>'];
			var sectionTitles = app.roomsData.sectionTitles;
			if (!sectionTitles) {
				this.$('select[name=sections]').parent().hide();
				return;
			}
			for (var i = 0; i < sectionTitles.length; i++) {
				var sectionName = BattleLog.escapeHTML(sectionTitles[i]);
				buf.push('<option value="' + sectionName + '">' + sectionName + '</option>');
			}
			this.$('select[name=sections]').html(buf.join(''));
		},
		updateUser: function () {
			this.update();
		},
		focus: function () {
			if (new Date().getTime() - this.lastUpdate > 20 * 1000) {
				app.send('/cmd rooms');
				this.lastUpdate = new Date().getTime();
			}
			var prevPos = this.$el.scrollTop();
			if (!this.$('select:focus').length) {
				this.$('button[name=joinRoomPopup]').focus();
			}
			this.$el.scrollTop(prevPos);
		},
		joinRoomPopup: function () {
			app.addPopupPrompt("Room name:", "Join room", function (room) {
				var routeLength = (Config.routes.client + '/').length;
				if (room.substr(0, 7) === 'http://') room = room.slice(7);
				if (room.substr(0, 8) === 'https://') room = room.slice(8);
				if (room.substr(0, routeLength) === Config.routes.client + '/') room = room.slice(routeLength);
				if (room.substr(0, 8) === 'psim.us/') room = room.slice(8);
				if (room.substr(0, document.location.hostname.length + 1) === document.location.hostname + '/') room = room.slice(document.location.hostname.length + 1);
				room = toRoomid(room);
				if (!room) return;
				app.tryJoinRoom(room);
			});
		},
		toggleMoreRooms: function () {
			this.showMoreRooms = !this.showMoreRooms;
			this.updateRoomList();
			this.$el.find('button[name=toggleMoreRooms]').text(
				this.showMoreRooms ? 'Hide more rooms' : 'Show more rooms'
			);
		},
		update: function (rooms) {
			if (rooms) {
				this.lastUpdate = new Date().getTime();
				app.roomsData = rooms;
			}
			if (!app.roomsData) return;
			this.initSectionSelection();
			this.updateRoomList();
			if (!app.roomsFirstOpen && window.location.host !== 'demo.psim.us') {
				if (Config.roomsFirstOpenScript) {
					Config.roomsFirstOpenScript();
				}
				app.roomsFirstOpen = 2;
			}
		},

		renderRoomBtn: function (roomData) {
			var id = toID(roomData.title);
			var buf = '<div><a href="' + app.root + id + '" class="blocklink"><small style="float:right">(' + Number(roomData.userCount) + ' users)</small><strong><i class="fa fa-comment-o"></i> ' + BattleLog.escapeHTML(roomData.title) + '<br /></strong><small>' + BattleLog.escapeHTML(roomData.desc || '') + '</small></a>';
			if (roomData.subRooms && roomData.subRooms.length) {
				buf += '<div class="subrooms"><i class="fa fa-level-up fa-rotate-90"></i> Subrooms:';
				for (var i = 0; i < roomData.subRooms.length; i++) {
					buf += ' <a class="blocklink" href="' + app.root + toID(roomData.subRooms[i]) + '"><i class="fa fa-comment-o"></i> <strong>' + BattleLog.escapeHTML(roomData.subRooms[i]) + '</strong></a>';
				}
				buf += '</div>';
			}
			buf += '</div>';
			return buf;
		},

		compareRooms: function (roomA, roomB) {
			return roomB.userCount - roomA.userCount;
		},
		updateRoomList: function () {
			var rooms = app.roomsData;

			if (rooms.userCount) {
				var userCount = Number(rooms.userCount);
				var battleCount = Number(rooms.battleCount);
				var leftSide = '<button class="button" name="finduser" title="Find an online user"><span class="pixelated usercount" title="Picaro is a well known and friendly member of the Waugatuck Wonders, and he represents our chatrooms." ></span><strong>' + userCount + '</strong> ' + (userCount == 1 ? 'user' : 'users') + ' online</button> ';
				var rightSide = '<button class="button" name="roomlist" title="Watch an active battle"><span class="pixelated battlecount" title="Big Gonzo is the original K.O. trophy winner for the San Francisco Smog! He\'s now retired and represents our battles." ></span><strong>' + battleCount + '</strong> active ' + (battleCount == 1 ? 'battle' : 'battles') + '</button>';
				var farSide = '<button class="button" name="rosters" title="View Team Rosters"><span class="pixelated rostercount" title="Mojo was the captain of the Edison Electric in Season 3 and led the team to a Little Cup victory!" ></span><strong>RPTL</strong></button>';
				this.$('.roomlisttop').html('<div class="roomcounters">' + leftSide + '</td><td>' + rightSide + '</div>' + '<div class="league">' + farSide + '</td></div>' );
			}

			if (rooms.pspl) {
				for (var i = 0; i < rooms.pspl.length; i++) {
					rooms.pspl[i].spotlight = "Spotlight rooms";
				}
				rooms.chat = rooms.pspl.concat(rooms.chat);
				rooms.pspl = null;
			}
			if (rooms.official) {
				for (var i = 0; i < rooms.official.length; i++) {
					rooms.official[i].section = "Official";
				}
				rooms.chat = rooms.official.concat(rooms.chat);
				rooms.official = null;
			}

			var allRooms = rooms.chat;
			if (this.focusedSection) {
				var sectionFilter = this.focusedSection;
				allRooms = allRooms.filter(function (roomData) {
					return (roomData.section || 'Other') === sectionFilter;
				});
			}

			var spotlightLabel = '';
			var spotlightRooms = [];
			var officialRooms = [];
			var otherRooms = [];
			var hiddenRooms = [];
			for (var i = 0; i < allRooms.length; i++) {
				var roomData = allRooms[i];
				if (roomData.spotlight) {
					spotlightRooms.push(roomData);
					spotlightLabel = roomData.spotlight;
				} else if (roomData.section === 'Official') {
					officialRooms.push(roomData);
				} else if (roomData.privacy === 'hidden') {
					hiddenRooms.push(roomData);
				} else {
					otherRooms.push(roomData);
				}
			}

			this.$('.roomlist').first().html(
				(officialRooms.length ?
					'<h2 class="rooms-officialchatrooms">Official chat rooms</h2>' + officialRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : ''
				) +
				(spotlightRooms.length ?
					'<h2 class="rooms-psplchatrooms">' + BattleLog.escapeHTML(spotlightLabel) + '</h2>' + spotlightRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : ''
				)
			);
			this.$('.roomlist').last().html(
				(otherRooms.length ?
					'<h2 class="rooms-chatrooms">Chat rooms</h2>' + otherRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : ''
				) +
				(hiddenRooms.length && this.showMoreRooms ?
					'<h2 class="rooms-chatrooms">Hidden rooms</h2>' + hiddenRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : ''
				)
			);
		},
		roomlist: function () {
			app.joinRoom('battles');
		},
		rosters: function() {
			app.joinRoom('league');
		},
		closeHide: function () {
			app.sideRoom = app.curSideRoom = null;
			clearInterval(this.chatroomInterval);
			this.chatroomInterval = null;
			this.close();
		},
		finduser: function () {
			if (app.isDisconnected) {
				app.addPopupMessage("You are offline.");
				return;
			}
			app.addPopupPrompt("Username", "Open", function (target) {
				if (!target) return;
				if (toID(target) === 'zarel') {
					app.addPopup(Popup, { htmlMessage: "Zarel is very busy; please don't contact him this way. If you're looking for help, try <a href=\"/help\">joining the Help room</a>?" });
					return;
				}
				app.addPopup(UserPopup, { name: target });
			});
		},
		refresh: function () {
			var section = this.$('select[name=sections]').val();
			this.focusedSection = section;
			this.updateRoomList();
		}
	});

	this.BattlesRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'battles',
		title: 'Battles',
		isSideRoom: true,
		events: {
			'change select[name=elofilter]': 'refresh',
			'submit .search': 'submitSearch'
		},
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="close"><i class="fa fa-times"></i> Close</button><div class="roomlist"><p><button class="button" name="refresh"><i class="fa fa-refresh"></i> Refresh</button> <span style="' + Dex.getPokemonIcon('rhyperior') + ';display:inline-block;vertical-align:middle" class="picon" title="Big Gonzo is the original K.O. trophy winner for the San Francisco Smog! He\'s now retired and represents our battles."></span></p>';

			buf += '<p><label class="label">Format:</label><button class="select formatselect" name="selectFormat">(All formats)</button></p>';
			buf += '<label>Minimum Elo: <select name="elofilter" class="button"><option value="none">None</option><option value="1000">1000</option><option value="1100">1100</option><option value="1300">1300</option><option value="1500">1500</option><option value="1700">1700</option><option value="1900">1900</option></select></label>';
			buf += '<p><form class="search"><input type="text" name="prefixsearch" class="textbox" value="' + BattleLog.escapeHTML(this.usernamePrefix) + '" placeholder="username prefix"/><button type="submit" class="button">Search</button></form></p>';
			buf += '<div class="list"><p>Loading...</p></div>';
			buf += '</div></div>';

			this.$el.html(buf);
			this.$list = this.$('.list');
			this.$refreshButton = this.$('button[name=refresh]');

			this.format = '';
			app.on('response:roomlist', this.update, this);
			app.send('/cmd roomlist');
			this.update();
		},
		selectFormat: function (format, button) {
			if (!window.BattleFormats) {
				return;
			}
			var self = this;
			app.addPopup(FormatPopup, { format: format, sourceEl: button, selectType: 'watch', onselect: function (newFormat) {
				self.changeFormat(newFormat);
			} });
		},
		changeFormat: function (format) {
			this.format = format;
			this.data = null;
			this.update();
			this.refresh();
		},
		focus: function (e) {
			if (e && $(e.target).is('input')) return;
			if (e && $(e.target).closest('select, a').length) return;
			if (new Date().getTime() - this.lastUpdate > 60 * 1000) {
				this.refresh();
			}
			var prevPos = this.$el.scrollTop();
			this.$('button[name=refresh]').focus();
			this.$el.scrollTop(prevPos);
		},
		rejoin: function () {
			this.refresh();
		},
		renderRoomBtn: function (id, roomData, matches) {
			var format = (matches[1] || '');
			var formatBuf = '';
			if (roomData.minElo) {
				formatBuf += '<small style="float:right">(' + (typeof roomData.minElo === 'number' ? 'rated: ' : '') + BattleLog.escapeHTML('' + roomData.minElo) + ')</small>';
			}
			formatBuf += (format ? '<small>[' + BattleLog.escapeFormat(format) + ']</small><br />' : '');
			var roomDesc = formatBuf + '<em class="p1">' + BattleLog.escapeHTML(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + BattleLog.escapeHTML(roomData.p2) + '</em>';
			if (!roomData.p1) {
				matches = id.match(/[^0-9]([0-9]*)$/);
				roomDesc = formatBuf + 'empty room ' + matches[1];
			} else if (!roomData.p2) {
				roomDesc = formatBuf + '<em class="p1">' + BattleLog.escapeHTML(roomData.p1) + '</em>';
			}
			return '<div><a href="' + app.root + id + '" class="blocklink">' + roomDesc + '</a></div>';
		},
		submitSearch: function (e) {
			e.preventDefault();
			this.refresh();
		},
		update: function (data) {
			if (!data && !this.data) {
				if (app.isDisconnected) {
					this.$list.html('<p>You are offline.</p>');
				} else {
					this.$list.html('<p>Loading...</p>');
				}
				return;
			}
			this.$('button[name=refresh]')[0].disabled = false;

			// Synchronize stored room data with incoming data
			if (data) this.data = data;
			var rooms = this.data.rooms;

			var buf = [];
			for (var id in rooms) {
				var roomData = rooms[id];
				var matches = ChatRoom.parseBattleID(id);
				// bogus room ID could be used to inject JavaScript
				if (!matches || this.format && matches[1] !== this.format) {
					continue;
				}
				buf.push(this.renderRoomBtn(id, roomData, matches));
			}

			if (!buf.length) return this.$list.html('<p>No ' + BattleLog.escapeFormat(this.format) + ' battles are going on right now.</p>');
			return this.$list.html('<p>' + buf.length + (buf.length === 100 ? '+' : '') + ' ' + BattleLog.escapeFormat(this.format) + ' ' + (buf.length === 1 ? 'battle' : 'battles') + '</p>' + buf.join(""));
		},
		refresh: function () {
			var usernamePrefix = this.$('input[name=prefixsearch]').val();
			var elofilter = this.$('select[name=elofilter]').val();
			var searchParams = [this.format, elofilter, toID(usernamePrefix)];
			app.send('/cmd roomlist ' + searchParams.join(','));

			this.lastUpdate = new Date().getTime();
			// Prevent further refreshes until we get a response.
			this.$refreshButton[0].disabled = true;
		}
	});

	function clock(teams) {

		for(var i=0; i < teams.length; i++)
		{
			date = new Date(Date.now()).toLocaleString('en-US', { timeZone: teams[i].timeZone });
			try {
				document.getElementById("time" + teams[i].id).innerHTML = date;
			} catch(TypeError) {
				break;
			}
		}
		setTimeout(clock, 1000, teams);
	};

	this.LeagueRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'league',
		title: 'League',
		date: new Date(),
		isSideRoom: true,
		events: {
			'submit .search': 'submitSearch',
			'click .accordion': 'expandTeam',
		},
		teams: [],
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="close"><i class="fa fa-times"></i> Close</button><div class="roomlist"><p><strong>RPTL Rosters</strong></p>';

			app.on('response:page', this.getTeams, this)
			app.send('/cmd page 18ZdLs31r7BulAZWx4N_u3VmhsGD4_jRXYI1HE73XQgg, Teams'); //18ZdLs31r7BulAZWx4N_u3VmhsGD4_jRXYI1HE73XQgg

			buf += this.renderData();

			this.$el.html(buf);
			this.$list = this.$('.list');
			this.$rosters = this.$('table[border=4]');
			this.$times = this.$('td[name=time]');

			for(var i = 0; i < this.teams.length; i++) {
				this.$rosters[i].style.display = "none";
			}

			this.format = '';
			app.on('response:roomlist', this.update, this);
			app.send('/cmd roomlist');
			document.body.onload = clock(this.teams);
			
		},
		expandTeam: function(e) {
			// e.target.classList.toggle("active");
			// var panel = e.target.nextElementSibling;
			// if (panel.style.display === "block") {
			// 	panel.style.display = "none";
			// } else {
			// 	panel.style.display = "block";
			// }
			this.$('table[id=' + e.target.getAttribute("id").replace('acc', 'table') + ']').toggle("active");
		},
		focus: function (e) {
			if (e && $(e.target).is('input')) return;
			if (e && $(e.target).closest('select, a').length) return;
			var prevPos = this.$el.scrollTop();
			this.$el.scrollTop(prevPos);
		},
		renderRoomBtn: function (id, roomData, matches) {
			var format = (matches[1] || '');
			var formatBuf = '';
			if (roomData.minElo) {
				formatBuf += '<small style="float:right">(' + (typeof roomData.minElo === 'number' ? 'rated: ' : '') + BattleLog.escapeHTML('' + roomData.minElo) + ')</small>';
			}
			formatBuf += (format ? '<small>[' + BattleLog.escapeFormat(format) + ']</small><br />' : '');
			var roomDesc = formatBuf + '<em class="p1">' + BattleLog.escapeHTML(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + BattleLog.escapeHTML(roomData.p2) + '</em>';
			if (!roomData.p1) {
				matches = id.match(/[^0-9]([0-9]*)$/);
				roomDesc = formatBuf + 'empty room ' + matches[1];
			} else if (!roomData.p2) {
				roomDesc = formatBuf + '<em class="p1">' + BattleLog.escapeHTML(roomData.p1) + '</em>';
			}
			return '<div><a href="' + app.root + id + '" class="blocklink">' + roomDesc + '</a></div>';
		},
		update: function (data) {
			if (!data && !this.data) {
				if (app.isDisconnected) {
					this.$list.html('<p>You are offline.</p>');
				} else {
					this.$list.html('<p>Loading...</p>');
				}
				return;
			}

			// Synchronize stored room data with incoming data
			if (data) this.data = data;

			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="close"><i class="fa fa-times"></i> Close</button><div class="roomlist"><p><strong>RPTL Rosters</strong></p>';

			buf += this.renderData();

			return this.$el.html(buf);
		},
		getTeams: function(data) {
			let rosterLength = this.getRosterLength(data);
			let counter = 0;
			for ( let y = 0; y < data.length; y += rosterLength + 9 ) {
				for ( let x = 0; x < data[y].length; x += 4) {
					team = { 
							"name": data[y][x],
							"trainer": data[y+1][x],
							"zone": data[y+1][x+1],
							"roster": [],
							"points": [],
							"nicknames": [],
							"id": counter,
							"wins": 0,
							"losses": 0,
							"differential": 0
					};
					
					if ( data[y+rosterLength+5][x+2] != undefined && data[y+rosterLength+5][x+2] != "") {
						team["wins"] = data[y+rosterLength+5][x+2].split('-')[0];
						team["losses"] = data[y+rosterLength+5][x+2].split('-')[1];
						team["differential"] = data[y+rosterLength+6][x+2];
					}
					for ( let i = 3; i < rosterLength+3; i++ ) {
						let mon = data[y+i][x] === undefined ? "" : data[y+i][x];
						let points = data[y+i][x+1] === undefined ? "" : data[y+i][x+1];
						team["roster"].push(mon);
						team["points"].push(points);
						if (data[y+i][x+2] === undefined) {
							team["nicknames"].push("");
						}
						else {
							team["nicknames"].push(data[y+i][x+2]);
						}
					}

					if (this.zones[team["zone"]]) {
						team["timeZone"] = this.zones[team["zone"]];
					}
					else {
						team["timeZone"] = 'Africa/Timbuktu';
					}

					let entry = this.teams.findIndex(x => x.name === team.name);

					if (entry > -1) {
						this.teams[entry] = team;
					}
					else {
						this.teams.push(team)
					}
					counter++;
				}
			}

			// Sort in Descending Records
			this.teams.sort((a, b) => {
				if(a['wins'] > b['wins']) {
					return -1;
				}
				if(a['wins'] < b['wins']) {
					return 1;
				}
				
				if(a['losses'] > b['losses']) {
					return 1;
				}
				if(a['losses'] < b['losses']) {
					return -1;
				}

				if(parseInt(a['differential']) > parseInt(b['differential'])) {
					return -1;
				}
				if(parseInt(a['differential']) < parseInt(b['differential'])) {
					return 1;
				}

				return 0;
			});
			this.update()
		},
		renderData: function() {
			let buf = '';
			for(var i = 0; i < this.teams.length; i++) {
				this.teams[i].time = new Date(Date.now()).toLocaleString('en-US', { timeZone: this.teams[i].timeZone });
				buf+= '<img src="sprites/logos/' + this.teams[i].name.replace(/\s/g, '').replaceAll('\'','').toLowerCase() + '.png" width="200" style="vertical-align:middle;cursor:pointer" />'
				buf+= '<button class="accordion" id="acc' + this.teams[i].id + '">' + this.teams[i].name + '</button>';
				buf+= '<table border="4" id="table' + this.teams[i].id + '"><tbody>';
				buf+= '<tr>';
				buf+= '<td>&nbsp;<b>Showdown Trainer:</b>&nbsp;</td>';
				buf+= '<td style="text-align: center; vertical-align: middle;" colspan="2">&nbsp;' + this.teams[i].trainer + '&nbsp;</td>';
				buf+= '</tr>';
				buf+= '<tr>';
				buf+= '<td>&nbsp;<b>LocalTime:</b>&nbsp;</td>';
				buf+= '<td id="time' + this.teams[i].id + '">&nbsp;</td>';
				buf+= '<td style="text-align: center; vertical-align: middle;">&nbsp;' + this.teams[i].zone + '&nbsp;</td>';
				buf+= '</tr>';
				buf+= '<tr>';
				buf+= '<td style="text-align: center; vertical-align: middle;" colspan="2">&nbsp;<b>Pokémon:</b>&nbsp;</td>';
				buf+= '<td>&nbsp;<b>Nickname:</b>&nbsp;</td>';

				for(var j = 0; j < this.teams[i].roster.length; j++) {
					buf+= '<tr>';
					buf+= '<td>&nbsp;' + this.teams[i].roster[j] + '</td>';

					item = window.BattleItems[toID(this.teams[i].roster[j])];

					if (item?.spritenum) {
						// TODO: We never hit this now
						buf+= '<td style="text-align: center; vertical-align: middle;">&nbsp;<span class=itemicon style="' + Dex.getItemIcon(this.teams[i].roster[j]) + ';display:inline-block;vertical-align:middle" class="picon"></span></td>';
					}
					else {
						buf+= '<td style="text-align: center; vertical-align: middle;">&nbsp;<span style="' + Dex.getPokemonIcon(this.teams[i].roster[j]) + ';display:inline-block;vertical-align:middle" class="picon"></span></td>';
					}
					buf+= '<td>&nbsp;' + this.teams[i].nicknames[j] + '</td>';
					buf+= '</tr>';
				}
				buf+= '<td>&nbsp;<b>Record:</b></td>';
				buf+= '<td style="text-align: center; vertical-align: middle;" colspan="2">&nbsp;<b>' + this.teams[i].wins + '-' + this.teams[i].losses + ' (' + this.teams[i].differential + ')' + '</b></td>';
				buf+= '</tbody></table>';
				buf+= '<br>';
				buf+= '<br>';
			}
			return buf;
		},
		getRosterLength: function(data) {
			const teamdata = data;

			let rosterLength = 0;
			let startIndex = 0;
			let endIndex = 0;

			for ( let y = 0; y < data.length; y++ ) {
				if( teamdata[y][0] === "Pokemon") {
					startIndex = y+1;
				}
				else if( teamdata[y][0] === "Remaining Points:") {
					endIndex = y;
					break;
				}
			}

			if (startIndex >= 0 && endIndex != 0) {
				rosterLength = endIndex - startIndex;
			}
			else {
				console.log("Issue finding roster mark points!");
			}
			return rosterLength;
		},
		// TODO: Add in more time zones.
		zones: {
			'AEST': 'Australia/Brisbane',
			'CCT': 'Asia/Taipei',
			'CET': 'Europe/Berlin',
			'CST': 'America/Chicago',
			'EST': 'America/New_York',
			'GMT+8': 'Asia/Taipei',
			'MST': 'America/Phoenix',
			'PST': 'America/Los_Angeles',
			'UTC+8': 'Asia/Taipei',
			'GMT+2': 'Europe/Berlin'
		}
	});
}).call(this, jQuery);
