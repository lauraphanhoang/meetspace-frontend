const API_URL = process.env.NEXT_PUBLIC_API_URL;
export async function getRooms() {
  const response = await fetch(`${API_URL}/rooms`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de récupérer les salles.");
  }

  return result;
}

export async function getMyReservations(token: string) {
  const response = await fetch(`${API_URL}/reservations/my`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de récupérer vos réservations.",
    );
  }

  return result;
}

export async function createReservation(
  token: string,
  data: {
    roomId: number;
    startDate: string;
    endDate: string;
  },
) {
  const response = await fetch(`${API_URL}/reservations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de créer la réservation.");
  }

  return result;
}

export async function getReservationById(token: string, id: number) {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de récupérer la réservation.",
    );
  }

  return result;
}
export async function deleteReservation(token: string, id: number) {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible d'annuler la réservation.");
  }

  return result;
}
export async function getRoomById(id: number) {
  const response = await fetch(`${API_URL}/rooms/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de récupérer la salle.");
  }

  return result;
}

export async function updateReservation(
  token: string,
  id: number,
  data: {
    roomId: number;
    startDate: string;
    endDate: string;
  },
) {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de modifier la réservation.");
  }

  return result;
}

export async function getAllReservations(token: string) {
  const response = await fetch(`${API_URL}/reservations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de récupérer les réservations.",
    );
  }

  return result;
}

export async function deleteRoom(token: string, id: number) {
  const response = await fetch(`${API_URL}/rooms/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de supprimer la salle.");
  }

  return result;
}
export async function createRoom(
  token: string,
  data: {
    name: string;
    capacity: number;
    location: string;
    equipment?: string;
    images?: File[];
  },
) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("capacity", String(data.capacity));
  formData.append("location", data.location);

  if (data.equipment) {
    formData.append("equipment", data.equipment);
  }

  if (data.images) {
    data.images.forEach((image) => {
      formData.append("images", image);
    });
  }

  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "Impossible de créer la salle.",
    );
  }

  return result;
}

export async function updateRoom(
  token: string,
  id: number,
  data: {
    name?: string;
    capacity?: number;
    location?: string;
    equipment?: string;
    images?: File[];
  },
) {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append("name", data.name);
  }

  if (data.capacity !== undefined) {
    formData.append("capacity", String(data.capacity));
  }

  if (data.location !== undefined) {
    formData.append("location", data.location);
  }

  if (data.equipment !== undefined) {
    formData.append("equipment", data.equipment);
  }

  if (data.images) {
    data.images.forEach((image) => {
      formData.append("images", image);
    });
  }

  const response = await fetch(`${API_URL}/rooms/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "Impossible de modifier la salle.",
    );
  }

  return result;
}

export async function getAdminReservationById(token: string, id: number) {
  const response = await fetch(`${API_URL}/reservations/admin/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de récupérer la réservation.",
    );
  }

  return result;
}

export async function checkAvailability(
  token: string,
  roomId: number,
  startDate: string,
  endDate: string,
) {
  const params = new URLSearchParams({
    roomId: String(roomId),
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/reservations/availability?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de vérifier la disponibilité.",
    );
  }

  return result;
}

export async function getRoomAvailability(
  token: string,
  roomId: number,
  date: string,
) {
  const params = new URLSearchParams({
    roomId: String(roomId),
    date,
  });

  const response = await fetch(
    `${API_URL}/reservations/availability/day?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de récupérer les disponibilités.",
    );
  }

  return result;
}

export async function getUsers(token: string) {
  const response = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de récupérer les utilisateurs.",
    );
  }

  return result;
}

export async function getUserById(token: string, id: number) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de récupérer l'utilisateur.");
  }

  return result;
}

export async function deleteRoomImage(
  token: string,
  roomId: number,
  imageId: number,
) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/images/${imageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de supprimer la photo.");
  }

  return result;
}
