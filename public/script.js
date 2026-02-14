// ---------------------------------
// 1) App constants
// ---------------------------------
const STORAGE_KEY = "caply.links.v1";
const SHORT_DOMAIN = "cap-ly.com/";

// ---------------------------------
// 2) Grab important DOM elements
// ---------------------------------
const shortenForm = document.getElementById("shorten-form");
const longUrlInput = document.getElementById("long-url");
const customCodeInput = document.getElementById("custom-code");
const shortLinkInput = document.getElementById("short-link");
const copyButton = document.getElementById("copy-btn");
const resultBox = document.getElementById("result-box");
const statusElement = document.getElementById("status");

// ---------------------------------
// 3) App state (loaded from localStorage on startup)
// ---------------------------------
let links = loadLinks();

// ---------------------------------
// 4) UI helper
// ---------------------------------
function setStatus(message, type = "") {
    statusElement.textContent = message;
    statusElement.className = `status${type ? ` status--${type}` : ""}`;
}

// ---------------------------------
// 5) localStorage helpers
// ---------------------------------
function loadLinks() {
    // We keep mappings in localStorage so this demo stays frontend-only.
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (_) {
        return {};
    }
}

function saveLinks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

// ---------------------------------
// 6) Validation and formatting helpers
// ---------------------------------
function normalizeUrl(rawValue) {
    const value = rawValue.trim();
    if (!value) {
        return "";
    }

    // If user forgets protocol, add https:// automatically.
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isHttpUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_) {
        return false;
    }
}

function sanitizeCode(rawValue) {
    return rawValue.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
}

// ---------------------------------
// 7) Short-code generation
// ---------------------------------
function createRandomCode(length = 6) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i += 1) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }
    return code;
}

function chooseCode(requestedCode) {
    if (requestedCode && !links[requestedCode]) {
        return requestedCode;
    }

    // Generate until we find a code that does not already exist.
    let generated = createRandomCode();
    while (links[generated]) {
        generated = createRandomCode();
    }
    return generated;
}

function buildShortLink(code) {
    return `${SHORT_DOMAIN}${code}`;
}

function showResult(code) {
    shortLinkInput.value = buildShortLink(code);
    resultBox.classList.remove("hidden");
}

// ---------------------------------
// 8) Route helper (for direct visits like /abc123)
// ---------------------------------
function getCodeFromPathname() {
    const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
    return sanitizeCode(cleanPath);
}

function tryRedirectFromPath() {
    const codeFromPath = getCodeFromPathname();
    if (!codeFromPath) {
        return false;
    }

    const match = links[codeFromPath];
    if (!match) {
        setStatus(`Code "${codeFromPath}" was not found in this browser.`, "error");
        return false;
    }

    // If the path contains a known code, treat it like a short-link redirect.
    window.location.replace(match.url);
    return true;
}

// ---------------------------------
// 9) Form handler
// ---------------------------------
function handleShorten(event) {
    event.preventDefault();
    setStatus("");

    const longUrl = normalizeUrl(longUrlInput.value);
    const requestedCode = sanitizeCode(customCodeInput.value);

    if (!isHttpUrl(longUrl)) {
        setStatus("Please enter a valid URL (example: https://example.com).", "error");
        return;
    }

    if (customCodeInput.value.trim() && !requestedCode) {
        setStatus("Custom code can only use letters, numbers, hyphen, and underscore.", "error");
        return;
    }

    const finalCode = chooseCode(requestedCode);
    if (requestedCode && requestedCode !== finalCode) {
        setStatus("That custom code already exists, so a random code was created instead.", "error");
    } else {
        setStatus("Short link created successfully.", "success");
    }

    links[finalCode] = {
        url: longUrl,
        createdAt: Date.now()
    };

    saveLinks();
    showResult(finalCode);
    shortenForm.reset();
}

// ---------------------------------
// 10) Clipboard action
// ---------------------------------
async function copyShortLink() {
    if (!shortLinkInput.value) {
        return;
    }

    try {
        await navigator.clipboard.writeText(shortLinkInput.value);
        setStatus("Short link copied to clipboard.", "success");
    } catch (_) {
        // Fallback copy method for older browsers.
        shortLinkInput.select();
        document.execCommand("copy");
        setStatus("Short link copied to clipboard.", "success");
    }
}

// ---------------------------------
// 11) App startup
// ---------------------------------
shortenForm.addEventListener("submit", handleShorten);
copyButton.addEventListener("click", copyShortLink);

tryRedirectFromPath();
