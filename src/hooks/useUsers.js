import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://dummyjson.com/users';
const PAGE_LIMIT = 10;

/**
 * Custom hook to fetch and manage users from dummyjson API.
 * Supports pagination and search.
 */
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // 0-indexed page
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (searchQuery.trim()) {
        url = `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&limit=${PAGE_LIMIT}&skip=${page * PAGE_LIMIT}`;
      } else {
        url = `${API_BASE}?limit=${PAGE_LIMIT}&skip=${page * PAGE_LIMIT}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();

      // Normalise API shape to a consistent internal shape
      const normalised = data.users.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        username: u.username,
        age: u.age,
        gender: u.gender,
        image: u.image,
        bloodGroup: u.bloodGroup,
        role: u.role
          ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
          : 'User',
        department: u.company?.department ?? '',
        company: u.company?.name ?? '',
        jobTitle: u.company?.title ?? '',
        city: u.address?.city ?? '',
        country: u.address?.country ?? '',
        university: u.university ?? '',
        birthDate: u.birthDate,
        // Derive a status – the API doesn't provide one, so we base it
        // on whether the user appears to have a recent-enough birthDate,
        // alternating for a realistic mix.
        status: u.id % 5 === 0 ? 'Inactive' : 'Active',
      }));

      setUsers(normalised);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const goToPage = (p) => {
    if (p >= 0 && p < totalPages) setPage(p);
  };

  const search = (q) => {
    setPage(0);
    setSearchQuery(q);
  };

  return {
    users,
    total,
    loading,
    error,
    page,
    totalPages,
    goToPage,
    searchQuery,
    search,
    refetch: fetchUsers,
  };
};

export default useUsers;
