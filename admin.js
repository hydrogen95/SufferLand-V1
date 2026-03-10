// ============================================
// SUFFERLAND - Admin Panel JavaScript
// ============================================

// Global state
let currentConfig = null;
let token = localStorage.getItem('sufferland_admin_token');

// Check authentication
if (!token) {
    window.location.href = 'login.html';
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadAdminConfig();
});

// ============================================
// Load Configuration for Admin
// ============================================
async function loadAdminConfig() {
    try {
        const response = await fetch('/api/admin/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        
        if (response.ok) {
            currentConfig = await response.json();
            populateForms();
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error loading config:', error);
        showSaveStatus('Error loading configuration', false);
    }
}

// ============================================
// Populate Forms with Config Data
// ============================================
function populateForms() {
    if (!currentConfig) return;
    
    // Server info
    document.getElementById('server-name').value = currentConfig.server.name || '';
    document.getElementById('server-tagline').value = currentConfig.server.tagline || '';
    document.getElementById('server-description').value = currentConfig.server.description || '';
    document.getElementById('server-ip').value = currentConfig.server.ip || '';
    document.getElementById('server-port').value = currentConfig.server.port || '';
    document.getElementById('discord-link').value = currentConfig.server.discord || '';
    
    // Features
    renderFeatures(currentConfig.server.features || []);
    
    // Ranks
    renderRankEditors(currentConfig.ranks || []);
}

// ============================================
// Render Features List
// ============================================
function renderFeatures(features) {
    const container = document.getElementById('features-container');
    container.innerHTML = features.map((feature, index) => `
        <div class="perk-item" data-index="${index}">
            <input type="text" value="${feature}" placeholder="Enter feature description">
            <button type="button" class="btn-icon btn-remove" onclick="removeFeature(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// ============================================
// Add Feature
// ============================================
function addFeature() {
    const container = document.getElementById('features-container');
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'perk-item';
    div.dataset.index = index;
    div.innerHTML = `
        <input type="text" placeholder="Enter feature description">
        <button type="button" class="btn-icon btn-remove" onclick="removeFeature(${index})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

// ============================================
// Remove Feature
// ============================================
function removeFeature(index) {
    const container = document.getElementById('features-container');
    const items = container.querySelectorAll('.perk-item');
    if (items[index]) {
        items[index].remove();
    }
    // Reindex remaining items
    container.querySelectorAll('.perk-item').forEach((item, i) => {
        item.dataset.index = i;
        item.querySelector('.btn-remove').setAttribute('onclick', `removeFeature(${i})`);
    });
}

// ============================================
// Render Rank Editors
// ============================================
function renderRankEditors(ranks) {
    const container = document.getElementById('ranks-edit-container');
    container.innerHTML = ranks.map((rank, index) => `
        <div class="admin-card rank-edit-card" data-rank-index="${index}">
            <div class="rank-edit-header">
                <h4><i class="fas fa-crown"></i> ${rank.name}</h4>
                <span style="color: ${rank.color}">●</span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Rank Name</label>
                    <input type="text" class="rank-name" value="${rank.name}" placeholder="Rank name">
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="text" class="rank-price" value="${rank.price}" placeholder="Price (e.g., ₱50)">
                </div>
            </div>
            <div class="form-group">
                <label>Color (Hex)</label>
                <input type="text" class="rank-color" value="${rank.color}" placeholder="#00FF00">
            </div>
            <div class="form-group">
                <label>Perks</label>
                <div class="perk-list">
                    ${rank.perks.map((perk, perkIndex) => `
                        <div class="perk-item" data-perk-index="${perkIndex}">
                            <input type="text" value="${perk}" placeholder="Enter perk">
                            <button type="button" class="btn-icon btn-remove" onclick="removePerk(${index}, ${perkIndex})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-perk-btn" onclick="addPerk(${index})">
                    <i class="fas fa-plus"></i> Add Perk
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// Add Perk to Rank
// ============================================
function addPerk(rankIndex) {
    const rankCard = document.querySelector(`.rank-edit-card[data-rank-index="${rankIndex}"]`);
    const perkList = rankCard.querySelector('.perk-list');
    const perkIndex = perkList.children.length;
    
    const div = document.createElement('div');
    div.className = 'perk-item';
    div.dataset.perkIndex = perkIndex;
    div.innerHTML = `
        <input type="text" placeholder="Enter perk">
        <button type="button" class="btn-icon btn-remove" onclick="removePerk(${rankIndex}, ${perkIndex})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    perkList.appendChild(div);
}

// ============================================
// Remove Perk from Rank
// ============================================
function removePerk(rankIndex, perkIndex) {
    const rankCard = document.querySelector(`.rank-edit-card[data-rank-index="${rankIndex}"]`);
    const perkList = rankCard.querySelector('.perk-list');
    const items = perkList.querySelectorAll('.perk-item');
    
    if (items[perkIndex]) {
        items[perkIndex].remove();
    }
    
    // Reindex remaining perks
    perkList.querySelectorAll('.perk-item').forEach((item, i) => {
        item.dataset.perkIndex = i;
        item.querySelector('.btn-remove').setAttribute('onclick', `removePerk(${rankIndex}, ${i})`);
    });
}

// ============================================
// Switch Tab
// ============================================
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.admin-tab').classList.add('active');
    
    // Update panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`panel-${tabName}`).classList.add('active');
}

// ============================================
// Collect Server Data from Forms
// ============================================
function collectServerData() {
    // Collect features
    const features = [];
    document.querySelectorAll('#features-container .perk-item input').forEach(input => {
        if (input.value.trim()) {
            features.push(input.value.trim());
        }
    });
    
    return {
        name: document.getElementById('server-name').value,
        tagline: document.getElementById('server-tagline').value,
        description: document.getElementById('server-description').value,
        ip: document.getElementById('server-ip').value,
        port: document.getElementById('server-port').value,
        discord: document.getElementById('discord-link').value,
        features: features
    };
}

// ============================================
// Collect Ranks Data from Forms
// ============================================
function collectRanksData() {
    const ranks = [];
    
    document.querySelectorAll('.rank-edit-card').forEach(card => {
        const rankIndex = card.dataset.rankIndex;
        const perks = [];
        
        card.querySelectorAll('.perk-list .perk-item input').forEach(input => {
            if (input.value.trim()) {
                perks.push(input.value.trim());
            }
        });
        
        ranks.push({
            id: currentConfig.ranks[rankIndex]?.id || rankIndex,
            name: card.querySelector('.rank-name').value,
            price: card.querySelector('.rank-price').value,
            color: card.querySelector('.rank-color').value,
            perks: perks
        });
    });
    
    return ranks;
}

// ============================================
// Save All Changes
// ============================================
async function saveAllChanges() {
    const serverData = collectServerData();
    const ranksData = collectRanksData();
    
    try {
        // Save server data
        const serverResponse = await fetch('/api/admin/update-server', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, serverData })
        });
        
        // Save ranks data
        const ranksResponse = await fetch('/api/admin/update-ranks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, ranks: ranksData })
        });
        
        if (serverResponse.ok && ranksResponse.ok) {
            showSaveStatus('All changes saved successfully!', true);
            // Reload config to ensure data is synced
            loadAdminConfig();
        } else {
            showSaveStatus('Error saving changes', false);
        }
    } catch (error) {
        console.error('Error saving changes:', error);
        showSaveStatus('Error saving changes', false);
    }
}

// ============================================
// Update Admin Credentials
// ============================================
async function updateCredentials() {
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!newUsername && !newPassword) {
        showSaveStatus('Please enter a new username or password', false);
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        showSaveStatus('Passwords do not match', false);
        return;
    }
    
    try {
        const response = await fetch('/api/admin/update-credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token, 
                username: newUsername || undefined, 
                password: newPassword || undefined 
            })
        });
        
        if (response.ok) {
            showSaveStatus('Credentials updated successfully!', true);
            document.getElementById('new-username').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            showSaveStatus('Error updating credentials', false);
        }
    } catch (error) {
        console.error('Error updating credentials:', error);
        showSaveStatus('Error updating credentials', false);
    }
}

// ============================================
// Show Save Status
// ============================================
function showSaveStatus(message, success) {
    const status = document.getElementById('save-status');
    status.innerHTML = success 
        ? `<i class="fas fa-check-circle"></i> ${message}`
        : `<i class="fas fa-exclamation-circle"></i> ${message}`;
    status.className = `save-status ${success ? 'success' : 'error'}`;
    
    setTimeout(() => {
        status.classList.remove('success', 'error');
    }, 3000);
}

// ============================================
// Logout
// ============================================
function logout() {
    localStorage.removeItem('sufferland_admin_token');
    window.location.href = 'login.html';
}

// ============================================
// Auto-save on input change (debounced)
// ============================================
let saveTimeout;
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            // Optional: Auto-save indicator
            console.log('Changes detected...');
        }, 1000);
    }
});
