const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const CONFIG_FILE = './config.json';

// Read config file
function getConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
}

// Write config file
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

// Get server status from Minecraft API
async function getServerStatus(ip, port) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://api.mcsrvstat.us/2/${ip}:${port}`, {
      timeout: 5000
    });
    const data = await response.json();
    return {
      online: data.online || false,
      players: {
        online: data.players?.online || 0,
        max: data.players?.max || 0
      },
      version: data.version || 'Unknown',
      motd: data.motd?.clean || ['SUFFERLAND']
    };
  } catch (error) {
    console.error('Error fetching server status:', error);
    return {
      online: false,
      players: { online: 0, max: 0 },
      version: 'Unknown',
      motd: ['SUFFERLAND']
    };
  }
}

// API Routes

// Get all config data (public)
app.get('/api/config', (req, res) => {
  const config = getConfig();
  if (config) {
    // Remove sensitive data
    const publicConfig = {
      server: config.server,
      ranks: config.ranks
    };
    res.json(publicConfig);
  } else {
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// Get server status
app.get('/api/status', async (req, res) => {
  const config = getConfig();
  if (config) {
    const status = await getServerStatus(config.server.ip, config.server.port);
    res.json(status);
  } else {
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const config = getConfig();
  
  if (config && config.admin && 
      username === config.admin.username && 
      password === config.admin.password) {
    res.json({ success: true, token: 'sufferland_admin_token_' + Date.now() });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Update server info (admin only)
app.post('/api/admin/update-server', (req, res) => {
  const { token, serverData } = req.body;
  if (!token || !token.startsWith('sufferland_admin_token_')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const config = getConfig();
  if (config) {
    config.server = { ...config.server, ...serverData };
    if (saveConfig(config)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save config' });
    }
  } else {
    res.status(500).json({ success: false, error: 'Failed to load config' });
  }
});

// Update ranks (admin only)
app.post('/api/admin/update-ranks', (req, res) => {
  const { token, ranks } = req.body;
  if (!token || !token.startsWith('sufferland_admin_token_')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const config = getConfig();
  if (config) {
    config.ranks = ranks;
    if (saveConfig(config)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save config' });
    }
  } else {
    res.status(500).json({ success: false, error: 'Failed to load config' });
  }
});

// Update admin credentials (admin only)
app.post('/api/admin/update-credentials', (req, res) => {
  const { token, username, password } = req.body;
  if (!token || !token.startsWith('sufferland_admin_token_')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const config = getConfig();
  if (config) {
    if (username) config.admin.username = username;
    if (password) config.admin.password = password;
    if (saveConfig(config)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save config' });
    }
  } else {
    res.status(500).json({ success: false, error: 'Failed to load config' });
  }
});

// Get full config for admin (admin only)
app.post('/api/admin/config', (req, res) => {
  const { token } = req.body;
  if (!token || !token.startsWith('sufferland_admin_token_')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const config = getConfig();
  if (config) {
    res.json(config);
  } else {
    res.status(500).json({ error: 'Failed to load config' });
  }
});

app.listen(PORT, () => {
  console.log(`SUFFERLAND Server running on port ${PORT}`);
  console.log(`Website: http://localhost:${PORT}`);
});
