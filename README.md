# MISSED. website

## Run in VS Code
1. Extract `MISSED-website.zip`.
2. Open the `MISSED-website` folder in VS Code.
3. Open `index.html` in a browser. Recommended: install the Live Server extension, right-click `index.html`, and choose **Open with Live Server**.
4. Paste messages or upload a WhatsApp `.txt` export, then click **Analyze messages**.

## Included
- Single-file HTML app with responsive CSS and JavaScript
- Paste input, `.txt` upload, drag-and-drop, sample chat
- Local-only rule-based detection of likely tasks, deadlines, events, mentions, questions, and possible changes
- Original message shown as evidence for each finding
- Category filters and summary stats

## Limitations
This is a simple hackathon MVP, not a trained AI/LLM. It cannot guarantee semantic accuracy and may miss implicit tasks, ambiguous dates, or locale-specific export formats. Verify findings against the source chat. No messages are sent to a server. WhatsApp exports are created on mobile via chat menu/contact info > Export chat; choose without media. Official guide: https://faq.whatsapp.com/1180414079177245/
