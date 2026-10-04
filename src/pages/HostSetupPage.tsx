// src/pages/HostSetupPage.tsx

import { useState } from "react";
import { createHostRoom } from "../lib/roomRouting";

function HostSetupPage() {
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = () => {
    if (creating) return;

    setCreating(true);

    const { adminToken } = createHostRoom();

    // A full navigation reloads the app and initializes the store
    // using the new host URL.
    window.location.href = `/host/${adminToken}`;
  };

  return (
    <main className="transition-page">
      <section className="transition-card">
        <p className="eyebrow">HCM QUIZ RACING</p>
        <h1>Host a race</h1>
        <p>Create a room and invite your players to join.</p>

        <button
          type="button"
          className="race-button"
          onClick={handleCreateRoom}
          disabled={creating}
        >
          {creating ? "Creating room..." : "Create room"}
        </button>
      </section>
    </main>
  );
}

export default HostSetupPage;
