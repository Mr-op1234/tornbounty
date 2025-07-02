// Global variables
let bountyData = [];
let filteredData = [];
let currentIndex = 0;

// DOM Elements
const uploadInterface = document.getElementById('upload-interface');
const dashboardInterface = document.getElementById('dashboard-interface');
const termsCheckbox = document.getElementById('terms-agree');
const browseBtnElement = document.getElementById('browse-btn');
const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const fileInfo = document.getElementById('file-info');
const processBtn = document.getElementById('process-btn');
const statusMessage = document.getElementById('status-message');
const userLevelInput = document.getElementById('user-level');
const getTargetsBtn = document.getElementById('get-targets-btn');
const resultsSection = document.getElementById('results-section');
const targetDisplay = document.getElementById('target-display');
const currentResult = document.getElementById('current-result');
const totalResults = document.getElementById('total-results');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const errorMessage = document.getElementById('error-message');
const backToUploadBtn = document.getElementById('back-to-upload');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Terms checkbox handler
    termsCheckbox.addEventListener('change', function() {
        browseBtnElement.disabled = !this.checked;
    });

    // File upload handlers
    browseBtnElement.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);

    // Process file handler
    processBtn.addEventListener('click', processFile);

    // Dashboard handlers
    userLevelInput.addEventListener('input', validateUserLevel);
    getTargetsBtn.addEventListener('click', getPlayerDetails);

    // Navigation handlers
    prevBtn.addEventListener('click', showPreviousTarget);
    nextBtn.addEventListener('click', showNextTarget);
    backToUploadBtn.addEventListener('click', backToUpload);
}

// File Upload Functions
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files } });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showStatusMessage('Please select a valid XLSX file.', 'error');
        return;
    }

    // Show file info
    document.getElementById('file-name').textContent = file.name;
    fileInfo.style.display = 'block';
    uploadArea.style.display = 'none';
    
    // Store file for processing
    window.selectedFile = file;
}

function processFile() {
    if (!window.selectedFile) {
        showStatusMessage('No file selected.', 'error');
        return;
    }

    showStatusMessage('Processing file...', 'info');
    updateProgress(20);

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            updateProgress(50);
            
            // Parse XLSX file
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            updateProgress(75);
            
            // Clean and validate data
            bountyData = cleanBountyData(jsonData);
            
            if (bountyData.length === 0) {
                throw new Error('WRONG XLSX FILE PLEASE TRY AGAIN');
            }
            
            updateProgress(100);
            
            showStatusMessage(`Successfully processed ${bountyData.length} bounty records!`, 'success');
            
            setTimeout(() => {
                switchToDashboard();
            }, 1500);
            
        } catch (error) {
            console.error('Error processing file:', error);
            
            // Show specific error message or default
            const errorMsg = error.message === 'WRONG XLSX FILE PLEASE TRY AGAIN' 
                ? error.message 
                : 'Error processing file. Please check the file format.';
                
            showStatusMessage(errorMsg, 'error');
            updateProgress(0);
            
            // Reset file selection
            resetFileSelection();
        }
    };
    
    reader.readAsBinaryString(window.selectedFile);
}

function cleanBountyData(rawData) {
    // Check if data is empty
    if (!rawData || rawData.length === 0) {
        throw new Error('WRONG XLSX FILE PLEASE TRY AGAIN');
    }

    // Validate required columns exist
    const firstRow = rawData[0];
    const requiredColumns = validateBountyColumns(firstRow);
    
    if (!requiredColumns.isValid) {
        throw new Error('WRONG XLSX FILE PLEASE TRY AGAIN');
    }

    // Check if data is already cleaned (numeric values in reward/level/quantity)
    const isAlreadyCleaned = detectIfAlreadyCleaned(rawData, requiredColumns);

    return rawData.map(row => {
        // Get values using flexible column mapping
        let reward = getColumnValue(row, requiredColumns.reward);
        let level = getColumnValue(row, requiredColumns.level);
        let quantity = getColumnValue(row, requiredColumns.quantity);
        let status = getColumnValue(row, requiredColumns.status);
        let target = getColumnValue(row, requiredColumns.target);

        // Clean data only if not already cleaned
        if (!isAlreadyCleaned) {
            // Clean reward: remove $ and commas, convert to number
            reward = reward.toString().replace(/[$,]/g, '');
        }
        reward = parseInt(reward) || 0;

        if (!isAlreadyCleaned) {
            // Clean level: extract number from "Level: XX" format
            level = level.toString().replace(/[^\d]/g, '');
        }
        level = parseInt(level) || 0;

        if (!isAlreadyCleaned) {
            // Clean quantity: extract number from "Qty: XX" format
            quantity = quantity.toString().replace(/[^\d]/g, '');
        }
        quantity = parseInt(quantity) || 0;

        // Clean status: normalize values (always clean this)
        status = status.toString().toLowerCase().trim();
        
        // Normalize status values
        const statusMap = {
            'okay': 'Okay',
            'hospital': 'Hospital',
            'abroad': 'Abroad',
            'traveling': 'Traveling',
            'travelling': 'Traveling' // Handle both spellings
        };
        
        status = statusMap[status] || 'Unknown';

        return {
            reward: reward,
            target: target || '',
            level: level,
            status: status,
            quantity: quantity
        };
    }).filter(row => 
        row.reward > 0 && 
        row.level > 0 && 
        row.level <= 100 && 
        row.target && 
        ['Okay', 'Hospital', 'Abroad', 'Traveling'].includes(row.status)
    );
}

function validateBountyColumns(firstRow) {
    if (!firstRow) {
        return { isValid: false };
    }

    const columns = Object.keys(firstRow).map(key => key.toLowerCase().trim());
    
    // Define possible column name variations
    const columnMappings = {
        reward: ['reward', 'bounty', 'price', 'amount', 'money'],
        target: ['target', 'name', 'player', 'username', 'user'],
        level: ['level', 'lvl', 'lv'],
        status: ['status', 'state', 'condition'],
        quantity: ['quantity', 'qty', 'amount', 'count', 'number']
    };

    const result = {
        isValid: true,
        reward: null,
        target: null,
        level: null,
        status: null,
        quantity: null
    };

    // Find matching columns
    for (const [requiredCol, variations] of Object.entries(columnMappings)) {
        let found = false;
        for (const variation of variations) {
            const matchedColumn = columns.find(col => col.includes(variation));
            if (matchedColumn) {
                // Get original column name (with original casing)
                const originalColumnName = Object.keys(firstRow).find(
                    key => key.toLowerCase().trim() === matchedColumn
                );
                result[requiredCol] = originalColumnName;
                found = true;
                break;
            }
        }
        
        if (!found) {
            result.isValid = false;
            break;
        }
    }

    return result;
}

function getColumnValue(row, columnName) {
    return row[columnName] || '';
}

function detectIfAlreadyCleaned(data, requiredColumns) {
    // Check first few rows to see if data is already in cleaned format
    const sampleSize = Math.min(5, data.length);
    let cleanedCount = 0;

    for (let i = 0; i < sampleSize; i++) {
        const row = data[i];
        const reward = getColumnValue(row, requiredColumns.reward);
        const level = getColumnValue(row, requiredColumns.level);
        const quantity = getColumnValue(row, requiredColumns.quantity);

        // Check if reward is already numeric (no $ or commas)
        const rewardStr = reward.toString();
        const isRewardCleaned = !rewardStr.includes('$') && !rewardStr.includes(',') && !isNaN(parseInt(rewardStr));

        // Check if level is already numeric (no "Level:" prefix)
        const levelStr = level.toString();
        const isLevelCleaned = !levelStr.toLowerCase().includes('level') && !isNaN(parseInt(levelStr));

        // Check if quantity is already numeric (no "Qty:" prefix)
        const quantityStr = quantity.toString();
        const isQuantityCleaned = !quantityStr.toLowerCase().includes('qty') && !isNaN(parseInt(quantityStr));

        if (isRewardCleaned && isLevelCleaned && isQuantityCleaned) {
            cleanedCount++;
        }
    }

    // If more than 80% of samples are already cleaned, consider the whole dataset as cleaned
    return (cleanedCount / sampleSize) > 0.8;
}

function updateProgress(percentage) {
    document.getElementById('progress-fill').style.width = percentage + '%';
}

function resetFileSelection() {
    fileInput.value = '';
    fileInfo.style.display = 'none';
    uploadArea.style.display = 'block';
    window.selectedFile = null;
}

function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type === 'error' ? 'error-message' : 'status-message';
    statusMessage.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
}

// Dashboard Functions
function switchToDashboard() {
    uploadInterface.classList.remove('active');
    dashboardInterface.classList.add('active');
}

function validateUserLevel() {
    const level = parseInt(userLevelInput.value);
    getTargetsBtn.disabled = !level || level < 1 || level > 100;
}

function getPlayerDetails() {
    const userLevel = parseInt(userLevelInput.value);
    
    if (!userLevel || userLevel < 1 || userLevel > 100) {
        showErrorMessage('Please enter a valid level between 1 and 100.');
        return;
    }

    // Filter players with level < user input
    filteredData = bountyData.filter(player => player.level < userLevel);

    if (filteredData.length === 0) {
        showErrorMessage('No such Players');
        return;
    }

    // Sort by priority: Status > Reward > Quantity
    filteredData.sort((a, b) => {
        // Status priority: Okay > Hospital > Abroad > Traveling
        const statusPriority = {
            'Okay': 4,
            'Hospital': 3,
            'Abroad': 2,
            'Traveling': 1
        };

        // Primary sort: Status (higher priority first)
        const statusDiff = statusPriority[b.status] - statusPriority[a.status];
        if (statusDiff !== 0) return statusDiff;

        // Secondary sort: Reward (descending)
        const rewardDiff = b.reward - a.reward;
        if (rewardDiff !== 0) return rewardDiff;

        // Tertiary sort: Quantity (descending)
        return b.quantity - a.quantity;
    });

    // Display results
    currentIndex = 0;
    displayCurrentTarget();
    resultsSection.style.display = 'block';
    errorMessage.style.display = 'none';
}

function displayCurrentTarget() {
    if (filteredData.length === 0) return;

    const target = filteredData[currentIndex];
    
    // Format reward with commas
    const formattedReward = '$' + target.reward.toLocaleString();
    
    // Get status class for styling
    const statusClass = target.status.toLowerCase();
    
    targetDisplay.innerHTML = `
        <tr>
            <td><strong>${formattedReward}</strong></td>
            <td>${target.target}</td>
            <td>${target.level}</td>
            <td>${target.quantity}</td>
            <td><span class="status ${statusClass}">${target.status}</span></td>
        </tr>
    `;

    // Update navigation info
    currentResult.textContent = currentIndex + 1;
    totalResults.textContent = filteredData.length;

    // Update navigation buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === filteredData.length - 1;
}

function showPreviousTarget() {
    if (currentIndex > 0) {
        currentIndex--;
        displayCurrentTarget();
    }
}

function showNextTarget() {
    if (currentIndex < filteredData.length - 1) {
        currentIndex++;
        displayCurrentTarget();
    }
}

function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    resultsSection.style.display = 'none';
}

function backToUpload() {
    // Reset everything
    bountyData = [];
    filteredData = [];
    currentIndex = 0;
    
    // Reset form
    fileInput.value = '';
    userLevelInput.value = '';
    termsCheckbox.checked = false;
    browseBtnElement.disabled = true;
    getTargetsBtn.disabled = true;
    
    // Reset UI
    fileInfo.style.display = 'none';
    uploadArea.style.display = 'block';
    resultsSection.style.display = 'none';
    statusMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    updateProgress(0);
    
    // Switch interfaces
    dashboardInterface.classList.remove('active');
    uploadInterface.classList.add('active');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (dashboardInterface.classList.contains('active') && resultsSection.style.display !== 'none') {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
            showPreviousTarget();
        } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
            showNextTarget();
        }
    }
});
