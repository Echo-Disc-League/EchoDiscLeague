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

const quickRankingsTeamAmount = 10;

const messageRef = ref(database, 'messages/infoBoardMessage');
get(messageRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const message = snapshot.val();
            const formattedMessage = message.replace(/\\n/g, '\n');
            document.getElementById('infoBoardMessage').textContent = formattedMessage;
        } else {
            document.getElementById('infoBoardMessage').textContent = "No message found";
        }
    })
    .catch((error) => {
        console.error("Error fetching info board message:", error);
        document.getElementById('infoBoardMessage').textContent = "Error loading message";
    });

const infoBoardImageRef = ref(database, 'messages/infoBoardImage');
get(infoBoardImageRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const imagePath = snapshot.val();
            const imageReference = storageRef(storage, imagePath);
            
            return getDownloadURL(imageReference);
        }
    })
    .then((url) => {
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = "Info Board Banner";
            img.id = "infoBoardImage";
            
            const infoBoard = document.querySelector('.info-board');
            const heading = infoBoard.querySelector('h1');
            heading.after(img);
        }
    })
    .catch((error) => {
        console.error("Error loading info board image:", error);
    });

// Fetch and sort teams by MMR with logos
const teamsRef = ref(database, 'teams');
get(teamsRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const teamsData = snapshot.val();
            
            const teamsArray = Object.keys(teamsData).map(key => ({
                id: key,
                ...teamsData[key]
            }));
            
            teamsArray.sort((a, b) => b.mmr - a.mmr);
            const topTeams = teamsArray.slice(0, quickRankingsTeamAmount);
            
            let rankingsHTML = '';
            
            topTeams.forEach((team, index) => {
                if (index > 0) {
                    rankingsHTML += '<div></div>';
                }
                
                rankingsHTML += `<h2 class="teamLinkButton" data-team-id="${team.id}">
                    <a href="/html/teamPage.html?team=${team.id}">
                        ${index + 1}. ${team.name} - ${team.mmr}
                        <span class="logo-container" id="logo-container-${team.id}"></span>
                    </a>
                </h2>`;
            });
            
            document.getElementById('rankingsList').innerHTML = rankingsHTML;
            
            const loadPlaceholder = (teamId, teamName) => {
                const placeholderRef = storageRef(storage, 'team-logos/Placeholder.png');
                getDownloadURL(placeholderRef)
                    .then((url) => {
                        const container = document.getElementById(`logo-container-${teamId}`);
                        if (container) {
                            const img = document.createElement('img');
                            img.src = url;
                            img.alt = `${teamName} logo`;
                            img.className = 'team-logo';
                            container.appendChild(img);
                        }
                    })
                    .catch((error) => {
                        console.error(`Placeholder image not found:`, error);
                    });
            };
            
            topTeams.forEach((team) => {
                if (team.logo) {
                    const logoRef = storageRef(storage, team.logo);
                    getDownloadURL(logoRef)
                        .then((url) => {
                            const container = document.getElementById(`logo-container-${team.id}`);
                            if (container) {
                                const img = document.createElement('img');
                                img.src = url;
                                img.alt = `${team.name} logo`;
                                img.className = 'team-logo';
                                container.appendChild(img);
                            }
                        })
                        .catch((error) => {
                            console.error(`Logo not found for ${team.name}, loading placeholder:`, error);
                            loadPlaceholder(team.id, team.name);
                        });
                } else {
                    loadPlaceholder(team.id, team.name);
                }
            });
            
        } else {
            document.getElementById('rankingsList').textContent = "No rankings available";
        }
    })
    .catch((error) => {
        console.error("Error fetching teams:", error);
        document.getElementById('rankingsList').textContent = "Error loading rankings";
    });

console.log("Firebase loaded");