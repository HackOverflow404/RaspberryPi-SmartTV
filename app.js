// Predefined apps
const predefinedApps = [
  { name: "YouTube", url: "https://youtube.com", id: "youtube" },
  { name: "Netflix", url: "https://netflix.com", id: "netflix" },
  { name: "Prime Video", url: "https://primevideo.com", id: "prime" },
  { name: "Hulu", url: "https://hulu.com", id: "hulu" },
  { name: "Spotify", url: "https://spotify.com", id: "spotify" }
];

// DOM elements
const grid = document.getElementById("launcherGrid");
const addBtn = document.getElementById("addLauncherBtn");
const editToggleBtn = document.getElementById("editToggleBtn");
const editModeText = document.getElementById("editModeText");
const nameInput = document.getElementById("appName");
const urlInput = document.getElementById("appURL");

// State
let editMode = false;
let customApps = [];

// Storage functions
function loadCustomApps() {
  try {
    const stored = localStorage.getItem("tvLauncherApps");
    if (stored) {
      customApps = JSON.parse(stored);
      console.log("Loaded custom apps:", customApps);
    }
  } catch (e) {
    console.error("Error loading custom apps:", e);
    customApps = [];
  }
}

function saveCustomApps() {
  try {
    localStorage.setItem("tvLauncherApps", JSON.stringify(customApps));
    console.log("Saved custom apps:", customApps);
  } catch (e) {
    console.error("Error saving custom apps:", e);
  }
}

// Gradients for custom apps
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
];

function getGradient(index) {
  return gradients[index % gradients.length];
}

// Create tile element
function createTile(app, index, isCustom) {
  console.log("Creating tile for:", app.name, "isCustom:", isCustom);
  
  const tile = document.createElement("div");
  tile.className = "tile loading";

  // Set data attribute for predefined apps
  if (app.id && predefinedApps.some(pApp => pApp.id === app.id)) {
    tile.setAttribute('data-app', app.id);
  }

  const content = document.createElement("div");
  content.className = "tile-content";

  const name = document.createElement("div");
  name.textContent = app.name;
  content.appendChild(name);
  tile.appendChild(content);

  // Apply custom gradient for custom apps
  if (isCustom) {
    const gradient = getGradient(index);
    tile.style.setProperty('--primary-gradient', gradient);
  }

  // Click handler for navigation
  tile.addEventListener('click', function(e) {
    if (!editMode) {
      console.log("Navigating to:", app.url);
      tile.style.transform = 'scale(0.95)';
      setTimeout(() => {
        window.location.href = app.url;
      }, 150);
    }
  });

  // Add edit controls for custom apps
  if (editMode && isCustom) {
    tile.classList.add("editing");
    
    const controls = document.createElement("div");
    controls.className = "controls";

    // Rename button
    const renameBtn = document.createElement("button");
    renameBtn.className = "rename-btn";
    renameBtn.textContent = "R";
    renameBtn.title = "Rename";
    renameBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const newName = prompt("Enter new name:", app.name);
      if (newName && newName.trim()) {
        const customIndex = index - predefinedApps.length;
        customApps[customIndex].name = newName.trim();
        saveCustomApps();
        render();
      }
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "X";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (confirm(`Delete "${app.name}"?`)) {
        const customIndex = index - predefinedApps.length;
        customApps.splice(customIndex, 1);
        saveCustomApps();
        render();
      }
    });

    controls.appendChild(renameBtn);
    controls.appendChild(deleteBtn);
    tile.appendChild(controls);
  }

  return tile;
}

// Render all tiles
function render() {
  console.log("Rendering apps. Edit mode:", editMode);
  console.log("Custom apps:", customApps);
  
  grid.innerHTML = "";
  const allApps = [...predefinedApps, ...customApps];

  allApps.forEach((app, index) => {
    const isCustom = index >= predefinedApps.length;
    const tile = createTile(app, index, isCustom);
    grid.appendChild(tile);

    // Stagger animations
    setTimeout(() => {
      tile.style.animationDelay = `${index * 50}ms`;
    }, 10);
  });

  // Update edit button styling
  if (editMode) {
    editToggleBtn.classList.add('pulse');
  } else {
    editToggleBtn.classList.remove('pulse');
  }
}

// Add app functionality
function addApp() {
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  console.log("Adding app:", name, url);

  if (!name || !url) {
    alert("Please provide both a name and URL.");
    return;
  }

  // URL validation
  try {
    new URL(url);
  } catch {
    alert("Please enter a valid URL (including https://)");
    return;
  }

  // Add to custom apps
  const newApp = {
    name: name,
    url: url,
    id: `custom-${Date.now()}`
  };

  customApps.push(newApp);
  saveCustomApps();

  // Clear inputs
  nameInput.value = "";
  urlInput.value = "";

  // Show success feedback
  const originalHTML = addBtn.innerHTML;
  addBtn.innerHTML = "<span>Added!</span>";
  setTimeout(() => {
    addBtn.innerHTML = originalHTML;
  }, 1000);

  // Re-render
  render();
}

// Toggle edit mode
function toggleEditMode() {
  editMode = !editMode;
  console.log("Edit mode toggled:", editMode);
  
  editModeText.textContent = editMode ? "Done" : "Edit Mode";
  editToggleBtn.className = `btn ${editMode ? 'btn-primary' : 'btn-secondary'}`;
  
  render();
}

// Event listeners
addBtn.addEventListener('click', addApp);
editToggleBtn.addEventListener('click', toggleEditMode);
searchBtn.addEventListener('click', performGoogleSearch);

// Search on Enter key press
searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    performGoogleSearch();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && editMode) {
    toggleEditMode();
  }
});

// Initialize app
function init() {
  console.log("Initializing TV Launcher");
  loadCustomApps();
  render();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}