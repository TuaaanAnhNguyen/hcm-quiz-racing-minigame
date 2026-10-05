// src/pages/HostSetupPage.tsx

import { useState } from "react";
import { createHostRoom } from "../lib/roomRouting";

function HostSetupPage() {
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = () => {
    if (creating) return;

    setCreating(true);

    const { adminToken } = createHostRoom();

    window.location.href = `/host/${adminToken}`;
  };

  return (
    <main className="transition-page">
      <section className="transition-card">
        <p className="eyebrow">HCM QUIZ RACING</p>
        <h1>Tạo cuộc đua</h1>
        <p>Tạo phòng và mời người chơi tham gia.</p>

        <button
          type="button"
          className="race-button"
          onClick={handleCreateRoom}
          disabled={creating}
        >
          {creating ? "Đang tạo phòng..." : "Tạo phòng"}
        </button>
      </section>
    </main>
  );
}

export default HostSetupPage;
