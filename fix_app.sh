sed -i 's/{currentView === '"'"'leaderboard'"'"' .*/{currentView === '"'"'leaderboard'"'"' \&\& <LeaderboardPage \/>}/g' src/App.tsx
