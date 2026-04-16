// ===== FIREBASE CONFIGURATION =====
// Bu dosyadaki değerleri kendi Firebase projenizin bilgileriyle değiştirin.
// Firebase Console: https://console.firebase.google.com
// 1. Yeni proje oluşturun (örn: "lamina-garden")
// 2. Web uygulaması ekleyin
// 3. Firestore Database oluşturun
// 4. Storage oluşturun
// 5. Authentication > Email/Password etkinleştirin
// 6. Aşağıdaki bilgileri projenizin config'i ile değiştirin

const firebaseConfig = {
    apiKey: "AIzaSyDrsgqbkcquc3lY514hTjxCq0QwyUVCeXM",
    authDomain: "la-mina-garden.firebaseapp.com",
    projectId: "la-mina-garden",
    storageBucket: "la-mina-garden.firebasestorage.app",
    messagingSenderId: "635019371650",
    appId: "1:635019371650:web:1d671447952597987b809b",
    measurementId: "G-VQN944JNLR"
};

// Firebase'i başlat
let db = null;
let storage = null;
let auth = null;
let firebaseReady = false;

try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        storage = firebase.storage();
        auth = firebase.auth();
        firebaseReady = true;
        console.log('Firebase bağlantısı başarılı.');
    }
} catch (e) {
    console.log('Firebase henüz yapılandırılmadı. localStorage kullanılacak.');
}

// ===== UNIFIED DATA LAYER =====
// Firebase varsa oradan, yoksa localStorage'dan okur/yazar.
// Admin paneli ve ana site aynı fonksiyonları kullanır.

const DataStore = {
    // Veri oku
    async getAll(collection) {
        if (firebaseReady) {
            try {
                const snapshot = await db.collection(collection).orderBy('createdAt', 'desc').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (e) {
                console.error('Firebase okuma hatası:', e);
                return this._getLocal(collection);
            }
        }
        return this._getLocal(collection);
    },

    // Veri ekle
    async add(collection, data) {
        data.createdAt = Date.now();
        if (firebaseReady) {
            try {
                const docRef = await db.collection(collection).add(data);
                data.id = docRef.id;
                // localStorage'ı da güncelle (yedek)
                this._addLocal(collection, data);
                return data;
            } catch (e) {
                console.error('Firebase yazma hatası:', e);
            }
        }
        data.id = Date.now().toString();
        this._addLocal(collection, data);
        return data;
    },

    // Veri sil
    async remove(collection, id) {
        if (firebaseReady) {
            try {
                await db.collection(collection).doc(id).delete();
            } catch (e) {
                console.error('Firebase silme hatası:', e);
            }
        }
        this._removeLocal(collection, id);
    },

    // Fotoğraf yükle (Storage)
    async uploadImage(file) {
        if (firebaseReady) {
            try {
                const fileName = Date.now() + '_' + file.name;
                const ref = storage.ref('photos/' + fileName);
                await ref.put(file);
                return await ref.getDownloadURL();
            } catch (e) {
                console.error('Firebase yükleme hatası:', e);
            }
        }
        // Fallback: base64 olarak localStorage'a kaydet
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    },

    // Ayarları oku
    async getSettings() {
        if (firebaseReady) {
            try {
                const doc = await db.collection('settings').doc('main').get();
                if (doc.exists) return doc.data();
            } catch (e) {
                console.error('Firebase ayar okuma hatası:', e);
            }
        }
        const stored = localStorage.getItem('laminaData');
        if (stored) return JSON.parse(stored).settings || {};
        return { phone: '0(545) 971 12 85', whatsapp: '905459711285', instagram: 'laminagarden' };
    },

    // Ayarları kaydet
    async saveSettings(settings) {
        if (firebaseReady) {
            try {
                await db.collection('settings').doc('main').set(settings, { merge: true });
            } catch (e) {
                console.error('Firebase ayar yazma hatası:', e);
            }
        }
        const stored = JSON.parse(localStorage.getItem('laminaData') || '{}');
        stored.settings = settings;
        localStorage.setItem('laminaData', JSON.stringify(stored));
    },

    // --- localStorage yardımcıları ---
    _getLocal(collection) {
        const stored = localStorage.getItem('laminaData');
        if (!stored) return [];
        const data = JSON.parse(stored);
        return data[collection] || [];
    },

    _addLocal(collection, item) {
        const stored = JSON.parse(localStorage.getItem('laminaData') || '{}');
        if (!stored[collection]) stored[collection] = [];
        stored[collection].unshift(item);
        localStorage.setItem('laminaData', JSON.stringify(stored));
    },

    _removeLocal(collection, id) {
        const stored = JSON.parse(localStorage.getItem('laminaData') || '{}');
        if (stored[collection]) {
            stored[collection] = stored[collection].filter(item =>
                item.id !== id && item.id !== parseInt(id)
            );
            localStorage.setItem('laminaData', JSON.stringify(stored));
        }
    }
};
