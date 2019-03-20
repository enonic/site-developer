exports.macro = function (context) {
    const command = context.body;

    if (command && command.trim().length) {
        const lines = command.split('<br />\n'); // This markup is created when doing a shift-enter inside the editor
        const linesFormatted = [];
        lines.forEach(function (line) {
            // Only return lines with data
            if (line && line.trim().length) {
                // Replace '$ ' with prompt markup
                linesFormatted.push(line.replace(/^\$ /, '<span class="prompt"></span>'));
            }
        });
        const body = '<code class="command">' + linesFormatted.join('<br/>') + '</code>';

        return {
            body: body,
            // We need to use pageContributions instead of putting these styles in the site CSS file, since we need the style to be shown in the macro preview
            pageContributions: {
                headEnd: [
                    '<style>.command {display:inline-block;color:#fff;background-color:#000;border-radius:1em;padding:1em;text-align:left;} .command .prompt::before {content:"$ ";opacity:0.5;}</style>'
                ]
            }
        };
    }

    return {
        body: ''
    };
};
