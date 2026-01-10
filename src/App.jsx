import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import trashIcon from "/icons/trash-2.svg";


function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const STORAGE_KEY = "smartFlashcards.v1";

export default function App() {
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return [
      { id: "c1", front: "What is 2 + 2?", back: "4" },
      { id: "c2", front: "Capital of France?", back: "Paris" },
      { id: "c3", front: "Derivative of x^2?", back: "2x" },
    ];
  });

  const [selectedId, setSelectedId] = useState(() => "c1");
  const [showBack, setShowBack] = useState(false);

  // hamburger sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Add-card form
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const frontInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  // Keep selectedId valid if cards change
  useEffect(() => {
    if (cards.length === 0) return;
    const exists = cards.some((c) => c.id === selectedId);
    if (!exists) setSelectedId(cards[0].id);
  }, [cards, selectedId]);

  const selectedIndex = useMemo(() => {
    return Math.max(0, cards.findIndex((c) => c.id === selectedId));
  }, [cards, selectedId]);

  const current = cards[selectedIndex] ?? null;

  function selectByIndex(i) {
    if (cards.length === 0) return;
    const clamped = Math.min(Math.max(i, 0), cards.length - 1);
    setSelectedId(cards[clamped].id);
    setShowBack(false);
  }

  function prev() {
    selectByIndex(selectedIndex - 1);
  }

  function next() {
    selectByIndex(selectedIndex + 1);
  }

  function addCard(e) {
    e.preventDefault();
    const f = newFront.trim();
    const b = newBack.trim();
    if (!f || !b) return;

    const card = { id: uid(), front: f, back: b };
    setCards((prevCards) => [card, ...prevCards]);
    setSelectedId(card.id);
    setShowBack(false);
    setNewFront("");
    setNewBack("");
    frontInputRef.current?.focus();
  }

  function deleteCard(id) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  // Keyboard: Left/Right = prev/next, Space or Enter = reveal/hide
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setShowBack((s) => !s);
      } else if (e.key.toLowerCase() === "b") {
        setSidebarOpen((o) => !o);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, cards.length]);

  return (
    <div className="appShell">
      {/* Global top bar (full width) */}
      <header className="globalTopBar">
        <div className="logoRow">
          <button
            className="iconBtn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            ☰
          </button>

          {/* Logo section (swap text for an image later) */}
          <div className="logoBox">
            <div className="logoText">FLASH</div>
            <div className="logoSubtle">cards</div>
          </div>
        </div>

        <div className="topTitle">
          <div className="title">Study</div>
          <div className="subtle">
            {cards.length === 0 ? "0/0" : `${selectedIndex + 1}/${cards.length}`}
          </div>
        </div>

        <div className="topRight" />
      </header>

      <div className="contentRow">
        {/* Backdrop for mobile drawer only */}
        <button
          className={`backdrop ${sidebarOpen ? "show" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />

        {/* Sidebar (drawer/collapsible) */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebarHeader">
            <div className="brand">Flashcards</div>
            <div className="subtle">{cards.length} cards</div>
          </div>

          <div className="list">
            {cards.length === 0 ? (
              <div className="emptySmall">No cards yet.</div>
            ) : (
              cards.map((c, i) => {
                const active = c.id === selectedId;

                return (
                  <div key={c.id} className={`listItemRow ${active ? "active" : ""}`}>
                    <button
                      className="listItemMain"
                      onClick={() => selectByIndex(i)}
                      title="Open card"
                    >
                      <div className="listItemTitle">{c.front}</div>
                      <div className="listItemMeta">
                        {c.back.length > 40 ? c.back.slice(0, 40) + "…" : c.back}
                      </div>
                    </button>

                    <button
                      className="listTrashBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCard(c.id);
                      }}
                      aria-label="Delete card"
                      title="Delete card"
                    >
                      <svg className="listTrashIcon" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"
                        />
                      </svg>
                    </button>

                  </div>
                );
              })
            )}
          </div>

          <form className="addForm" onSubmit={addCard}>
            <div className="formTitle">Add a card</div>
            <input
              ref={frontInputRef}
              className="input"
              placeholder="Front (question)"
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
            />
            <input
              className="input"
              placeholder="Back (answer)"
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
            />
            <button className="primary" type="submit">
              Add
            </button>
            <div className="hint">Left/Right to navigate, Space to flip, B toggles sidebar.</div>
          </form>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="cardArea">
            {!current ? (
              <div className="emptyBig">
                <div className="emptyBigTitle">No cards to study</div>
                <div className="subtle">Add one using the sidebar.</div>
              </div>
            ) : (
              <div className="cardWrap">
                <div
                  className="flashcard"
                  onClick={() => setShowBack((s) => !s)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flashcardLabel">{showBack ? "Back" : "Front"}</div>
                  <div className="flashcardText">
                    {showBack ? current.back : current.front}
                  </div>
                  <div className="flashcardFooter subtle">Click to flip</div>
                </div>

                {/* Centered arrows + Delete on the right */}
                <div className="cardControls">
                  <div />
                  <div className="cardNav">
                    <button className="iconBtn" onClick={prev} disabled={selectedIndex <= 0}>
                      ◀
                    </button>
                    <button
                      className="iconBtn"
                      onClick={() => setShowBack((s) => !s)}
                      disabled={!current}
                    >
                      {showBack ? "Hide" : "Reveal"}
                    </button>
                    <button
                      className="iconBtn"
                      onClick={next}
                      disabled={selectedIndex >= cards.length - 1}
                    >
                      ▶
                    </button>
                  </div>
              

                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
