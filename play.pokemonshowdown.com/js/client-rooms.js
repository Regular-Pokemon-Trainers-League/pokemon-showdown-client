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
			document.getElementById("time" + teams[i].id).innerHTML = date;
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
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="close"><i class="fa fa-times"></i> Close</button><div class="roomlist"><p><strong>RPTL Rosters</strong></p>';
       
			for(var i = 0; i < this.teams.length; i++) {
				this.teams[i].time = new Date(Date.now()).toLocaleString('en-US', { timeZone: this.teams[i].timeZone });
				buf+= '<img src="sprites/logos/' + this.teams[i].name.replace(/\s/g, '').replaceAll('\'','').toLowerCase() + '.png" width="200" style="vertical-align:middle;cursor:pointer" />'
				buf+= '<button class="accordion" id="acc' + this.teams[i].id + '">' + this.teams[i].name + '</button>';
				buf+= '<table border="4" id="table' + this.teams[i].id + '"><tbody>';
				buf+= '<tr>';
				buf+= '<td>&nbsp;Showdown Trainer&nbsp;</td>';
				buf+= '<td>&nbsp;' + this.teams[i].zone + '&nbsp;</td>';
				buf+= '<td>&nbsp;' + this.teams[i].coach + '&nbsp;</td>';
				buf+= '</tr>';
				buf+= '<tr>';
				buf+= '<td>&nbsp;Pokémon:&nbsp;</td>';
				buf+= '<td id="time' + this.teams[i].id + '">&nbsp;</td>';
				buf+= '<td>&nbsp;Name:&nbsp;</td>';

				var keys = Object.keys(this.teams[i].team);
				for(var j = 0; j < keys.length; j++) {
					buf+= '<tr>';
					buf+= '<td>&nbsp;' + keys[j] + '</td>';
					if( keys[j].includes("Item")) {
						buf+= '<td>&nbsp;<span class=itemicon style="' + Dex.getItemIcon(this.teams[i].team[keys[j]]) + ';display:inline-block;vertical-align:middle" class="picon"></span></td>';
					}
					else {
						buf+= '<td>&nbsp;<span style="' + Dex.getPokemonIcon(keys[j]) + ';display:inline-block;vertical-align:middle" class="picon"></span></td>';
					}
					buf+= '<td>&nbsp;' + this.teams[i].team[keys[j]] + '</td>';
					buf+= '</tr>';
				}
				buf+= '</tbody></table>';
				buf+= '<br>';
				buf+= '<br>';
			}

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
			
			this.update();
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
		teams: [
			{
				'id': 0,
				'name': 'Beads of Ruin',
				'coach': 'Superperson00',
				'zone': 'AEST',
				'timeZone': 'Australia/Brisbane',
				'team': {
					'Togekiss': 'Togekiss',
					'Dragonite': 'Dragonite',
					'Arcanine': 'Arcanine',
					'Quaquaval': 'Quaquaval',
					'Jolteon': 'Jolteon',
					'Mudsdale': 'Mudsdale',
					'Vileplume': 'Vileplume',
					'Weavile': 'Weavile',
					'Item1': 'Banettite',
					'Item2': 'Rusted Shield',
					'Item3': 'Pinsirite',
					'Item4': 'Glalitite',
				}
			},
			{
				'id': 1,
				'name': 'Mario Kart Wii 2',
				'coach': 'RyinThyme',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Archaludon': 'Archaludon',
					'Toedscruel': 'Toedscruel',
					'Whimsicott': 'Whimsicott',
					'Shiftry': 'Shiftry',
					'Barraskewda': 'Barraskewda',
					'Golisopod': 'Golisopod',
					'Iron Moth': 'Iron Moth',
					'Bronzong': 'Bronzong',
					'Item1': 'Blue Orb',
					'Item2': 'Mewtwonite-X',
					'Item3': 'Salamencite',
					'Item4': 'Zap Plate',
				}
			},
			{
				'id': 2,
				'name': 'Team Zoroark',
				'coach': 'Milotic42',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Amoonguss': 'Amoonguss',
					'Greninja': 'Greninja',
					'Raichu': 'Raichu',
					'Gliscor': 'Gliscor',
					'Slither Wing': 'Slither Wing',
					'Blacephalon': 'Blacephalon',
					'Meowstic': 'Meowstic',
					'Altaria': 'Altaria',
					'Item1': 'Audinite',
					'Item2': 'Diancite',
					'Item3': 'Absolite',
					'Item4': 'Hearthflame Mask',
				}
			},
			{
				'id': 3,
				'name': 'Kalifornia Krooks',
				'coach': 'Silvestron',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Gengar': 'Picaro',
					'Rhyperior': 'Rhyperior',
					'Buzzwole': 'Buzzwole',
					'Noivern': 'Noivern',
					'Magmortar': 'Magmortar',
					'Hatterene': 'Hatterene',
					'Gourgeist': 'Gourgeist',
					'Magnezone': 'Magnezone',
					'Item1': 'Altarianite',
					'Item2': 'Cameruptite',
					'Item3': 'Gyaradosite',
					'Item4': 'Latiasite',
				}
			},
			{
				'id': 4,
				'name': 'The Goofy Goomers',
				'coach': 'RubyFlame57',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Goodra': 'Goodra',
					'Pheromosa': 'Pheromosa',
					'Tsareena': 'Tsareena',
					'Lilligant-Hisui': 'Lilligant-Hisui',
					'Corviknight': 'Corviknight',
					'Dudunsparce': 'Dudunsparce',
					'Ninetales-Alola': 'Ninetales-Alola',
					'Charjabug': 'Charjabug',
					'Item1': 'Slowbronite',
					'Item2': 'Lopunnite',
					'Item3': 'Charizardite-Y',
					'Item4': 'Wellspring Mask',
				}
			},
			{
				'id': 5,
				'name': 'Pocket Monsters',
				'coach': 'dankmaster1738',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Toxapex': 'Toxapex',
					'Garganacl': 'Garganacl',
					'Rillaboom': 'Rillaboom',
					'Aggronite': 'Aggronite',
					'Clefable': 'Clefable',
					'Ferrothorn': 'Ferrothorn',
					'Guzzlord': 'Guzzlord',
					'Cofagrigus': 'Cofagrigus',
					'Nihilego': 'Nihilego',
					'Item1': 'Blastoisinite',
					'Item2': 'Aggronite',
					'Item3': 'Venusaurite',
					'Item4': 'Aerodactylite',
				}
			},
			{
				'id': 6,
				'name': 'Garden State Gastlys',
				'coach': 'DiegoNegro',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Smeargle': 'Bullfighter',
					'Dragapult': 'James Baxter',
					'Overqwil': 'Overqwil',
					'Glimmora': 'Oblina',
					'Dugtrio-Alola': 'Jess, Tina, Carl',
					'Illumise': 'Sasha',
					'Sinistcha': 'Sinistcha',
					'Archeops': 'Crookneck',
					'Item1': 'Steelixite',
					'Item2': 'Scizorite',
					'Item3': 'Alakazite',
					'Item4': 'Tyranitarite',
				}
			},
			{
				'id': 7,
				'name': 'Edison Electric Millivolts',
				'coach': 'Automajon',
				'zone': 'CST',
				'timeZone': 'America/Chicago',
				'team': {
					'Great Tusk': 'Great Tusk',
					'Armarouge': 'Armarouge',
					'Aerodactyl': 'Aerodactyl',
					'Arctozolt': 'Arctozolt',
					'Weezing-Galar': 'Weezing-Galar',
					'Ceruledge': 'Ceruledge',
					'Reuniclus': 'Reuniclus',
					'Vikavolt': 'Vikavolt',
					'Item1': 'Lucarionite',
					'Item2': 'Latiosite',
					'Item3': 'Abomasite',
					'Item4': 'Cornerstone Mask',
				}
			},
			{
				'id': 8,
				'name': 'Pittsburgh Sphealers',
				'coach': 'Chuke',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Scrafty': 'Scrafty',
					'Celesteela': 'Celesteela',
					'Pelipper': 'Pelipper',
					'Dracovish': 'Dracovish',
					'Tangela': 'Tangela',
					'Eelektross': 'Eelektross',
					'Froslass': 'Froslass',
					'Clodsire': 'Clodsire',
					'Item1': 'Manectite',
					'Item2': 'Sceptilite',
					'Item3': 'Swampertite',
					'Item4': 'Charizardite-X',
				}
			},
			{
				'id': 9,
				'name': 'Baja Blastoise',
				'coach': 'HeroOfZero',
				'zone': 'EST',
				'timeZone': 'America/New_York',
				'team': {
					'Charizard': 'Charizard',
					'Garchomp': 'Garchomp',
					'Tinkaton': 'Tinkaton',
					'Farigiraf': 'Farigiraf',
					'Pangoro': 'Pangoro',
					'Hydrapple': 'Hydrapple',
					'Mismagius': 'Mismagius',
					'Lickilicky': 'Lickilicky',
					'Item1': 'Pidgeotite',
					'Item2': 'Galladite',
					'Item3': 'Metagrossite',
					'Item4': 'Ampharosite',
				}
			},
		]
	});
}).call(this, jQuery);
