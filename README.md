# MISSED. — Conversation Intelligence

MISSED. is a browser-based tool for reviewing exported chat conversations. It identifies likely action items, deadlines, questions, commitments, and possible changes, then shows the source messages so you can verify the context.

## Run locally

1. Clone or download this repository.
2. Open `index.html` in a modern browser. You can also open the folder in VS Code and use the Live Server extension.
3. Choose a plain-text `.txt` chat export (up to 2 MB).
4. Review or edit the parsed conversation, then select **Analyze conversation**.
5. Use the urgency filter to focus on critical, important, or follow-up findings.

There is no build step, package installation, server, or API key required.

## Features

- Imports TXT conversation exports directly in the browser.
- Parses common timestamped chat formats and keeps multiline message text together.
- Lets you review and edit the parsed conversation before analysis.
- Highlights possible deadlines, requests, questions, commitments, and decision changes.
- Shows possible same-topic changes with earlier and latest source messages. These are heuristic matches, not confirmed contradictions.
- Filters results by urgency.
- Processes conversation text locally; chat contents are not sent to a server.

## Environment files

This static app does not currently read environment variables. `.env` is ignored by Git, and `.env.example` documents that no configuration is required. Do not commit credentials or private values.

## Limitations

MISSED. uses simple text-matching heuristics, not an AI model. It may miss implicit tasks, misunderstand ambiguous dates or unfamiliar export formats, or flag unrelated messages that share a topic. Always verify findings against the original conversation.
