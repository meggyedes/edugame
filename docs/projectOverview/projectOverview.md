# Project Overview

The goal of this project is to create a simple browser-based, TypeScript-powered world adventure game for Dutch children aged 9–12, where the player follows **Milo van Zee**, a curious young explorer, traveling the globe to discover and photograph animals in their natural habitats. The game should educate children in a subtle, interactive way—through exploration, observation, and pattern recognition—without quizzes or question-based tasks. Scientific facts, animal behaviors, habitats, and environmental concepts will be integrated naturally into the gameplay through interactive exploration, in-game visuals, and narrative storytelling.

The game is intended to have a **visual style and gameplay feel similar to Stardew Valley**, with colorful, top-down, tile-based 2D graphics, animated characters, and interactive environments. While inspired by that style, the entire game will be built using **vanilla TypeScript, HTML, and CSS**, without any game engines, frameworks, or libraries (e.g., no PhaserJS, React, or Unity). This approach allows full control over game logic, rendering, animations, and interactions while keeping the project lightweight and accessible.

The game will function in two languages, English and Dutch, so all text content (UI, descriptions, feedback messages) will be stored separately or clearly structured, allowing easy switching between languages.

Technically, the project will consist of a basic HTML page containing the main game area (canvas or main "game field" div), a menu, a language selector, and a section where the player can view their progress or achievements. Most logic will be written in TypeScript, handling the game state, different scenes (menu, gameplay, results screen), character movement, environment generation, animal encounters, and interactive exploration events. Graphics—including backgrounds, landscapes, animals, Milo, and icons—can be drawn with CSS/Canvas or imported as public domain images. The UI should be colorful, playful, and child-friendly without being cluttered.

From a gameplay perspective, players will receive continuous feedback and rewarding “dopamine moments.” Each area or mini-event has a quick and clear goal (for example, discovering a hidden animal footprint, photographing an animal, or observing behavior), and successful completion triggers instant gratification such as earning points, stars, badges, unlocking new locations, or displaying fun animations. A simple results system allows players to view their progress—total points, discovered animals, explored regions, or a “world map progress bar”—which is stored locally in the browser using localStorage, ensuring continuity between sessions.

The project will include three main documentation components: a technical document, a user manual, and a maintenance guide.

The technical document will describe the technologies used (HTML, CSS, TypeScript), the folder structure, the main modules, and explain how the game loop, language switching, and data persistence are implemented.

The user manual will focus on players and teachers, describing how to launch the game, switch languages, control Milo, interact with animals, understand points and badges, and access progress information.

The maintenance document will outline how to add new locations, animals, interactive events, images, or languages in the future, and describe the process for rebuilding and redeploying the updated project.

Overall, the game will serve as an educational, motivational, and interactive experience where children learn about animals, nature, and the environment through immersive exploration. A well-structured reward system and a clear progress screen will help maintain engagement and a sense of accomplishment. Behind the scenes, the project will feature organized, object-oriented TypeScript code and thorough documentation, making it both an effective learning project and a presentable school deliverable.

---

# Project Requirements

• The game must be developed using TypeScript.  
• No JavaScript frameworks (e.g., PhaserJS), libraries (e.g., PixiJS), or game engines (e.g., Unity, Godot) may be used.  
• Proper Object-Oriented Programming (OOP) principles must be applied throughout the game.  
 o The use of AI tools is not disallowed, but discouraged, and any AI-generated code must still adhere to OOP principles.  
 o All team members must understand and be able to explain all parts of the code.  
• All work must be committed to the GitHub repository provided by the program.  
 o The final version of the game must be fully playable from GitHub Pages.  
• A Game Design Document (GDD) must be created to ensure that development aligns with the game’s goals.  
 o All documentation must be completed on the GitHub repository wiki.  
 o The document should comprehensively cover the following aspects:  
  Target Audience  
  Game Goals and Learning Objectives  
  Game Mechanics and Features  
  Visuals and Game Interface  
  Plot and Game Flow  
  Game Architecture  
  Playtesting and Feedback  
• All assets used must be public domain, Creative Commons, legally licensed, or explicitly created by the team for this project.  
 o All assets must be properly attributed according to their license (for example, on a credit page within the game).  
• The game must be available in Dutch and optionally also in English.  
 o PABO students may be involved to assist with Dutch translation.

---

# Development Approach and Sprints

| Week            | Activities                         | Deliverables                                                                                                     |
| --------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 10 Nov – 14 Nov | Sprint 0 – Design Thinking™ Sprint | • Paper prototype<br>• First draft of the Game Design Document                                                   |
| 21 November     | First school visit                 | • Feedback from pupils                                                                                           |
| 01 Dec – 05 Dec | Sprint 1                           | • Updated design documentation<br>• First, rough prototype of the game<br>• Feedback from PABO students (03 Dec) |
| 08 Dec – 12 Dec | Sprint 2                           | • Updated design documentation<br>• Second, more polished prototype<br>• Feedback from pupils (12 Dec)           |
| 15 Dec – 19 Dec | Sprint 3 – Project work            | • Updated design documentation<br>• Third prototype                                                              |
| 05 Jan – 09 Jan | Sprint 4 – Project work            | • Final design document<br>• Final version of the game                                                           |
| 19 Jan – 22 Jan | Exam Week – Presentation phase     | • Hosted version of the final game<br>• Prepared presentation based on the final game and design document        |
| 04 Feb          | Final Demo at HZ (13:00–15:00)     | • Final version of the game                                                                                      |
