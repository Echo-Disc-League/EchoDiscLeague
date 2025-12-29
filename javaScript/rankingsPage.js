import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCoi0Fmm2JOZyy1U-q6Ajv26a4kOBraEHE",
    authDomain: "echodiscleague.firebaseapp.com",
    databaseURL: "https://echodiscleague-default-rtdb.firebaseio.com",
    projectId: "echodiscleague",
    storageBucket: "echodiscleague.firebasestorage.app",
    messagingSenderId: "180497385590",
    appId: "1:180497385590:web:531e47f2b8f3bdc517b757",
    measurementId: "G-0CPN0KBDM7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

let allTeams = []; // Store all teams globally - fetched ONCE
let logoCache = {}; // Store loaded logo URLs - loaded ONCE per logo

// Function to load a single logo and cache it
async function loadLogo(team) {
    // Return cached logo if it exists
    if (logoCache[team.id]) {
        return logoCache[team.id];
    }
    
    try {
        if (team.logo) {
            const logoRef = storageRef(storage, team.logo);
            const url = await getDownloadURL(logoRef);
            logoCache[team.id] = url;
            return url;
        } else {
            // Load placeholder
            const placeholderRef = storageRef(storage, 'team-logos/Placeholder.png');
            const url = await getDownloadURL(placeholderRef);
            logoCache[team.id] = url;
            return url;
        }
    } catch (error) {
        console.error(`Error loading logo for ${team.name}, trying placeholder:`, error);
        try {
            const placeholderRef = storageRef(storage, 'team-logos/Placeholder.png');
            const url = await getDownloadURL(placeholderRef);
            logoCache[team.id] = url;
            return url;
        } catch (placeholderError) {
            console.error(`Placeholder image not found:`, placeholderError);
            return null;
        }
    }
}

// Function to display teams (uses cached data only, no Firebase calls)
function displayTeams(teams) {
    let rankingsHTML = '';
    
    if (teams.length === 0) {
        document.getElementById('rankingsList').innerHTML = '<p style="text-align: center; margin-top: 20px;">No teams found</p>';
        return;
    }
    
    teams.forEach((team, index) => {
        if (index > 0) {
            rankingsHTML += '<div></div>';
        }
        
        // Calculate actual rank from original sorted array
        const actualRank = allTeams.findIndex(t => t.id === team.id) + 1;
        
        rankingsHTML += `<h2 class="teamLinkButton" data-team-id="${team.id}">
            <a href="/html/teamPage.html?team=${team.id}">
                ${actualRank}. ${team.name} - ${team.mmr}
                <span class="logo-container" id="logo-container-${team.id}"></span>
            </a>
        </h2>`;
    });
    
    document.getElementById('rankingsList').innerHTML = rankingsHTML;
    
    // Insert cached logos (no Firebase calls - just using cached URLs)
    teams.forEach((team) => {
        const logoUrl = logoCache[team.id];
        if (logoUrl) {
            const container = document.getElementById(`logo-container-${team.id}`);
            if (container) {
                const img = document.createElement('img');
                img.src = logoUrl;
                img.alt = `${team.name} logo`;
                img.className = 'team-logo';
                container.appendChild(img);
            }
        }
    });
}

// Search functionality (uses cached allTeams array, no Firebase calls)
document.getElementById('search-bar').addEventListener('input', function(e) {
    const searchQuery = e.target.value.toLowerCase().trim();
    
    if (searchQuery === '') {
        // Show all teams if search is empty (from cache)
        displayTeams(allTeams);
    } else {
        // Filter teams based on search query (from cache)
        const filteredTeams = allTeams.filter(team => 
            team.name.toLowerCase().includes(searchQuery)
        );
        displayTeams(filteredTeams);
    }
});

// SINGLE Firebase fetch - happens only once on page load
const teamsRef = ref(database, 'teams');
get(teamsRef)
    .then(async (snapshot) => {
        if (snapshot.exists()) {
            const teamsData = snapshot.val();
            
            // Store all teams in memory
            allTeams = Object.keys(teamsData).map(key => ({
                id: key,
                ...teamsData[key]
            }));
            
            allTeams.sort((a, b) => b.mmr - a.mmr);
            
            // Load all logos once and cache them
            console.log('Loading logos...');
            await Promise.all(allTeams.map(team => loadLogo(team)));
            console.log('All logos loaded and cached');
            
            // Display all teams with cached logos
            displayTeams(allTeams);
            
        } else {
            document.getElementById('rankingsList').textContent = "No rankings available";
        }
    })
    .catch((error) => {
        console.error("Error fetching teams:", error);
        document.getElementById('rankingsList').textContent = "Error loading rankings";
    });

console.log("Firebase loaded");