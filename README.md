# Smart Flashcards

A minimal, dark, monospace flashcard web app built with React + Vite.  
Designed for fast studying with a sidebar card list, quick add, and keyboard navigation.

## Features
- Sidebar list of cards (select any card to study)
- Add new cards (front + back)
- Click card to flip (front vs answer)
- Keyboard navigation:
  - `Left / Right` arrows: previous / next card
  - `Space` or `Enter`: flip card
  - `B`: toggle sidebar (optional)
- Delete cards via trash icon in the sidebar
- Persists cards using `localStorage`

## Tech Stack
- React
- Vite
- CSS (minimal dark theme, monospace)

## Where data is stored
Cards are saved in your browser in `localStorage` under this key:

- `smartFlashcards.v1`

This means:
- Refreshing the page keeps your cards
- Different browsers/devices do not sync automatically
- Clearing site data wipes cards

## Project Structure (typical)
smart-flashcards/
src/
App.jsx
App.css
index.css
icons/
trash.svg (or trash.png)
