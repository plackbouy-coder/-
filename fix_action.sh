sed -i '/const handlePlayerAction = (targetId: number) => {/a\
        const a = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"); a.volume = 0.01; a.play().catch(()=>{});\n' src/components/GameRoom.tsx
