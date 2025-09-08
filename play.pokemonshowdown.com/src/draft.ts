import { PS, PSRoom, type RoomID, type Team } from "./client-main";
import { type ID } from "./battle-dex-data";

export interface Draft {
    name: string;
    format: ID;
    folder: string;
    /** Used in roomids (`team-[key]`) to refer to the team. Always persists within
      * a single session, but not always between refreshes. As long as a team still
        * exists, pointers to a Team are equivalent to a key. */
    key: string;
    /** uploaded team ID. will not exist for teams that are not uploaded. tracked locally */
    draftid?: number;
}