/** @jsx preact.h */
import preact from 'preact';
import {Net, PSModel} from './utils';
import {BattlePanel} from './replays-battle';
declare function toID(input: string): string;

interface ReplayResult {
  uploadtime: number;
  id: string;
  format: string;
  players: string[];
  password?: string;
  private?: number;
  rating?: number;
}

class SearchPanel extends preact.Component<{id: string}> {
  results: ReplayResult[] | null = null;
  resultError: string | null = null;
  format = '';
  user = '';
  isPrivate = false;
  byRating = false;
  page = 1;
  loggedInUser: string | null = null;
  loggedInUserIsSysop = false;
  sort = 'date';
  override componentDidMount() {
    Net('/check-login.php').get().then(result => {
      if (result.charAt(0) !== ']') return;
      const [userid, sysop] = result.slice(1).split(',');
      this.loggedInUser = userid;
      this.loggedInUserIsSysop = !!sysop;
      this.forceUpdate();
    });
    this.updateSearch(Net.decodeQuery(this.props.id));
  }
  override componentDidUpdate(previousProps: this['props']) {
    if (this.props.id === previousProps.id) return;
    const query = Net.decodeQuery(this.props.id);
    const page = parseInt(query.page || '1');
    const byRating = (query.sort === 'rating');
    if (page !== this.page || byRating !== this.byRating) this.updateSearch(query);
  }
  updateSearch(query: {[k: string]: string}) {
    const user = query.user || '';
    const format = query.format || '';
    const page = parseInt(query.page || '1');
    const isPrivate = !!query.private;
    this.byRating = (query.sort === 'rating');
    this.search(user, format, isPrivate, page);
  }
  parseResponse(response: string, isPrivate?: boolean) {
    this.results = null;
    this.resultError = null;

    if (isPrivate) {
      if (response.charAt(0) !== ']') {
        this.resultError = `Unrecognized response: ${response}`;
        return;
      }
      response = response.slice(1);
    }
    const results = JSON.parse(response);
    if (!Array.isArray(results)) {
      this.resultError = results.actionerror || `Unrecognized response: ${response}`;
      return;
    }
    this.results = results;
  }
  search(user: string, format: string, isPrivate?: boolean, page = 1) {
    this.base!.querySelector<HTMLInputElement>('input[name=user]')!.value = user;
    this.base!.querySelector<HTMLInputElement>('input[name=format]')!.value = format;
    this.base!.querySelectorAll<HTMLInputElement>('input[name=private]')[isPrivate ? 1 : 0]!.checked = true;

    if (!format && !user) return this.recent();
    this.user = user;
    this.format = format;
    this.isPrivate = !!isPrivate;
    this.page = page;
    this.results = null;
    this.resultError = null;
    if (user || !format) this.byRating = false;

    if (!format && !user) {
      PSRouter.replace('')
    } else {
      PSRouter.replace('?' + Net.encodeQuery({
        user: user || undefined,
        format: format || undefined,
        private: isPrivate ? '1' : undefined,
        page: page === 1 ? undefined : page,
        sort: this.byRating ? 'rating' : undefined,
      }));
    }
    this.forceUpdate();
    Net(`/api/replays/${isPrivate ? 'searchprivate' : 'search'}`).get({
      query: {
        username: this.user,
        format: this.format,
        page,
        sort: this.byRating ? 'rating' : undefined,
      },
    }).then(response => {
      if (this.format !== format || this.user !== user) return;
      this.parseResponse(response, true);
      this.forceUpdate();
    }).catch(error => {
      if (this.format !== '' || this.user !== '') return;
      this.resultError = '' + error;
      this.forceUpdate();
    });
  }
  modLink(overrides: {page?: number, sort?: string}) {
    const newPage = (overrides.page !== undefined ? this.page + overrides.page : 1);
    return './?' + Net.encodeQuery({
      user: this.user || undefined,
      format: this.format || undefined,
      private: this.isPrivate ? '1' : undefined,
      page: newPage === 1 ? undefined : newPage,
      sort: (overrides.sort ? overrides.sort === 'rating' : this.byRating) ? 'rating' : undefined,
    });
  }
  recent() {
    this.format = '';
    this.user = '';
    this.results = null;
    this.forceUpdate();
    Net('/api/replays/recent').get().then(response => {
      if (this.format !== '' || this.user !== '') return;
      this.parseResponse(response, true);
      this.forceUpdate();
    }).catch(error => {
      if (this.format !== '' || this.user !== '') return;
      this.resultError = '' + error;
      this.forceUpdate();
    });
  }
  submitForm = (e: Event) => {
    e.preventDefault();
    const format = this.base!.querySelector<HTMLInputElement>('input[name=format]')?.value || '';
    const user = this.base!.querySelector<HTMLInputElement>('input[name=user]')?.value || '';
    const isPrivate = !this.base!.querySelector<HTMLInputElement>('input[name=private]')?.checked;
    this.search(user, format, isPrivate);
  };
  cancelForm = (e: Event) => {
    e.preventDefault();
    this.search('', '');
  };
  searchLoggedIn = (e: Event) => {
    if (!this.loggedInUser) return; // shouldn't happen
    (this.base!.querySelector('input[name=user]') as HTMLInputElement).value = this.loggedInUser;
    this.submitForm(e);
  };
  url(replay: ReplayResult) {
    const viewpointSwitched = (toID(replay.players[1]) === toID(this.user));
    return replay.id + (replay.password ? `-${replay.password}pw` : '') + (viewpointSwitched ? '?p2' : '');
  }
  formatid(replay: ReplayResult) {
    let formatid = replay.format;
    if (!formatid.startsWith('gen') || !/[0-9]/.test(formatid.charAt(3))) {
      // 2013 Oct 14, two days after X and Y were released; good enough
      // estimate for when we renamed `ou` to `gen5ou`.
      formatid = (replay.uploadtime > 1381734000 ? 'gen6' : 'gen5') + formatid;
    }
    if (!/^gen[0-9]+-/.test(formatid)) {
      formatid = formatid.slice(0, 4) + '-' + formatid.slice(4);
    }
    return formatid;
  }
  override render() {
    const activelySearching = !!(this.format || this.user);
    const hasNextPageLink = (this.results?.length || 0) > 50;
    const results = hasNextPageLink ? this.results!.slice(0, 50) : this.results;
    const searchResults = <ul class="linklist">
      {(this.resultError && <li>
        <strong class="message-error">{this.resultError}</strong>
      </li>) ||
      (!results && <li>
        <em>Loading...</em>
      </li>) ||
      (results?.map(result => <li>
        <a href={this.url(result)} class="blocklink">
          <small>{result.format}{result.rating ? ` (Rating: ${result.rating})` : ''}<br /></small>
          {!!result.private && <i class="fa fa-lock"></i>} {}
          <strong>{result.players[0]}</strong> vs. <strong>{result.players[1]}</strong>
        </a>
      </li>))}
    </ul>;
    return <div class={PSRouter.showingRight() ? 'sidebar' : ''}>
      <section class="section first-section">
        <h1>Search replays</h1>
        <form onSubmit={this.submitForm}>
          <p>
            <label>
              Username:<br />
              <input type="search" class="textbox" name="user" placeholder="(blank = any user)" size={20} /> {}
              {this.loggedInUser && <button type="button" class="button" onClick={this.searchLoggedIn}>{this.loggedInUser}'s replays</button>}
            </label>
          </p>
          <p>
            <label>Format:<br />
            <input type="search" class="textbox" name="format" placeholder="(blank = any format)" size={30} /></label>
          </p>
          <p>
            <label class="checkbox inline"><input type="radio" name="private" value="" /> Public</label> {}
            <label class="checkbox inline"><input type="radio" name="private" value="1" /> Private (your own replays only)</label>
          </p>
          <p>
            <button type="submit" class="button"><i class="fa fa-search" aria-hidden></i> <strong>Search</strong></button> {}
            {activelySearching && <button class="button" onClick={this.cancelForm}>Cancel</button>}
          </p>
          {activelySearching && <h1 aria-label="Results"></h1>}
          {activelySearching && this.format && !this.user && <p>
            Sort by: {}
            <a href={this.modLink({sort: 'date'})} class={`button button-first${this.byRating ? '' : ' disabled'}`}>
              Date
            </a>
            <a href={this.modLink({sort: 'rating'})} class={`button button-last${this.byRating ? ' disabled' : ''}`}>
              Rating
            </a>
          </p>}
          {activelySearching && this.page > 1 && <p class="pagelink">
            <a href={this.modLink({page: -1})} class="button"><i class="fa fa-caret-up"></i><br />Page {this.page - 1}</a>
          </p>}
          {activelySearching && searchResults}
          {activelySearching && (this.results?.length || 0) > 50 && <p class="pagelink">
            <a href={this.modLink({page: 1})} class="button">Page {this.page + 1}<br /><i class="fa fa-caret-down"></i></a>
          </p>}
        </form>
      </section>
      {!activelySearching && <FeaturedReplays />}
      {!activelySearching && <section class="section">
        <h1>Recent replays</h1>
        <ul class="linklist">
          {searchResults}
        </ul>
      </section>}
    </div>;
  }
}

class FeaturedReplays extends preact.Component {
  week = Array(10).fill(false);
  showWeekTwo = (e: Event) => {
    e.preventDefault();
    this.week[1] = false;
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
        <h2>Week 2</h2>
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
        </a></li>
        {/* {!this.week[1] && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showWeekTwo}>Week 2 <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.week[1] &&  <ul class="linklist"> <li><a href="mundanton-gen9natdex6v6doublesdraft-836" class="blocklink">
          <small>[gen9natdex6v6doublesdraft]<br /></small>
          <strong>Team Zorua</strong> vs. <strong>Tinkering Tinkatons</strong>
          <small><br />Week 2</small>
        </a></li></ul>} */}
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
    if (!href.startsWith(this.baseLoc)) return false;

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
  }
  override render() {
    const position = PSRouter.showingLeft() && PSRouter.showingRight() && !PSRouter.stickyRight ?
      {display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'} : {};
    return <div class={'bar-wrapper' + (PSRouter.showingLeft() && PSRouter.showingRight() ? ' has-sidebar' : '')} style={position}>
      {PSRouter.showingLeft() && <SearchPanel id={PSRouter.leftLoc!} />}
      {PSRouter.showingRight() && <BattlePanel id={PSRouter.rightLoc!} />}
      <div style={{clear: 'both'}}></div>
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
