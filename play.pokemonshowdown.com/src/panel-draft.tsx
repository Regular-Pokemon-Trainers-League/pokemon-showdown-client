import { PS, PSRoom, type RoomID, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { PSTeambuilder, TeamBox } from "./panel-teamdropdown";
import { Dex, PSUtils, toID, type ID } from "./battle-dex";
import { Teams } from "./battle-teams";
import { BattleLog } from "./battle-log";
import { type Draft } from "./draft";

class DraftsRoom extends PSRoom {
    readonly DEFAULT_FORMAT = Dex.modid;
	curFolder = '';
	curFolderKeep = '';
	searchTerms: string[] = [];

    updateSearch = (value: string) => {
		if (!value) {
			this.searchTerms = [];
		} else {
			this.searchTerms = value.split(",").map(q => q.trim().toLowerCase());
		}
	};
    matchesSearch = (draft: Draft | null) => {
		if (!draft) return false;
		if (this.searchTerms.length === 0) return true;
		const normalized = draft.name.toLowerCase();
		return this.searchTerms.every(term => normalized.includes(term));
	};
}

class DraftsPanel extends PSRoomPanel<DraftsRoom> {
    static readonly id = 'drafts';
	static readonly routes = ['drafts'];
	static readonly Model = DraftsRoom;
	static readonly icon = <i class="fa fa-group" aria-hidden></i>;
	static readonly title = 'Drafts';
    selectFolder = (e: MouseEvent) => {
		const room = this.props.room;
		let elem = e.target as HTMLElement | null;
		let folder: string | null = null;
		while (elem) {
			if (elem.getAttribute('data-href')) {
				return;
			}
			if (elem.className === 'selectFolder') {
				folder = elem.getAttribute('data-value') || '';
				break;
			}
			if (elem.className === 'folderlist') {
				return;
			}
			elem = elem.parentElement;
		}
		if (folder === null) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		if (folder === '++') {
			PS.prompt("Folder name?", '', { parentElem: elem!, okButton: "Create" }).then(name => {
				if (!name) return;
				room.curFolderKeep = `${name}/`;
				room.curFolder = `${name}/`;
				this.forceUpdate();
			});
			return;
		}
		room.curFolder = folder;
		this.forceUpdate();
	};
    addFormatFolder = (ev: Event) => {
		const room = this.props.room;
		const button = ev.currentTarget as HTMLButtonElement;
		const folder = toID(button.value);
		room.curFolderKeep = folder;
		room.curFolder = folder;
		button.value = '';
		this.forceUpdate();
	};
	updateSearch = (ev: KeyboardEvent) => {
		const target = ev.currentTarget as HTMLInputElement;
		this.props.room.updateSearch(target.value);
		this.forceUpdate();
	};
	clearSearch = () => {
		const target = this.base!.querySelector<HTMLInputElement>('input[type="search"]');
		if (!target) return;
		target.value = '';
		this.props.room.updateSearch('');
	};

    getDrafts() {
        //Replace this function with call to get drafts from database
        let draft1: (Draft | null) = {"name": "RPTS Season 1", "format": toID("NatDex6v6"), "folder": "RPTS", "key": "RPTS_S1"}
        let draft2: (Draft | null) = {"name": "RPTL Season 15", "format": toID("NatDex6v6"), "folder": "RPTL", "key": "RPTL_S15"}

        return [draft1, draft2];
    }

    renderFolder(value: string) {
		const { room } = this.props;
		const cur = room.curFolder === value;
		let children;
		const folderOpenIcon = cur ? 'fa-folder-open' : 'fa-folder';
		if (value.endsWith('/')) {
			// folder
			children = [
				<i class={`fa ${folderOpenIcon}${value === '/' ? '-o' : ''}`}></i>,
				value.slice(0, -1) || '(uncategorized)',
			];
		} else if (value === '') {
			children = [
				<em>(all)</em>,
			];
		} else if (value === '++') {
			children = [
				<i class="fa fa-plus" aria-hidden></i>,
				<em>(add folder)</em>,
			];
		} else {
			children = [
				<i class={`fa ${folderOpenIcon}-o`}></i>,
				value.slice(4) || '(uncategorized)',
			];
		}

		// folders were <div>s rather than <button>s because in theory it has
		// less weird interactions with HTML5 drag-and-drop (looking at Firefox)
		// modern browsers don't seem to have these bugs, so we're going to make
		// them buttons for now
		const active = (PS.dragging as any)?.folder === value ? ' active' : '';
		if (cur) {
			return <div
				class="folder cur" data-value={value}
			>
				<div class="folderhack3">
					<div class="folderhack1"></div><div class="folderhack2"></div>
					<button class={`selectFolder${active}`} data-value={value}>{children}</button>
				</div>
			</div>;
		}
		return <div
			class="folder" data-value={value}
		>
			<button class={`selectFolder${active}`} data-value={value}>{children}</button>
		</div>;
	}

    renderFolderList() {
		const room = this.props.room;
		// The folder list isn't actually saved anywhere:
		// it's regenerated anew from the team list every time.

		// (This is why folders you create will automatically disappear
		// if you leave them without adding anything to them.)

		const folderTable: { [folder: string]: 1 | undefined } = { '': 1 };
		const folders: string[] = [];
		for (const draft of this.getDrafts()) {
			const folder = draft.folder;
			if (folder && !(`${folder}/` in folderTable)) {
				folders.push(`${folder}/`);
				folderTable[`${folder}/`] = 1;
				if (!('/' in folderTable)) {
					folders.push('/');
					folderTable['/'] = 1;
				}
			}

			const format = draft.format || room.DEFAULT_FORMAT;
			if (!(format in folderTable)) {
				folders.push(format);
				folderTable[format] = 1;
			}
		}
		if (room.curFolderKeep.endsWith('/') || room.curFolder.endsWith('/')) {
			if (!('/' in folderTable)) {
				folders.push('/');
				folderTable['/'] = 1;
			}
		}
		if (!(room.curFolderKeep in folderTable)) {
			folderTable[room.curFolderKeep] = 1;
			folders.push(room.curFolderKeep);
		}
		if (!(room.curFolder in folderTable)) {
			folderTable[room.curFolder] = 1;
			folders.push(room.curFolder);
		}

		PSUtils.sortBy(folders, folder => [
			folder.endsWith('/') ? 10 : -parseInt(folder.charAt(3), 10),
			folder,
		]);

		let renderedFormatFolders = [
			<div class="foldersep"></div>,
			<div class="folder"><button
				name="format" value="" data-selecttype="drafts"
				class="selectFolder" data-href="/formatdropdown" onChange={this.addFormatFolder}
			>
				<i class="fa fa-plus" aria-hidden></i><em>(add format folder)</em>
			</button></div>,
		];

		let renderedFolders: preact.ComponentChild[] = [];

		renderedFolders.push(...renderedFormatFolders);

		return <div class="folderlist" onClick={this.selectFolder}>
			<div class="folderlistbefore"></div>

			{this.renderFolder('')}
			{renderedFolders}
			<div class="foldersep"></div>
			{this.renderFolder('++')}

			<div class="folderlistafter"></div>
		</div>;
	}

    override render() {
		const room = this.props.room;
		let drafts: (Draft | null)[] = this.getDrafts(); // TODO: how to store get drafts

		let filterFolder: string | null = null;
		let filterFormat: string | null = null;
		let draftTerm = 'draft';
		if (room.curFolder) {
			if (room.curFolder.endsWith('/')) {
				filterFolder = room.curFolder.slice(0, -1);
				drafts = drafts.filter(draft => !draft || draft.folder === filterFolder);
				draftTerm = 'draft in folder';
			} else {
				filterFormat = room.curFolder;
				drafts = drafts.filter(draft => !draft || draft.format === filterFormat);
				if (filterFormat !== Dex.modid) draftTerm = BattleLog.formatName(filterFormat) + ' team';
			}
		}

		const filteredTeams = drafts.filter(room.matchesSearch);

		return <PSPanelWrapper room={room}>
			<div class="folderpane">
				{this.renderFolderList()}
			</div>
			<div class="draftpane">
				{filterFolder ? (
					<h2>
						<i class="fa fa-folder-open" aria-hidden></i> {filterFolder} {}
						<button class="button small" style="margin-left:5px" name="renameFolder">
							<i class="fa fa-pencil" aria-hidden></i> Rename
						</button> {}
						<button class="button small" style="margin-left:5px" name="promptDeleteFolder">
							<i class="fa fa-times" aria-hidden></i> Remove
						</button>
					</h2>
				) : filterFolder === '' ? (
					<h2><i class="fa fa-folder-open-o" aria-hidden></i> Teams not in any folders</h2>
				) : filterFormat ? (
					<h2><i class="fa fa-folder-open-o" aria-hidden></i> {filterFormat} <small>({drafts.length})</small></h2>
				) : (
					<h2>All Teams <small>({drafts.length})</small></h2>
				)}
				<p>
					<button data-cmd="/newteam" class="button big">
						<i class="fa fa-plus-circle" aria-hidden></i> New {draftTerm}
					</button> {}
					<button data-cmd="/newteam box" class="button">
						<i class="fa fa-archive" aria-hidden></i> New box
					</button>
					<input
						type="search" class="textbox" placeholder="Search teams"
						style="margin-left:5px;" onKeyUp={this.updateSearch}
					></input>
				</p>
				<ul class="draftlist">
					{!drafts.length ? (
						<li><em>you have no teams lol</em></li>
					) : !filteredTeams.length ? (
						<li><em>you have no teams matching <code>{room.searchTerms.join(", ")}</code></em></li>
					) : filteredTeams.map(team => team ? (
						<li key={team.key} data-teamkey={team.key}>
							{/* <TeamBox team={team} onClick={this.clearSearch} /> {}
							{!team.uploaded && <button data-cmd={`/deleteteam ${team.key}`} class="option">
								<i class="fa fa-trash" aria-hidden></i> Delete
							</button>} {}
							{team.uploaded?.private ? (
								<i class="fa fa-cloud gray"></i>
							) : team.uploaded ? (
								<i class="fa fa-globe gray"></i>
							) : team.teamid ? (
								<i class="fa fa-plug gray"></i>
							) : (
								null
							)} */}
						</li>
					) : (
						<li key="undelete">
							<button data-cmd="/undeleteteam" class="option">
								<i class="fa fa-undo" aria-hidden></i> Undo delete
							</button>
						</li>
					))}
				</ul>
				<p>
					<button data-cmd="/newteam bottom" class="button">
						<i class="fa fa-plus-circle" aria-hidden></i> New {draftTerm}
					</button> {}
					<button data-cmd="/newteam box bottom" class="button">
						<i class="fa fa-archive" aria-hidden></i> New box
					</button>
				</p>
			</div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(DraftsPanel);
