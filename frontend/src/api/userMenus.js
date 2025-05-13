const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Always get the token from localStorage inside every API call!
const getValidToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === "null" || token === "undefined") {
    throw new Error("No valid authentication token. Please login again.");
  }
  return token;
};

export const saveMenu = async (menuDate, meals, analysis = {}) => {
  const token = getValidToken();
  const res = await fetch(`${API}/api/user-menus`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_date: menuDate,
      meals,
      bmi: analysis.bmi,
      tdee: analysis.tdee_user,
      analysis_json: JSON.stringify(analysis)
    }),
  });
  let errText = '';
  if (!res.ok) {
    try {
      const err = await res.json();
      errText = err.error || err.message || res.statusText;
    } catch(e) {
      errText = res.statusText;
    }
    throw new Error(errText || 'Failed to save menu');
  }
  return await res.json();
};

export const getMenus = async (range = "week") => {
  const token = getValidToken();
  const res = await fetch(`${API}/api/user-menus?range=${range}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    let errText = '';
    try {
      const err = await res.json();
      errText = err.error || err.message || err.msg || res.statusText;
    } catch(e) {
      errText = res.statusText;
    }
    throw new Error(errText || 'Failed to fetch menus');
  }
  return await res.json();
};

export const deleteMenu = async (menuId) => {
  const token = getValidToken();
  const res = await fetch(`${API}/api/user-menus/${menuId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    let errText = '';
    try {
      const err = await res.json();
      errText = err.error || err.message || res.statusText;
    } catch(e) {
      errText = res.statusText;
    }
    throw new Error(errText || 'Failed to delete menu');
  }
  return await res.json();
};

export const updateMenu = async (menuId, meals) => {
  const token = getValidToken();
  const res = await fetch(`${API}/api/user-menus/${menuId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ meals }),
  });
  if (!res.ok) {
    let errText = '';
    try {
      const err = await res.json();
      errText = err.error || err.message || res.statusText;
    } catch(e) {
      errText = res.statusText;
    }
    throw new Error(errText || 'Failed to update menu');
  }
  return await res.json();
};