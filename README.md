# WIP Joplin to Anki

Create quiz entries inside Joplin notes and auto import them as notes into Anki. Currently WIP.

**Known Issues**

- Anki note browser should be closed during import; if open, _updates to note fields_ will not appear as expected.
- For markdown to render in the Default template `Answer` field a newline is needed after the `</summary>` tag

**TODO**

- [x] Convert markdown from Joplin to HTML in Anki.
- [x] Implement basic cli for configuring with params: urls, Joplin token, last export date. Store as config.
- [x] Get/update last export date as config.
- [ ] Improve logging: log levels exposed in cli, log summary of export / import.
- [ ] Document usage.
