export function formatRelativeDate(isoDate) {
  const normalized = isoDate.endsWith("Z") ? isoDate : isoDate + "Z";
  const date = new Date(normalized);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? "s" : ""}`;
  if (diffHour < 24) return `Hace ${diffHour} hora${diffHour !== 1 ? "s" : ""}`;
  return `Hace ${diffDay} día${diffDay !== 1 ? "s" : ""}`;
}

function getInitials(username) {
  return username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(username) {
  const colors = [
    "#5865F2",
    "#57F287",
    "#FEE75C",
    "#EB459E",
    "#ED4245",
    "#3BA55C",
    "#FAA61A",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function createCommentCard(comment, onDelete) {
  const { id, username, message, date } = comment;

  const card = document.createElement("div");
  card.dataset.commentId = id;
  card.className =
    "comment-card bg-[#2b2d31] rounded-lg p-4 flex gap-3 group border border-transparent hover:border-[#3f4147]";

  const avatarColor = getAvatarColor(username);
  const initials = getInitials(username);

  card.innerHTML = `
    <div class="flex-shrink-0">
      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
           style="background-color: ${avatarColor}">
        ${initials}
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2 flex-wrap">
        <span class="font-semibold text-white text-sm">${escapeHtml(username)}</span>
        <span class="text-[#949ba4] text-xs">${formatRelativeDate(date)}</span>
      </div>
      <p class="text-[#dbdee1] text-sm mt-1 break-words leading-relaxed">${escapeHtml(message)}</p>
    </div>
    <div class="flex-shrink-0 opacity-0 group-hover:opacity-100">
      <button
        class="delete-btn text-[#949ba4] hover:text-[#ed4245] hover:bg-[#ed424520] p-1.5 rounded cursor-pointer"
        title="Eliminar comentario"
        data-id="${id}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  `;

  card.querySelector(".delete-btn").addEventListener("click", () => {
    onDelete(id);
  });

  return card;
}

export function renderComments(comments, container, onDelete) {
  container.innerHTML = "";

  if (!comments || comments.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="text-5xl mb-4">💬</div>
        <p class="text-[#949ba4] text-base font-medium">No hay comentarios aún</p>
        <p class="text-[#5c6068] text-sm mt-1">¡Sé el primero en comentar!</p>
      </div>
    `;
    return;
  }

  const sorted = [...comments].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  sorted.forEach((comment) => {
    container.appendChild(createCommentCard(comment, onDelete));
  });
}

export function prependCommentCard(comment, container, onDelete) {
  if (container.querySelector(".empty-state")) {
    container.innerHTML = "";
  }
  const card = createCommentCard(comment, onDelete);
  container.insertBefore(card, container.firstChild);
}

export function removeCommentCard(id, container) {
  const card = container.querySelector(`[data-comment-id="${id}"]`);
  if (card) {
    card.remove();
  }

  if (container.children.length === 0) {
    renderComments([], container, () => {});
  }
}

export function showToast(message, type = "success") {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast";

  const isSuccess = type === "success";
  toast.className = `fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg ${
    isSuccess ? "bg-[#3ba55c]" : "bg-[#ed4245]"
  }`;

  toast.innerHTML = `
    <span>${isSuccess ? "✓" : "✕"}</span>
    <span>${escapeHtml(message)}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

export function setLoadingState(loading, container) {
  if (loading) {
    container.innerHTML = `
      <div class="flex items-center justify-center py-16">
        <div class="flex gap-1.5">
          <div class="w-2 h-2 rounded-full bg-[#5865f2] animate-bounce" style="animation-delay:0ms"></div>
          <div class="w-2 h-2 rounded-full bg-[#5865f2] animate-bounce" style="animation-delay:150ms"></div>
          <div class="w-2 h-2 rounded-full bg-[#5865f2] animate-bounce" style="animation-delay:300ms"></div>
        </div>
      </div>
    `;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
