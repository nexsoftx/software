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
// ২. 🎨 Custom UI Modal Function (Animated SVG)
// ==========================================
window.showCustomModal = function(type, title, message, confirmCallback = null) {
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

// ==========================================
// ৩. Global Authentication State (সম্পূর্ণ সেকশন)
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // BANNED USER CHECK
                if (userData.status === 'banned') {
                    await signOut(auth);
                    showCustomModal('error', 'Account Suspended', 'Your account has been banned by the Administrator. You cannot access this portal.', () => {
                        window.location.href = "login.html";
                    });
                    if(document.getElementById('guestMenu')) document.getElementById('guestMenu').style.display = 'flex';
                    if(document.getElementById('userMenu')) document.getElementById('userMenu').style.display = 'none';
                    return; 
                }

                const finalName = userData.name || user.displayName || "User";
                const finalEmail = userData.email || user.email;

                if(document.getElementById('guestMenu')) document.getElementById('guestMenu').style.display = 'none';
                if(document.getElementById('userMenu')) document.getElementById('userMenu').style.display = 'block';
                
                if(document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = finalName;
                if(document.getElementById('dropdownEmail')) document.getElementById('dropdownEmail').innerText = finalEmail;
                if(document.getElementById('profileName')) document.getElementById('profileName').innerText = finalName;
                if(document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = finalEmail;
                
                if(document.getElementById('welcomeName')) document.getElementById('welcomeName').innerText = `Welcome back, ${finalName.split(' ')[0]}!`;

                if(document.getElementById('totalDownloadsCount')) {
                    document.getElementById('totalDownloadsCount').innerText = userData.totalDownloads || 0;
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        
        // ড্যাশবোর্ড ডেটা লোড
        if(document.getElementById('savedSoftwareList')) {
            window.loadUserFavorites(user.uid);
        }
        if(document.getElementById('ticketHistoryList')) {
            window.loadUserTickets(user.uid);
        }

        // প্রফেশনাল ফেভারিট সিঙ্ক
        if (window.syncUserFavorites) {
            window.syncUserFavorites(user.uid);
        }

    } else {
        // লগআউট থাকলে ক্যাশ ক্লিয়ার
        localStorage.removeItem('nexsoftx_user_favs');

        if(document.getElementById('guestMenu')) document.getElementById('guestMenu').style.display = 'flex';
        if(document.getElementById('userMenu')) document.getElementById('userMenu').style.display = 'none';
        
        if(document.getElementById('updateNameInput')) document.getElementById('updateNameInput').value = "";
        if(document.getElementById('updateEmailInput')) document.getElementById('updateEmailInput').value = "";
        
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
// ৫. Professional Favorite Toggle System (সম্পূর্ণ সেকশন)
// ==========================================

// --- ৫.১: বাটন রেন্ডারার ফাংশন ---
window.renderFavoriteBtnState = function(isSaved) {
    const favBtn = document.getElementById('favoriteBtn');
    if (!favBtn) return;

    if (isSaved) {
        favBtn.setAttribute('data-saved', 'true');
        favBtn.innerHTML = `<svg width="18" height="18" fill="#10b981" stroke="#10b981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> <span>Saved in Favorites</span>`;
        favBtn.style.background = '#ecfdf5';
        favBtn.style.color = '#10b981';
        favBtn.style.borderColor = '#a7f3d0';
    } else {
        favBtn.setAttribute('data-saved', 'false');
        favBtn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> <span>Add to Favorite</span>`;
        favBtn.style.background = '#f8fafc';
        favBtn.style.color = '#009640';
        favBtn.style.borderColor = '#e2e8f0';
    }
};

// --- ৫.২: ইউজারের ফেভারিট ডেটাবেস ও ক্যাশে সিঙ্ক করা ---
window.syncUserFavorites = async function(userId) {
    if (!userId) {
        localStorage.removeItem('nexsoftx_user_favs');
        return;
    }
    try {
        const querySnapshot = await getDocs(collection(db, "users", userId, "favorites"));
        const favIds = [];
        querySnapshot.forEach(docSnap => favIds.push(docSnap.id));
        localStorage.setItem('nexsoftx_user_favs', JSON.stringify(favIds));

        // বর্তমান পেজের বাটনের সাথে মিলানো
        const currentSoftwareId = new URLSearchParams(window.location.search).get('id');
        if (currentSoftwareId && document.getElementById('favoriteBtn')) {
            window.renderFavoriteBtnState(favIds.includes(currentSoftwareId));
        }
    } catch (err) {
        console.error("Favorite sync error:", err);
    }
};

// --- ৫.৩: ফেভারিট টগল ক্লিক হ্যান্ডলার (Save ও Remove একসাথে) ---
document.addEventListener('click', async (e) => {
    const favBtn = e.target.closest('#favoriteBtn');
    if (favBtn) {
        e.preventDefault();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            showCustomModal('warning', 'Login Required', 'Please sign in to manage your favorite software list.', () => {
                window.location.href = "login.html";
            });
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const softwareId = urlParams.get('id');
        const softwareName = favBtn.getAttribute('data-name') || document.getElementById('detTitle')?.innerText || "Software";
        const downloadBtn = document.getElementById('downloadBtn');
        const downloadLink = downloadBtn ? downloadBtn.getAttribute('href') : '#';

        if (!softwareId) return;

        const isCurrentlySaved = favBtn.getAttribute('data-saved') === 'true';
        let favs = [];
        try {
            favs = JSON.parse(localStorage.getItem('nexsoftx_user_favs') || '[]');
        } catch(err) { favs = []; }

        if (isCurrentlySaved) {
            // ১. রিমুভ টগল (Optimistic UI)
            window.renderFavoriteBtnState(false);
            favs = favs.filter(id => id !== softwareId);
            localStorage.setItem('nexsoftx_user_favs', JSON.stringify(favs));

            try {
                await deleteDoc(doc(db, "users", currentUser.uid, "favorites", softwareId));
                showCustomModal('success', 'Removed!', `<b>${softwareName}</b> has been removed from your favorites.`);
            } catch (error) {
                // ব্যর্থ হলে আগের অবস্থায় ফেরত নেওয়া
                window.renderFavoriteBtnState(true);
                favs.push(softwareId);
                localStorage.setItem('nexsoftx_user_favs', JSON.stringify(favs));
                showCustomModal('error', 'Error', 'Failed to remove: ' + error.message);
            }

        } else {
            // ২. অ্যাড টগল (Optimistic UI)
            window.renderFavoriteBtnState(true);
            if (!favs.includes(softwareId)) favs.push(softwareId);
            localStorage.setItem('nexsoftx_user_favs', JSON.stringify(favs));

            try {
                await setDoc(doc(db, "users", currentUser.uid, "favorites", softwareId), {
                    name: softwareName,
                    link: downloadLink,
                    savedAt: new Date().toISOString()
                });
                showCustomModal('success', 'Saved!', `<b>${softwareName}</b> has been added to your favorites.`);
            } catch (error) {
                // ব্যর্থ হলে আগের অবস্থায় ফেরত নেওয়া
                window.renderFavoriteBtnState(false);
                favs = favs.filter(id => id !== softwareId);
                localStorage.setItem('nexsoftx_user_favs', JSON.stringify(favs));
                showCustomModal('error', 'Error', 'Failed to save: ' + error.message);
            }
        }
    }
});

// ==========================================
// ৬. Remove from Favorites (profile.html) (সম্পূর্ণ সেকশন)
// ==========================================
document.addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('btn-remove')) {
        const softwareId = e.target.getAttribute('data-id');
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        showCustomModal('confirm', 'Remove Software?', 'Are you sure you want to remove this software from your saved list?', async () => {
            try {
                // ফায়ারবেস থেকে রিমুভ করা
                await deleteDoc(doc(db, "users", currentUser.uid, "favorites", softwareId));
                
                // লোকাল ক্যাশ থেকে রিমুভ করা
                if (softwareId) {
                    localStorage.removeItem('fav_' + softwareId);
                }

                // প্রোফাইলের লিস্ট রিফ্রেশ করা
                window.loadUserFavorites(currentUser.uid); 
                showCustomModal('success', 'Removed!', 'The software has been successfully removed from your list.');
            } catch (error) {
                showCustomModal('error', 'Error!', 'Failed to remove: ' + error.message);
            }
        });
    }
});

// ==========================================
// ৭. Load Dynamic Data (profile.html) (সম্পূর্ণ সেকশন)
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
        const savedIds = [];
        querySnapshot.forEach(docSnap => {
            savedItems.push({ id: docSnap.id, ...docSnap.data() });
            savedIds.push(docSnap.id);
        });

        // ক্যাশে ফেভারিট আইডিগুলো সিঙ্ক রাখা
        localStorage.setItem('nexsoftx_user_favs', JSON.stringify(savedIds));

        savedItems.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        savedItems.forEach((data) => {
            const softwareId = data.id;
            const dateObj = new Date(data.savedAt);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            // ডুপ্লিকেট ID দূর করে ক্লাস ব্যবহার করা হয়েছে
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
                        <a href="${data.link || '#'}" data-name="${data.name}" class="btn-action-view btn-download-trigger" style="cursor:pointer; text-decoration:none;">Download</a>
                        <button class="btn-remove modal-btn-danger" style="padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer;" data-id="${softwareId}">Remove</button>
                    </div>
                </div>
            `;

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
};

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
// ৯. Update Profile & Password (সম্পূর্ণ সেকশন)
// ==========================================

// --- ৯.১: প্রোফাইল ইনফরমেশন আপডেট (নাম ও ইমেইল) ---
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
                    await updateDoc(doc(db, "users", currentUser.uid), { name: newName });
                    
                    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = newName;
                    if(document.getElementById('welcomeName')) document.getElementById('welcomeName').innerText = `Welcome back, ${newName.split(' ')[0]}!`;
                    if(document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = newName;
                }
                
                if (newEmail && newEmail !== currentUser.email) {
                    await verifyBeforeUpdateEmail(currentUser, newEmail);
                    await updateDoc(doc(db, "users", currentUser.uid), { email: newEmail });
                    isEmailVerificationSent = true;
                }
                
                if (isEmailVerificationSent) {
                    showCustomModal('success', 'Verification Sent!', 'Your name is updated. A verification link has been sent to your NEW email address. Please check your inbox to confirm the email change.');
                } else {
                    showCustomModal('success', 'Profile Updated!', message);
                }
                
            } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                    showCustomModal('warning', 'Security Alert', 'To change your email address, please Sign Out and Sign In again to verify your identity.');
                } else {
                    showCustomModal('error', 'Update Failed', error.message);
                }
            }
        }
    });
}

// --- ৯.২: পাসওয়ার্ড পরিবর্তন লজিক (Security Settings) ---
const passwordChangeForm = document.getElementById('passwordChangeForm');
if (passwordChangeForm) {
    passwordChangeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const currentUser = auth.currentUser;

        if (!currentUser) {
            showCustomModal('warning', 'Login Required', 'Please log in to change your password.');
            return;
        }

        if (newPassword.length < 6) {
            showCustomModal('error', 'Weak Password', 'New password must be at least 6 characters long.');
            return;
        }

        try {
            // ১. বর্তমান পাসওয়ার্ড যাচাই (Re-authentication)
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // ২. নতুন পাসওয়ার্ড আপডেট
            await updatePassword(currentUser, newPassword);

            // ৩. ফর্ম ক্লিয়ার ও নোটিফিকেশন
            passwordChangeForm.reset();
            showCustomModal('success', 'Password Updated!', 'Your password has been changed successfully.');

        } catch (error) {
            console.error("Password update error:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                showCustomModal('error', 'Authentication Failed', 'Current password is incorrect. Please try again.');
            } else {
                showCustomModal('error', 'Update Failed', error.message);
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
// ১১. Track Software Downloads & Show Popup (No New Tab - Same Page Download)
// ==========================================
document.addEventListener('click', (e) => {
    const downloadBtn = e.target.closest('#downloadBtn') || e.target.closest('.btn-direct-download') || e.target.closest('.btn-download-trigger');
    
    if (downloadBtn) {
        e.preventDefault(); 
        
        const softwareName = downloadBtn.getAttribute('data-name');
        const downloadLink = downloadBtn.getAttribute('href'); 
        const filePassword = downloadBtn.getAttribute('data-password');
        
        if (softwareName) {
            showDownloadConfirmModal(softwareName, downloadLink, filePassword);
        }
    }
});

function showDownloadConfirmModal(softwareName, link, filePassword = null) {
    const existingModal = document.getElementById('downloadModal');
    if (existingModal) existingModal.remove();

    // পাসওয়ার্ড থাকলে মেসেজের নিচে ব্যাজ দেখাবে
    const passwordHtml = filePassword ? `
        <div style="margin: 10px auto 16px auto; background: #f8fafc; border: 1px dashed #cbd5e1; padding: 8px 14px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.88rem; color: #475569;">
            <span>File Password: <strong style="color: #0f172a; font-family: monospace; font-size: 0.95rem; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${escapeHtml(filePassword)}</strong></span>
            <button type="button" id="copyPasswordBtn" style="background: #10b981; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Copy</button>
        </div>
    ` : '';

    const modalHTML = `
        <div class="custom-modal-overlay" id="downloadModal">
            <div class="custom-modal-box">
                <div class="modal-icon-wrapper icon-bg-success">
                    <svg class="modal-svg-icon" viewBox="0 0 52 52">
                        <circle class="modal-svg-circle" cx="26" cy="26" r="23" fill="none"/>
                        <path class="modal-svg-download-arrow" fill="none" d="M26 14v16m-6-6l6 6 6-6"/>
                        <path class="modal-svg-download-tray" fill="none" d="M17 37h18"/>
                    </svg>
                </div>
                <h3 class="custom-modal-title">Ready to Download</h3>
                <p class="custom-modal-text" style="margin-bottom: ${filePassword ? '6px' : '24px'};">Do you want to start downloading <b>${softwareName}</b>?</p>
                
                ${passwordHtml}

                <div class="custom-modal-actions">
                    <button class="modal-btn modal-btn-cancel" id="cancelDownloadBtn">Cancel</button>
                    <button class="modal-btn modal-btn-confirm" id="confirmDownloadBtn">Download</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('downloadModal');
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // পাসওয়ার্ড কপি বাটন লজিক
    if (filePassword) {
        const copyBtn = document.getElementById('copyPasswordBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(filePassword);
                copyBtn.innerText = 'Copied!';
                setTimeout(() => { copyBtn.innerText = 'Copy'; }, 2000);
            });
        }
    }

    const closeDownloadModal = (callback) => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (callback) callback();
        }, 250);
    };

    document.getElementById('cancelDownloadBtn').addEventListener('click', () => {
        closeDownloadModal();
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

            if (auth.currentUser) {
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    totalDownloads: increment(1)
                });
                const totalDlEl = document.getElementById('totalDownloadsCount');
                if (totalDlEl) {
                    const currentCount = parseInt(totalDlEl.innerText) || 0;
                    totalDlEl.innerText = currentCount + 1;
                }
            }
        } catch (error) {
            console.error("Failed to track download:", error);
        }

        // 🟢 হালকা লোড নিয়ে কোনো নতুন ট্যাব ছাড়াই একই পেজে ব্যাকগ্রাউন্ডে ডাউনলোড শুরু হবে
        setTimeout(() => {
            closeDownloadModal(() => {
                if (link && link !== '#') {
                    const silentDownloader = document.createElement('iframe');
                    silentDownloader.style.display = 'none';
                    silentDownloader.src = link;
                    document.body.appendChild(silentDownloader);
                    setTimeout(() => silentDownloader.remove(), 45000);
                } else {
                    alert("Download link is currently unavailable.");
                }
            });
        }, 800);
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
// ১৩. 🚀 Microsoft Store Style Home & Details Page Loader (সম্পূর্ণ সেকশন)
// ==========================================

function getPlatformMiniIcon(platform) {
    const p = (platform || "").toLowerCase();
    if (p.includes('mac') || p.includes('ios')) {
        return `<svg class="icon-mac" viewBox="2.5 1.5 17 21" fill="#0284c7" style="width:14px; height:14px; vertical-align:middle;"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.56-.69.95-1.65.84-2.62-.83.03-1.86.56-2.45 1.25-.52.6-.97 1.57-.85 2.51.93.07 1.9-.45 2.46-1.14z"/></svg> Mac`;
    } else if (p.includes('android')) {
        return `<svg class="icon-android" viewBox="0 3 24 16.5" fill="#10b981" style="width:14px; height:12px; vertical-align:middle;"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.156-.2701.0631-.6151-.2069-.7711-.27-.1559-.615-.0631-.771.2069l-2.0231 3.5042c-1.464-.666-3.097-1.041-4.8765-1.041s-3.4125.375-4.8765 1.041L5.1004 5.3001c-.156-.27-.501-.3628-.771-.2069-.27.156-.3629.501-.2069.7711l1.996 3.4572C2.6894 11.2334.3434 14.8114 0 19.1434h24c-.3435-4.332-2.6895-7.91-6.1185-9.822"/></svg> Android`;
    } else {
        return `<svg class="icon-win" viewBox="0 0 24 24" fill="#0284c7" style="width:12px; height:12px; vertical-align:middle;"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.801"/></svg> Win`;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 🟢 ট্রানজিশন শেষে স্বয়ংক্রিয়ভাবে overflow: visible ফিরিয়ে দেওয়ার লজিক
let isShelfNavigating = false;
window.navigateShelfPage = function(containerId, direction) {
    if (isShelfNavigating) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const pages = container.querySelectorAll('.ms-shelf-page');
    if (pages.length <= 1) return;

    let currentIndex = 0;
    pages.forEach((page, idx) => {
        if (page.classList.contains('shelf-page-active')) {
            currentIndex = idx;
        }
    });

    let newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= pages.length || newIndex === currentIndex) return;

    isShelfNavigating = true;

    // 🟢 স্লাইড চলার সময় সাময়িক ক্লিপ হবে যাতে সাইডে স্ক্রোলবার না আসে
    container.style.overflow = 'hidden';

    const currentPage = pages[currentIndex];
    const nextPage = pages[newIndex];

    const startX = direction > 0 ? '100%' : '-100%';
    const endCurrentX = direction > 0 ? '-100%' : '100%';

    nextPage.classList.remove('shelf-page-sliding', 'shelf-page-active', 'shelf-page-hidden');
    nextPage.style.position = 'absolute';
    nextPage.style.top = '0';
    nextPage.style.left = '0';
    nextPage.style.visibility = 'visible';
    nextPage.style.pointerEvents = 'none';
    nextPage.style.opacity = '0';
    nextPage.style.transform = `translate3d(${startX}, 0, 0)`;

    void nextPage.offsetWidth;

    currentPage.classList.add('shelf-page-sliding');
    nextPage.classList.add('shelf-page-sliding');

    currentPage.style.opacity = '0';
    currentPage.style.transform = `translate3d(${endCurrentX}, 0, 0)`;

    nextPage.style.opacity = '1';
    nextPage.style.transform = 'translate3d(0, 0, 0)';

    setTimeout(() => {
        currentPage.classList.remove('shelf-page-sliding', 'shelf-page-active');
        currentPage.classList.add('shelf-page-hidden');
        currentPage.style.cssText = '';

        nextPage.classList.remove('shelf-page-sliding', 'shelf-page-hidden');
        nextPage.classList.add('shelf-page-active');
        nextPage.style.cssText = '';

        // 🟢 স্লাইড শেষ হওয়া মাত্রই সম্পূর্ণ overflow: visible করে দেওয়া (যাতে হোভার শ্যাডো ও কার্ড কখনোই না কাটে)
        container.style.overflow = 'visible';

        isShelfNavigating = false;
    }, 460);

    const prevBtn = document.getElementById(containerId.replace('Container', 'Prev'));
    const nextBtn = document.getElementById(containerId.replace('Container', 'Next'));
    
    if (prevBtn) {
        prevBtn.style.opacity = newIndex === 0 ? '0.35' : '1';
        prevBtn.style.cursor = newIndex === 0 ? 'default' : 'pointer';
    }
    if (nextBtn) {
        nextBtn.style.opacity = newIndex === pages.length - 1 ? '0.35' : '1';
        nextBtn.style.cursor = newIndex === pages.length - 1 ? 'default' : 'pointer';
    }
};

// -----------------------------------------------------
// 🛍️ হোমপেজের ৬টি Microsoft Store সেকশন রেন্ডারার
// -----------------------------------------------------
window.loadHomeSoftware = function() {
    const contentWrapper = document.getElementById('homePageContent');
    if (!contentWrapper) return;

    onSnapshot(collection(db, "software"), (snapshot) => {
        const allSoftware = [];
        snapshot.forEach(docSnap => {
            allSoftware.push({ id: docSnap.id, ...docSnap.data() });
        });

        allSoftware.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

        const trendingSoft = allSoftware.filter(s => s.section === 'trending_software' || (!s.section && (s.platform || '').toLowerCase().includes('win')));
        const trendingApps = allSoftware.filter(s => s.section === 'trending_apps' || (!s.section && !(s.platform || '').toLowerCase().includes('win')));
        const fastItems = allSoftware.filter(s => s.section === 'get_it_done_fast');
        const bestSelling = allSoftware.filter(s => s.section === 'best_selling_games');
        const mustHave = allSoftware.filter(s => s.section === 'must_have_apps');
        const spotlight = allSoftware.filter(s => s.section === 'spotlight_games');
        const streaming = allSoftware.filter(s => s.section === 'streaming_shelf');

        // ১. Trending Shelves
        const secTrending = document.getElementById('sectionTrending');
        const containerTrendingSoft = document.getElementById('trendingSoftContainer');
        const containerTrendingApps = document.getElementById('trendingAppsContainer');
        const navTrendingSoft = document.getElementById('trendingSoftNav');
        const navTrendingApps = document.getElementById('trendingAppsNav');

        if (secTrending) {
            secTrending.style.display = (trendingSoft.length > 0 || trendingApps.length > 0) ? 'block' : 'none';
            
            if (containerTrendingSoft) {
                containerTrendingSoft.innerHTML = renderCompactCards(trendingSoft);
            }
            if (navTrendingSoft) {
                navTrendingSoft.style.display = trendingSoft.length > 6 ? 'flex' : 'none';
                const prevBtn = document.getElementById('trendingSoftPrev');
                const nextBtn = document.getElementById('trendingSoftNext');
                if (prevBtn) { prevBtn.style.opacity = '0.35'; prevBtn.style.cursor = 'default'; }
                if (nextBtn) { nextBtn.style.opacity = '1'; nextBtn.style.cursor = 'pointer'; }
            }

            if (containerTrendingApps) {
                containerTrendingApps.innerHTML = renderCompactCards(trendingApps);
            }
            if (navTrendingApps) {
                navTrendingApps.style.display = trendingApps.length > 6 ? 'flex' : 'none';
                const prevBtn = document.getElementById('trendingAppsPrev');
                const nextBtn = document.getElementById('trendingAppsNext');
                if (prevBtn) { prevBtn.style.opacity = '0.35'; prevBtn.style.cursor = 'default'; }
                if (nextBtn) { nextBtn.style.opacity = '1'; nextBtn.style.cursor = 'pointer'; }
            }
        }

        // ২. Get It Done Fast
        const secFast = document.getElementById('sectionFast');
        const gridFast = document.getElementById('fastGrid');
        if (secFast) {
            secFast.style.display = fastItems.length > 0 ? 'block' : 'none';
            if (gridFast) gridFast.innerHTML = renderFastCards(fastItems);
        }

        // ৩. Best Selling Posters
        const secBest = document.getElementById('sectionBestSelling');
        const rowBest = document.getElementById('bestSellingRow');
        if (secBest) {
            secBest.style.display = bestSelling.length > 0 ? 'block' : 'none';
            if (rowBest) rowBest.innerHTML = renderPosterCards(bestSelling);
        }

        // ৪. Must-Have Free Apps
        const secMust = document.getElementById('sectionMustHave');
        const gridMust = document.getElementById('mustHaveAppsGrid');
        if (secMust) {
            secMust.style.display = mustHave.length > 0 ? 'block' : 'none';
            if (gridMust) gridMust.innerHTML = renderAppCards(mustHave);
        }

        // ৫. Must-Play Spotlight Picks
        const secSpot = document.getElementById('sectionSpotlight');
        const gridSpot = document.getElementById('spotlightGrid');
        if (secSpot) {
            secSpot.style.display = spotlight.length > 0 ? 'block' : 'none';
            if (gridSpot) gridSpot.innerHTML = renderSpotlightCards(spotlight);
        }

        // ৬. Video Streaming Shelf
        const secStream = document.getElementById('sectionStreaming');
        const rowStream = document.getElementById('curatedRow');
        if (secStream) {
            secStream.style.display = streaming.length > 0 ? 'block' : 'none';
            if (rowStream) rowStream.innerHTML = renderCuratedCards(streaming);
        }
    });
};

// -----------------------------------------------------
// 🎨 কার্ড রেন্ডারার
// -----------------------------------------------------
function renderCompactCards(items) {
    if (!items || items.length === 0) return '';
    
    let html = '';
    const pageSize = 6;
    const totalPages = Math.ceil(items.length / pageSize);
    
    for (let p = 0; p < totalPages; p++) {
        const pageItems = items.slice(p * pageSize, (p + 1) * pageSize);
        const isFirst = (p === 0);
        
        // ১ম পেজ shelf-page-active থাকবে, বাকিগুলো shelf-page-hidden
        html += `<div class="ms-shelf-page ${isFirst ? 'shelf-page-active' : 'shelf-page-hidden'}" data-page="${p}">`;
        
        pageItems.forEach(data => {
            const rating = data.totalVotes > 0 ? (data.totalRatingScore / data.totalVotes).toFixed(1) : '5.0';
            const displayName = data.name || data.title;
            const displayCategory = data.category || 'Software';
            const displayPrice = data.pricing || 'Free';

            html += `
                <div class="ms-compact-item">
                    <a href="details.html?id=${data.id}" class="ms-compact-link">
                        ${data.topNote ? `<span class="ms-corner-badge">${escapeHtml(data.topNote)}</span>` : ''}
                        <div class="ms-compact-icon-wrapper">
                            <img src="${data.iconUrl || 'assets/favicon.png'}" class="ms-compact-icon" alt="${escapeHtml(displayName)}">
                        </div>
                        <div class="ms-compact-info">
                            <h4 class="ms-compact-title">${escapeHtml(displayName)}</h4>
                            <span class="ms-compact-subtitle">
                                <span class="ms-os-mini-pill">${getPlatformMiniIcon(data.platform)}</span> 
                                ${escapeHtml(displayCategory)}
                            </span>
                        </div>
                        <span class="ms-compact-badge">${escapeHtml(displayPrice)}</span>
                    </a>
                    <div class="ms-hover-flyout">
                        <div class="ms-flyout-top">
                            <img src="${data.iconUrl || 'assets/favicon.png'}" class="ms-flyout-icon">
                            <div class="ms-flyout-header-info">
                                <h4 class="ms-flyout-title">${escapeHtml(displayName)}</h4>
                                <div class="ms-flyout-meta"><span class="ms-flyout-rating">${rating} ★</span> <span>${escapeHtml(displayCategory)}</span></div>
                            </div>
                            <a href="details.html?id=${data.id}" class="ms-flyout-get-btn">Get</a>
                        </div>
                        <p class="ms-flyout-desc">${escapeHtml(data.shortDesc || '')}</p>
                        <div class="ms-flyout-footer-esrb"><span class="ms-esrb-badge">${escapeHtml(data.topNote || 'VERIFIED')}</span><div class="ms-esrb-text">${escapeHtml(data.developer || 'Nexsoftx')}<br>Direct Download</div></div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    return html;
}

function renderFastCards(items) {
    if (!items || items.length === 0) return '';
    let html = '';
    items.forEach(data => {
        const displayName = data.name || data.title;
        const displayCategory = data.category || data.developer || 'Software';
        const displayPrice = data.pricing || 'Free';

        html += `
            <div class="ms-fast-card">
                <a href="details.html?id=${data.id}" class="ms-fast-inner">
                    ${data.topNote ? `<span class="ms-corner-badge">${escapeHtml(data.topNote)}</span>` : ''}
                    <img src="${data.bannerUrl || data.iconUrl || 'assets/favicon.png'}" class="ms-fast-bg-img" alt="${escapeHtml(displayName)}">
                    <div class="ms-fast-dark-overlay"></div>
                    <div class="ms-fast-tagline">${escapeHtml(data.shortDesc || displayName)}</div>
                    <div class="ms-fast-bottom-bar">
                        <img src="${data.iconUrl || 'assets/favicon.png'}" class="ms-fast-logo">
                        <div class="ms-fast-info">
                            <h4 class="ms-fast-title">${escapeHtml(displayName)}</h4>
                            <span class="ms-fast-cat">${escapeHtml(displayCategory)}</span>
                        </div>
                        <span class="ms-fast-price">${escapeHtml(displayPrice)}</span>
                    </div>
                </a>
                <div class="ms-hover-flyout">
                    <img src="${data.bannerUrl || data.iconUrl || 'assets/favicon.png'}" class="ms-fast-flyout-banner" alt="${escapeHtml(displayName)}">
                    <div class="ms-fast-flyout-body">
                        <div class="ms-flyout-top">
                            <img src="${data.iconUrl || 'assets/favicon.png'}" class="ms-flyout-icon">
                            <div class="ms-flyout-header-info">
                                <h4 class="ms-flyout-title">${escapeHtml(displayName)}</h4>
                                <div class="ms-flyout-meta"><span>${escapeHtml(data.developer || 'Nexsoftx')}</span></div>
                            </div>
                            <a href="details.html?id=${data.id}" class="ms-flyout-get-btn">Install</a>
                        </div>
                        <p class="ms-flyout-desc">${escapeHtml(data.shortDesc || '')}</p>
                        <div class="ms-flyout-footer-esrb"><span class="ms-esrb-badge">${escapeHtml(data.topNote || 'EVERYONE')}</span><div class="ms-esrb-text">${escapeHtml(data.size || 'Direct Link')}</div></div>
                    </div>
                </div>
            </div>`;
    });
    return html;
}

function renderPosterCards(items) {
    if (!items || items.length === 0) return '';
    let html = '';
    items.forEach(data => {
        const displayName = data.name || data.title;
        const displayPrice = data.pricing || 'Free';

        html += `
            <div class="ms-poster-card">
                <a href="details.html?id=${data.id}" class="ms-poster-inner">
                    ${data.topNote ? `<span class="ms-corner-badge">${escapeHtml(data.topNote)}</span>` : ''}
                    <img src="${data.bannerUrl || data.iconUrl || 'assets/favicon.png'}" class="ms-poster-bg-img" alt="${escapeHtml(displayName)}">
                    <div class="ms-poster-overlay"></div>
                    <div class="ms-poster-info">
                        <h4 class="ms-poster-name">${escapeHtml(displayName)}</h4>
                        <span class="ms-poster-status">${escapeHtml(displayPrice)}</span>
                    </div>
                </a>
                <div class="ms-hover-flyout">
                    <div class="ms-flyout-media"><img src="${data.bannerUrl || data.iconUrl || 'assets/favicon.png'}" alt="${escapeHtml(displayName)}"><span class="ms-media-play-icon">▶</span></div>
                    <div class="ms-flyout-poster-body">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                            <div><h4 class="ms-poster-flyout-title">${escapeHtml(displayName)}</h4><div class="ms-poster-flyout-sub">${escapeHtml(data.developer || 'Nexsoftx')}</div></div>
                            <a href="details.html?id=${data.id}" class="ms-flyout-get-btn">Get</a>
                        </div>
                        <p class="ms-flyout-desc">${escapeHtml(data.shortDesc || '')}</p>
                        <div class="ms-flyout-footer-esrb"><span class="ms-esrb-badge">${escapeHtml(data.topNote || 'VERIFIED')}</span><div class="ms-esrb-text">${escapeHtml(data.size || 'Free Download')}</div></div>
                    </div>
                </div>
            </div>`;
    });
    return html;
}

function renderAppCards(items) {
    if (!items || items.length === 0) return '';
    let html = '';
    items.forEach(data => {
        const displayName = data.name || data.title;
        const displayCategory = data.category || 'App';
        const displayPrice = data.pricing || 'Free';

        html += `
            <div class="ms-app-card">
                ${data.topNote ? `<span class="ms-corner-badge">${escapeHtml(data.topNote)}</span>` : ''}
                <img src="${data.iconUrl || 'assets/favicon.png'}" class="ms-app-icon" alt="${escapeHtml(displayName)}">
                <div class="ms-app-info">
                    <h4 class="ms-app-title">${escapeHtml(displayName)}</h4>
                    <span class="ms-app-cat">
                        <span class="ms-os-mini-pill">${getPlatformMiniIcon(data.platform)}</span> 
                        ${escapeHtml(displayCategory)}
                    </span>
                </div>
                <span class="ms-app-badge">${escapeHtml(displayPrice)}</span>
            </div>`;
    });
    return html;
}

function renderSpotlightCards(items) {
    if (!items || items.length === 0) return '';
    let html = '';
    items.forEach(data => {
        const displayName = data.name || data.title;
        const displayCategory = data.category || 'Game';
        const displayPrice = data.pricing || 'Free';

        html += `
            <div class="ms-spotlight-item">
                <a href="details.html?id=${data.id}" class="ms-spotlight-inner">
                    ${data.topNote ? `<span class="ms-corner-badge">${escapeHtml(data.topNote)}</span>` : ''}
                    <img src="${data.bannerUrl || data.iconUrl || 'assets/favicon.png'}" class="ms-spotlight-art-img" alt="${escapeHtml(displayName)}">
                    <div class="ms-spotlight-gradient-overlay"></div>
                    <div class="ms-spotlight-bar">
                        <img src="${data.iconUrl || 'assets/favicon.png'}" class="ms-spotlight-mini-icon">
                        <div class="ms-spotlight-bar-info">
                            <h4 class="ms-spotlight-bar-title">${escapeHtml(displayName)}</h4>
                            <span class="ms-spotlight-bar-cat">${escapeHtml(displayCategory)}</span>
                        </div>
                        <span class="ms-spotlight-bar-price">${escapeHtml(displayPrice)}</span>
                    </div>
                </a>
            </div>`;
    });
    return html;
}

function renderCuratedCards(items) {
    if (!items || items.length === 0) return '';
    let html = '';
    items.forEach(data => {
        const displayName = data.name || data.title;
        const displayPrice = data.pricing || 'Free';

        html += `
            <div class="ms-curated-card">
                <a href="details.html?id=${data.id}" class="ms-curated-inner">
                    ${data.topNote ? `<span class="ms-corner-badge">${escapeHtml(data.topNote)}</span>` : ''}
                    <div class="ms-curated-top-banner" style="background: #e0f2fe;">
                        <img src="${data.iconUrl || 'assets/favicon.png'}" class="ms-curated-app-logo">
                    </div>
                    <div class="ms-curated-bottom-info">
                        <h4 class="ms-curated-app-title">${escapeHtml(displayName)}</h4>
                        <div class="ms-curated-sub-row">
                            <span class="ms-os-mini-pill">${getPlatformMiniIcon(data.platform)}</span>
                            <span class="ms-curated-app-price">${escapeHtml(displayPrice)}</span>
                        </div>
                    </div>
                </a>
            </div>`;
    });
    return html;
}

// -----------------------------------------------------
// 📄 সফটওয়্যার ডিটেইলস পেজ লোডার (details.html)
// -----------------------------------------------------
window.loadSoftwareDetails = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const softwareId = urlParams.get('id');
    if (!softwareId) return;

    try {
        const docRef = doc(db, "software", softwareId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            const fullTitle = data.title || data.name;
            document.title = `${fullTitle} - Nexsoftx`;
            if(document.getElementById('detTitle')) document.getElementById('detTitle').innerText = fullTitle;
            if(document.getElementById('detShortDesc')) document.getElementById('detShortDesc').innerText = data.shortDesc;
            if(document.getElementById('detCoverImg')) document.getElementById('detCoverImg').src = data.bannerUrl || data.iconUrl;
            if(document.getElementById('detFullDesc')) document.getElementById('detFullDesc').innerHTML = data.fullDesc || `<p>${data.shortDesc}</p>`;
            if(document.getElementById('detFileSize')) document.getElementById('detFileSize').innerHTML = `${data.size || 'N/A'}`;

            if(document.getElementById('detFileName')) document.getElementById('detFileName').innerText = data.fileName || data.name || fullTitle;
            if(document.getElementById('detDeveloper')) document.getElementById('detDeveloper').innerText = data.developer || 'Unknown';
            if(document.getElementById('detVersion')) document.getElementById('detVersion').innerText = data.version || 'Latest';
            if(document.getElementById('detLicense')) document.getElementById('detLicense').innerText = data.license || data.pricing || 'Freeware';
            
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

            if(document.getElementById('detTags') && (data.tags || data.category)) {
                const combinedTags = `${data.category ? data.category + ', ' : ''}${data.tags || ''}`;
                const tagArray = combinedTags.split(',').map(t => t.trim()).filter(Boolean);
                document.getElementById('detTags').innerHTML = tagArray.map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join(', ');
            }

            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) {
                dlBtn.setAttribute('data-name', data.name || fullTitle);
                dlBtn.href = data.downloadLink || '#';
                
                if (data.filePassword) {
                    dlBtn.setAttribute('data-password', data.filePassword);
                } else {
                    dlBtn.removeAttribute('data-password');
                }
            }
            
            const favBtn = document.getElementById('favoriteBtn');
            if(favBtn) { favBtn.setAttribute('data-name', data.name || fullTitle); }
            const starRating = document.getElementById('starRating');
            if(starRating) { starRating.setAttribute('data-software', data.name || fullTitle); }

            window.loadRelatedSoftware(softwareId);
        } else {
            document.querySelector('.post-details-section').innerHTML = `<div style="text-align:center; padding:80px;"><h2>Software Not Found!</h2><p style="color:#64748b; margin-top:10px;">The software you are looking for does not exist or has been removed.</p><a href="index.html" class="btn-signup" style="display:inline-block; margin-top:20px;">Return Home</a></div>`;
        }
    } catch (error) {
        console.error("Error loading software details:", error);
    }
};

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
                const relName = data.name || data.title;
                html += `
                    <div class="software-card">
                        <img src="${data.iconUrl || 'assets/favicon.png'}" alt="${escapeHtml(relName)}" class="post-image">
                        <div class="card-content">
                            <div class="title-with-icon">
                                <h4>${escapeHtml(relName)}</h4>
                                <span style="font-size: 0.75rem; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; color: #475569; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                    ${getPlatformMiniIcon(data.platform)}
                                </span>
                            </div>
                            <p>${escapeHtml(data.shortDesc || '')}</p>
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
};

if (document.getElementById('homePageContent')) {
    window.loadHomeSoftware();
}
if (window.location.pathname.includes('details.html')) {
    window.loadSoftwareDetails();
}

// ==========================================
// 🔍 ১৪. Advanced Google-like Search (Fuzzy, Suggestions & Enter Key) (সম্পূর্ণ সেকশন)
// ==========================================
let allSoftwareList = [];

// ফায়ারবেস থেকে সব সফটওয়্যার আগে থেকে লোড করে রাখা
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
    fetchAllSoftwareForSearch();

    // ১. টাইপ করার সাথে সাথে সাজেশান ফিল্টারিং
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        searchSuggestions.innerHTML = '';

        if (query.length === 0) {
            searchSuggestions.style.display = 'none';
            return;
        }

        let results = allSoftwareList.map(item => {
            const title = (item.title || "").toLowerCase();
            let matchScore = 0;
            
            // পারফেক্ট ম্যাচ
            if (title.includes(query)) {
                matchScore = 100; 
            } else {
                // ফাজি / বানান ভুলের জন্য ম্যাচ
                const titleWords = title.split(' ');
                const queryWords = query.split(' ');
                
                let minDistance = Infinity;
                queryWords.forEach(qw => {
                    titleWords.forEach(tw => {
                        const dist = getTypoDistance(qw, tw);
                        if (dist < minDistance) minDistance = dist;
                    });
                });
                
                if (minDistance <= 2) {
                    matchScore = 50 - minDistance; 
                }
            }
            return { ...item, matchScore };
        })
        .filter(item => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

        // ড্রপডাউনে HTML রেন্ডার করা
        if (results.length > 0) {
            let html = '';
            results.forEach(item => {
                html += `
                    <a href="details.html?id=${item.id}" class="suggestion-item">
                        <img src="${item.iconUrl || 'assets/favicon.png'}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
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
            searchSuggestions.innerHTML = `<div style="padding: 18px 20px; color: #64748b; font-size: 0.95rem; text-align: center;">No software found for "<b>${escapeHtmlText(query)}</b>"</div>`;
            searchSuggestions.style.display = 'block';
        }
    });

    // ২. কীবোর্ডের Enter চাপলে স্বয়ংক্রিয়ভাবে প্রথম সফটওয়্যারের পেজে নিয়ে যাওয়া
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstSuggestion = searchSuggestions.querySelector('.suggestion-item');
            if (firstSuggestion) {
                firstSuggestion.click();
            }
        }
    });

    // ৩. বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হওয়া
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });
    
    // ৪. ইনপুটে ক্লিক বা ফোকাস করলে পুনরায় ড্রপডাউন দেখানো
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0 && searchSuggestions.innerHTML !== '') {
            searchSuggestions.style.display = 'block';
        }
    });
}

// ==========================================
// 🚀 ইউনিভার্সাল হরাইজন্টাল স্ক্রোলিং ফাংশন (সব সেকশনের জন্য)
// ==========================================
window.scrollShelf = function(elementId, direction) {
    const el = document.getElementById(elementId);
    if (el) {
        // ক্লিকে মসৃণভাবে ৮০% স্ক্রিন একবারে ডানে বা বামে স্ক্রোল হবে
        const scrollAmount = el.clientWidth * 0.8;
        el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
};

// ==========================================
// 📢 Render Global Top Note on Website
// ==========================================
async function renderWebsiteTopNote() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "top_note"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const existingBanner = document.getElementById('siteTopNoteBanner');
            if (existingBanner) existingBanner.remove();

            if (data.enabled && data.text) {
                const bgColors = {
                    success: 'linear-gradient(135deg, #10b981, #059669)',
                    info: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    dark: '#0f172a'
                };

                const bannerHtml = `
                    <div id="siteTopNoteBanner" style="background: ${bgColors[data.type] || bgColors.success}; color: white; text-align: center; padding: 10px 20px; font-size: 0.9rem; font-weight: 600; position: fixed; top: 0; left: 0; width: 100%; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span>${data.text}</span>
                        <button onclick="document.getElementById('siteTopNoteBanner').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; margin-left: 10px;">&times;</button>
                    </div>
                `;
                document.body.insertAdjacentHTML('afterbegin', bannerHtml);
                
                // ব্যানার অন থাকলে ন্যাভবারকে সামান্য নিচে নামিয়ে দেয়া
                const navbar = document.querySelector('.navbar');
                if (navbar) navbar.style.top = '42px';
            }
        }
    } catch (e) {
        console.error("Top note render error:", e);
    }
}
renderWebsiteTopNote();
