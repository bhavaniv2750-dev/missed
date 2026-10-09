# MISSED. — AI-Assisted Hackathon Development Log

## Project overview

**Problem:** Important tasks, deadlines, questions, and changes can get buried in long group-chat exports.

**Solution:** MISSED. is a static browser app that reads a TXT conversation, parses messages, lets the user review and edit them, and highlights likely findings with the source message for verification.

**Current MVP features**

- Import plain-text chat exports locally (the current upload limit is 2 MB).
- Parse common timestamped formats and retain multiline message text.
- Review and edit parsed messages before analysis.
- Highlight likely deadlines, requests, questions, commitments, completion updates, and changes.
- Display possible earlier/latest message pairs for messages assigned the same topic.
- Filter findings by Critical, Important, or Follow-up urgency.
- Keep the analysis in the browser; no app backend or AI API is used.

Possible-change matches and other findings are heuristics, not confirmed facts.

## Tech stack and architecture

- HTML for the app structure and results interface.
- CSS for responsive styling and mobile layout.
- Vanilla JavaScript for file reading, text parsing, heuristic analysis, filters, and rendering.
- Runs as static files in a modern browser. No build system or package installation is needed.
- Data flow: local TXT file → parsed messages → editable review field → user clicks Analyze → findings/change detection → rendered results.

The app itself does not call an AI model. Git ignores `.env`; this app does not currently require environment variables.

## Development plan

This plan is retrospective: the MVP already existed before this file was requested. It does not claim to have preceded application coding. Further feature work should wait for the user's confirmation.

1. Check parsing against representative WhatsApp exports, including multiline messages, empty files, unsupported files, and oversized files.
2. Verify each finding type, urgency filter, and possible-change pairing against sample conversations.
3. Review keyboard accessibility, status/error feedback, and phone and desktop layouts.
4. Fix demonstrated parser or classification failures with focused regression examples while keeping heuristic limitations clear.
5. Update documentation, run targeted checks, inspect staged files for secrets, and publish intentional changes to GitHub.

## Significant AI-assisted development interactions

The assistant was identified as Copilot SDK in VS Code. The exact model identifier was not recorded. The entries below summarize user instructions from the available conversation; they do not invent a full prompt transcript.

### 1. Detect possible changes

- **Actual instruction:** Add a block immediately after `parseMessages(raw)` to pair an update-like message with a preceding message that has the same inferred topic.
- **Purpose:** Identify possible changed details for later display.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded.
- **Files/components:** `script.js` in the working `missed-app` folder.
- **Outcome:** Added a `changeAlerts` heuristic. Same-topic matches are not necessarily contradictions.
- **Verification:** Editor diagnostics reported no errors at the time.

### 2. Show earlier and latest messages

- **Actual instructions:** Add a “What changed?” section above the results, render the earlier/latest pair, and pass `changeAlerts` into `renderResults()`.
- **Purpose:** Make possible changes visible while communicating uncertainty.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded.
- **Files/components:** `index.html`, `script.js`, and `style.css` in the working `missed-app` folder.
- **Outcome:** Added a conditional change panel with escaped source text and a heuristic caveat.
- **Verification:** Editor diagnostics reported no errors.

### 3. Add urgency filtering

- **Actual instruction:** Add All findings, Critical, Important, and Follow-up filter choices.
- **Purpose:** Help users focus on higher-urgency findings.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded.
- **Files/components:** `index.html`, `script.js`, and `style.css` in the working `missed-app` folder.
- **Outcome:** Added a selector that filters the findings list.
- **Verification:** Browser demo analysis worked, and the Critical filter displayed two critical results. Editor diagnostics reported no errors.

### 4. Make the interface phone-friendly

- **Actual instruction:** “convert this entire webapp into phone interface”.
- **Purpose:** Improve use on phone-sized screens.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded.
- **Files/components:** `style.css` and theme-color metadata in `index.html` in `missed-app`.
- **Outcome:** Added a mobile single-column layout, compact sticky header, touch-sized controls, and safe-area spacing.
- **Verification:** Editor diagnostics reported no errors. A subsequent browser viewport measurement was denied, so phone-size visual verification was not completed.

### 5. Import TXT files locally

- **Actual instruction:** Replace the paste controls with a single TXT upload area and start the analysis on file selection.
- **Purpose:** Simplify chat input to local file import.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded.
- **Files/components:** `index.html`, `script.js`, and `style.css` in `missed-app`.
- **Outcome:** Added local file reading and feedback for empty, oversized, unsupported, or unreadable files.
- **Verification:** JavaScript syntax and editor diagnostics passed. A Node harness exercised file selection, analysis, findings, and change rendering.

### 6. Review parsed text before analysis; improve parser

- **Actual instruction:** Show parsed information in an analysis window for review, remove Load Demo, use one TXT upload button, and add an Analyze button. The user also supplied a handler design calling separate `extractFindings()` and `detectChanges()` helpers.
- **Purpose:** Give the user control to inspect/edit parsed content before analyzing it and separate parsing, extraction, and change detection.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded.
- **Files/components:** `index.html`, `script.js`, and `style.css` in `missed-app`.
- **Outcome:** File selection populates an editable review field; Analyze runs separately. The parser supports common timestamped formats and multiline content.
- **Verification:** `node --check` and editor diagnostics passed. A Node DOM harness verified select-file → review → Analyze → render results. A targeted parser check verified timestamps and continuation lines.

### 7. Install Git and publish the website

- **Actual instruction:** “install git and then push code to github”; the user gave `https://github.com/bhavaniv2750-dev/missed` and confirmed public visibility.
- **Purpose:** Publish the website.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded. Git for Windows and Git Credential Manager were used.
- **Files/components:** Initial `index.html` and `README.md` in the Downloads repository.
- **Outcome:** Installed Git, initialized the repository, and pushed commit `3c0ab83`. After GitHub credentials were configured, later pushes succeeded. At the user's request, a comment-only `.env` was force-with-lease pushed in `b7bbe37`.
- **Verification:** Git reported a successful push and a clean tracking branch at that point.

### 8. Publish the current app source files

- **Actual instruction:** “create read me and push everything to git hub”, then “push script js , style css and all the other files into git”.
- **Purpose:** Publish the current app implementation and accurate documentation.
- **AI tool/model:** Copilot SDK in VS Code; model not recorded.
- **Files/components:** Copied `index.html`, `script.js`, and `style.css` from `missed-app` into the Downloads GitHub repository; updated `README.md`; added `.gitignore` and `.env.example`.
- **Outcome:** Commit `8be0380` added the current app and docs. Commit `b7bbe37` followed with `.env`. The local `.env` contained only a comment. GitHub's `main` subsequently advanced with commits removing `.env`, `.env.example`, and `.gitignore`; that newer remote state was fetched and checked rather than overwritten with a force push.
- **Verification:** `node --check` passed, common credential patterns were checked, and the source files were pushed. The exact latest remote commit should be checked again before a future push.

## Debugging

- **Stale page-load call:** Replacing text input left an obsolete `updateCount()` invocation, which could fail on page load. It was removed; later JavaScript syntax checks passed.
- **Git unavailable in existing PowerShell sessions:** The new install was not initially on the terminal PATH. Git was invoked through its installed path, and the user PATH was updated.
- **GitHub authentication unavailable at first:** Initial pushes could not prompt for credentials. After Git Credential Manager sign-in, pushes succeeded. No passwords or tokens were added to source files.
- **Customization prompt attempt:** A workspace `.prompt.md` creation was interrupted by a later user request. No `.prompt.md` file was verified as created. This root `prompt.md` is the requested development log.
- **Latest remote diverged from local:** GitHub later showed commits deleting environment files. The difference was inspected; no force push was done in that turn to avoid overwriting remote changes.

## AI features and design decisions

- AI assisted software development, prompt preparation, and heuristic refinement. The app itself does not integrate an AI model or external service.
- Original message evidence is shown to let the user verify each classification.
- Same-topic change matches are labeled as possible, not confirmed contradictions.
- File text is read in-browser and not sent to a server.
- The parsed conversation can be reviewed and edited before analysis.
- Mobile layout and urgency filtering support quick review on smaller screens.

## Testing and improvements

- `node --check` passed after parser and upload-flow changes.
- Editor diagnostics reported no errors at the time of the corresponding changes.
- Browser demo analysis and Critical filtering were checked; two critical demo findings were shown.
- A Node DOM harness checked file selection, review population, analysis, summary rendering, and change-card rendering.
- A parser example checked timestamped messages and multiline continuation text.
- Git checks verified `.env` ignore behavior and scanned for common credential patterns before source publication. The later explicit push included only a comment-only `.env`.
- There is no full automated test suite in the static website repository. Broader export coverage and phone-viewport visual checks remain follow-up work.

## Final summary

MISSED. is a responsive, static chat-review MVP implemented with HTML, CSS, and vanilla JavaScript. AI-assisted work covered possible-change alerts, urgency filters, mobile styling, TXT parsing, an editable review-before-analysis flow, documentation, and GitHub publishing.

The development assistant was Copilot SDK in VS Code; the exact model is not recorded. The app does not call an AI API. This document is retrospective and was created after application code and the repository already existed; it was not present before the original coding began.
