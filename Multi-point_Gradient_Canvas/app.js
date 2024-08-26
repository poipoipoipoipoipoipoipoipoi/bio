// Get DOM elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const influenceInput = document.getElementById('influence');
const sigmaInput = document.getElementById('sigma');
const downloadButton = document.getElementById('download-image');
const createCanvasButton = document.getElementById('create-canvas');
const pointList = document.getElementById('point-list');

let points = [];
let canvasWidth = 500;
let canvasHeight = 300;
let sigma = parseFloat(sigmaInput.value);

// Set initial canvas size
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Update canvas size on button click
createCanvasButton.addEventListener('click', () => {
    canvasWidth = parseInt(document.getElementById('canvas-width').value, 10);
    canvasHeight = parseInt(document.getElementById('canvas-height').value, 10);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    draw();
});

// Add a point to the canvas
function addPoint(x, y, color, influence) {
    points.push({ x, y, color, influence: parseFloat(influence) });
    updatePointList();
    draw();
}

// Update the list of points in the UI
function updatePointList() {
    pointList.innerHTML = '';
    points.forEach((point, index) => {
        const pointDiv = document.createElement('div');
        pointDiv.className = 'point-controls';
        pointDiv.innerHTML = 
            `<span>${index + 1}:</span>
            <input type="color" value="${point.color}" onchange="updatePointColor(${index}, this.value)">
            <input type="number" value="${point.influence}" min="0.01" step="0.1" onchange="updatePointInfluence(${index}, this.value)">
            <button onclick="removePoint(${index})">remove</button>`;
        pointList.appendChild(pointDiv);
    });
}

// Update the color of a point
function updatePointColor(index, color) {
    points[index].color = color;
    draw();
}

// Update the influence of a point
function updatePointInfluence(index, influence) {
    points[index].influence = parseFloat(influence);
    draw();
    updatePointList(); // Update the point list to reflect changes
}

// Remove a point from the list
function removePoint(index) {
    points.splice(index, 1);
    updatePointList();
    draw();
}

// Convert HEX color to Oklab
function hexToOklab(hex) {
    const [r, g, b] = hexToRgb(hex).map(value => value / 255);

    // Transform from sRGB to linear RGB
    const rLinear = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    const RGB_TO_XYZ = [
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041]
    ];

    const x = rLinear * RGB_TO_XYZ[0][0] + gLinear * RGB_TO_XYZ[0][1] + bLinear * RGB_TO_XYZ[0][2];
    const y = rLinear * RGB_TO_XYZ[1][0] + gLinear * RGB_TO_XYZ[1][1] + bLinear * RGB_TO_XYZ[1][2];
    const z = rLinear * RGB_TO_XYZ[2][0] + gLinear * RGB_TO_XYZ[2][1] + bLinear * RGB_TO_XYZ[2][2];

    const LMS_TO_XYZ = [
        [0.4002, 0.7075, -0.0808],
        [-0.2263, 1.1653,  0.0457],
        [0.0000, 0.0000,  0.9182]
    ];

    const l_ = x * LMS_TO_XYZ[0][0] + y * LMS_TO_XYZ[0][1] + z * LMS_TO_XYZ[0][2];
    const m = x * LMS_TO_XYZ[1][0] + y * LMS_TO_XYZ[1][1] + z * LMS_TO_XYZ[1][2];
    const s = x * LMS_TO_XYZ[2][0] + y * LMS_TO_XYZ[2][1] + z * LMS_TO_XYZ[2][2];

    const l__ = Math.pow(l_, 1 / 3);
    const m_ = Math.pow(m, 1 / 3);
    const s_ = Math.pow(s, 1 / 3);

    const l___ = 0.2104542553*l__ + 0.7936177850*m_ - 0.0040720468*s_;
    const a__ = 1.9779984951*l__ - 2.4285922050*m_ + 0.4505937099*s_;
    const b_oklab = 0.0259040371*l__ + 0.7827717662*m_ - 0.8086757660*s_;

    return {
        l: l___,
        a: a__,
        b_oklab: b_oklab
    };
}

function gammaCorrection(c) {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// Convert Oklab to RGB
function oklabToRgb(oklab) {
    const l1 = oklab.l + oklab.a * 0.3963378 + oklab.b_oklab * 0.2158038;
    const m1 = oklab.l - oklab.a * 0.1055613 - oklab.b_oklab * 0.0638542;
    const s1 = oklab.l - oklab.a * 0.0894842 - oklab.b_oklab * 1.2914855;

    const l2 = l1 * l1 * l1;
    const m2 = m1 * m1 * m1;
    const s2 = s1 * s1 * s1;

    const r1 = 4.0767416621 * l2 - 3.3077115913 * m2 + 0.2309699292 * s2;
    const g1 = -1.2684380046 * l2 + 2.6097574011 * m2 - 0.3413193965 * s2;
    const b1 = -0.0041960863 * l2 - 0.7034186147 * m2 + 1.7076147010 * s2;

    const r2 = Math.round(Math.min(Math.max(gammaCorrection(r1) * 255, 0), 255));
    const g2 = Math.round(Math.min(Math.max(gammaCorrection(g1) * 255, 0), 255));
    const b2 = Math.round(Math.min(Math.max(gammaCorrection(b1) * 255, 0), 255));

    return [
        r2,
        g2,
        b2
    ];
}

// Draw points and interpolated colors on the canvas
function draw(showPoints = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
            const x = i;
            const y = j;
            let l = 0, a = 0, b_oklab = 0, weightSum = 0;

            points.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const influenceSigma = sigma * point.influence;
                const weight = Math.exp(-distance * distance / (2 * influenceSigma * influenceSigma));

                const color = hexToOklab(point.color);
                l += color.l * weight;
                a += color.a * weight;
                b_oklab += color.b_oklab * weight;
                weightSum += weight;
            });

            // Normalize weights
            l = weightSum ? l / weightSum : 0;
            a = weightSum ? a / weightSum : 0;
            b_oklab = weightSum ? b_oklab / weightSum : 0;

            const rgb = oklabToRgb({ l, a, b_oklab });
            const index = (y * canvas.width + x) * 4;
            data[index] = rgb[0];
            data[index + 1] = rgb[1];
            data[index + 2] = rgb[2];
            data[index + 3] = 255; // Fully opaque
        }
    }

    ctx.putImageData(imageData, 0, 0);

    if (showPoints) {
        // Draw point markers
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.influence * 10, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = point.color;
            ctx.fill();
        });
    }
}

// Convert HEX color to RGB
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

// Download the image
function downloadImage() {
    // Temporarily hide point markers
    draw(false);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'interpolated_image.png';
    link.click();

    // Restore point markers
    draw(true);
}

// Handle canvas interactions
let isDragging = false;
let draggedPointIndex = null;

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (event.button === 0) { // Left click
        // Check if clicking near an existing point
        for (let i = 0; i < points.length; i++) {
            const dx = x - points[i].x;
            const dy = y - points[i].y;
            if (Math.sqrt(dx * dx + dy * dy) < points[i].influence * 10) {
                isDragging = true;
                draggedPointIndex = i;
                return;
            }
        }
        // If no existing point is near, add a new point
        const color = colorPicker.value;
        const influence = influenceInput.value;
        addPoint(x, y, color, influence);
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging && draggedPointIndex !== null) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        points[draggedPointIndex].x = x;
        points[draggedPointIndex].y = y;
        draw();
    }
});

// Handle mouse wheel for adjusting influence
canvas.addEventListener('wheel', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let pointIndex = null;
    for (let i = 0; i < points.length; i++) {
        const dx = x - points[i].x;
        const dy = y - points[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < points[i].influence * 10) {
            pointIndex = i;
            break;
        }
    }

    if (pointIndex !== null) {
        const change = event.deltaY > 0 ? -0.1 : 0.1;
        points[pointIndex].influence = Math.max(0.1, points[pointIndex].influence + change);
        influenceInput.value = points[pointIndex].influence;
        updatePointList(); // Ensure list updates
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedPointIndex = null;
});

canvas.addEventListener('dblclick', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Remove point if double-clicked near an existing point
    for (let i = 0; i < points.length; i++) {
        const dx = x - points[i].x;
        const dy = y - points[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < points[i].influence * 10) {
            removePoint(i);
            return;
        }
    }
});

// Event listeners for user inputs
colorPicker.addEventListener('change', () => {
    if (draggedPointIndex !== null) {
        points[draggedPointIndex].color = colorPicker.value;
        draw();
    }
});

influenceInput.addEventListener('input', () => {
    if (draggedPointIndex !== null) {
        points[draggedPointIndex].influence = parseFloat(influenceInput.value);
        draw();
    }
});

sigmaInput.addEventListener('input', () => {
    sigma = parseFloat(sigmaInput.value);
    draw();
});

downloadButton.addEventListener('click', downloadImage);

// Initial drawing
draw();
