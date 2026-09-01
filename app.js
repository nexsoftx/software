// ==========================================
// 🚀 NEXSOFTX - MASTER JAVASCRIPT FILE (EMOJI-FREE PRO VERSION)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc, getDoc, addDoc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
const provider = new GoogleAuthProvider();

// ==========================================
// ২. 🎨 Custom UI Modal Function
// ==========================================
window.showCustomModal = function(type, title, message, confirmCallback = null) {
    const existingModal = document.getElementById('customModal');
    if (existingModal) existingModal.remove();

    let iconSvg = '';
    let iconBgClass = '';
    let btnClass = 'modal-btn-confirm';
    let btnText = 'OK, Got it!';
    let isConfirm = false;

    if (type === 'success') {
        iconBgClass = 'icon-bg-success';
        iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === 'confirm' || type === 'warning') {
        isConfirm = type === 'confirm';
        iconBgClass = 'icon-bg-warning';
        btnClass = isConfirm ? 'modal-btn-danger' : 'modal-btn-confirm';
        btnText = isConfirm ? 'Yes, Remove' : 'OK';
        iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    } else if (type === 'error') {
        iconBgClass = 'icon-bg-error';
        btnClass = 'modal-btn-danger';
        iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
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
    
    setTimeout(() => modal.classList.add('show'), 10);

    document.getElementById('modalConfirmBtn').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (confirmCallback) confirmCallback();
    });

    if (isConfirm) {
        document.getElementById('modalCancelBtn').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    }
}

// ==========================================
// ৩. Global Authentication State
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 🚀 BANNED USER CHECK
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().status === 'banned') {
                await signOut(auth);
                showCustomModal('error', 'Account Suspended', 'Your account has been banned by the Administrator. You cannot access this portal.', () => {
                    window.location.href = "login.html";
                });
                if(document.getElementById('guestMenu')) document.getElementById('guestMenu').style.display = 'flex';
                if(document.getElementById('userMenu')) document.getElementById('userMenu').style.display = 'none';
                return; // ব্যান হলে বাকি UI লোড হবে না
            }
        } catch (error) {
            console.error("Error checking ban status:", error);
        }

        if(document.getElementById('guestMenu')) document.getElementById('guestMenu').style.display = 'none';
        if(document.getElementById('userMenu')) document.getElementById('userMenu').style.display = 'block';
        
        if(document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = user.displayName || "User";
        if(document.getElementById('dropdownEmail')) document.getElementById('dropdownEmail').innerText = user.email;
        if(document.getElementById('profileName')) document.getElementById('profileName').innerText = user.displayName || "User";
        if(document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = user.email;
        
        // ✨ ইমোজি মুছে ফেলা হয়েছে
        if(document.getElementById('welcomeName')) document.getElementById('welcomeName').innerText = `Welcome back, ${user.displayName ? user.displayName.split(' ')[0] : 'User'}!`;
        
        if(document.getElementById('savedSoftwareList')) {
            window.loadUserFavorites(user.uid);
        }
        if(document.getElementById('ticketHistoryList')) {
            window.loadUserTickets(user.uid);
        }

        const favBtn = document.getElementById('favoriteBtn');
        if(favBtn) {
            const softwareName = favBtn.getAttribute('data-name') || "Saved Software";
            const softwareId = softwareName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            getDoc(doc(db, "users", user.uid, "favorites", softwareId)).then((docSnap) => {
                if (docSnap.exists()) {
                    // ✅ ইমোজির বদলে SVG আইকন
                    favBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 5px; margin-top: -2px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Already Saved`;
                    favBtn.style.background = '#f8fafc';
                    favBtn.style.color = '#94a3b8';
                    favBtn.style.border = '1px solid #e2e8f0';
                    favBtn.style.pointerEvents = 'none';
                    favBtn.style.cursor = 'not-allowed';
                }
            });
        }
    } else {
        if(document.getElementById('guestMenu')) document.getElementById('guestMenu').style.display = 'flex';
        if(document.getElementById('userMenu')) document.getElementById('userMenu').style.display = 'none';
        
        if(document.getElementById('updateNameInput')) document.getElementById('updateNameInput').value = user?.displayName || "";
        if(document.getElementById('updateEmailInput')) document.getElementById('updateEmailInput').value = user?.email || "";
        
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = "login.html";
        }
    }
});

// ==========================================
// ৪. Sign Up & Sign In Logic
// ==========================================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if(password !== confirmPassword) {
            showCustomModal('error', 'Password Mismatch', 'Your passwords do not match. Please try again.');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                await updateProfile(user, { displayName: fullName });
                
                // 🚀 Default Status: active (ডেটাবেসে ইউজার সেভ)
                await setDoc(doc(db, "users", user.uid), {
                    name: fullName,
                    email: email,
                    role: "user",
                    status: "active",
                    createdAt: new Date().toISOString()
                });

                showCustomModal('success', 'Welcome!', `Account created successfully, <b>${fullName}</b>!`, () => {
                    window.location.href = "profile.html";
                });
            })
            .catch((error) => { showCustomModal('error', 'Registration Failed', error.message); });
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                showCustomModal('success', 'Welcome Back!', 'You have successfully logged in.', () => {
                    window.location.href = "profile.html";
                });
            })
            .catch(() => { showCustomModal('error', 'Access Denied', 'Invalid Email or Password! Please try again.'); });
    });
}

const googleLoginBtn = document.getElementById('googleLoginBtn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists()) {
                    await setDoc(doc(db, "users", user.uid), {
                        name: user.displayName,
                        email: user.email,
                        role: "user",
                        status: "active",
                        createdAt: new Date().toISOString()
                    });
                }
                window.location.href = "profile.html";
            })
            .catch((error) => { showCustomModal('error', 'Authentication Failed', error.message); });
    });
}

// ==========================================
// ৫. Save to Favorites (details.html)
// ==========================================
document.addEventListener('click', async (e) => {
    // ফেভারিট বাটনে ক্লিক করা হলে
    const favBtn = e.target.closest('#favoriteBtn');
    if (favBtn) {
        e.preventDefault();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            showCustomModal('warning', 'Login Required', 'Please sign in first to save software to your list!', () => {
                window.location.href = "login.html";
            });
            return;
        }
        
        try {
            // URL থেকে অরিজিনাল আইডি এবং বাটন থেকে নাম ও লিংক নেওয়া
            const urlParams = new URLSearchParams(window.location.search);
            const softwareId = urlParams.get('id');
            const softwareName = favBtn.getAttribute('data-name');
            const downloadBtn = document.getElementById('downloadBtn');
            const downloadLink = downloadBtn ? downloadBtn.getAttribute('href') : '#';

            if (!softwareId || !softwareName) return;

            // ইউজারের ফায়ারবেস ফেভারিট লিস্টে সেভ করা (সঠিক আইডি ও লিংকসহ)
            await setDoc(doc(db, "users", currentUser.uid, "favorites", softwareId), {
                name: softwareName,
                link: downloadLink, // অরিজিনাল ডাউনলোড লিংক সেভ করা হচ্ছে
                savedAt: new Date().toISOString()
            });
            
            showCustomModal('success', 'Awesome!', `<b>${softwareName}</b> has been added to your favorites successfully!`);

            favBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 5px; margin-top: -2px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Already Saved`;
            favBtn.style.background = '#f8fafc';
            favBtn.style.color = '#94a3b8';
            favBtn.style.border = '1px solid #e2e8f0';
            favBtn.style.pointerEvents = 'none';
            favBtn.style.cursor = 'not-allowed';

        } catch (error) {
            showCustomModal('error', 'Error!', 'Failed to save: ' + error.message);
        }
    }
});
// ==========================================
// ৬. Remove from Favorites (profile.html)
// ==========================================
document.addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('btn-remove')) {
        const softwareId = e.target.getAttribute('data-id');
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        showCustomModal('confirm', 'Remove Software?', 'Are you sure you want to remove this software from your saved list?', async () => {
            try {
                await deleteDoc(doc(db, "users", currentUser.uid, "favorites", softwareId));
                window.loadUserFavorites(currentUser.uid); 
                showCustomModal('success', 'Removed!', 'The software has been successfully removed from your list.');
            } catch (error) {
                showCustomModal('error', 'Error!', 'Failed to remove: ' + error.message);
            }
        });
    }
});

// ==========================================
// ৭. Load Dynamic Data (profile.html)
// ==========================================
window.loadUserFavorites = async function(userId) {
    const listContainer = document.getElementById('savedSoftwareList');
    const totalSavedCount = document.getElementById('totalSavedCount');
    const recentActivityList = document.getElementById('recentActivityList');
    
    if (!listContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "users", userId, "favorites"));
        if(totalSavedCount) totalSavedCount.innerText = querySnapshot.size;

        if (querySnapshot.empty) {
            listContainer.innerHTML = `<p style="color: #94a3b8; font-weight: 500;">You haven't saved any software yet.</p>`;
            if(recentActivityList) recentActivityList.innerHTML = `<p style="color: #94a3b8; font-weight: 500;">No recent activity found.</p>`;
            return;
        }
        
        let html = "";
        let activityHtml = ""; 
        
        const savedItems = [];
        querySnapshot.forEach(doc => {
            savedItems.push({ id: doc.id, ...doc.data() });
        });
        savedItems.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        savedItems.forEach((data) => {
            const softwareId = data.id; // অরিজিনাল সফটওয়্যার আইডি
            const dateObj = new Date(data.savedAt);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            // 🟢 ১. সেভড সফটওয়্যার কার্ড
            // এখানে Download বাটনে সরাসরি data-name এবং href দেওয়া হয়েছে যাতে 11 নম্বর সেকশনের পপআপ কাজ করে
            html += `
                <div class="saved-item">
                    <div class="saved-item-info">
                        <h4 style="display:flex; align-items:center; gap:8px; margin:0; font-size:1.1rem;">
                            <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            ${data.name}
                        </h4>
                        <p style="display:flex; align-items:center; gap:5px; font-size:0.85rem; color:#94a3b8; margin-top:6px; margin-bottom:0;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Saved on: ${dateStr}
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items:center;">
                        <!-- ডাউনলোড পপআপ ট্রিগার করার জন্য আইডি এবং ডাটা সেট করা হয়েছে -->
                        <a href="${data.link || '#'}" id="downloadBtn" data-name="${data.name}" class="btn-action-view" style="cursor:pointer;">Download</a>
                        <button class="btn-remove modal-btn-danger" style="padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer;" data-id="${softwareId}">Remove</button>
                    </div>
                </div>
            `;

            // 🟢 ২. রিসেন্ট অ্যাক্টিভিটি 
            // View বাটনে সঠিক অরিজিনাল সফটওয়্যার আইডি পাস করা হচ্ছে
            activityHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
                    <div>
                        <h4 style="color: #2c3e50; font-size: 0.95rem; margin: 0 0 5px 0; display: flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
                            Saved "${data.name}"
                        </h4>
                        <p style="color: #7f8c8d; font-size: 0.8rem; margin: 0; padding-left: 14px;">${dateStr} at ${timeStr}</p>
                    </div>
                    <a href="details.html?id=${softwareId}" style="text-decoration: none; color: #10b981; font-weight: bold; background: #ecfdf5; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; border: 1px solid #d1fae5;">View</a>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        if(recentActivityList) recentActivityList.innerHTML = activityHtml;

    } catch (error) {
        console.error("Error loading data:", error);
        listContainer.innerHTML = `<p style="color: #ef4444;">Failed to load saved software.</p>`;
    }
}

// ==========================================
// ৮. Dropdown Menu & Logout
// ==========================================
const profileIconBtn = document.getElementById('profileIconBtn');
const profileDropdown = document.getElementById('profileDropdown');
if (profileIconBtn && profileDropdown) {
    profileIconBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });
    window.addEventListener('click', () => profileDropdown.classList.remove('show'));
}

const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
const logoutBtn = document.getElementById('logoutBtn');

if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); signOut(auth).then(() => window.location.href = "index.html");
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); signOut(auth).then(() => window.location.href = "index.html");
    });
}

// ==========================================
// ৯. Update Profile & Password
// ==========================================
const profileUpdateForm = document.getElementById('profileUpdateForm');
if (profileUpdateForm) {
    profileUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('updateNameInput').value.trim();
        const newEmail = document.getElementById('updateEmailInput').value.trim();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
            try {
                let message = "Your profile has been updated successfully.";
                let isEmailVerificationSent = false;
                
                if (newName && newName !== currentUser.displayName) {
                    await updateProfile(currentUser, { displayName: newName });
                    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = newName;
                    
                    // ✨ ইমোজি মুছে ফেলা হয়েছে
                    if(document.getElementById('welcomeName')) document.getElementById('welcomeName').innerText = `Welcome back, ${newName.split(' ')[0]}!`;
                    if(document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = newName;
                }
                
                if (newEmail && newEmail !== currentUser.email) {
                    await verifyBeforeUpdateEmail(currentUser, newEmail);
                    isEmailVerificationSent = true;
                }
                
                if (isEmailVerificationSent) {
                    showCustomModal('success', 'Verification Sent!', 'Your name is updated. A verification link has been sent to your NEW email address. Please check your inbox to confirm the email change.');
                } else {
                    showCustomModal('success', 'Profile Updated!', message);
                }
                
            } catch (error) {
                if(error.code === 'auth/requires-recent-login') {
                    showCustomModal('warning', 'Security Alert', 'To change your email address, please Sign Out and Sign In again to verify your identity.');
                } else {
                    showCustomModal('error', 'Update Failed', error.message);
                }
            }
        }
    });
}

// ==========================================
// ১০. Support Ticket System (Create & Load)
// ==========================================
const createTicketForm = document.getElementById('createTicketForm');
if (createTicketForm) {
    createTicketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subject = document.getElementById('ticketSubject').value.trim();
        const message = document.getElementById('ticketMessage').value.trim();
        const currentUser = auth.currentUser;

        if (currentUser && subject && message) {
            try {
                await addDoc(collection(db, "users", currentUser.uid, "tickets"), {
                    subject: subject,
                    message: message,
                    status: "Open",
                    createdAt: new Date().toISOString()
                });

                createTicketForm.reset();
                showCustomModal('success', 'Ticket Submitted!', 'Your support ticket has been created successfully. Our team will get back to you soon.');
                window.loadUserTickets(currentUser.uid);
            } catch (error) {
                showCustomModal('error', 'Submission Failed', error.message);
            }
        }
    });
}

window.loadUserTickets = async function(userId) {
    const ticketListContainer = document.getElementById('ticketHistoryList');
    const activeTicketsCount = document.getElementById('activeTicketsCount');
    
    if (!ticketListContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "users", userId, "tickets"));
        
        let html = "";
        let openCount = 0;
        const tickets = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            tickets.push({ id: doc.id, ...data });
            if (data.status === 'Open') openCount++;
        });

        if (activeTicketsCount) activeTicketsCount.innerText = openCount;

        if (tickets.length === 0) {
            ticketListContainer.innerHTML = `<p style="color: #64748b; font-weight: 500; text-align:center; padding: 20px;">You have no active support tickets.</p>`;
            return;
        }
        
        tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        tickets.forEach((data) => {
            const dateObj = new Date(data.createdAt);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // 🎫 স্ট্যাটাস ডিজাইন আপডেট: Open এর বদলে Pending, এবং সুন্দর SVG আইকন যুক্ত করা হয়েছে
            const isPending = data.status === 'Open';
            const statusColor = isPending ? '#f59e0b' : '#10b981'; 
            const statusText = isPending ? 'Pending' : 'Solved'; 
            const statusBg = isPending ? '#fffbeb' : '#ecfdf5';
            const statusIcon = isPending ? 
                `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` : 
                `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
            
            // 💬 অ্যাডমিন রিপ্লাই বক্স (যদি অ্যাডমিন উত্তর দিয়ে থাকে)
            const adminReplyBox = data.adminReply ? `
                <div style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 12px 16px; border-radius: 8px; margin-top: 12px; margin-left: 30px;">
                    <div style="font-size: 0.85rem; font-weight: 700; color: #047857; margin-bottom: 4px; display: flex; align-items: center; gap: 5px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                        Admin Response:
                    </div>
                    <p style="color: #065f46; font-size: 0.92rem; margin: 0; line-height: 1.5;">${data.adminReply}</p>
                </div>
            ` : '';

            html += `
                <div class="saved-item" style="padding: 20px; border-left: 4px solid ${statusColor}; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                        <h4 style="font-size: 1.1rem; color: #1e293b; display: flex; align-items: center; gap: 8px; margin: 0;">
                            <svg width="22" height="22" fill="none" stroke="${statusColor}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                            ${data.subject}
                        </h4>
                        <span style="background: ${statusBg}; color: ${statusColor}; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px;">
                            ${statusIcon} ${statusText}
                        </span>
                    </div>
                    <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin: 0; padding-left: 30px;">${data.message}</p>
                    
                    <!-- অ্যাডমিনের রিপ্লাই এখানে শো করবে -->
                    ${adminReplyBox}

                    <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 500; margin-top: 5px; padding-left: 30px; display: flex; align-items: center; gap: 6px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5zM5 12h14"></path></svg>
                        Submitted on ${dateStr}
                    </div>
                </div>
            `;
        });
        
        ticketListContainer.innerHTML = html;

    } catch (error) {
        console.error("Error loading tickets:", error);
        ticketListContainer.innerHTML = `<p style="color: #ef4444;">Failed to load tickets.</p>`;
    }
}
// ==========================================
// ১১. 🚀 Track Software Downloads & Show Popup
// ==========================================
document.addEventListener('click', (e) => {
    const downloadBtn = e.target.closest('#downloadBtn') || e.target.closest('.btn-direct-download');
    
    if (downloadBtn) {
        e.preventDefault(); 
        
        const softwareName = downloadBtn.getAttribute('data-name');
        const downloadLink = downloadBtn.getAttribute('href'); 
        
        if (softwareName) {
            showDownloadConfirmModal(softwareName, downloadLink);
        }
    }
});

function showDownloadConfirmModal(softwareName, link) {
    const existingModal = document.getElementById('downloadModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div class="custom-modal-overlay" id="downloadModal">
            <div class="custom-modal-box">
                <div class="modal-icon-wrapper icon-bg-success">
                    <svg width="45" height="45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </div>
                <h3 class="custom-modal-title">Ready to Download</h3>
                <p class="custom-modal-text">Do you want to start downloading <b>${softwareName}</b>?</p>
                <div class="custom-modal-actions">
                    <button class="modal-btn modal-btn-cancel" id="cancelDownloadBtn">Cancel</button>
                    <button class="modal-btn modal-btn-confirm" id="confirmDownloadBtn">Download</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('downloadModal');
    
    setTimeout(() => modal.classList.add('show'), 10);

    document.getElementById('cancelDownloadBtn').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    document.getElementById('confirmDownloadBtn').addEventListener('click', async () => {
        const btn = document.getElementById('confirmDownloadBtn');
        btn.innerHTML = `Starting...`;
        btn.style.pointerEvents = 'none';

        const softwareId = softwareName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        try {
            await setDoc(doc(db, "software", softwareId), {
                downloadCount: increment(1)
            }, { merge: true });
        } catch (error) {
            console.error("Failed to track download:", error);
        }

        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (link && link !== '#') {
                // 🔥 বর্তমান পেজেই থেকে ডাউনলোড ট্রিগার করার জন্য গোপন অ্যাঙ্কর ট্যাগ ব্যবহার করা হলো
                const a = document.createElement('a');
                a.href = link;
                a.setAttribute('download', ''); // ব্রাউজারকে ফাইল ডাউনলোডের নির্দেশ দেয়
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Download link is currently unavailable.");
            }
        }, 300);
    });
}

// ==========================================
// ১২. ⭐ Real-time Rating System (Edit & Update Support)
// ==========================================
const starContainer = document.getElementById('starRating');

if (starContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    let softwareId = urlParams.get('id'); 
    
    if (!softwareId) {
        const softwareName = starContainer.getAttribute('data-software');
        softwareId = softwareName ? softwareName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null;
    }

    if (softwareId) {
        const stars = starContainer.querySelectorAll('span');
        const avgRatingEl = document.getElementById('avgRating');
        const totalVotesEl = document.getElementById('totalVotes');
        const msgEl = document.getElementById('ratingMessage');

        // পেজ লোড হওয়ার সময় আগের রেটিং চেক করা (লক করা হবে না, যাতে এডিট করা যায়)
        const previousRating = localStorage.getItem(`rated_${softwareId}`);
        if (previousRating) {
            highlightStars(parseInt(previousRating));
            msgEl.innerText = `You rated this ${previousRating} stars. Click to update.`;
        }

        stars.forEach(star => {
            // হোভার করলে স্টার হাইলাইট হবে
            star.addEventListener('mouseover', function() {
                resetStars();
                highlightStars(parseInt(this.getAttribute('data-value')));
            });
            
            // মাউস সরিয়ে নিলে আগের সেভ করা রেটিংয়ে ফিরে যাবে
            star.addEventListener('mouseout', function() {
                resetStars();
                const currentSavedRating = localStorage.getItem(`rated_${softwareId}`);
                if (currentSavedRating) {
                    highlightStars(parseInt(currentSavedRating));
                }
            });

            // রেটিং ক্লিক করলে ডাটা আপডেট হবে
            star.addEventListener('click', async function() {
                const newRatingValue = parseInt(this.getAttribute('data-value'));
                const oldRatingValue = localStorage.getItem(`rated_${softwareId}`) ? parseInt(localStorage.getItem(`rated_${softwareId}`)) : 0;
                
                // যদি একই স্টারে আবার ক্লিক করে তবে কিছুই হবে না
                if (newRatingValue === oldRatingValue) return; 

                msgEl.innerText = "Updating your rating...";
                msgEl.style.color = "#94a3b8";
                
                try {
                    // লজিক: নতুন রেটিং থেকে পুরনো রেটিং মাইনাস করে স্কোর আপডেট করা হবে। 
                    // প্রথমবার রেটিং দিলে ভোট ১ বাড়বে, নাহলে শুধু স্কোর আপডেট হবে।
                    const ratingDiff = newRatingValue - oldRatingValue;
                    const voteIncrement = oldRatingValue === 0 ? 1 : 0; 
                    
                    await setDoc(doc(db, "software", softwareId), {
                        totalRatingScore: increment(ratingDiff),
                        totalVotes: increment(voteIncrement)
                    }, { merge: true });
                    
                    // লোকাল স্টোরেজে নতুন রেটিং সেভ করে রাখা
                    localStorage.setItem(`rated_${softwareId}`, newRatingValue);
                    
                    msgEl.innerText = oldRatingValue === 0 ? "Thank you for your rating!" : "Rating updated successfully!";
                    msgEl.style.color = "#10b981";
                } catch (error) {
                    msgEl.innerText = "Failed to submit rating.";
                    msgEl.style.color = "#ef4444";
                    console.error("Rating Error:", error);
                }
            });
        });

        // স্টার কালার করার ফাংশন
        function highlightStars(val) {
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= val) {
                    s.classList.add('active');
                }
            });
        }

        // স্টার রিসেট করার ফাংশন
        function resetStars() {
            stars.forEach(s => s.classList.remove('active'));
        }

        // ফায়ারবেস থেকে রিয়েল-টাইমে রেটিং এবং রেটিংস সংখ্যা আপডেট করে দেখানো
        onSnapshot(doc(db, "software", softwareId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const score = data.totalRatingScore || 0;
                const votes = data.totalVotes || 0;
                
                if (votes > 0) {
                    const avg = (score / votes).toFixed(1); 
                    avgRatingEl.innerText = avg;
                    totalVotesEl.innerText = votes;
                } else {
                    avgRatingEl.innerText = "0.0";
                    totalVotesEl.innerText = "0";
                }
            }
        });
    }
}

// ==========================================
// ১৩. 🚀 Real-time Home & Details Page Loader with Icons
// ==========================================

// প্ল্যাটফর্ম অনুযায়ী আইকন সিলেক্ট করার ফাংশন
function getPlatformIcon(platform) {
    const p = (platform || "").toLowerCase();
    if (p.includes('mac') || p.includes('ios')) {
        return `<img src="https://img.icons8.com/color/48/mac-os.png" alt="Mac" style="width: 15px; height: 15px; vertical-align: middle; margin-right: 3px;"> Mac`;
    } else if (p.includes('android')) {
        return `<img src="https://img.icons8.com/color/48/android-os.png" alt="Android" style="width: 15px; height: 15px; vertical-align: middle; margin-right: 3px;"> Android`;
    } else {
        return `<img src="https://img.icons8.com/color/48/windows-10.png" alt="Windows" style="width: 15px; height: 15px; vertical-align: middle; margin-right: 3px;"> Windows`;
    }
}

window.loadHomeSoftware = function() {
    const contentWrapper = document.getElementById('homePageContent');
    if (!contentWrapper) return;

    // URL থেকে ক্যাটাগরি (os) প্যারামিটার চেক করা হচ্ছে
    const urlParams = new URLSearchParams(window.location.search);
    const targetOS = urlParams.get('os');

    onSnapshot(collection(db, "software"), (snapshot) => {
        const allSoftware = [];
        snapshot.forEach(docSnap => {
            allSoftware.push({ id: docSnap.id, ...docSnap.data() });
        });

        // পোস্টগুলোকে নতুন থেকে পুরোনো ক্রমানুসারে সাজানো
        allSoftware.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

        // HTML কার্ড জেনারেট করার হেল্পার ফাংশন
        const generateHTML = (items, limit) => {
            if (items.length === 0) return `<p style="text-align: center; color: #64748b; width: 100%; padding: 30px; grid-column: 1 / -1; font-weight: 500;">No software found in this category.</p>`;
            let html = '';
            items.slice(0, limit).forEach(data => {
                html += `
                    <div class="software-card">
                        <img src="${data.iconUrl || 'https://via.placeholder.com/300x200'}" alt="${data.title}" class="post-image">
                        <div class="card-content">
                            <div class="title-with-icon">
                                <h4>${data.title}</h4>
                                <span style="font-size: 0.75rem; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; color: #475569; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                    ${getPlatformIcon(data.platform)}
                                </span>
                            </div>
                            <p>${data.shortDesc || ''}</p>
                            <a href="details.html?id=${data.id}" class="btn-download">View Details</a>
                        </div>
                    </div>
                `;
            });
            return html;
        };

        if (targetOS) {
            // 🟢 মেনু থেকে নির্দিষ্ট কোনো OS এ ক্লিক করলে (যেমন Windows)
            document.getElementById('sectionWindows').style.display = 'none';
            document.getElementById('sectionMac').style.display = 'none';
            document.getElementById('sectionAndroid').style.display = 'none';
            
            const mainTitle = document.getElementById('mainSectionTitle');
            if (targetOS === 'windows') mainTitle.innerText = "Windows Software";
            else if (targetOS === 'mac') mainTitle.innerText = "Mac Applications";
            else if (targetOS === 'android') mainTitle.innerText = "Android APKs";

            const filteredItems = allSoftware.filter(s => (s.platform || "").toLowerCase().includes(targetOS));
            document.getElementById('latestSoftwareGrid').innerHTML = generateHTML(filteredItems, 30); // ক্যাটাগরি পেজে সর্বোচ্চ ৩০টি
        } else {
            // 🟢 ডিফল্ট হোম পেজ
            document.getElementById('sectionWindows').style.display = 'block';
            document.getElementById('sectionMac').style.display = 'block';
            document.getElementById('sectionAndroid').style.display = 'block';
            document.getElementById('mainSectionTitle').innerText = "Latest Published Software";

            const windowsItems = allSoftware.filter(s => (s.platform || "").toLowerCase().includes('windows'));
            const macItems = allSoftware.filter(s => (s.platform || "").toLowerCase().includes('mac') || (s.platform || "").toLowerCase().includes('ios'));
            const androidItems = allSoftware.filter(s => (s.platform || "").toLowerCase().includes('android'));

            // 🟢 আপনার কথামতো নতুন লিমিট সেট করা হয়েছে (৬ + ১২ + ৬ + ৬ = মোট ৩০টি পোস্ট)
            document.getElementById('latestSoftwareGrid').innerHTML = generateHTML(allSoftware, 6); 
            document.getElementById('windowsSoftwareGrid').innerHTML = generateHTML(windowsItems, 12); 
            document.getElementById('macSoftwareGrid').innerHTML = generateHTML(macItems, 6); 
            document.getElementById('androidSoftwareGrid').innerHTML = generateHTML(androidItems, 6); 
        }
    });
}

window.loadSoftwareDetails = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const softwareId = urlParams.get('id');
    if (!softwareId) return;

    try {
        const docRef = doc(db, "software", softwareId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            document.title = `${data.title} - Nexsoftx`;
            if(document.getElementById('detTitle')) document.getElementById('detTitle').innerText = data.title;
            if(document.getElementById('detShortDesc')) document.getElementById('detShortDesc').innerText = data.shortDesc;
            if(document.getElementById('detCoverImg')) document.getElementById('detCoverImg').src = data.bannerUrl || data.iconUrl;
            if(document.getElementById('detFullDesc')) document.getElementById('detFullDesc').innerHTML = data.fullDesc || `<p>${data.shortDesc}</p>`;
            if(document.getElementById('detFileSize')) document.getElementById('detFileSize').innerHTML = `${data.size || 'N/A'}`;

            if(document.getElementById('detFileName')) document.getElementById('detFileName').innerText = data.fileName || data.title;
            if(document.getElementById('detDeveloper')) document.getElementById('detDeveloper').innerText = data.developer || 'Unknown';
            if(document.getElementById('detVersion')) document.getElementById('detVersion').innerText = data.version || 'Latest';
            if(document.getElementById('detLicense')) document.getElementById('detLicense').innerText = data.license || 'Freeware';
            
            if(document.getElementById('detReleaseDate')) {
                const dateToUse = data.releaseDate ? new Date(data.releaseDate) : (data.publishedAt ? new Date(data.publishedAt) : new Date());
                document.getElementById('detReleaseDate').innerText = dateToUse.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }
            
            if(document.getElementById('detChangelog')) {
                const clog = document.getElementById('detChangelog');
                if (data.changelog) { clog.href = data.changelog; clog.style.display = 'inline'; }
                else { clog.style.display = 'none'; document.getElementById('detChangelog').parentElement.style.display = 'none'; }
            }
            
            if(document.getElementById('detLanguages')) document.getElementById('detLanguages').innerText = data.languages || 'English';
            if(document.getElementById('detTotalDownloads')) document.getElementById('detTotalDownloads').innerText = data.downloadCount || '0';
            if(document.getElementById('detUploadedBy')) document.getElementById('detUploadedBy').innerText = data.uploadedBy || 'Nexsoftx Team';

            if(document.getElementById('detTags') && data.tags) {
                const tagArray = data.tags.split(',').map(t => t.trim());
                document.getElementById('detTags').innerHTML = tagArray.map(t => `<span class="tag-badge">${t}</span>`).join(', ');
            }

            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) {
                dlBtn.setAttribute('data-name', data.title);
                dlBtn.href = data.downloadLink || '#';
            }
            const favBtn = document.getElementById('favoriteBtn');
            if(favBtn) { favBtn.setAttribute('data-name', data.title); }
            const starRating = document.getElementById('starRating');
            if(starRating) { starRating.setAttribute('data-software', data.title); }

            window.loadRelatedSoftware(softwareId);
        } else {
            document.querySelector('.post-details-section').innerHTML = `<div style="text-align:center; padding:80px;"><h2>Software Not Found!</h2><p style="color:#64748b; margin-top:10px;">The software you are looking for does not exist or has been removed.</p><a href="index.html" class="btn-signup" style="display:inline-block; margin-top:20px;">Return Home</a></div>`;
        }
    } catch (error) {
        console.error("Error loading software details:", error);
    }
}

window.loadRelatedSoftware = async function(currentSoftwareId) {
    const grid = document.getElementById('relatedSoftwareGrid');
    if (!grid) return;

    try {
        const snapshot = await getDocs(collection(db, "software"));
        let html = "";
        let count = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;

            if (id !== currentSoftwareId && count < 6) {
                count++;
                html += `
                    <div class="software-card">
                        <img src="${data.iconUrl || 'https://via.placeholder.com/300x200'}" alt="${data.title}" class="post-image">
                        <div class="card-content">
                            <div class="title-with-icon">
                                <h4>${data.title}</h4>
                                <span style="font-size: 0.75rem; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; color: #475569; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                    ${getPlatformIcon(data.platform)}
                                </span>
                            </div>
                            <p>${data.shortDesc || ''}</p>
                            <a href="details.html?id=${id}" class="btn-download">View Details</a>
                        </div>
                    </div>
                `;
            }
        });

        if (count === 0) {
            grid.innerHTML = `<p style="text-align: center; color: #64748b; width: 100%; padding: 20px;">No related software found.</p>`;
        } else {
            grid.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading related software:", error);
    }
}

if (document.getElementById('homePageContent')) {
    window.loadHomeSoftware();
}
if (window.location.pathname.includes('details.html')) {
    window.loadSoftwareDetails();
}

// ==========================================
// 🔍 ১৪. Advanced Google-like Search (Fuzzy & Suggestions)
// ==========================================
let allSoftwareList = [];

// ফায়ারবেস থেকে সব সফটওয়্যার আগে থেকে লোড করে রাখা (দ্রুত সার্চের জন্য)
async function fetchAllSoftwareForSearch() {
    try {
        const querySnapshot = await getDocs(collection(db, "software"));
        allSoftwareList = [];
        querySnapshot.forEach(docSnap => {
            allSoftwareList.push({ id: docSnap.id, ...docSnap.data() });
        });
    } catch (error) {
        console.error("Error fetching software for search:", error);
    }
}

// বানান ভুলের দূরত্ব (Typo Tolerance) মাপার অ্যালগরিদম (Levenshtein Distance)
function getTypoDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    return matrix[a.length][b.length];
}

const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');

if (searchInput && searchSuggestions) {
    fetchAllSoftwareForSearch(); // পেজ লোড হলেই ডাটা ফেচ হবে

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        searchSuggestions.innerHTML = '';

        if (query.length === 0) {
            searchSuggestions.style.display = 'none';
            return;
        }

        // সার্চ ফিল্টারিং এবং স্কোরিং (Typo Tolerance)
        let results = allSoftwareList.map(item => {
            const title = item.title.toLowerCase();
            let matchScore = 0;
            
            // ১. যদি একদম সঠিকভাবে টাইপ করে বা নামের অংশ মিলে যায় (Perfect Match)
            if (title.includes(query)) {
                matchScore = 100; 
            } else {
                // ২. বানান ভুল থাকলে (Fuzzy Match / Typo Check)
                const titleWords = title.split(' ');
                const queryWords = query.split(' ');
                
                let minDistance = Infinity;
                queryWords.forEach(qw => {
                    titleWords.forEach(tw => {
                        const dist = getTypoDistance(qw, tw);
                        if (dist < minDistance) minDistance = dist;
                    });
                });
                
                // যদি বানানে ১-২ অক্ষরের ভুল থাকে, তবে সেটিকেও রেজাল্টে আনবে
                if (minDistance <= 2) {
                    matchScore = 50 - minDistance; 
                }
            }
            return { ...item, matchScore };
        })
        .filter(item => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore) // সবচেয়ে বেশি মেলা রেজাল্ট উপরে
        .slice(0, 5); // সর্বোচ্চ ৫টি সাজেশান দেখাবে

        // HTML রেন্ডার করা
        if (results.length > 0) {
            let html = '';
            results.forEach(item => {
                html += `
                    <a href="details.html?id=${item.id}" class="suggestion-item">
                        <img src="${item.iconUrl || 'https://via.placeholder.com/40'}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
                        <div>
                            <h4>${item.title}</h4>
                            <span>${getPlatformIcon(item.platform)}</span>
                        </div>
                    </a>
                `;
            });
            searchSuggestions.innerHTML = html;
            searchSuggestions.style.display = 'block';
        } else {
            // কিছুই না পাওয়া গেলে
            searchSuggestions.innerHTML = `<div style="padding: 18px 20px; color: #64748b; font-size: 0.95rem; text-align: center;">No software found for "<b>${query}</b>"</div>`;
            searchSuggestions.style.display = 'block';
        }
    });

    // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হয়ে যাবে
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });
    
    // ইনপুটে ফোকাস করলে আবার ড্রপডাউন দেখাবে
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0 && searchSuggestions.innerHTML !== '') {
            searchSuggestions.style.display = 'block';
        }
    });
}