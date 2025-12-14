// YoloFi Default User Agent Stylesheet
// This defines the "Look & Feel" of unstyled HTML in our browser.
// Theme: Modern, Clean, Sky Blue/Navy accents.

pub const YOLOFI_UA_CSS: &str = r#"
/* YoloFi Base Theme */
html {
    background-color: #f8f9fa; /* Soft White */
    color: #1a1a1a; /* Almost Black */
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
    color: #2c3e50; /* Navy */
    font-weight: 700;
    margin-bottom: 0.5em;
}

h1 {
    font-size: 2.5em;
    border-bottom: 2px solid #3498db; /* YoloFi Sky Blue */
    padding-bottom: 0.2em;
}

a {
    color: #3498db; /* YoloFi Sky Blue */
    text-decoration: none;
    transition: color 0.2s;
}

a:hover {
    color: #2980b9; /* Darker Blue */
    text-decoration: underline;
}

button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.5em 1em;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
}

/* Debug/Internal styles */
yolofi-internal-status {
    display: block;
    background: #2c3e50;
    color: #ecf0f1;
    padding: 10px;
    font-family: monospace;
}
"#;
