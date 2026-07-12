sed -i '/const createGame = () => {/a\
        // Unlock audio context\n        const silentAudio = new Audio("data:audio/mp3;base64,//MkxAA...\"); // Short silent MP3\n        silentAudio.volume = 0.01;\n        silentAudio.play().catch(() => {});\n' src/components/GameLobby.tsx
