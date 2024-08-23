const segmentMap = {
    'A': 'FF777', 'B': 'FF77C', 'C': 'FF739', 'D': 'FF75E', 'E': 'FF779', 'F': 'FF771',
    'G': 'FF73D', 'H': 'FF776', 'I': 'FF730', 'J': 'FF71E', 'K': 'FF775', 'L': 'FF738',
    'M': 'FF715', 'N': 'FF754', 'O': 'FF75C', 'P': 'FF773', 'Q': 'FF767', 'R': 'FF750',
    'S': 'FF76C', 'T': 'FF778', 'U': 'FF73E', 'V': 'FF732', 'W': 'FF72A', 'X': 'FF764',
    'Y': 'FF76E', 'Z': 'FF71B', '0': 'FF73F', '1': 'FF706', '2': 'FF75B', '3': 'FF74F',
    '4': 'FF766', '5': 'FF76D', '6': 'FF77D', '7': 'FF707', '8': 'FF77F', '9': 'FF76F'
};

function convertText() {
    const input = document.getElementById('input').value.toUpperCase();
    const output = document.getElementById('output');

    output.innerHTML = input.split('').map(char => segmentMap[char] ? `&#x${segmentMap[char]}` : char).join('');
}

function applyDisplaySettings() {
    const output = document.getElementById('output');
    const displayOption = document.getElementById('displayOptions').value;

    switch (displayOption) {
        case 'wrap-center':
            output.style.whiteSpace = 'pre-wrap';
            output.style.wordBreak = 'normal';
            output.style.textAlign = 'center';
            break;
        case 'wrap-left':
            output.style.whiteSpace = 'pre-wrap';
            output.style.wordBreak = 'normald';
            output.style.textAlign = 'left';
            break;
        case 'wrap-right':
            output.style.whiteSpace = 'pre-wrap';
            output.style.wordBreak = 'normal';
            output.style.textAlign = 'right';
            break;
        case 'nowrap-left':
            output.style.whiteSpace = 'pre';
            output.style.wordBreak = 'keep-all';
            output.style.textAlign = 'left';
            break;
    }
}