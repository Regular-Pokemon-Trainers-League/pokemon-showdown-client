/** @jsx preact.h */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { Net, PSModel } from './utils';
import { BattlePanel } from './replays-battle';
import { SearchPanel } from './replays-index';
declare const Config: any;

interface ReplayResult {
  uploadtime: number;
  id: string;
  format: string;
  players: string[];
  password?: string;
  private?: number;
  rating?: number;
}

class FeaturedReplays extends preact.Component {
  week = Array(10).fill(false);
  showWeekThree = (e: Event) => {
    e.preventDefault();
    this.week[2] = true;
    this.forceUpdate();
  };
  showWeekTwo = (e: Event) => {
    e.preventDefault();
    this.week[1] = true;
    this.forceUpdate();
  };
  showWeekOne = (e: Event) => {
    e.preventDefault();
    this.week[0] = true;
    this.forceUpdate();
  };
  override render() {
    return <section class="section">
      <h1>RPTL S13</h1>
      <img src="//rptl.us/sprites/sudowoodo_punching.gif" alt="" style={{imageRendering: 'pixelated'}} />
      <ul class="linklist">
        <h2>Week 4</h2>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-1006" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Uncle Sanskaar's Noodle House</strong> vs. <strong>Waugatuck Wonders</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-998" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Lacunosa Little League</strong> vs. <strong>Kakuna's Law Firm</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-1004" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Regular Pokemon Trainers Team</strong> vs. <strong>Edison Electric MilliVolts</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-1027" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Beads of Ruin</strong> vs. <strong>Inazuma Elekids</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-1010" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Himalayan Hemorrhoids</strong> vs. <strong>Spheal City Junior</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-1033" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Viking Veluza</strong> vs. <strong>Kakuna's Law Firm</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-995" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Uncle Sanskaar's Noodle House</strong> vs. <strong>Tinkering Tinkatons</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-1003" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Lumiose City Larvitars</strong> vs. <strong>KinderGarden State Gastlys</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-1005" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Regular Pokemon Trainers Team</strong> vs. <strong>Lacunosa Little League</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-994" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Inazuma Elekids</strong> vs. <strong>Portland Popplios</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-975" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>The Goofy Goomers</strong> vs. <strong>Team Zorua</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-974" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>KinderGarden State Gastlys</strong> vs. <strong>Pittsburgh Sphealers</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-971" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Team Zorua</strong> vs. <strong>Insomnia City Wooper Troopers</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-970" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Pittsburgh Sphealers</strong> vs. <strong>Insomnia City Wooper Troopers</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-968" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Edison Electric MilliVolts</strong> vs. <strong>Himalayan Hemorrhoids</strong>
          <small><br />Week 4</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-967" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Tinkering Tinkatons</strong> vs. <strong>Viking Veluza</strong>
          <small><br />Week 4</small>
        </a></li>
        {!this.week[2] && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showWeekThree}>Week 3 <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.week[2] && <h2>Week 3</h2>}
        {this.week[2] &&  <ul class="linklist">
        <li><a href="mundanton-gen9natdex6v6doublesdraft-976" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>The Goofy Goomers</strong> vs. <strong>KinderGarden State Gastlys</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-965" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Spheal City Junior</strong> vs. <strong>Lacunosa Little League</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-951" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Waugatuck Wonders</strong> vs. <strong>Team Zorua</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-950" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Lumiose City Larvitars</strong> vs. <strong>Waugatuck Wonders</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-949" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Tinkering Tinkatons</strong> vs. <strong>Pittsburgh Sphealers</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-948" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Edison Electric MilliVolts</strong> vs. <strong>Insomnia City Wooper Troopers</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-947" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>KinderGarden State Gastlys</strong> vs. <strong>Edison Electric MilliVolts</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-946" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Pittsburgh Sphealers</strong> vs. <strong>Lumiose City Larvitars</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-945" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Beads of Ruin</strong> vs. <strong>Lacunosa Little League</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-943" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Portland Popplios</strong> vs. <strong>Tinkering Tinkatons</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-942" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Beads of Ruin</strong> vs. <strong>Kakuna's Law Firm</strong>
          <small><br />Week 3</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-941" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Team Zorua</strong> vs. <strong>Kakuna's Law Firm</strong>
          <small><br />Week 3</small>
        </a></li>
        </ul>}
        {!this.week[1] && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showWeekTwo}>Week 2 <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.week[1] && <h2>Week 2</h2>}
        {this.week[1] &&  <ul class="linklist">
        <li><a href="mundanton-gen9natdex6v6doublesdraft-973" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Spheal City Junior</strong> vs. <strong>Viking Veluza</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-972" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Spheal City Junior</strong> vs. <strong>The Goofy Goomers</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-969" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Insomnia Wooper Troopers</strong> vs. <strong>Himalayan Hemorrhoids</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-932" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Uncle Sanskaar's Noodle House</strong> vs. <strong>Inazuma Elekids</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-930" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Rocket City Trash Pandas</strong> vs. <strong>The Goofy Goomers</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-911" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Team Zorua</strong> vs. <strong>Uncle Sanskaar's Noodle House</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-905" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Beads of Ruin</strong> vs. <strong>KinderGarden State Gastlys</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-903" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>KinderGarden State Gastlys</strong> vs. <strong>Insomnia City Wooper Troopers</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-899" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Inazuma Elekids</strong> vs. <strong>Edison Electric MilliVolts</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-899" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Kakuna's Law Firm</strong> vs. <strong>Portland Popplios</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-877" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Waugatuck Wonders</strong> vs. <strong>Regular Pokemon Trainers Team</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-876" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Lumiose City Larvitars</strong> vs. <strong>Lacunosa Little League</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-875" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Viking Veluza</strong> vs. <strong>Pittsburgh Sphealers</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-871" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Tinkering Tinkatons</strong> vs. <strong>Kakuna's Law Firm</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-868" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Edison Electric MilliVolts</strong> vs. <strong>Lumiose City Larvitars</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-867" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Pittsburgh Sphealers</strong> vs. <strong>Waugatuck Wonders</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-852" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Himalayan Hemorrhoids</strong> vs. <strong>Lacunosa Little League</strong>
          <small><br />Week 2</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-836" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Team Zorua</strong> vs. <strong>Tinkering Tinkatons</strong>
          <small><br />Week 2</small>
        </a></li></ul>}
        {!this.week[0] && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showWeekOne}>Week 1 <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.week[0] && <h2>Week 1</h2>}
        {this.week[0] && <ul class="linklist"> <li><a href="mundanton-gen9natdex6v6doublesdraft-835" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Uncle Sanskaar's Noodle House</strong> vs. <strong>Himalayan Hemorrhoids</strong>
          <small><br />Week 1</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-829" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>The Goofy Goomers</strong> vs. <strong>Insomnia City Wooper Troopers</strong>
          <small><br />Week 1</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-828" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Spheal City Junior</strong> vs. <strong>Rocket City Trash Pandas</strong>
          <small><br />Week 1</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-790" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Team Zorua</strong> vs. <strong>Regular Pokemon Trainers Team</strong>
          <small><br />Week 1</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-789" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Tinkering Tinkatons</strong> vs. <strong>Lumiose City Larvitars</strong>
          <small><br />Week 1</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-759" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>The Pittsburgh Sphealers</strong> vs. <strong>Kakuna's Law Firm</strong>
          <small><br />Week 1</small>
        </a></li>
        <li><a href="mundanton-gen9natdex6v6doublesdraft-689" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>KinderGarden State Gastlys</strong> vs. <strong>Inazuma Elekid</strong>
          <small><br />Week 1</small>
        </a></li></ul>}
      </ul>
    </section>;
  }
}

export const PSRouter = new class extends PSModel {
	baseLoc: string;
	leftLoc: string | null = null;
	rightLoc: string | null = null;
	forceSinglePanel = false;
	stickyRight = true;
	constructor() {
		super();
		const baseLocSlashIndex = document.location.href.lastIndexOf('/');
		this.baseLoc = document.location.href.slice(0, baseLocSlashIndex + 1);
		if (Net.defaultRoute) {
			this.baseLoc = document.location.href.replace(/#.*/, '') + '#';
		}
		this.go(document.location.href);
		this.setSinglePanel(true);
		if (window.history) window.addEventListener('popstate', e => {
			PSRouter.popState(e);
			this.update();
		});
		window.onresize = () => {
			PSRouter.setSinglePanel();
		};
	}
	showingLeft() {
		return this.leftLoc !== null && (!this.forceSinglePanel || this.rightLoc === null);
	}
	showingRight() {
		return this.rightLoc !== null;
	}
	href(route: string | null) {
		return `${Net.defaultRoute ? '#' : route?.startsWith('?') ? './' : ''}${route || ''}` || '.';
	}
	setSinglePanel(init?: boolean) {
		const singlePanel = window.innerWidth < 1300;
		const stickyRight = (window.innerHeight > 614);
		if (this.forceSinglePanel !== singlePanel || this.stickyRight !== stickyRight) {
			this.forceSinglePanel = singlePanel;
			this.stickyRight = stickyRight;
			if (!init) this.update();
		}
	}
	push(href: string): boolean {
		if (!href.startsWith(this.baseLoc)) return false;

		if (this.go(href)) {
			window.history?.pushState([this.leftLoc, this.rightLoc], '', href);
		}
		return true;
	}
	/** returns whether the URL should change */
	go(href: string): boolean {
		if (!href.startsWith(this.baseLoc) && href + '#' !== this.baseLoc) return false;

		const loc = href.slice(this.baseLoc.length);
		if (!loc || loc.startsWith('?')) {
			this.leftLoc = loc;
			if (this.forceSinglePanel) {
				this.rightLoc = null;
			} else {
				return this.rightLoc === null;
			}
		} else {
			this.rightLoc = loc;
		}
		return true;
	}
	replace(loc: string) {
		const href = this.baseLoc + loc;
		if (this.go(href)) {
			window.history?.replaceState([this.leftLoc, this.rightLoc], '', href);
		}
		return true;
	}
	popState(e: PopStateEvent) {
		if (Array.isArray(e.state)) {
			const [leftLoc, rightLoc] = e.state;
			this.leftLoc = leftLoc;
			this.rightLoc = rightLoc;
			if (this.forceSinglePanel) this.leftLoc = null;
		} else {
			this.leftLoc = null;
			this.rightLoc = null;
			this.go(document.location.href);
		}
		this.update();
	}
};

export class PSReplays extends preact.Component {
	static darkMode: 'dark' | 'light' | 'auto' = 'auto';
	static updateDarkMode() {
		let dark = this.darkMode === 'dark' ? 'dark' : '';
		if (this.darkMode === 'auto') {
			dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : '';
		}
		document.documentElement.className = dark;
	}
	override componentDidMount() {
		PSRouter.subscribe(() => this.forceUpdate());
		if (window.history) {
			this.base!.addEventListener('click', e => {
				let el = e.target as HTMLElement;
				for (; el; el = el.parentNode as HTMLElement) {
					if (el.tagName === 'A' && PSRouter.push((el as HTMLAnchorElement).href)) {
						e.preventDefault();
						e.stopImmediatePropagation();
						this.forceUpdate();
						return;
					}
				}
			});
		}
		// load custom colors from loginserver
		Net(`https://${Config.routes.client}/config/colors.json`).get().then(response => {
			const data = JSON.parse(response);
			Object.assign(Config.customcolors, data);
		});
	}
	override render() {
		const position = PSRouter.showingLeft() && PSRouter.showingRight() && !PSRouter.stickyRight ?
			{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' } : {};
		return <div
			class={'bar-wrapper' + (PSRouter.showingLeft() && PSRouter.showingRight() ? ' has-sidebar' : '')} style={position}
		>
			{PSRouter.showingLeft() && <SearchPanel id={PSRouter.leftLoc!} />}
			{PSRouter.showingRight() && <BattlePanel id={PSRouter.rightLoc!} />}
			<div style={{ clear: 'both' }}></div>
		</div>;
	}
}

preact.render(<PSReplays />, document.getElementById('main')!);

if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
	document.documentElement.className = 'dark';
}
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
	if (PSReplays.darkMode === 'auto') document.documentElement.className = event.matches ? "dark" : "";
});
