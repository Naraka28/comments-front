import {
  getComments,
  createComment,
  deleteComment,
} from "./comments.service.js";
import {
  renderComments,
  prependCommentCard,
  removeCommentCard,
  showToast,
  setLoadingState,
} from "./ui.js";

const form = document.getElementById("comment-form");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const commentsContainer = document.getElementById("comments-container");
const publishBtn = document.getElementById("publish-btn");
const usernameError = document.getElementById("username-error");
const messageError = document.getElementById("message-error");

function validateForm() {
  let valid = true;

  usernameError.textContent = "";
  messageError.textContent = "";
  usernameInput.classList.remove("border-[#ed4245]");
  messageInput.classList.remove("border-[#ed4245]");

  if (!usernameInput.value.trim()) {
    usernameError.textContent = "El nombre de usuario es obligatorio.";
    usernameInput.classList.add("border-[#ed4245]");
    valid = false;
  }

  if (messageInput.value.trim().length < 5) {
    messageError.textContent = "El mensaje debe tener al menos 5 caracteres.";
    messageInput.classList.add("border-[#ed4245]");
    valid = false;
  }

  return valid;
}

async function loadComments() {
  setLoadingState(true, commentsContainer);

  try {
    const comments = await getComments();
    renderComments(comments, commentsContainer, handleDelete);
  } catch (error) {
    console.error("Error cargando comentarios:", error);
    commentsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-[#ed4245] text-sm font-medium">No se pudieron cargar los comentarios.</p>
        <p class="text-[#5c6068] text-xs mt-1">Verifica que el servidor esté corriendo en localhost:3000</p>
      </div>
    `;
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  publishBtn.disabled = true;
  publishBtn.textContent = "Publicando...";

  try {
    const newComment = await createComment(username, message);

    prependCommentCard(newComment, commentsContainer, handleDelete);

    usernameInput.value = "";
    messageInput.value = "";
    usernameError.textContent = "";
    messageError.textContent = "";

    showToast("¡Comentario publicado!", "success");
  } catch (error) {
    console.error("Error creando comentario:", error);
    showToast("No se pudo publicar el comentario.", "error");
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = "Publicar";
  }
}

async function handleDelete(id) {
  const confirmed = window.confirm(
    "¿Estás seguro de que quieres eliminar este comentario?",
  );
  if (!confirmed) return;

  try {
    await deleteComment(id);
    removeCommentCard(id, commentsContainer);
    showToast("Comentario eliminado.", "success");
  } catch (error) {
    console.error("Error eliminando comentario:", error);
    showToast("No se pudo eliminar el comentario.", "error");
  }
}

form.addEventListener("submit", handleSubmit);

loadComments();
