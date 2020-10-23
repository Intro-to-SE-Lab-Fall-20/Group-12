const { FormatBytes, ParseGmailMessageResponse } = require("../utils");
const fs = require("fs");
const path = require("path");

describe("FormatBytes", () => {
    it("100 Bytes = 100 Bytes", () => {
        expect(FormatBytes(100)).toBe("100 Bytes");
    });

    it("1024 Bytes = 1 KB", () => {
        expect(FormatBytes(1024)).toBe("1 KB");
    });

    it("1048576 Bytes = 1 MB", () => {
        expect(FormatBytes(1048576)).toBe("1 MB");
    });

    it("1073741824 Bytes = 1 GB", () => {
        expect(FormatBytes(1073741824)).toBe("1 GB");
    });

    it("1099511627776 Bytes = 1 TB", () => {
        expect(FormatBytes(1099511627776)).toBe("1 TB");
    });

    it("1125899910000000 Bytes = 1 PB", () => {
        expect(FormatBytes(1125899910000000)).toBe("1 PB");
    });
});

describe("Gmail Message Parser", () => {
    it("Can Parse Text Only Email", () => {
        const gmailMessageResponse = JSON.parse(fs.readFileSync(path.join(__dirname, "data/text-part-email.json")));
        const email = ParseGmailMessageResponse(gmailMessageResponse);

        expect(email).toMatchObject({
            googleId: "175542155d351730",
            googleThreadId: "175542155d351730",
            unread: false,
            labels: ["CATEGORY_PERSONAL", "INBOX"],
            date: "Oct 23, 2020 @ 1:23 AM",
            from: "Hunter Mitchell <huntermitchell386@gmail.com>",
            to: ["mememailapi@gmail.com"],
            cc: [],
            subject: "Plain Text",
            snippet: "Plain Text",
            body: "UGxhaW4gVGV4dA0K",
            attachments: []
        });
    });

    it("Can Parse HTML Email (w/ Text Part)", () => {
        const gmailMessageResponse = JSON.parse(fs.readFileSync(path.join(__dirname, "data/html-part-email.json")));
        const email = ParseGmailMessageResponse(gmailMessageResponse);

        expect(email).toMatchObject({
            googleId: "17554183edb9643b",
            googleThreadId: "17554183edb9643b",
            unread: false,
            labels: ["IMPORTANT", "CATEGORY_PERSONAL", "INBOX"],
            date: "Oct 23, 2020 @ 1:14 AM",
            from: "Google <no-reply@accounts.google.com>",
            to: ["mememailapi@gmail.com"],
            cc: [],
            subject: "Security alert",
            snippet: "MemeMail was granted access to your Google Account mememailapi@gmail.com If you did not grant access, you should check this activity and secure your account. Check activity You can also go directly to:",
            body: "PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIG5hbWU9ImZvcm1hdC1kZXRlY3Rpb24iIGNvbnRlbnQ9ImVtYWlsPW5vIi8+PG1ldGEgbmFtZT0iZm9ybWF0LWRldGVjdGlvbiIgY29udGVudD0iZGF0ZT1ubyIvPjxzdHlsZSBub25jZT0iSXZtY3A3di9vV2hpUU5XdTczdWRFUSI+LmF3bCBhIHtjb2xvcjogI0ZGRkZGRjsgdGV4dC1kZWNvcmF0aW9uOiBub25lO30gLmFibWwgYSB7Y29sb3I6ICMwMDAwMDA7IGZvbnQtZmFtaWx5OiBSb2JvdG8tTWVkaXVtLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmOyBmb250LXdlaWdodDogYm9sZDsgdGV4dC1kZWNvcmF0aW9uOiBub25lO30gLmFkZ2wgYSB7Y29sb3I6IHJnYmEoMCwgMCwgMCwgMC44Nyk7IHRleHQtZGVjb3JhdGlvbjogbm9uZTt9IC5hZmFsIGEge2NvbG9yOiAjYjBiMGIwOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7fSBAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA2MDBweCkgey52MnNwIHtwYWRkaW5nOiA2cHggMzBweCAwcHg7fSAudjJyc3Age3BhZGRpbmc6IDBweCAxMHB4O319IEBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDYwMHB4KSB7Lm1kdjJydyB7cGFkZGluZzogNDBweCA0MHB4O319IDwvc3R5bGU+PGxpbmsgaHJlZj0iLy9mb250cy5nb29nbGVhcGlzLmNvbS9jc3M/ZmFtaWx5PUdvb2dsZStTYW5zIiByZWw9InN0eWxlc2hlZXQiIHR5cGU9InRleHQvY3NzIi8+PC9oZWFkPjxib2R5IHN0eWxlPSJtYXJnaW46IDA7IHBhZGRpbmc6IDA7IiBiZ2NvbG9yPSIjRkZGRkZGIj48dGFibGUgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgc3R5bGU9Im1pbi13aWR0aDogMzQ4cHg7IiBib3JkZXI9IjAiIGNlbGxzcGFjaW5nPSIwIiBjZWxscGFkZGluZz0iMCIgbGFuZz0iZW4iPjx0ciBoZWlnaHQ9IjMyIiBzdHlsZT0iaGVpZ2h0OiAzMnB4OyI+PHRkPjwvdGQ+PC90cj48dHIgYWxpZ249ImNlbnRlciI+PHRkPjxkaXYgaXRlbXNjb3BlIGl0ZW10eXBlPSIvL3NjaGVtYS5vcmcvRW1haWxNZXNzYWdlIj48ZGl2IGl0ZW1wcm9wPSJhY3Rpb24iIGl0ZW1zY29wZSBpdGVtdHlwZT0iLy9zY2hlbWEub3JnL1ZpZXdBY3Rpb24iPjxsaW5rIGl0ZW1wcm9wPSJ1cmwiIGhyZWY9Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9BY2NvdW50Q2hvb3Nlcj9FbWFpbD1tZW1lbWFpbGFwaUBnbWFpbC5jb20mYW1wO2NvbnRpbnVlPWh0dHBzOi8vbXlhY2NvdW50Lmdvb2dsZS5jb20vYWxlcnQvbnQvMTYwMzQzMzY3NTAwMD9yZm4lM0QxMjclMjZyZm5jJTNEMSUyNmVpZCUzRDQxMzExNzkzNzk4MzE1OTA5NDglMjZldCUzRDAiLz48bWV0YSBpdGVtcHJvcD0ibmFtZSIgY29udGVudD0iUmV2aWV3IEFjdGl2aXR5Ii8+PC9kaXY+PC9kaXY+PHRhYmxlIGJvcmRlcj0iMCIgY2VsbHNwYWNpbmc9IjAiIGNlbGxwYWRkaW5nPSIwIiBzdHlsZT0icGFkZGluZy1ib3R0b206IDIwcHg7IG1heC13aWR0aDogNTE2cHg7IG1pbi13aWR0aDogMjIwcHg7Ij48dHI+PHRkIHdpZHRoPSI4IiBzdHlsZT0id2lkdGg6IDhweDsiPjwvdGQ+PHRkPjxkaXYgc3R5bGU9ImJvcmRlci1zdHlsZTogc29saWQ7IGJvcmRlci13aWR0aDogdGhpbjsgYm9yZGVyLWNvbG9yOiNkYWRjZTA7IGJvcmRlci1yYWRpdXM6IDhweDsgcGFkZGluZzogNDBweCAyMHB4OyIgYWxpZ249ImNlbnRlciIgY2xhc3M9Im1kdjJydyI+PGltZyBzcmM9Imh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL2ltYWdlcy9icmFuZGluZy9nb29nbGVsb2dvLzJ4L2dvb2dsZWxvZ29fY29sb3JfNzR4MjRkcC5wbmciIHdpZHRoPSI3NCIgaGVpZ2h0PSIyNCIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAxNnB4OyIgYWx0PSJHb29nbGUiPjxkaXYgc3R5bGU9ImZvbnQtZmFtaWx5OiAmIzM5O0dvb2dsZSBTYW5zJiMzOTssUm9ib3RvLFJvYm90b0RyYWZ0LEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2JvcmRlci1ib3R0b206IHRoaW4gc29saWQgI2RhZGNlMDsgY29sb3I6IHJnYmEoMCwwLDAsMC44Nyk7IGxpbmUtaGVpZ2h0OiAzMnB4OyBwYWRkaW5nLWJvdHRvbTogMjRweDt0ZXh0LWFsaWduOiBjZW50ZXI7IHdvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7Ij48ZGl2IHN0eWxlPSJmb250LXNpemU6IDI0cHg7Ij48YT5NZW1lTWFpbDwvYT4gd2FzIGdyYW50ZWQgYWNjZXNzIHRvIHlvdXIgR29vZ2xlJm5ic3A7QWNjb3VudCA8L2Rpdj48dGFibGUgYWxpZ249ImNlbnRlciIgc3R5bGU9Im1hcmdpbi10b3A6OHB4OyI+PHRyIHN0eWxlPSJsaW5lLWhlaWdodDogbm9ybWFsOyI+PHRkIGFsaWduPSJyaWdodCIgc3R5bGU9InBhZGRpbmctcmlnaHQ6OHB4OyI+PGltZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHN0eWxlPSJ3aWR0aDogMjBweDsgaGVpZ2h0OiAyMHB4OyB2ZXJ0aWNhbC1hbGlnbjogc3ViOyBib3JkZXItcmFkaXVzOiA1MCU7OyIgc3JjPSJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vLWpoZFNxcVYtVHU4L0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FNWnV1Y21tSGtVLTFvQTNtcU5xVmFDRzhrV3NyaVhKTncvczk2L3Bob3RvLmpwZyIgYWx0PSIiPjwvdGQ+PHRkPjxhIHN0eWxlPSJmb250LWZhbWlseTogJiMzOTtHb29nbGUgU2FucyYjMzk7LFJvYm90byxSb2JvdG9EcmFmdCxIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtjb2xvcjogcmdiYSgwLDAsMCwwLjg3KTsgZm9udC1zaXplOiAxNHB4OyBsaW5lLWhlaWdodDogMjBweDsiPm1lbWVtYWlsYXBpQGdtYWlsLmNvbTwvYT48L3RkPjwvdHI+PC90YWJsZT4gPC9kaXY+PGRpdiBzdHlsZT0iZm9udC1mYW1pbHk6IFJvYm90by1SZWd1bGFyLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmOyBmb250LXNpemU6IDE0cHg7IGNvbG9yOiByZ2JhKDAsMCwwLDAuODcpOyBsaW5lLWhlaWdodDogMjBweDtwYWRkaW5nLXRvcDogMjBweDsgdGV4dC1hbGlnbjogbGVmdDsiPjxicj5JZiB5b3UgZGlkIG5vdCBncmFudCBhY2Nlc3MsIHlvdSBzaG91bGQgY2hlY2sgdGhpcyBhY3Rpdml0eSBhbmQgc2VjdXJlIHlvdXIgYWNjb3VudC48ZGl2IHN0eWxlPSJwYWRkaW5nLXRvcDogMzJweDsgdGV4dC1hbGlnbjogY2VudGVyOyI+PGEgaHJlZj0iaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL0FjY291bnRDaG9vc2VyP0VtYWlsPW1lbWVtYWlsYXBpQGdtYWlsLmNvbSZhbXA7Y29udGludWU9aHR0cHM6Ly9teWFjY291bnQuZ29vZ2xlLmNvbS9hbGVydC9udC8xNjAzNDMzNjc1MDAwP3JmbiUzRDEyNyUyNnJmbmMlM0QxJTI2ZWlkJTNENDEzMTE3OTM3OTgzMTU5MDk0OCUyNmV0JTNEMCIgdGFyZ2V0PSJfYmxhbmsiIGxpbmstaWQ9Im1haW4tYnV0dG9uLWxpbmsiIHN0eWxlPSJmb250LWZhbWlseTogJiMzOTtHb29nbGUgU2FucyYjMzk7LFJvYm90byxSb2JvdG9EcmFmdCxIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjsgbGluZS1oZWlnaHQ6IDE2cHg7IGNvbG9yOiAjZmZmZmZmOyBmb250LXdlaWdodDogNDAwOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7Zm9udC1zaXplOiAxNHB4O2Rpc3BsYXk6aW5saW5lLWJsb2NrO3BhZGRpbmc6IDEwcHggMjRweDtiYWNrZ3JvdW5kLWNvbG9yOiAjNDE4NEYzOyBib3JkZXItcmFkaXVzOiA1cHg7IG1pbi13aWR0aDogOTBweDsiPkNoZWNrIGFjdGl2aXR5PC9hPjwvZGl2PjwvZGl2PjxkaXYgc3R5bGU9InBhZGRpbmctdG9wOiAyMHB4OyBmb250LXNpemU6IDEycHg7IGxpbmUtaGVpZ2h0OiAxNnB4OyBjb2xvcjogIzVmNjM2ODsgbGV0dGVyLXNwYWNpbmc6IDAuM3B4OyB0ZXh0LWFsaWduOiBjZW50ZXIiPllvdSBjYW4gYWxzbyBnbyBkaXJlY3RseSB0bzo8YnI+PGEgc3R5bGU9ImNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODcpO3RleHQtZGVjb3JhdGlvbjogaW5oZXJpdDsiPmh0dHBzOi8vbXlhY2NvdW50Lmdvb2dsZS5jb20vbm90aWZpY2F0aW9uczwvYT48L2Rpdj48L2Rpdj48ZGl2IHN0eWxlPSJ0ZXh0LWFsaWduOiBsZWZ0OyI+PGRpdiBzdHlsZT0iZm9udC1mYW1pbHk6IFJvYm90by1SZWd1bGFyLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2NvbG9yOiByZ2JhKDAsMCwwLDAuNTQpOyBmb250LXNpemU6IDExcHg7IGxpbmUtaGVpZ2h0OiAxOHB4OyBwYWRkaW5nLXRvcDogMTJweDsgdGV4dC1hbGlnbjogY2VudGVyOyI+PGRpdj5Zb3UgcmVjZWl2ZWQgdGhpcyBlbWFpbCB0byBsZXQgeW91IGtub3cgYWJvdXQgaW1wb3J0YW50IGNoYW5nZXMgdG8geW91ciBHb29nbGUgQWNjb3VudCBhbmQgc2VydmljZXMuPC9kaXY+PGRpdiBzdHlsZT0iZGlyZWN0aW9uOiBsdHI7Ij4mY29weTsgMjAyMCBHb29nbGUgTExDLCA8YSBjbGFzcz0iYWZhbCIgc3R5bGU9ImZvbnQtZmFtaWx5OiBSb2JvdG8tUmVndWxhcixIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtjb2xvcjogcmdiYSgwLDAsMCwwLjU0KTsgZm9udC1zaXplOiAxMXB4OyBsaW5lLWhlaWdodDogMThweDsgcGFkZGluZy10b3A6IDEycHg7IHRleHQtYWxpZ246IGNlbnRlcjsiPjE2MDAgQW1waGl0aGVhdHJlIFBhcmt3YXksIE1vdW50YWluIFZpZXcsIENBIDk0MDQzLCBVU0E8L2E+PC9kaXY+PC9kaXY+PC9kaXY+PC90ZD48dGQgd2lkdGg9IjgiIHN0eWxlPSJ3aWR0aDogOHB4OyI+PC90ZD48L3RyPjwvdGFibGU+PC90ZD48L3RyPjx0ciBoZWlnaHQ9IjMyIiBzdHlsZT0iaGVpZ2h0OiAzMnB4OyI+PHRkPjwvdGQ+PC90cj48L3RhYmxlPjwvYm9keT48L2h0bWw+",
            attachments: []
        });
    });

    it("Can Parse HTML Email with Attachments (w/ Text Part)", () => {
        const gmailMessageResponse = JSON.parse(fs.readFileSync(path.join(__dirname, "data/html-part-email-with-attachments.json")));
        const email = ParseGmailMessageResponse(gmailMessageResponse);

        expect(email).toMatchObject({
            googleId: "17551dc3f563fa54",
            googleThreadId: "17551dc3f563fa54",
            unread: false,
            labels: ["IMPORTANT", "CATEGORY_PERSONAL", "INBOX"],
            date: "Oct 22, 2020 @ 14:49 PM",
            from: "Hunter Mitchell <huntermitchell386@gmail.com>",
            to: ["mememailapi@gmail.com"],
            cc: [],
            subject: "Requested Social Media Images",
            snippet: "Hey, I am sending over some images you requested the other day for the social media accounts. See Attached. Thanks, Hunter Mitchell",
            body: "PGRpdiBkaXI9Imx0ciI+SGV5LDxkaXY+PGJyPjwvZGl2PjxkaXY+SSBhbSBzZW5kaW5nIG92ZXIgc29tZSBpbWFnZXMgeW91IHJlcXVlc3RlZCB0aGUgb3RoZXIgZGF5IGZvciB0aGUgc29jaWFsIG1lZGlhIGFjY291bnRzLjwvZGl2PjxkaXY+PGJyPjwvZGl2PjxkaXY+U2VlIEF0dGFjaGVkLjwvZGl2PjxkaXY+PGJyPjwvZGl2PjxkaXY+VGhhbmtzLDwvZGl2PjxkaXY+SHVudGVyIE1pdGNoZWxsPC9kaXY+PC9kaXY+DQo=",
            attachments: [
                {
                    id: "ANGjdJ8zsD5LTHX-9K3nHlmDyqDuAYk-MOG7YiIyTpVrCGquQY_uaK_2CaS6KmCKAQkw2v3HcvLEryiK3_oj9stEPd4Z3FygHQ8ua_YxfZAQmrHaZQup2AeRivaiRgjLfYlcvptZ9FxJqe-5umJUIEthSMv9pR0G0t11FM8bKxjXUSVIAVuRD758S6alcOn579D72IvriiOl-D0xg1xMmyOBcjhfI3vPp3W1O7scUrUFGsOcxw2LdRSiErgsKgl84XK5tAQ0cSOLMYFS9b8kFIY4bRPK54IkMq9IXWg5-QVq4sjDJegBTd55jc9csuauJnBydYu-I0W3EZxWXIBd0JHzLFXApsyphlsmYfSesuC0uHXFPGdyRWfn4JkZtIzz4hZH_OZuQ7lez6XvnSWV",
                    name: "Facebook Page Header.png",
                    size: 185941,
                    displaySize: "181.58 KB",
                    mimeType: "image/png"
                },
                {
                    id: "ANGjdJ_YIWcDa1me_N0aJRIGVK0FZSCo9rtQ93JkeQy6hw6D8g1Ny2QcdrGUixvkoHLBjhXtMhzU_xn-k-5F3pQZl5Ova3zcflJpToJB9acm2ld3gflZTKBKExeUzCnpFLbJVfiSA59HG1Ct2aVeFUhTbIHy6az_HtOoN9SAEx3XXjhYltooF1D3tvhW_UjR-3SLozg9X5Op4FihkQpFq2ZQf1QMaMiq8CNS1pgLGZ1Pzb5FBchZYM5n4EWXlVk5t7J0gxPNOnrwiy54FeZvbuSjrWc9umhAow-j811il9o-qhnkKq0KZW_pE8Qxo2j3Q1hSk6EZr44IaTchOrjplt8f3o8wlcWHcD1kmKBjWyX3eXaNI5awcp6EvxVVBPM5IP8DX2rTKJt5Y8GAGhWf",
                    name: "icon.png",
                    size: 33059,
                    displaySize: "32.28 KB",
                    mimeType: "image/png"
                }
            ]
        });
    });

    it("Can Parse Text Only Email (w/ Multiple Recipients)", () => {
        const gmailMessageResponse = JSON.parse(fs.readFileSync(path.join(__dirname, "data/text-part-email-multi.json")));
        const email = ParseGmailMessageResponse(gmailMessageResponse);

        expect(email).toMatchObject({
            googleId: "17554351cc57f70f",
            googleThreadId: "17554351cc57f70f",
            unread: false,
            labels: ["CATEGORY_PERSONAL", "INBOX"],
            date: "Oct 23, 2020 @ 1:45 AM",
            from: "Hunter Mitchell <huntermitchell386@gmail.com>",
            to: ["mememailapi@gmail.com", "Hunter Mitchell <contact@hunter.dev>"],
            cc: [],
            subject: "Email with Multiple Recipients",
            snippet: "This is an email with multiple recipients.",
            body: "VGhpcyBpcyBhbiBlbWFpbCB3aXRoIG11bHRpcGxlIHJlY2lwaWVudHMuDQo=",
            attachments: []
        });
    });

    it("Can Parse Text Only Email (w/ CCs)", () => {
        const gmailMessageResponse = JSON.parse(fs.readFileSync(path.join(__dirname, "data/text-part-email-cc.json")));
        const email = ParseGmailMessageResponse(gmailMessageResponse);

        expect(email).toMatchObject({
            googleId: "1755435704902d1f",
            googleThreadId: "1755435704902d1f",
            unread: false,
            labels: ["CATEGORY_PERSONAL", "INBOX"],
            date: "Oct 23, 2020 @ 1:46 AM",
            from: "Hunter Mitchell <huntermitchell386@gmail.com>",
            to: ["mememailapi@gmail.com"],
            cc: [],
            subject: "Email with CCs",
            snippet: "This is an email with multiple CCs.",
            body: "VGhpcyBpcyBhbiBlbWFpbCB3aXRoIG11bHRpcGxlIENDcy4NCg==",
            attachments: []
        });
    });
});