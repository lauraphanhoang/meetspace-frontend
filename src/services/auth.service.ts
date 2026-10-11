const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Une erreur est survenue lors de l’inscription.",
    );
  }

  return result;
}

interface LoginData {
  email: string;
  password: string;
}

export async function loginUser(data: LoginData) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Email ou mot de passe incorrect.");
  }

  return result;
}

export async function getProfile(token: string) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de récupérer le profil.");
  }

  return result;
}

export async function updateProfile(
  token: string,
  data: {
    firstname?: string;
    lastname?: string;
    email?: string;
  },
) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "Impossible de modifier votre profil.",
    );
  }

  return result;
}
export async function changePassword(
  token: string,
  data: {
    currentPassword: string;
    newPassword: string;
  },
) {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de modifier le mot de passe.",
    );
  }

  return result;
}

export async function updateAvatar(token: string, file: File) {
  const formData = new FormData();

  formData.append("avatar", file);

  const response = await fetch(`${API_URL}/auth/profile/avatar`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible de modifier la photo de profil.",
    );
  }

  return result;
}

export function logoutUser() {
  localStorage.removeItem("access_token");
}
