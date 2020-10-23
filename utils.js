const dayjs = require("dayjs");
const tz = require("dayjs/plugin/timezone");
const rt = require("dayjs/plugin/relativeTime");

dayjs.extend(tz);
dayjs.extend(rt);

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
const FormatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

module.exports.FormatBytes = FormatBytes;

module.exports.ParseGmailMessageResponse = (response) => {
    // Emails usually come with multiple parts (Text and a nicer HTML version... we want to display the nice HTML version)
    const payload = response.data.payload;
    const attachments = [];

    // Determine if this is an email or an email with more parts for attachments
    //  why google does this I have 0 clue...
    let emailPart = null;
    if (payload.parts) {
        const mailParts = payload.parts.filter(x => x.filename == "");
        const attachmentParts = payload.parts.filter(x => x.filename != "");

        emailPart = mailParts.find(x => x.mimeType == "text/html") || mailParts[0];
        if (emailPart.parts) {
            emailPart = emailPart.parts.find(x => x.mimeType == "text/html") || emailPart.parts[0];
        }

        for (const attachmentPart of attachmentParts) {
            attachments.push({
                id: attachmentPart.body.attachmentId,
                name: attachmentPart.filename,
                size: attachmentPart.body.size,
                displaySize: FormatBytes(attachmentPart.body.size),
                mimeType: attachmentPart.mimeType
            });
        }

        // console.log("-------------------- PART --------------------");
        // console.log(mailParts);
        // console.log("~~~~~~~~~~~~~~~~~~~~~~~~");
        // console.log(emailPart);
        // console.log("-------------------- ---- --------------------");

    } else {
        emailPart = payload;
    }

    // So, we need to decode and "re-encode" BASE64 due to the 1 byte padding used. Browsers dont like that.
    const decodedData = Buffer.from(emailPart.body.data, "base64");

    const GetHeaderValue = (key) => {
        const header = response.data.payload.headers.find(x => x.name.toLowerCase() == key.toLowerCase());
        return (header) ? header.value : "";
    };

    // As usual, it wouldn't be Google if their API didn't suck
    // Parse through all this shit and wrap it in our own data structure that makes sense
    return {
        googleId: response.data.id,
        googleThreadId: response.data.threadId,
        unread: response.data.labelIds.includes("UNREAD"),
        labels: response.data.labelIds,
        date: dayjs(Number(response.data.internalDate)).format("MMM DD, YYYY @ H:mm A"),
        dateRelative: dayjs(Number(response.data.internalDate)).fromNow(),
        from: GetHeaderValue("From"),
        to: GetHeaderValue("To").split(",").map(x => x.trim()).filter(x => x != ""),
        cc: GetHeaderValue("Cc").split(",").map(x => x.trim()).filter(x => x != ""),
        subject: GetHeaderValue("Subject") || "(No Subject)",
        snippet: response.data.snippet,
        body: decodedData.toString("base64"),
        attachments
    };
};