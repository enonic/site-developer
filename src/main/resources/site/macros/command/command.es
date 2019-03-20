exports.macro = function (context) {
    // Only output content if first line has data
    if (context.params.line1 && context.params.line1.trim().length) {
        const linesConfig = [
            context.params.line1,
            context.params.line2,
            context.params.line3,
            context.params.line4,
            context.params.line5,
            context.params.line6,
            context.params.line7,
            context.params.line8,
            context.params.line9,
        ];
        const lines = [];
        linesConfig.forEach(function (line) {
            // Only return lines with data
            if (line && line.trim().length) {
                // Replace '$ ' with prompt markup
                lines.push(line.replace(/^\$ /, '<span class="prompt"></span>'));
            }
        });
        const body = '<code class="command">' + lines.join('<br/>') + '</code>';

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
