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

// Get team ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get('team');

if (!teamId) {
    document.querySelector('.team-container').innerHTML = '<h1>Team not found</h1><a href="../index.html">Back to Rankings</a>';
} else {
    // Fetch team data
    const teamRef = ref(database, `teams/${teamId}`);
    get(teamRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const teamData = snapshot.val();
                
                // Display team info
                document.getElementById('teamName').textContent = teamData.name;
                document.getElementById('teamMMR').textContent = teamData.mmr || 'N/A';
                document.getElementById("teamRosterBanner").textContent = `${teamData.name}'s Roster`;
                
                // Load team logo or placeholder
                const logoPath = teamData.logo || 'team-logos/Placeholder.png';
                const logoReference = storageRef(storage, logoPath);
                getDownloadURL(logoReference)
                    .then((url) => {
                        document.getElementById('teamLogo').src = url;
                    })
                    .catch((error) => {
                        console.error("Error loading logo, trying placeholder:", error);
                        const placeholderRef = storageRef(storage, 'team-logos/Placeholder.png');
                        getDownloadURL(placeholderRef)
                            .then((url) => {
                                document.getElementById('teamLogo').src = url;
                            })
                            .catch(() => {
                                document.getElementById('teamLogo').style.display = 'none';
                            });
                    });
                
                // Display team roster
                if (teamData.members) {
                    let rosterHTML = '<div class="roster-grid">';
                    
                    // Captain
                    if (teamData.members.captain) {
                        rosterHTML += `
                            <div class="member-card captain">
                                <span class="role-badge">Captain</span>
                                <p class="member-name">${teamData.members.captain}</p>
                            </div>
                        `;
                    }
                    
                    // Co-Captain
                    if (teamData.members.coCaptain) {
                        rosterHTML += `
                            <div class="member-card co-captain">
                                <span class="role-badge">Co-Captain</span>
                                <p class="member-name">${teamData.members.coCaptain}</p>
                            </div>
                        `;
                    }
                    
                    // Players
                    if (teamData.members.players && teamData.members.players.length > 0) {
                        teamData.members.players.forEach(player => {
                            rosterHTML += `
                                <div class="member-card player">
                                    <span class="role-badge">Player</span>
                                    <p class="member-name">${player}</p>
                                </div>
                            `;
                        });
                    }
                    
                    rosterHTML += '</div>';
                    document.getElementById('teamRoster').innerHTML = rosterHTML;
                } else {
                    document.getElementById('teamRoster').innerHTML = '<p>No roster available</p>';
                }
                
            } else {
                document.querySelector('.team-container').innerHTML = '<h1>Team not found</h1><a href="../index.html">Back to Rankings</a>';
            }
        })
        .catch((error) => {
            console.error("Error fetching team data:", error);
            document.querySelector('.team-container').innerHTML = '<h1>Error loading team</h1><a href="../index.html">Back to Rankings</a>';
        });
}