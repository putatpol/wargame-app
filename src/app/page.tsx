"use client";

import characterData from "../data/character.json";
import React from "react";
import { Character } from "@/interface/character";
import { useTeam } from "@/context/TeamContext";
import Notification from "@/components/Notification";
import CardModal from "@/components/CardModal";
import RandomSection from "@/components/home/RandomSection";
import CharacterCard from "@/components/home/CharacterCard";

export default function Home() {
  const characters = characterData as Character[];
  const {
    selectedTeamByCharacter,
    addToTeam,
    removeFromTeam,
    isTeamDisabled,
    addRandomCharacters,
    resetTeams,
    notifications,
  } = useTeam();
  const [randomCount, setRandomCount] = React.useState(5);
  const [cardModal, setCardModal] = React.useState<{
    cardImage: string;
    characterName: string;
  } | null>(null);

  const handleTeamClick = (characterId: number, team: "A" | "B") => {
    const currentTeam = selectedTeamByCharacter[characterId];

    // ถ้าคลิกปุ่มเดิมที่อยู่ ให้ลบออก
    if (currentTeam === team) {
      removeFromTeam(characterId, team);
    } else {
      // ถ้าclickปุ่มใหม่ ให้เพิ่มเข้าทีมใหม่
      addToTeam(characterId, team);
    }
  };

  return (
    <div className="p-4">
      {/* Random Section */}
      <RandomSection
        randomCount={randomCount}
        onChangeCount={setRandomCount}
        onRandomTeamA={() => addRandomCharacters(randomCount, "A")}
        onRandomTeamB={() => addRandomCharacters(randomCount, "B")}
        onReset={resetTeams}
      />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/75 text-white rounded-lg shadow-lg mx-auto">
        {characters.map((char) => (
          <CharacterCard
            key={char.id}
            char={char}
            selectedTeamByCharacter={selectedTeamByCharacter}
            isTeamDisabled={isTeamDisabled}
            onViewCard={(selectedChar) => {
              if (selectedChar.skills.length === 0) return;
              setCardModal({
                cardImage: selectedChar.skills[0].card,
                characterName: selectedChar.name,
              });
            }}
            onTeamClick={handleTeamClick}
          />
        ))}
      </div>

      {/* Card Modal */}
      {cardModal && (
        <CardModal cardModal={cardModal} setCardModal={setCardModal} />
      )}

      {/* Notifications */}
      <Notification notifications={notifications} />
    </div>
  );
}
