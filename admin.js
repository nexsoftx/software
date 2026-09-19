// ==========================================
// 🛡️ NEXSOFTX - ADMIN PANEL MASTER JS (100% FIXED)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, updateProfile, updatePassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc, getDoc, addDoc, collectionGroup, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAEH4mX2_qGVaC9ixo0X0AsDQ_EmF-acXM",
    authDomain: "nexsoftx-8cd29.firebaseapp.com",
    projectId: "nexsoftx-8cd29",
    storageBucket: "nexsoftx-8cd29.firebasestorage.app",
    messagingSenderId: "275845923772",
    appId: "1:275845923772:web:d56d1f2efdcaff353da1b9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -----------------------------------------------------
// 🎨 ১. Custom Admin Alert Modal (Animated SVG)
// -----------------------------------------------------
window.showAdminModal = function(type, title, message, confirmCallback = null) {
    const existingModal = document.getElementById('customModal');
    if (existingModal) existingModal.remove();

    let iconSvg = '';
    let iconBgClass = '';
    let btnClass = 'modal-btn-confirm';
    let btnText = 'OK';
    let isConfirm = false;

    if (type === 'success') {
        iconBgClass = 'icon-bg-success';
        iconSvg = `
            <svg class="modal-svg-icon" viewBox="0 0 52 52">
                <circle class="modal-svg-circle" cx="26" cy="26" r="23" fill="none"/>
                <path class="modal-svg-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>`;
    } else if (type === 'confirm' || type === 'warning' || type === 'security') {
        isConfirm = type === 'confirm';
        iconBgClass = 'icon-bg-warning';
        btnClass = isConfirm ? 'modal-btn-danger' : 'modal-btn-confirm';
        btnText = isConfirm ? 'Yes, Confirm' : 'OK';
        iconSvg = `
            <svg class="modal-svg-icon" viewBox="0 0 52 52">
                <circle class="modal-svg-circle" cx="26" cy="26" r="23" fill="none"/>
                <path class="modal-svg-exclamation" fill="none" d="M26 15v14m0 6v2"/>
            </svg>`;
    } else if (type === 'error') {
        iconBgClass = 'icon-bg-error';
        btnClass = 'modal-btn-danger';
        iconSvg = `
            <svg class="modal-svg-icon" viewBox="0 0 52 52">
                <circle class="modal-svg-circle" cx="26" cy="26" r="23" fill="none"/>
                <path class="modal-svg-cross" fill="none" d="M17 17l18 18M35 17L17 35"/>
            </svg>`;
    }

    const modalHTML = `
        <div class="custom-modal-overlay" id="customModal">
            <div class="custom-modal-box">
                <div class="modal-icon-wrapper ${iconBgClass}">${iconSvg}</div>
                <h3 class="custom-modal-title">${title}</h3>
                <p class="custom-modal-text">${message}</p>
                <div class="custom-modal-actions">
                    ${isConfirm ? `<button class="modal-btn modal-btn-cancel" id="modalCancelBtn">Cancel</button>` : ''}
                    <button class="modal-btn ${btnClass}" id="modalConfirmBtn">${btnText}</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('customModal');
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    const closeModal = (callback) => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (callback) callback();
        }, 250);
    };

    document.getElementById('modalConfirmBtn').addEventListener('click', () => {
        closeModal(confirmCallback);
    });

    if (isConfirm) {
        document.getElementById('modalCancelBtn').addEventListener('click', () => {
            closeModal();
        });
    }
};

// -----------------------------------------------------
// 🛡️ ২. Admin Security Lock (Master & Sub-Admin)
// -----------------------------------------------------
const currentPath = window.location.pathname;
const isAdminLoginPage = currentPath.includes('admin-login');

if (currentPath.includes('admin') && !isAdminLoginPage) {
    document.documentElement.style.display = 'none';
}

const MASTER_ADMIN_EMAIL = "admin@nexsoftx.com"; 

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const isMaster = user.email === MASTER_ADMIN_EMAIL;
        let isSubAdmin = false;

        if (!isMaster) {
            try {
                const adminDocRef = doc(db, "admins", user.email.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                const adminDocSnap = await getDoc(adminDocRef);
                if (adminDocSnap.exists()) {
                    isSubAdmin = true;
                }
            } catch (err) {
                console.error("Auth check error:", err);
            }
        }

        if (!isMaster && !isSubAdmin) {
            if (currentPath.includes('admin')) {
                await signOut(auth);
                window.location.href = "login.html"; 
            }
            return;
        }

        if (isAdminLoginPage) {
            window.location.href = "admin.html";
        } else {
            document.documentElement.style.display = '';
            
            if(document.getElementById('adminNameDisplay')) {
                document.getElementById('adminNameDisplay').innerText = user.displayName || (isMaster ? "Master Admin" : "Sub Admin");
            }
            window.loadAdminData();
            window.loadAdminUsers();
            window.loadAdminTickets();
            window.loadAdminNotifications();
            window.loadAdminSettingsData(user);
            window.loadGlobalTopNote();
        }
    } else {
        if (currentPath.includes('admin') && !isAdminLoginPage) {
            window.location.href = "admin-login.html";
        } else {
            document.documentElement.style.display = '';
        }
    }
});

// -----------------------------------------------------
// 🔐 ৩. Secret Admin Login Logic
// -----------------------------------------------------
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const isMaster = user.email === MASTER_ADMIN_EMAIL;
            const adminDocRef = doc(db, "admins", email.toLowerCase().replace(/[^a-z0-9]/g, '_'));
            const adminDocSnap = await getDoc(adminDocRef);

            if (isMaster || adminDocSnap.exists()) {
                showAdminModal('success', 'Welcome Admin!', 'Identity verified. Redirecting...', () => {
                    window.location.href = "admin.html";
                });
                setTimeout(() => { window.location.href = "admin.html"; }, 2000);
            } else {
                await signOut(auth);
                showAdminModal('error', 'Access Denied', 'This account does not have administrative privileges!');
            }
        } catch (error) { 
            showAdminModal('error', 'Authentication Failed', error.message); 
        }
    });
}

// ==========================================
// 🚀 ৪. Publish & Edit Software Logic (Fixed)
// ==========================================
window.currentEditId = null;
const publishSoftwareForm = document.getElementById('publishSoftwareForm');

if (publishSoftwareForm) {
    publishSoftwareForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 🟢 সাবমিটের সময় ইনপুট থেকে মান নেওয়া (পাসওয়ার্ডসহ)
        const name = document.getElementById('softName').value.trim();
        const title = document.getElementById('softTitle').value.trim();
        const category = document.getElementById('softCategory').value.trim();
        const pricing = document.getElementById('softPricing').value;

        const platform = document.getElementById('softPlatform').value;
        const section = document.getElementById('softSection') ? document.getElementById('softSection').value : 'trending_software';
        const topNote = document.getElementById('softTopNote') ? document.getElementById('softTopNote').value.trim() : '';

        const fileName = document.getElementById('softFileName').value.trim();
        const filePassword = document.getElementById('softPassword') ? document.getElementById('softPassword').value.trim() : ''; // 🟢 ঠিক জায়গায় আনা হলো

        const iconUrl = document.getElementById('softIcon').value.trim();
        const bannerUrl = document.getElementById('softBanner').value.trim();
        const version = document.getElementById('softVersion').value.trim();
        const size = document.getElementById('softSize').value.trim();
        const link = document.getElementById('softLink').value.trim();
        const shortDesc = document.getElementById('softShortDesc').value.trim();
        const fullDesc = document.getElementById('fullDescription') ? document.getElementById('fullDescription').innerHTML : '';
        
        const developer = document.getElementById('softDeveloper').value.trim();
        const license = document.getElementById('softLicense').value.trim();
        const languages = document.getElementById('softLanguages').value.trim();
        const changelog = document.getElementById('softChangelog').value.trim();
        const tags = document.getElementById('softTags').value.trim();
        const releaseDate = document.getElementById('softReleaseDate').value;
        
        const manualUploader = document.getElementById('softUploadedBy').value.trim();
        const uploadedBy = manualUploader ? manualUploader : (auth.currentUser ? (auth.currentUser.displayName || "Admin") : "Nexsoftx Team");

        const softwareId = window.currentEditId ? window.currentEditId : (name || title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const softwareData = {
            name, 
            title, 
            category, 
            pricing,
            platform, 
            section, 
            topNote, 
            fileName,
            filePassword, // 🟢 ডেটাবেসে সেভ হবে
            iconUrl, 
            bannerUrl, 
            version, 
            size, 
            downloadLink: link, 
            shortDesc, 
            fullDesc,
            developer, 
            license, 
            languages, 
            changelog, 
            tags, 
            uploadedBy, 
            releaseDate
        };

        if (!window.currentEditId) {
            softwareData.publishedAt = new Date().toISOString();
        }
        
        try {
            const btn = publishSoftwareForm.querySelector('button[type="submit"]');
            btn.innerHTML = `Processing Data...`;
            btn.style.pointerEvents = 'none';
            
            await setDoc(doc(db, "software", softwareId), softwareData, { merge: true });
            
            showAdminModal('success', window.currentEditId ? 'Updated Successfully!' : 'Published Successfully!', `<b>${name}</b> has been saved.`);
            
            publishSoftwareForm.reset();
            if(document.getElementById('fullDescription')) document.getElementById('fullDescription').innerHTML = ''; 
            if(document.getElementById('softName')) document.getElementById('softName').value = '';
            if(document.getElementById('softCategory')) document.getElementById('softCategory').value = '';
            if(document.getElementById('softPricing')) document.getElementById('softPricing').value = 'Free';
            if(document.getElementById('softPassword')) document.getElementById('softPassword').value = ''; // 🟢 রিসেট
            if(document.getElementById('softSection')) document.getElementById('softSection').value = 'trending_software';
            if(document.getElementById('softTopNote')) document.getElementById('softTopNote').value = '';
            window.currentEditId = null;
            
            const uploadHeader = document.querySelector('#Upload h2');
            if (uploadHeader) uploadHeader.innerText = 'Publish New Software';
            btn.innerHTML = `Publish to Live Site`;
            btn.style.pointerEvents = 'auto';
            
            window.loadAdminData();
        } catch (error) {
            showAdminModal('error', 'Action Failed', error.message);
            const btn = publishSoftwareForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.innerHTML = window.currentEditId ? `Update Software` : `Publish to Live Site`;
                btn.style.pointerEvents = 'auto';
            }
        }
    });
}

// ==========================================
// 📊 ৫. Load Dashboard Stats & Software Table
// ==========================================
const sectionLabels = {
    trending_software: 'Trending Software',
    trending_apps: 'Trending Apps',
    get_it_done_fast: 'Get It Done Fast',
    best_selling_games: 'Best Selling Games',
    must_have_apps: 'Must-have Apps',
    spotlight_games: 'Spotlight Games',
    streaming_shelf: 'Streaming Shelf'
};

window.loadAdminData = async function() {
    const manageSoftwareList = document.getElementById('manageSoftwareList');
    const recentSoftwareList = document.getElementById('recentSoftwareList');
    const totalSoftwareCount = document.getElementById('totalSoftwareCount');
    const totalDownloadsCount = document.getElementById('totalDownloadsCount');
    const totalUsersCount = document.getElementById('totalUsersCount');
    
    try {
        const softwareSnapshot = await getDocs(collection(db, "software"));
        if (totalSoftwareCount) totalSoftwareCount.innerText = softwareSnapshot.size;

        const allSoftware = [];
        let realTotalDownloads = 0; 

        softwareSnapshot.forEach(docSnap => {
            const data = docSnap.data();
            allSoftware.push({ id: docSnap.id, ...data });
            realTotalDownloads += (data.downloadCount || 0); 
        });

        if (totalDownloadsCount) {
            totalDownloadsCount.innerText = realTotalDownloads.toLocaleString(); 
        }

        allSoftware.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

        // Manage Software টেবিল
        if (manageSoftwareList) {
            if (allSoftware.length === 0) {
                manageSoftwareList.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">No software published yet.</td></tr>`;
            } else {
                let html = "";
                allSoftware.forEach((data) => {
                    const dateStr = data.publishedAt ? new Date(data.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                    const secText = sectionLabels[data.section] || 'Trending Software';
                    const topNoteBadge = data.topNote 
                        ? `<span style="background:#fef3c7; color:#b45309; padding:4px 8px; border-radius:6px; font-size:0.78rem; font-weight:700;">${escapeHtmlText(data.topNote)}</span>` 
                        : `<span style="color:#94a3b8; font-size:0.8rem;">None</span>`;

                    const displayName = data.name || data.title;

                    html += `<tr>
                        <td style="font-weight: 600; display:flex; align-items:center; gap:10px;">
                            <img src="${data.iconUrl || 'assets/favicon.png'}" style="width:34px; height:34px; border-radius:6px; object-fit:cover; border: 1px solid #e2e8f0;">
                            <div>
                                <div style="color:#0f172a;">${escapeHtmlText(displayName)}</div>
                                <div style="font-size:0.75rem; color:#64748b;">${escapeHtmlText(data.category || 'Software')} • ${escapeHtmlText(data.pricing || 'Free')}</div>
                            </div>
                        </td>
                        <td>
                            <span style="background:#f1f5f9; padding:3px 8px; border-radius:6px; font-weight:600; color:#475569; font-size:0.82rem; margin-right:4px;">${data.platform || 'Windows'}</span>
                            <span style="background:#eff6ff; padding:3px 8px; border-radius:6px; font-weight:600; color:#2563eb; font-size:0.82rem;">${secText}</span>
                        </td>
                        <td>${topNoteBadge}</td>
                        <td>${dateStr}</td>
                        <td>
                            <button class="action-btn btn-edit" onclick="editSoftware('${data.id}')">Edit</button>
                            <button class="action-btn btn-delete" onclick="deleteSoftware('${data.id}')">Remove</button>
                        </td></tr>`;
                });
                manageSoftwareList.innerHTML = html;
            }
        }

        // Dashboard Recent Software টেবিল
        if (recentSoftwareList) {
            if (allSoftware.length === 0) {
                recentSoftwareList.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">No recent activity.</td></tr>`;
            } else {
                let html = "";
                allSoftware.slice(0, 5).forEach((data) => {
                    const dateStr = data.publishedAt ? new Date(data.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                    const displayName = data.name || data.title;
                    html += `<tr>
                        <td style="font-weight: 600; display:flex; align-items:center; gap:10px;"><img src="${data.iconUrl || 'assets/favicon.png'}" style="width:32px; height:32px; border-radius:6px; object-fit:cover; border: 1px solid #e2e8f0;">${escapeHtmlText(displayName)}</td>
                        <td><span style="background:#f1f5f9; padding:4px 8px; border-radius:6px; font-size:0.85rem; font-weight:600; color:#475569;">${data.platform || 'Windows'}</span></td>
                        <td>${dateStr}</td>
                        <td><span class="admin-badge badge-active" style="background:#ecfdf5; color:#10b981; padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:bold;">Live</span></td>
                        <td><button class="action-btn btn-edit" onclick="editSoftware('${data.id}')">Edit</button></td></tr>`;
                });
                recentSoftwareList.innerHTML = html;
            }
        }
    } catch (error) { 
        console.error("Error loading software:", error); 
    }

    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        if (totalUsersCount) totalUsersCount.innerText = usersSnapshot.size;
    } catch (error) {
        console.error("Error loading users count:", error);
    }
};

// 🟢 একটিমাত্র সঠিক editSoftware ফাংশন (পাসওয়ার্ডসহ সব ডাটা লোড হবে)
window.editSoftware = async function(softwareId) {
    try {
        const docSnap = await getDoc(doc(db, "software", softwareId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            if (document.getElementById('softName')) {
                document.getElementById('softName').value = data.name || data.title || '';
            }
            if (document.getElementById('softTitle')) {
                document.getElementById('softTitle').value = data.title || data.name || '';
            }
            if (document.getElementById('softCategory')) {
                document.getElementById('softCategory').value = data.category || (data.tags ? data.tags.split(',')[0].trim() : '') || 'Software';
            }
            if (document.getElementById('softPricing')) {
                document.getElementById('softPricing').value = data.pricing || 'Free';
            }

            // 🟢 ফাইলের পাসওয়ার্ড থাকলে লোড হবে (না থাকলে খালি থাকবে)
            if (document.getElementById('softPassword')) {
                document.getElementById('softPassword').value = data.filePassword || '';
            }

            document.getElementById('softPlatform').value = data.platform || 'Windows';
            if (document.getElementById('softSection')) {
                document.getElementById('softSection').value = data.section || 'trending_software';
            }
            if (document.getElementById('softTopNote')) {
                document.getElementById('softTopNote').value = data.topNote || '';
            }

            document.getElementById('softIcon').value = data.iconUrl || '';
            document.getElementById('softBanner').value = data.bannerUrl || '';
            document.getElementById('softVersion').value = data.version || '';
            document.getElementById('softSize').value = data.size || '';
            document.getElementById('softLink').value = data.downloadLink || '';
            document.getElementById('softShortDesc').value = data.shortDesc || '';
            if(document.getElementById('fullDescription')) document.getElementById('fullDescription').innerHTML = data.fullDesc || '';

            document.getElementById('softFileName').value = data.fileName || '';
            document.getElementById('softDeveloper').value = data.developer || '';
            document.getElementById('softLicense').value = data.license || '';
            document.getElementById('softLanguages').value = data.languages || '';
            document.getElementById('softChangelog').value = data.changelog || '';
            document.getElementById('softTags').value = data.tags || '';
            document.getElementById('softUploadedBy').value = data.uploadedBy || '';
            document.getElementById('softReleaseDate').value = data.releaseDate || '';

            window.currentEditId = softwareId;
            
            const uploadHeader = document.querySelector('#Upload h2');
            if (uploadHeader) uploadHeader.innerText = 'Edit Software: ' + (data.name || data.title);
            
            const submitBtn = document.querySelector('#publishSoftwareForm button[type="submit"]');
            if (submitBtn) submitBtn.innerHTML = `Update Software`;

            // সাইজ হিন্ট আপডেট
            if (typeof window.updateImageSizeHints === 'function') {
                window.updateImageSizeHints();
            }

            if (typeof openAdminTab === "function") openAdminTab('Upload');
        }
    } catch (error) {
        showAdminModal('error', 'Error!', error.message);
    }
};

// 🟢 সফটওয়্যার রিমুভ ফাংশন
window.deleteSoftware = async function(softwareId) {
    showAdminModal('confirm', 'Delete Software?', 'Are you sure you want to remove this software?', async () => {
        try {
            await deleteDoc(doc(db, "software", softwareId));
            showAdminModal('success', 'Deleted!', 'Successfully removed.');
            window.loadAdminData(); 
        } catch (error) {
            showAdminModal('error', 'Delete Failed', error.message);
        }
    });
};

// ==========================================
// 👥 ৬. User Management
// ==========================================
window.allUsersData = [];
window.currentUsersPage = 1;
const USERS_PER_PAGE = 30;

window.loadAdminUsers = async function() {
    const totalUsersCount = document.getElementById('totalUsersCount');
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        if (totalUsersCount) totalUsersCount.innerText = usersSnapshot.size;

        window.allUsersData = [];
        usersSnapshot.forEach((docSnap) => {
            window.allUsersData.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        window.allUsersData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        window.renderUsersPage(1); 
    } catch (error) { console.error("Error loading users:", error); }
};

window.renderUsersPage = function(pageNumber) {
    window.currentUsersPage = pageNumber;
    const manageUsersList = document.getElementById('manageUsersList');
    const paginationContainer = document.getElementById('userPagination');
    if (!manageUsersList) return;

    if (window.allUsersData.length === 0) {
        manageUsersList.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px; color:#94a3b8;">No registered users found.</td></tr>`;
        if(paginationContainer) paginationContainer.innerHTML = "";
        return;
    }

    const startIndex = (pageNumber - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const pageUsers = window.allUsersData.slice(startIndex, endIndex);

    let html = "";
    pageUsers.forEach((userData) => {
        const userName = userData.name || userData.displayName || "User (" + userData.id.substring(0,6) + "...)";
        const userEmail = userData.email || "No email provided";
        const isBanned = userData.status === 'banned';
        const statusBadge = isBanned 
            ? `<span class="admin-badge" style="background:#fef2f2; color:#ef4444; padding:4px 10px; border-radius:20px; font-weight:bold;">Banned</span>`
            : `<span class="admin-badge" style="background:#ecfdf5; color:#10b981; padding:4px 10px; border-radius:20px; font-weight:bold;">Active</span>`;
        
        const banBtnText = isBanned ? "Unban" : "Ban User";
        const banBtnColor = isBanned ? "background:#10b981; color:white; border:none;" : "background:#f59e0b; color:white; border:none;";

        html += `
            <tr>
                <td style="font-weight: 600; color: #334155;">
                    <div style="font-size: 1rem; color: #0f172a;">${escapeHtmlText(userName)}</div>
                    <div style="font-size: 0.8rem; color: #64748b; font-weight: normal;">${escapeHtmlText(userEmail)}</div>
                </td>
                <td>${statusBadge}</td>
                <td style="display:flex; gap:8px;">
                    <button class="action-btn btn-edit" onclick="openEditUserModal('${userData.id}', '${userName}', '${userEmail}')">Edit Profile</button>
                    <button class="action-btn" onclick="toggleBanUser('${userData.id}', '${userData.status || 'active'}')" style="padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; transition:0.3s; ${banBtnColor}">${banBtnText}</button>
                    <button class="action-btn btn-delete" onclick="deleteUser('${userData.id}')">Remove Data</button>
                </td>
            </tr>`;
    });
    manageUsersList.innerHTML = html;

    if (paginationContainer) {
        const totalPages = Math.ceil(window.allUsersData.length / USERS_PER_PAGE);
        let btnHtml = "";
        if (totalPages > 1) {
            btnHtml += `<div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">`;
            btnHtml += `<span style="font-size:0.85rem; color:#64748b; margin-right:10px;">Page ${pageNumber} of ${totalPages}</span>`;
            for (let i = 1; i <= totalPages; i++) {
                const activeStyle = i === pageNumber ? "background:#0f172a; color:white;" : "background:#f1f5f9; color:#475569;";
                btnHtml += `<button onclick="renderUsersPage(${i})" style="border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.3s; ${activeStyle}">${i}</button>`;
            }
            btnHtml += `</div>`;
        }
        paginationContainer.innerHTML = btnHtml;
    }
};

window.openEditUserModal = function(userId, currentName, currentEmail) {
    const existingModal = document.getElementById('editUserModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div class="custom-modal-overlay show" id="editUserModal">
            <div class="custom-modal-box" style="text-align: left; max-width: 400px;">
                <h3 class="custom-modal-title" style="margin-bottom: 20px;">Edit User Profile</h3>
                <form id="updateUserAdminForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 5px;">User Name</label>
                        <input type="text" id="adminEditName" value="${currentName}" class="admin-input" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;" required>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 5px;">Email Address</label>
                        <input type="email" id="adminEditEmail" value="${currentEmail}" class="admin-input" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;" required>
                    </div>
                    <div class="custom-modal-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" class="modal-btn modal-btn-cancel" onclick="document.getElementById('editUserModal').remove()">Cancel</button>
                        <button type="submit" class="modal-btn modal-btn-confirm" style="background: #0284c7; color: white;">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('updateUserAdminForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('adminEditName').value.trim();
        const newEmail = document.getElementById('adminEditEmail').value.trim();
        try {
            await updateDoc(doc(db, "users", userId), { name: newName, email: newEmail });
            document.getElementById('editUserModal').remove();
            showAdminModal('success', 'Updated!', 'User profile updated successfully.');
            window.loadAdminUsers();
        } catch (error) { showAdminModal('error', 'Update Failed', error.message); }
    });
};

window.toggleBanUser = async function(userId, currentStatus) {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const actionWord = newStatus === 'banned' ? 'Ban' : 'Unban';
    
    showAdminModal('confirm', `${actionWord} User?`, `Are you sure you want to ${actionWord.toLowerCase()} this user?`, async () => {
        try {
            await updateDoc(doc(db, "users", userId), { status: newStatus });
            showAdminModal('success', 'Status Updated!', `User has been successfully ${newStatus === 'banned' ? 'banned' : 'unbanned'}.`);
            window.loadAdminUsers();
        } catch (error) {
            showAdminModal('error', 'Action Failed', error.message);
        }
    });
};

window.deleteUser = async function(userId) {
    showAdminModal('confirm', 'Remove Data?', 'Are you sure you want to delete this user data from Firestore?', async () => {
        try {
            await deleteDoc(doc(db, "users", userId));
            showAdminModal('success', 'Data Removed!', 'User data has been deleted.');
            window.loadAdminUsers(); 
        } catch (error) { showAdminModal('error', 'Action Failed', error.message); }
    });
};

// ==========================================
// 🎫 ৭. Support Tickets Management
// ==========================================
window.allTicketsData = [];
window.currentTicketsPage = 1;
const TICKETS_PER_PAGE = 20;

window.loadAdminTickets = async function() {
    const totalTicketsCount = document.getElementById('totalTicketsCount');
    const manageTicketsList = document.getElementById('manageTicketsList');
    window.allTicketsData = [];

    try {
        const ticketsSnapshot = await getDocs(collectionGroup(db, "tickets"));
        ticketsSnapshot.forEach((docSnap) => {
            const userId = docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : 'Unknown User';
            window.allTicketsData.push({ id: docSnap.id, userId, ...docSnap.data() });
        });

        if (totalTicketsCount) totalTicketsCount.innerText = window.allTicketsData.length;
        window.allTicketsData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        window.renderTicketsPage(1); 
    } catch (error) { 
        console.error("Ticket Fetch Error:", error); 
    }
};

window.renderTicketsPage = function(pageNumber) {
    window.currentTicketsPage = pageNumber;
    const manageTicketsList = document.getElementById('manageTicketsList');
    const paginationContainer = document.getElementById('ticketPagination');
    if (!manageTicketsList) return;

    if (window.allTicketsData.length === 0) {
        manageTicketsList.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">No support tickets found.</td></tr>`;
        if (paginationContainer) paginationContainer.innerHTML = "";
        return;
    }

    const startIndex = (pageNumber - 1) * TICKETS_PER_PAGE;
    const endIndex = startIndex + TICKETS_PER_PAGE;
    const pageTickets = window.allTicketsData.slice(startIndex, endIndex);

    let html = "";
    pageTickets.forEach((t) => {
        const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const isOpen = t.status === 'Open';
        const statusBadge = isOpen 
            ? `<span class="admin-badge" style="background:#fffbeb; color:#f59e0b; padding:4px 10px; border-radius:20px; font-weight:bold;">Pending</span>`
            : `<span class="admin-badge" style="background:#ecfdf5; color:#10b981; padding:4px 10px; border-radius:20px; font-weight:bold;">Solved</span>`;

        html += `
            <tr>
                <td><div style="font-size: 0.75rem; color: #64748b; font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">${t.userId.substring(0, 10)}...</div></td>
                <td>
                    <div style="font-weight: 600; color: #0f172a; margin-bottom: 3px;">${escapeHtmlText(t.subject || '')}</div>
                    <div style="font-size: 0.85rem; color: #475569; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtmlText(t.message || '')}</div>
                    ${t.adminReply ? `<div style="font-size: 0.8rem; color: #10b981; margin-top: 4px; font-weight: 600;">Reply: ${escapeHtmlText(t.adminReply)}</div>` : ''}
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 3px;">Submitted on: ${dateStr}</div>
                </td>
                <td>${statusBadge}</td>
                <td style="display:flex; gap:8px;">
                    <button class="action-btn btn-edit" onclick="openTicketReplyById('${t.id}')">Reply</button>
                    <button class="action-btn btn-delete" onclick="deleteTicket('${t.userId}', '${t.id}')">Delete</button>
                </td>
            </tr>`;
    });
    manageTicketsList.innerHTML = html;

    if (paginationContainer) {
        const totalPages = Math.ceil(window.allTicketsData.length / TICKETS_PER_PAGE);
        let btnHtml = "";
        if (totalPages > 1) {
            btnHtml += `<div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">`;
            btnHtml += `<span style="font-size:0.85rem; color:#64748b; margin-right:10px;">Page ${pageNumber} of ${totalPages}</span>`;
            for (let i = 1; i <= totalPages; i++) {
                const activeStyle = i === pageNumber ? "background:#0f172a; color:white;" : "background:#f1f5f9; color:#475569;";
                btnHtml += `<button onclick="renderUsersPage(${i})" style="border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.3s; ${activeStyle}">${i}</button>`;
            }
            btnHtml += `</div>`;
        }
        paginationContainer.innerHTML = btnHtml;
    }
};

window.openTicketReplyById = function(ticketId) {
    const t = window.allTicketsData.find(item => item.id === ticketId);
    if (!t) return;
    window.openTicketReplyModal(t.userId, t.id, t.subject, t.message, t.adminReply || '');
};

window.openTicketReplyModal = function(userId, ticketId, subject, message, existingReply) {
    const existingModal = document.getElementById('ticketReplyModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div class="custom-modal-overlay show" id="ticketReplyModal">
            <div class="custom-modal-box" style="text-align: left; max-width: 480px;">
                <h3 class="custom-modal-title" style="margin-bottom: 10px;">Reply to Support Ticket</h3>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 12px;"><b>Subject:</b> <span id="modalTicketSubject"></span></p>
                <div id="modalTicketMessage" style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; color: #334155; border: 1px solid #e2e8f0; white-space: pre-wrap; max-height: 150px; overflow-y: auto;"></div>
                <form id="adminReplyForm">
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 5px;">Admin Solution / Message</label>
                        <textarea id="adminReplyText" class="admin-textarea" rows="4" placeholder="Write your response here..." required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;"></textarea>
                    </div>
                    <div class="custom-modal-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" class="modal-btn modal-btn-cancel" onclick="document.getElementById('ticketReplyModal').remove()">Cancel</button>
                        <button type="submit" class="modal-btn modal-btn-confirm" style="background: #10b981; color: white;">Send Reply & Solved</button>
                    </div>
                </form>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('modalTicketSubject').textContent = subject || '';
    document.getElementById('modalTicketMessage').textContent = message || '';
    document.getElementById('adminReplyText').value = existingReply || '';

    document.getElementById('adminReplyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const replyText = document.getElementById('adminReplyText').value.trim();
        try {
            await updateDoc(doc(db, "users", userId, "tickets", ticketId), { 
                adminReply: replyText, 
                status: "Solved" 
            });
            document.getElementById('ticketReplyModal').remove();
            showAdminModal('success', 'Reply Sent!', 'Your message has been sent to the user.');
            window.loadAdminTickets();
        } catch (error) { 
            showAdminModal('error', 'Action Failed', error.message); 
        }
    });
};

function escapeHtmlText(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.deleteTicket = async function(userId, ticketId) {
    showAdminModal('confirm', 'Delete Ticket?', 'Are you sure you want to remove this support ticket?', async () => {
        try {
            await deleteDoc(doc(db, "users", userId, "tickets", ticketId));
            showAdminModal('success', 'Deleted!', 'Support ticket removed.');
            window.loadAdminTickets();
        } catch (error) {
            showAdminModal('error', 'Delete Failed', error.message);
        }
    });
};

// ==========================================
// 🔔 ৮. Admin Notifications
// ==========================================
window.toggleNotificationDrawer = function() {
    const drawer = document.getElementById('notificationDrawer');
    if (drawer) {
        const currentRight = drawer.style.right;
        drawer.style.right = (currentRight === '0px') ? '-380px' : '0px';
        if (drawer.style.right === '0px') {
            window.loadAdminNotifications();
        }
    }
};

window.loadAdminNotifications = async function() {
    const container = document.getElementById('notificationListContainer');
    const badge = document.getElementById('notifyBadgeCount');
    if (!container) return;

    try {
        let notifications = [];

        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach(docSnap => {
            const uData = docSnap.data();
            if (uData.createdAt) {
                notifications.push({
                    type: 'signup',
                    title: 'New User Signup',
                    desc: `${uData.name || uData.email || 'A user'} created an account.`,
                    time: uData.createdAt
                });
            }
        });

        const ticketsSnapshot = await getDocs(collectionGroup(db, "tickets"));
        ticketsSnapshot.forEach(docSnap => {
            const tData = docSnap.data();
            if (tData.createdAt && tData.status === 'Open') {
                notifications.push({
                    type: 'ticket',
                    title: 'New Support Ticket',
                    desc: `Subject: ${tData.subject}`,
                    time: tData.createdAt
                });
            }
        });

        notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

        const clearedTime = localStorage.getItem('adminClearedTime') || 0;
        notifications = notifications.filter(n => new Date(n.time).getTime() > parseInt(clearedTime));

        if (badge) {
            if (notifications.length > 0) {
                badge.innerText = notifications.length;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        if (notifications.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: #94a3b8; font-size: 0.9rem; margin-top: 30px;">No new notifications</p>`;
            return;
        }

        let html = "";
        notifications.forEach(n => {
            const dateStr = new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(n.time).toLocaleDateString();
            const iconBg = n.type === 'signup' ? '#ecfdf5' : '#fff7ed';
            const iconColor = n.type === 'signup' ? '#10b981' : '#f97316';
            const svgIcon = n.type === 'signup' 
                ? `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>`
                : `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>`;

            html += `
                <div style="display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid #f1f5f9; align-items: flex-start; border-radius: 8px;">
                    <div style="background: ${iconBg}; color: ${iconColor}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${svgIcon}
                    </div>
                    <div style="flex-grow: 1;">
                        <h4 style="font-size: 0.9rem; color: #0f172a; margin: 0 0 3px 0; font-weight: 600;">${n.title}</h4>
                        <p style="font-size: 0.82rem; color: #475569; margin: 0 0 5px 0; line-height: 1.4;">${n.desc}</p>
                        <span style="font-size: 0.72rem; color: #94a3b8;">${dateStr}</span>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error("Error loading notifications:", error);
    }
};

window.clearAllNotifications = function() {
    localStorage.setItem('adminClearedTime', new Date().getTime());
    window.loadAdminNotifications();
};

// ==========================================
// 🛡️ ৯. Admin Settings & Global Top Note
// ==========================================
window.loadAdminSettingsData = async function(currentUser) {
    const nameInput = document.getElementById('adminUpdateName');
    const emailInput = document.getElementById('adminUpdateEmail');
    const roleBadge = document.getElementById('currentAdminRoleBadge');
    const masterSection = document.getElementById('masterAdminSection');
    const topbarName = document.getElementById('adminNameDisplay');

    const currentName = currentUser.displayName || "Master Admin";
    if (nameInput) nameInput.value = currentName;
    if (emailInput) emailInput.value = currentUser.email;
    if (topbarName) topbarName.innerText = currentName;

    const isMaster = currentUser.email === MASTER_ADMIN_EMAIL;

    if (isMaster) {
        if (roleBadge) {
            roleBadge.innerText = "Master Admin";
            roleBadge.style.background = "#f5f3ff";
            roleBadge.style.color = "#8b5cf6";
        }
        if (masterSection) masterSection.style.display = "block";
        window.loadSubAdminsTable();
    } else {
        if (roleBadge) {
            roleBadge.innerText = "Sub Admin";
            roleBadge.style.background = "#eff6ff";
            roleBadge.style.color = "#3b82f6";
        }
        if (masterSection) masterSection.style.display = "none";
    }
};

window.loadGlobalTopNote = async function() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "top_note"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (document.getElementById('globalTopNoteText')) document.getElementById('globalTopNoteText').value = data.text || '';
            if (document.getElementById('globalTopNoteType')) document.getElementById('globalTopNoteType').value = data.type || 'success';
            if (document.getElementById('globalTopNoteEnabled')) document.getElementById('globalTopNoteEnabled').checked = !!data.enabled;
        }
    } catch (err) {
        console.error("Failed to load global top note:", err);
    }
};

const globalTopNoteForm = document.getElementById('globalTopNoteForm');
if (globalTopNoteForm) {
    globalTopNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = document.getElementById('globalTopNoteText').value.trim();
        const type = document.getElementById('globalTopNoteType').value;
        const enabled = document.getElementById('globalTopNoteEnabled').checked;

        try {
            await setDoc(doc(db, "settings", "top_note"), {
                text,
                type,
                enabled,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            showAdminModal('success', 'Top Note Saved!', 'Website global top note has been updated successfully.');
        } catch (error) {
            showAdminModal('error', 'Update Failed', error.message);
        }
    });
}

const adminProfileUpdateForm = document.getElementById('adminProfileUpdateForm');
if (adminProfileUpdateForm) {
    adminProfileUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('adminUpdateName').value.trim();
        const newPassword = document.getElementById('adminUpdatePassword').value;
        const currentUser = auth.currentUser;

        if (!currentUser) return;

        try {
            if (newName && newName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName: newName });
                if (document.getElementById('adminNameDisplay')) {
                    document.getElementById('adminNameDisplay').innerText = newName;
                }
            }

            if (newPassword) {
                await updatePassword(currentUser, newPassword);
            }

            showAdminModal('success', 'Profile Updated!', 'Your admin account details have been updated.');
            document.getElementById('adminUpdatePassword').value = '';
        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                showAdminModal('security', 'Security Alert', 'Please log out and log in again to verify your identity before changing password.');
            } else {
                showAdminModal('error', 'Update Failed', error.message);
            }
        }
    });
}

const createSubAdminForm = document.getElementById('createSubAdminForm');
if (createSubAdminForm) {
    createSubAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('subAdminName').value.trim();
        const email = document.getElementById('subAdminEmail').value.trim();
        const password = document.getElementById('subAdminPassword').value;

        try {
            const secondaryApp = initializeApp(firebaseConfig, "SecondaryAdmin_" + Date.now());
            const secondaryAuth = getAuth(secondaryApp);
            
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            await updateProfile(userCred.user, { displayName: name });

            await setDoc(doc(db, "admins", email.toLowerCase().replace(/[^a-z0-9]/g, '_')), {
                name, email, role: "Sub Admin", createdAt: new Date().toISOString()
            });

            showAdminModal('success', 'Sub-Admin Created!', `<b>${name}</b> has been added successfully.`);
            createSubAdminForm.reset();
            window.loadSubAdminsTable();
        } catch (error) {
            showAdminModal('error', 'Creation Failed', error.message);
        }
    });
}

window.loadSubAdminsTable = async function() {
    const tableList = document.getElementById('subAdminTableList');
    if (!tableList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "admins"));
        
        let html = `
            <tr>
                <td style="font-weight: 700; color: #8b5cf6;">Tawsif Ahamed Shuvo</td><td>admin@nexsoftx.com</td>
                <td><span class="admin-badge" style="background: #f5f3ff; color: #8b5cf6;">Master Admin</span></td>
                <td><span style="color: #94a3b8; font-size: 0.85rem; font-weight: bold;">Code Locked</span></td>
            </tr>
        `;

        querySnapshot.forEach(docSnap => {
            const admin = docSnap.data();
            if (admin.email !== MASTER_ADMIN_EMAIL) {
                html += `
                    <tr>
                        <td style="font-weight: 600;">${escapeHtmlText(admin.name)}</td>
                        <td>${escapeHtmlText(admin.email)}</td>
                        <td><span class="admin-badge badge-active">Sub Admin</span></td>
                        <td><button class="action-btn btn-delete" onclick="deleteSubAdmin('${docSnap.id}')">Remove</button></td>
                    </tr>
                `;
            }
        });
        tableList.innerHTML = html;
    } catch (error) {
        console.error("Error loading sub-admins:", error);
    }
};

window.deleteSubAdmin = async function(docId) {
    showAdminModal('confirm', 'Remove Sub-Admin?', 'Are you sure you want to remove this sub-admin?', async () => {
        try {
            await deleteDoc(doc(db, "admins", docId));
            showAdminModal('success', 'Removed!', 'Sub-admin has been removed.');
            window.loadSubAdminsTable();
        } catch (error) {
            showAdminModal('error', 'Action Failed', error.message);
        }
    });
};

// ==========================================
// 🚪 ১০. Admin Logout
// ==========================================
const handleAdminLogout = async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        window.location.href = "admin-login.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

const sidebarLogoutBtn = document.getElementById('adminSidebarLogout');
const dropdownLogoutBtn = document.getElementById('adminDropdownLogout');
if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleAdminLogout);
if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleAdminLogout);

// ==========================================
// 🔍 ১১. Global Admin Search
// ==========================================
document.addEventListener('input', function(e) {
    const isSearchBar = e.target.closest('.admin-search-bar');
    if (isSearchBar) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const allRows = document.querySelectorAll('.admin-table tbody tr');
        allRows.forEach(row => {
            if (row.cells.length <= 1) return;
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(searchTerm) ? '' : 'none';
        });
    }
});

// ==========================================
// 🖼️ 12. Dynamic Image Size Hints by Section
// ==========================================
const sectionSizeMap = {
    trending_software: {
        icon: 'Recommended: 150x150px (Square 1:1 App Icon)',
        banner: 'Recommended: 800x450px (Landscape 16:9 Wide Banner)'
    },
    trending_apps: {
        icon: 'Recommended: 150x150px (Square 1:1 App Icon)',
        banner: 'Recommended: 800x450px (Landscape 16:9 Wide Banner)'
    },
    get_it_done_fast: {
        icon: 'Recommended: 150x150px (Square 1:1 App Logo)',
        banner: 'Recommended: 600x300px (Wide Card Background Banner)'
    },
    best_selling_games: {
        icon: 'Recommended: 150x150px (Square 1:1 Icon for Details Page)',
        banner: 'Recommended: 400x550px (Vertical Portrait Poster - 2:3 / 3:4 Ratio)'
    },
    must_have_apps: {
        icon: 'Recommended: 150x150px (Square 1:1 App Icon)',
        banner: 'Recommended: 800x450px (Landscape 16:9 for Details Page)'
    },
    spotlight_games: {
        icon: 'Recommended: 150x150px (Square 1:1 Icon)',
        banner: 'Recommended: 600x350px (Landscape Game Art Banner)'
    },
    streaming_shelf: {
        icon: 'Recommended: 150x150px (Square Logo / Icon)',
        banner: 'Recommended: 600x350px (Landscape Screenshot / Preview)'
    }
};

window.updateImageSizeHints = function() {
    const sectionSelect = document.getElementById('softSection');
    const iconHint = document.getElementById('iconSizeHint');
    const bannerHint = document.getElementById('bannerSizeHint');
    if (!sectionSelect || !iconHint || !bannerHint) return;

    const currentSection = sectionSelect.value;
    const hints = sectionSizeMap[currentSection] || sectionSizeMap['trending_software'];
    
    iconHint.innerText = hints.icon;
    bannerHint.innerText = hints.banner;
    
    if (currentSection === 'best_selling_games') {
        bannerHint.style.color = '#e11d48';
    } else {
        bannerHint.style.color = '#0284c7';
    }
};

const sectionDropdown = document.getElementById('softSection');
if (sectionDropdown) {
    sectionDropdown.addEventListener('change', window.updateImageSizeHints);
}
