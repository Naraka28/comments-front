const API_BASE = "https://comments-api-o7wn.onrender.com/comments";

export async function getComments() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error(`Error al obtener comentarios: ${response.status}`);
  }
  return await response.json();
}

export async function createComment(username, message) {
  const body = {
    username,
    message,
  };

  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Error al crear comentario: ${response.status}`);
  }

  return await response.json();
}

export async function deleteComment(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar comentario: ${response.status}`);
  }

  return await response.json();
}
