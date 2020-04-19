# jta - Joplin to Anki

Create question/answers within Joplin notes and import them into Anki.

![jta demo](resources/jta-demo-captions.gif)

## Features

- Create jta question/answers in Joplin and sync them to Anki
- Sync updates to Anki
- Include images and code blocks in the question/answer fields
- Sync Joplin note tags, note title, and notebook name to Anki as note tags

Additionally, the provided `joplin-to-anki` template takes advantage of the HTML `details` tag so that the answer is hidden within a rendered Joplin note, but revealed on click.

## Setup

### Install Dependencies

- Install Node.js version 10 +
- Install npm
- Install [Anki Connect API](https://ankiweb.net/shared/info/2055492159); insure that you follow the full instructions [here](https://foosoft.net/projects/anki-connect/).
- Enable the [Joplin Web Clipper API](https://joplinapp.org/clipper/).

### Install & setup jta CLI

Clone this repository and install with npm:
`git clone https://github.com/BartBucknill/joplin-to-anki.git`
`cd joplin-to-anki`
`npm i -g .`

Configure `jta` to have your Joplin Web Clipper API token.
In your terminal: `jta config set -t [YOUR TOKEN HERE]>`

### Setup

Add [this](https://raw.githubusercontent.com/BartBucknill/joplin-to-anki/master/joplin-templates/joplin-to-anki.md) to your [Joplin templates](https://github.com/laurent22/joplin/blob/master/README.md#note-templates).

### Usage

**Start Anki and Joplin**

Ensure Anki, Anki Connect API, Joplin, and Joplin Web Clipper API are all running.

**Create a jta question/answer within a Joplin Note**

Insert the `jta` template: from the menu `File > Templates > Insert Template` and select `joplin-to-anki`, or use the keyboard shortcut.
Add your question and answer as below. Include images or code blocks if you want.

```
</span><span class="jta" data-id="2020-04-18T16-33-37-620">**Question:**<span class="question">

YOUR QUESTION HERE
</span><details class="answer">

YOUR ANSWER HERE

![helpful-image.jpg](:/fe8265525cb347d2bbfc70bd4xa89572)

Code blocks are OK too.

</details></span>
```

**Run jta**

In your terminal: `jta run`
By default this will check Joplin notes updated during the last day the first time you run it. Thereafter, it will only check notes updated since the last run.

**Check Anki**

You should now see the question/answer within Anki, in the deck `Joplin to Anki`.

## Known Issues

- Anki note browser should be closed during import; if open, **updates to note fields will not be synced from Joplin to Anki as expected**
- Syncing images into Anki is slow
- For markdown to render in the `joplin-to-anki` template `Answer` field _within Joplin_ a newline is needed after the `</summary>` tag
