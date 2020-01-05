
/**
 * STARTUP:
 *  - [ ] check env vars/config for: Joplin api key, mostRecentDate, base urls
 *  - [ ] if found in env var, update/create config accordingly
 *      - [ ] log and exit if api key not found
 *  - [ ] validate that both Joplin api and anki api are running
 *      - [ ] log and exit if not
 *  - [ ] check for Joplin model in anki, if not exist create
 *
 * EXPORT FROM JOPLIN
 *  - [ ] retrieve last run datetime from config file
 *  - [x] get list of updated/new note ids from Joplin
 *  - [ ] iterate list, for each:
 *      - [ ] get note
 *      - [ ] parse out quiz data
 *      - [ ] invoke ankiImport with it
 *      - [ ] if successful, update mostRecentDate based on note update date & increment success metric
 *      - [ ] if not successful, append id and error to errors array, increment failure metric
 *
 * IMPORT INTO ANKI
 *  - [ ] find note in anki by id field from joplin
 *      - [ ] if not found: create new note
 *      - [ ] if found: update by id
 *
 * FINISH:
 *  - [ ] update config file with mostRecentDate
 *  - [ ] log total success, and total failures with failure details
 */
