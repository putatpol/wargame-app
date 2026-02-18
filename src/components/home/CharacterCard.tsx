import Image from "next/image";
import React from "react";
import { Character } from "@/interface/character";

type CharacterCardProps = {
    char: Character;
    selectedTeamByCharacter: Record<number, "A" | "B" | null | undefined>;
    isTeamDisabled: (characterId: number, team: "A" | "B") => boolean;
    onViewCard: (char: Character) => void;
    onTeamClick: (characterId: number, team: "A" | "B") => void;
};

export default function CharacterCard({
    char,
    selectedTeamByCharacter,
    isTeamDisabled,
    onViewCard,
    onTeamClick,
}: CharacterCardProps) {
    return (
        <div className="border border-amber-500 p-4 rounded-lg bg-gray-800 shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-3">
                <Image
                    alt="avatar"
                    src={char.avatar}
                    width={50}
                    height={50}
                    className="rounded-xl"
                />
                <h2 className="text-xl font-bold text-amber-400">{char.name}</h2>
                <span className="text-sm bg-amber-700 px-2 py-1 rounded">
                    {char.role}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                <p>
                    🧬 Race: <b>{char.race}</b>
                </p>
                <p>
                    ⚔️ Class: <b>{char.class}</b>
                </p>
                <p>
                    ❤️ HP: <b className="text-red-400">{char.status.hp}</b>
                </p>
                <p>
                    🛡️ DEF: <b>{char.status.def}+</b>
                </p>
                <p>
                    🏃 Move: <b>{char.status.move}</b>
                </p>
                <p>
                    ⚡ AP: <b>{char.status.ap}</b>
                </p>
            </div>

            {/* Attack Section */}
            <div className="bg-gray-700 p-2 rounded mb-3">
                <p className="text-xs font-bold uppercase text-gray-400">
                    Basic Attack
                </p>
                <div className="flex justify-between text-sm">
                    <span>🎯 Hit: {char.status.attack.hitOn}+</span>
                    <span>📏 Range: {char.status.attack.range}"</span>
                    <span className="text-orange-400">
                        💥 DMG: {char.status.attack.damage}
                    </span>
                </div>
            </div>

            {/* Skills Section */}
            <div className="mb-3">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Skills</p>
                {char.skills.map((skill, index) => (
                    <div
                        key={index}
                        className="text-sm pl-2 border-l-2 border-amber-500 italic"
                    >
                        {skill.name} (AP: {skill.ap} | Hit: {skill.hitOn} | Range:{" "}
                        {skill.range})
                    </div>
                ))}
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => onViewCard(char)}
                    disabled={char.skills.length === 0}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🎴 Card
                </button>
                <button
                    onClick={() => onTeamClick(char.id, "A")}
                    disabled={isTeamDisabled(char.id, "A")}
                    className={`flex-1 px-4 py-2 rounded text-white font-semibold ${selectedTeamByCharacter[char.id] === "A"
                            ? "bg-blue-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } ${isTeamDisabled(char.id, "A")
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:cursor-pointer"
                        }`}
                >
                    + A
                </button>
                <button
                    onClick={() => onTeamClick(char.id, "B")}
                    disabled={isTeamDisabled(char.id, "B")}
                    className={`flex-1 px-4 py-2 rounded text-white font-semibold ${selectedTeamByCharacter[char.id] === "B"
                            ? "bg-green-700"
                            : "bg-green-600 hover:bg-green-700"
                        } ${isTeamDisabled(char.id, "B")
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:cursor-pointer"
                        }`}
                >
                    + B
                </button>
            </div>
        </div>
    );
}
