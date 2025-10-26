// ===== IMPORT FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  push,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyAAum8UicFCCF5bgwMQUzqmK3lR2b0oFGk",
  authDomain: "dg-service-5a315.firebaseapp.com",
  databaseURL: "https://dg-service-5a315-default-rtdb.firebaseio.com",
  projectId: "dg-service-5a315",
  storageBucket: "dg-service-5a315.firebasestorage.app",
  messagingSenderId: "482066361849",
  appId: "1:482066361849:web:a26a5c96d504e74601e128",
  measurementId: "G-YDT19BN7JC",
};

// ===== INITIALIZE FIREBASE =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== LOCAL LIKE STORAGE =====
let likedImages = JSON.parse(localStorage.getItem("likedImages") || "[]");

// ===== IMAGE DATA =====
const galleryImages = [
  {
    id: "img1",
    src: "https://deckenstore.github.io/image-host/1759377049766~2.jpg",
    caption: "Elegant Red Blouse",
    author: "Gourav Boutique",
  },
  {
    id: "img2",
    src: "https://deckenstore.github.io/image-host/Gemini_Generated_Image_4t8m3t4t8m3t4t8m~2.png",
    caption: "AI Modeled Silk Blouse",
    author: "Gourav Boutique",
  },
  {
    id: "img3",
    src: "https://deckenstore.github.io/image-host/Blouse Design.png",
    caption: "Modern Trendy Blouse Design",
    author: "Gourav Boutique",
  },
  {
    id: "img4",
    src: "https://deckenstore.github.io/Gourav-Butique/images/img1.jpg",
    caption: "Classic Embroidery",
    author: "Gourav Boutique",
  },
  {
    id: "img5",
    src: "https://deckenstore.github.io/image-host/",
    caption: "Designer Blouse",
    author: "Gourav Boutique",
  },
];

// ===== INITIALIZE POSTS IN FIREBASE =====
galleryImages.forEach((img) => {
  const imgRef = ref(db, "posts/" + img.id);
  get(imgRef).then((snapshot) => {
    if (!snapshot.exists()) {
      set(imgRef, {
        likes: 0,
        comments: {},
        src: img.src,
        caption: img.caption,
        author: img.author,
      });
    }
  });
});

// ===== RENDER GALLERY =====
const imageScroll = document.getElementById("imageScroll");
galleryImages.forEach((img, index) => {
  const imgEl = document.createElement("img");
  imgEl.src = img.src;
  imgEl.alt = "Design " + (index + 1);
  imgEl.addEventListener("click", () => openModal(img.id));
  imageScroll.appendChild(imgEl);
});

// ===== SCROLL BUTTONS =====
document.querySelector(".scroll-btn.left").onclick = () =>
  imageScroll.scrollBy({ top: -250, behavior: "smooth" });
document.querySelector(".scroll-btn.right").onclick = () =>
  imageScroll.scrollBy({ top: 250, behavior: "smooth" });

// ===== MODAL ELEMENTS =====
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const modalCaption = document.getElementById("modalCaption");
const modalAuthor = document.getElementById("modalAuthor");
const modalLikeBtn = document.getElementById("modalLikeBtn");
const modalLikeCount = document.getElementById("modalLikeCount");
const modalShareBtn = document.getElementById("modalShareBtn");
const modalComments = document.getElementById("modalComments");
const modalCommentInput = document.getElementById("modalCommentInput");
const modalCommentName = document.getElementById("modalCommentName");
const modalCommentBtn = document.getElementById("modalCommentBtn");
const modalPostBtn = document.getElementById("modalPostBtn");
const closeModal = document.getElementById("closeModal");

let currentImageId = null;

// ===== OPEN MODAL =====
function openModal(id) {
  currentImageId = id;
  const imgRef = ref(db, "posts/" + id);
  modal.style.display = "flex";
  modalCommentInput.value = "";
  modalCommentName.value = "";

  // REAL-TIME DATA
  onValue(imgRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const dataSnap = snapshot.val();
    modalImage.src = dataSnap.src;
    modalCaption.textContent = dataSnap.caption;
    modalAuthor.textContent = "by " + dataSnap.author;
    modalLikeCount.textContent = dataSnap.likes || 0;

    // RENDER COMMENTS
    modalComments.innerHTML = "";
    const comments = dataSnap.comments ? Object.values(dataSnap.comments) : [];
    comments.forEach((c) => renderComment(c));
  });

  // LIKE
  modalLikeBtn.onclick = async () => {
    if (likedImages.includes(currentImageId)) {
      alert("You already liked this ❤️");
      return;
    }
    const snapshot = await get(imgRef);
    const likes = snapshot.val().likes || 0;
    await update(imgRef, { likes: likes + 1 });
    likedImages.push(currentImageId);
    localStorage.setItem("likedImages", JSON.stringify(likedImages));
  };

  // COMMENT BUTTON (focus)
  modalCommentBtn.onclick = () => modalCommentInput.focus();

  // POST COMMENT
  modalPostBtn.onclick = async () => {
    const name = modalCommentName.value.trim() || "Anonymous";
    const text = modalCommentInput.value.trim();
    if (!text) return;
    const commentsRef = ref(db, "posts/" + currentImageId + "/comments");
    await push(commentsRef, { author: name, message: text });
    modalCommentInput.value = "";
    modalCommentName.value = "";
  };

  // SHARE
  modalShareBtn.onclick = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("🔗 Link copied!");
  };
}

// ===== CLOSE MODAL =====
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// ===== RENDER COMMENT =====
function renderComment(comment) {
  const div = document.createElement("div");
  div.classList.add("comment");
  div.innerHTML = `
    <div class="avatar"></div>
    <div class="text">
      <span class="author">${comment.author}</span>
      <span class="message">${comment.message}</span>
    </div>
  `;
  modalComments.appendChild(div);
  modalComments.scrollTop = modalComments.scrollHeight;
}

// ===== NAV MENU TOGGLE =====
window.toggleMenu = function () {
  const links = document.getElementById("navLinks");
  links.classList.toggle("show");
};
const toggle = document.getElementById("ctaToggle");
    const container = document.getElementById("ctaContainer");

    toggle.addEventListener("click", () => {
      container.classList.toggle("active");
      toggle.classList.toggle("rotate");
    });