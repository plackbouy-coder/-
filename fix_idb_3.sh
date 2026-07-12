sed -i 's/  return (/  if (!settingsLoaded) return null;\n\n  return (/g' src/context/GameContext.tsx
