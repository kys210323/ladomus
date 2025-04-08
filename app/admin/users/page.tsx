"use client";

import React, { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [errorMsg, setErrorMsg] = useState("");

  // 유저 목록 로드
  async function fetchUsers() {
    try {
      const res = await fetch("/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      setErrorMsg(error.message || "Error fetching users");
    }
  }

  // 컴포넌트 로드 시 유저 목록 불러오기
  useEffect(() => {
    fetchUsers();
  }, []);

  // 새 유저 생성
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      setNewUsername("");
      setNewPassword("");
      setNewRole("user");

      // 리스트 갱신
      await fetchUsers();
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  }

  // 유저 삭제
  async function handleDeleteUser(userId: number) {
    if (!confirm("정말 이 유저를 삭제하시겠습니까?")) return;

    setErrorMsg("");
    try {
      const res = await fetch(`/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      // 목록 갱신
      await fetchUsers();
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  }

  // 권한 토글(간단 예: user ↔ admin)
  async function handleToggleRole(user: User) {
    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      const res = await fetch("/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      // 목록 갱신
      await fetchUsers();
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">유저 관리</h1>

      {/* 에러메시지 */}
      {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

      {/* 새 유저 생성 폼 */}
      <form
        onSubmit={handleCreateUser}
        className="mb-6 p-4 bg-white rounded shadow max-w-xl"
      >
        <h2 className="font-semibold mb-2">새 유저 생성</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="border p-2 flex-1"
            required
          />
          <input
            type="text"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 flex-1"
            required
          />
        </div>
        <div className="flex gap-2 mb-2">
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="border p-2"
          >
            <option value="user">일반유저</option>
            <option value="admin">관리자</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            추가
          </button>
        </div>
      </form>

      {/* 유저 목록 테이블 */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Username</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">CreatedAt</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => handleToggleRole(u)}
                    className="underline text-blue-600 hover:text-blue-800"
                    title="권한 토글 (admin ↔ user)"
                  >
                    {u.role}
                  </button>
                </td>
                <td className="p-3">{u.createdAt}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  등록된 유저가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
