(function (exports, $) {
    exports.DraftsRoom = exports.Room.extend({
        type: 'drafts',
        title: 'Drafts',
        initialize: function() {
            this.$el.addClass('ps-room-light').addClass('scrollable');
            this.update();
        },

        curDraft: null,
        curDraftLoc: 0,
		curSearchVal: '',

        update: function() {
            drafts = this.getDrafts();
            if(this.curDraft) {
                if (this.curDraft.loaded === false || (this.curDraft.draftid && !this.curDraft.loaded)) {
                    this.loadDraft();
                    return this.updateDraftView();
                }
            }

            return this.updateDraftInterface();
        },

		getDrafts: function() {
			//Replace this function with call to get drafts from database
			let draft1 = {"name": "RPTS Season 1", "loaded": false, "format": toID("NatDex6v6"), "folder": "RPTS", "key": "RPTS_S1"}
			let draft2 = {"name": "RPTL Season 15", "loaded": false, "format": toID("NatDex6v6"), "folder": "RPTL", "key": "RPTL_S15"}

			return [draft1, draft2];
		},
        deletedDraft: null,
		deletedDraftLoc: -1,
		updateDraftInterface: function () {

			var buf = '';

			// folderpane TODO fix the folder pane
			buf = '<div class="folderpane">';
			buf += '</div>';

			// draftpane
			buf += '<div class="draftpane">';
			buf += '</div>';

			this.$el.html(buf);

			this.updateFolderList();
			this.updateDraftList();
		},

		updateFolderList: function () {
			var buf = '<div class="folderlist"><div class="folderlistbefore"></div>';

			buf += '<div class="folder' + (!this.curFolder ? ' cur"><div class="folderhack3"><div class="folderhack1"></div><div class="folderhack2"></div>' : '">') + '<div class="selectFolder" data-value="all"><em>(all)</em></div></div>' + (!this.curFolder ? '</div>' : '');
			var folderTable = {};
			var folders = [];
			var drafts = this.getDrafts();
			if (drafts) for (var i = -2; i < drafts.length; i++) {
				if (i >= 0) {
					var folder = drafts[i].folder;
					if (folder && !((folder + '/') in folderTable)) {
						folders.push('Z' + folder);
						folderTable[folder + '/'] = 1;
						if (!('/' in folderTable)) {
							folders.push('Z~');
							folderTable['/'] = 1;
						}
					}
				}

				var format;
				if (i === -2) {
					format = this.curFolderKeep;
				} else if (i === -1) {
					format = this.curFolder;
				} else {
					format = drafts[i].format;
					if (!format) format = 'gen9';
				}
				if (!format) continue;
				if (format in folderTable) continue;
				folderTable[format] = 1;
				if (format.slice(-1) === '/') {
					folders.push('Z' + (format.slice(0, -1) || '~'));
					if (!('/' in folderTable)) {
						folders.push('Z~');
						folderTable['/'] = 1;
					}
					continue;
				}
				if (format === 'gen9') {
					folders.push('A~');
					continue;
				}
				switch (format.slice(0, 4)) {
				case 'gen1': format = 'I' + format.slice(4); break;
				case 'gen2': format = 'H' + format.slice(4); break;
				case 'gen3': format = 'G' + format.slice(4); break;
				case 'gen4': format = 'F' + format.slice(4); break;
				case 'gen5': format = 'E' + format.slice(4); break;
				case 'gen6': format = 'D' + format.slice(4); break;
				case 'gen7': format = 'C' + format.slice(4); break;
				case 'gen8': format = 'B' + format.slice(4); break;
				case 'gen9': format = 'A' + format.slice(4); break;
				default: format = 'X' + format; break;
				}
				folders.push(format);
			}
			folders.sort();
			var gen = '';
			var formatFolderBuf = '<div class="foldersep"></div>';
			formatFolderBuf += '<div class="folder"><div class="selectFolder" data-value="+"><i class="fa fa-plus"></i><em>(add format folder)</em></div></div>';
			for (var i = 0; i < folders.length; i++) {
				var format = folders[i];
				var newGen;
				switch (format.charAt(0)) {
				case 'I': newGen = '1'; break;
				case 'H': newGen = '2'; break;
				case 'G': newGen = '3'; break;
				case 'F': newGen = '4'; break;
				case 'E': newGen = '5'; break;
				case 'D': newGen = '6'; break;
				case 'C': newGen = '7'; break;
				case 'B': newGen = '8'; break;
				case 'A': newGen = '9'; break;
				case 'X': newGen = 'X'; break;
				case 'Z': newGen = '/'; break;
				}
				if (gen !== newGen) {
					gen = newGen;
					if (gen === '/') {
						buf += formatFolderBuf;
						formatFolderBuf = '';
						buf += '<div class="foldersep"></div>';
						buf += '<div class="folder"><h3>Folders</h3></div>';
					} else if (gen === 'X') {
						buf += '<div class="folder"><h3>???</h3></div>';
					} else {
						buf += '<div class="folder"><h3>Gen ' + gen + '</h3></div>';
					}
				}
				var formatName;
				if (gen === '/') {
					formatName = format.slice(1);
					format = formatName + '/';
					if (formatName === '~') {
						formatName = '(uncategorized)';
						format = '/';
					} else {
						formatName = BattleLog.escapeHTML(formatName);
					}
					buf += '<div class="folder' + (this.curFolder === format ? ' cur"><div class="folderhack3"><div class="folderhack1"></div><div class="folderhack2"></div>' : '">') + '<div class="selectFolder" data-value="' + format + '"><i class="fa ' + (this.curFolder === format ? 'fa-folder-open' : 'fa-folder') + (format === '/' ? '-o' : '') + '"></i>' + formatName + '</div></div>' + (this.curFolder === format ? '</div>' : '');
					continue;
				}
				formatName = format.slice(1);
				if (formatName === '~') formatName = '';
				format = 'gen' + newGen + formatName;
				if (format.length === 4) formatName = '(uncategorized)';
				// folders are <div>s rather than <button>s because in theory it has
				// less weird interactions with HTML5 drag-and-drop
				buf += '<div class="folder' + (this.curFolder === format ? ' cur"><div class="folderhack3"><div class="folderhack1"></div><div class="folderhack2"></div>' : '">') + '<div class="selectFolder" data-value="' + format + '"><i class="fa ' + (this.curFolder === format ? 'fa-folder-open-o' : 'fa-folder-o') + '"></i>' + formatName + '</div></div>' + (this.curFolder === format ? '</div>' : '');
			}
			buf += formatFolderBuf;
			buf += '<div class="foldersep"></div>';
			buf += '<div class="folder"><div class="selectFolder" data-value="++"><i class="fa fa-plus"></i><em>(add folder)</em></div></div>';

			buf += '<div class="folderlistafter"></div></div>';

			this.$('.folderpane').html(buf);
		},

        updateDraftList: function (resetScroll) {
			var drafts = this.getDrafts();
			var buf = '';

			var filterFormat = '';

			// filterFolder === undefined: show teams in any folder
			// filterFolder === '': show only teams that don't have a folder
			var filterFolder;

			if (!this.curFolder) {
				buf += '<h2>All drafts <small style="font-weight: normal">(' + drafts.length + ')</small></h2>';
			} else {
				if (this.curFolder.slice(-1) === '/') {
					filterFolder = this.curFolder.slice(0, -1);
					if (filterFolder) {
						buf += '<h2><i class="fa fa-folder-open"></i> ' + filterFolder + ' <button class="button small" style="margin-left:5px" name="renameFolder"><i class="fa fa-pencil"></i> Rename</button> <button class="button small" style="margin-left:5px" name="promptDeleteFolder"><i class="fa fa-times"></i> Remove</button></h2>';
					} else {
						buf += '<h2><i class="fa fa-folder-open-o"></i> Teams not in any folders</h2>';
					}
				} else {
					filterFormat = this.curFolder;
					var func = function (draft) {
						return draft.format === filterFormat;
					};
					buf += '<h2><i class="fa fa-folder-open-o"></i> ' + filterFormat + ' <small style="font-weight: normal">(' + drafts.filter(func).length + ')</small></h2>';
				}
			}

			var newDraftButtonText = "New Draft";
			if (filterFolder) newTeamButtonText = "New Draft in folder";
			if (filterFormat && filterFormat !== 'gen9') {
				newDraftButtonText = "New " + BattleLog.escapeFormat(filterFormat) + " Team";
			}
			buf += '<p><button name="newTop" value="draft" class="button big"><i class="fa fa-plus-circle"></i> ' + newDraftButtonText + '</button> ' +
				'<input type="text" id="draftSearchBar" name="search" class="textbox searchinput" value="' + this.curSearchVal + '" placeholder="search drafts"/></p>';

			buf += '<ul class="teamlist">';
			var atLeastOne = false;

			if (!drafts.length) {
				if (this.deletedDraftLoc >= 0) {
					buf += '<li><button name="undoDelete"><i class="fa fa-undo"></i> Undo Delete</button></li>';
				}
				buf += '<li><p><em>you don\'t have any drafts lol</em></p></li>';
			} else {

				for (var i = 0; i < drafts.length + 1; i++) {
					if (i === this.deletedDraftLoc) {
						if (!atLeastOne) atLeastOne = true;
						buf += '<li><button name="undoDelete"><i class="fa fa-undo"></i> Undo Delete</button></li>';
					}
					if (i >= drafts.length) break;

					var draft = drafts[i];

					// TODO: Check doesn't work for drafts
					// if (draft && !draft.team && draft.team !== '') {
					// 	draft = null;
					// }
					// if (!draft) {
					// 	buf += '<li>Error: A corrupted draft was dropped</li>';
					// 	drafts.splice(i, 1);
					// 	i--;
					// 	if (this.deletedDraftLoc && this.deletedDraftLoc > i) this.deletedDraftLoc--;
					// 	continue;
					// }

					if (filterFormat && filterFormat !== (draft.format || 'gen9')) continue;
					if (filterFolder !== undefined && filterFolder !== draft.folder) continue;

					if (this.curSearchVal) {
						// If a Pokemon hasn't been given a nickname, species is omitted
						// from the packed team.team in favor of the name field
						// since the name defaults to the species' display name.
						// While eliminating this redundancy between name and species
						// helps with packed team size, the display name unfortunately
						// won't match the ID search term and so we need to special case
						// searching for Pokemon here
						// TODO: Hacked to work for draft names?
						var name = draft.name.map(function (el) {
							return el;
						});
						var searchVal = this.curSearchVal.split(',').map(function (el) {
							return el;
						});
						var meetsCriteria = searchVal.every(function (el) {
							return draft.name.indexOf(el) > -1 || name.includes(el);
						});
						if (!meetsCriteria) continue;
					}

					if (!atLeastOne) atLeastOne = true;
					var formatText = '';
					if (draft.format) {
						formatText = '[' + draft.format + '] ';
					}
					if (draft.folder) formatText += draft.folder + '/';

					// teams and boxes are <div>s rather than <button>s because Firefox doesn't
					// support dragging and dropping buttons.
					buf += '<li><div name="edit" data-value="' + i + '" class="team';
					if (draft.capacity === 24) buf += ' pc-box';
					buf += '" draggable="true">' + BattleLog.escapeHTML(formatText) + '<strong>' + BattleLog.escapeHTML(draft.name) + '</strong><br /><small>';
					// buf += Storage.getTeamIcons(draft);TODO: Replace this with a call to get drafted pokemon preview or just a league image?
					buf += '</small></div><button name="leave" value="' + i + '"><i class="fa fa-hand-peace-o"></i> Drop Out</button></li>';

				}
				if (!atLeastOne) {
					if (filterFolder) {
						buf += '<li><p><em>you don\'t have any drafts in this folder lol</em></p></li>';
					} else {
						buf += '<li><p><em>you don\'t have any ' + this.curFolder + ' drafts lol</em></p></li>';
					}
				}
			}

			buf += '</ul><p>';
			if (atLeastOne) {
				buf += '<button name="new" value="draft" class="button"><i class="fa fa-plus-circle"></i> ' + newDraftButtonText + '</button>';
			}
			buf += '</p>';

			var $pane = this.$('.draftpane');
			$pane.html(buf);
			if (resetScroll) {
				$pane.scrollTop(0);
			} else if (this.draftScrollPos) {
				$pane.scrollTop(this.draftScrollPos);
				this.draftScrollPos = 0;
			}

			// reset focus to searchbar
			var draftSearchBar = this.$("#draftSearchBar");
			var strLength = draftSearchBar.val().length;
			if (strLength) {
				draftSearchBar.focus();
				draftSearchBar[0].setSelectionRange(strLength, strLength);
			}
		},


    })

})(window, jQuery);