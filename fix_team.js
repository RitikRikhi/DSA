const fs = require('fs');

function removeAditi(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    const aditiIndex = content.indexOf('<div class="team-name">Aditi Sharma</div>');
    if (aditiIndex === -1) {
        console.log('Aditi not found in', file);
        return;
    }
    
    let startIndex = content.lastIndexOf('<div class="team-card"', aditiIndex);
    
    // To safely find the end, we can count the div openings and closings starting from startIndex
    let i = startIndex;
    let divCount = 0;
    let foundStart = false;
    
    while (i < content.length) {
        if (content.substr(i, 4) === '<div') {
            divCount++;
            foundStart = true;
        } else if (content.substr(i, 5) === '</div') {
            divCount--;
        }
        i++;
        
        if (foundStart && divCount === 0) {
            // Include the closing bracket
            i += 5; // to cover '> ' (approx) - actually we just want to break.
            // Let's just find the closing '>'
            while(content[i] !== '>' && i < content.length) i++;
            i++; // skip '>'
            break;
        }
    }
    
    if (startIndex !== -1 && i !== -1) {
        // Remove trailing whitespace if needed
        while(content[i] === '\n' || content[i] === '\r' || content[i] === ' ') i++;
        
        content = content.substring(0, startIndex) + content.substring(i);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Successfully removed Aditi Sharma from', file);
    }
}

removeAditi('client/home.html');
removeAditi('client/index.html');
