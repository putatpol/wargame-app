import Image from "next/image";
import React from "react";
import { Character } from "@/interface/character";
import { StatusBuff } from "@/interface/status";

type HpAdjustModalData = {
    characterId: number;
    characterName: string;
    currentHp: number;
};

type DeleteConfirmData = {
    characterId: number;
    characterName: string;
    team: "A" | "B";
};

type TeamSectionProps = {
    teamIds: number[];
    teamName: "A" | "B";
    teamColor: string;
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    getCharacterById: (id: number) => Character | undefined;
    currentHp: Record<number, number> | undefined;
    currentAp: Record<number, number> | undefined;
    attackerId: number | null;
    defenderId: number | null;
    openMenuId: number | null;
    activeStatusBuffs: Record<number, number[]> | undefined;
    statusBuffs: StatusBuff[];
    raceData: { name: string; description: string }[];
    characterStatBoost: Record<number, string | null | undefined>;
    isAttackDisabledByBuff: (characterId: number) => boolean;
    getDisplayStat: (characterId: number, statType: string) => number;
    removeStatusBuff: (characterId: number, buffId: number) => void;
    onViewCard: (char: Character) => void;
    onToggleMenu: (characterId: number) => void;
    onOpenStatBoost: (char: Character) => void;
    onOpenStatusModal: (char: Character) => void;
    onOpenHpAdjust: (modal: HpAdjustModalData) => void;
    onConfirmDelete: (modal: DeleteConfirmData) => void;
    onToggleAttacker: (char: Character) => void;
    onToggleDefender: (char: Character) => void;
    onSkipTurn: (char: Character) => void;
};

export default function TeamSection({
    teamIds,
    teamName,
    teamColor,
    score,
    setScore,
    getCharacterById,
    currentHp,
    currentAp,
    attackerId,
    defenderId,
    openMenuId,
    activeStatusBuffs,
    statusBuffs,
    raceData,
    characterStatBoost,
    isAttackDisabledByBuff,
    getDisplayStat,
    removeStatusBuff,
    onViewCard,
    onToggleMenu,
    onOpenStatBoost,
    onOpenStatusModal,
    onOpenHpAdjust,
    onConfirmDelete,
    onToggleAttacker,
    onToggleDefender,
    onSkipTurn,
}: TeamSectionProps) {
    return (
        <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${teamColor} flex items-center`}>
                Team {teamName}{" "}
                <span className="font-medium text-gray-300 text-sm! flex items-center pl-4">
                    <div
                        className={`w-10 h-10 bg-gray-100 ${teamColor} flex items-center justify-center text-xl font-bold shadow-lg`}
                        style={{
                            clipPath: "polygon(50% 0%, 95% 25%, 80% 90%, 20% 90%, 5% 25%)",
                        }}
                    >
                        {score}
                    </div>
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => setScore(score + 1)}
                            className="px-1 bg-gray-500 hover:bg-gray-600 rounded-sm mx-1"
                        >
                            ▲
                        </button>
                        <button
                            type="button"
                            onClick={() => setScore(score - 1)}
                            className="px-1 bg-gray-500 hover:bg-gray-600 rounded-sm mx-1"
                        >
                            ▼
                        </button>
                    </div>
                </span>
            </h2>

            {teamIds.length === 0 ? (
                <div className="text-gray-400 italic text-center py-8">
                    ยังไม่มีตัวละครในทีมนี้
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamIds.map((id) => {
                        const char = getCharacterById(id);
                        if (!char) return null;

                        const isAttacker = attackerId === char.id;
                        const isDefender = defenderId === char.id;
                        const isDead = (currentHp?.[char.id] ?? char.status.hp) === 0;
                        const isOutOfAp = (currentAp?.[char.id] ?? 0) === 0;

                        const highlightClass = isAttacker
                            ? "ring-4 ring-yellow-400 bg-yellow-900/20"
                            : isDefender
                                ? "ring-4 ring-blue-400 bg-blue-900/20"
                                : "";

                        const cardColor = isDead
                            ? "border-red-500 bg-red-900/20"
                            : isOutOfAp
                                ? "border-gray-500 bg-gray-600/20"
                                : teamName === "A"
                                    ? "border-blue-500 bg-blue-900/20"
                                    : "border-green-500 bg-green-900/20";

                        return (
                            <div
                                key={char.id}
                                className={`border-2 p-4 rounded-lg shadow-lg ${cardColor} ${highlightClass}`}
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-600">
                                    <Image
                                        alt={char.name}
                                        src={char.avatar}
                                        width={60}
                                        height={60}
                                        className={`rounded-lg ${isDead ? "grayscale" : ""}`}
                                    />
                                    <div>
                                        <h3 className="text-xl text-amber-400">
                                            <span
                                                className={isDead ? "line-through text-red-500" : ""}
                                            >
                                                {char.name}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-300">{char.role}</p>
                                        <div className="mt-2 flex gap-2">
                                            {isAttacker && (
                                                <span className="text-xs bg-yellow-300 text-black px-2 py-0.5 rounded">
                                                    ผู้โจมตี
                                                </span>
                                            )}
                                            {isDefender && (
                                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                                    ผู้ป้องกัน
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <p className="text-gray-400">Race</p>
                                        <p className="font-semibold">
                                            <span
                                                title={
                                                    raceData.find((r) => r.name === char.race)
                                                        ?.description +
                                                    (char.resist ? ` [${char.resist}]` : "")
                                                }
                                            >
                                                {char.race} •
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Class</p>
                                        <p className="font-semibold">{char.class}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">HP</p>
                                        <p className="font-semibold text-red-400">
                                            {currentHp?.[char.id] ?? char.status.hp}
                                            {characterStatBoost[char.id] === "hp" && (
                                                <span className="text-purple-400 ml-1">(+2)</span>
                                            )}
                                            {char.race === "Goliath" && (
                                                <span className="text-orange-400 ml-1">(+3)</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">AP</p>
                                        <p className="font-semibold text-yellow-300">
                                            {currentAp?.[char.id] ?? char.status.ap}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">DEF</p>
                                        <p className="font-semibold">
                                            {getDisplayStat(char.id, "def")} +
                                            {characterStatBoost[char.id] === "def" && (
                                                <span className="text-purple-400 ml-1">(-1)</span>
                                            )}
                                            {char.race === "Goliath" && (
                                                <span className="text-orange-400 ml-1">(+1)</span>
                                            )}
                                            {char.race === "Dwarf" && (
                                                <span className="text-orange-400 ml-1">(-1)</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Move</p>
                                        <p className="font-semibold">
                                            {getDisplayStat(char.id, "move")}
                                            {characterStatBoost[char.id] === "move" && (
                                                <span className="text-purple-400 ml-1">(+1)</span>
                                            )}
                                            {char.race === "Elf" && (
                                                <span className="text-orange-400 ml-1">(+1)</span>
                                            )}
                                            {char.race === "Dwarf" && (
                                                <span className="text-orange-400 ml-1">(-1)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Attack */}
                                <div className="bg-gray-700/50 p-2 rounded text-sm mb-3">
                                    <p className="text-xs font-bold text-gray-400 mb-1">
                                        Basic Attack
                                    </p>
                                    <div className="space-y-1">
                                        <p>
                                            <span>🎯 {getDisplayStat(char.id, "hiton")} +</span>
                                            {characterStatBoost[char.id] === "hiton" && (
                                                <span className="text-purple-400 ml-1">(-1)</span>
                                            )}
                                        </p>
                                        <p>📏 Range: {char.status.attack.range}"</p>
                                        <p className="text-orange-400">
                                            💥 DMG: {char.status.attack.damage}
                                        </p>
                                    </div>
                                </div>

                                {/* Active Statuses */}
                                {((activeStatusBuffs?.[char.id] ?? []) as number[]).length >
                                    0 && (
                                        <div className="mt-3 mb-3">
                                            <p className="text-xs text-gray-400 mb-1">Status</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {(activeStatusBuffs?.[char.id] ?? []).map((bid) => {
                                                    const b = statusBuffs.find((s) => s.id === bid);
                                                    return (
                                                        <span
                                                            key={bid}
                                                            title={b?.description}
                                                            className="bg-gray-700 text-sm px-2 py-1 rounded flex items-center gap-2"
                                                        >
                                                            <span>{b?.thaiName ?? `#${bid}`}</span>
                                                            <button
                                                                onClick={() => removeStatusBuff(char.id, bid)}
                                                                className="text-xs text-red-400 hover:text-red-200"
                                                                aria-label="remove-status"
                                                            >
                                                                ✕
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                {/* Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => onViewCard(char)}
                                        disabled={char.skills.length === 0}
                                        className="flex-1 hover:bg-gray-500 border border-gray-500 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        view card
                                    </button>

                                    {/* Menu button */}
                                    <div className="relative">
                                        <button
                                            onClick={() => onToggleMenu(char.id)}
                                            className="w-12 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 py-2 rounded transition"
                                            aria-haspopup="true"
                                            aria-expanded={openMenuId === char.id}
                                        >
                                            ⋯
                                            {char.race === "Human" &&
                                                !characterStatBoost[char.id] && (
                                                    <span className="absolute w-3 h-3 rounded-full bg-red-600 -top-1 -right-1" />
                                                )}
                                        </button>

                                        {openMenuId === char.id && (
                                            <div className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
                                                {char.race === "Human" &&
                                                    !characterStatBoost[char.id] && (
                                                        <button
                                                            onClick={() => onOpenStatBoost(char)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-purple-400 font-semibold"
                                                        >
                                                            ⭐ เพิ่ม Stat
                                                        </button>
                                                    )}

                                                <button
                                                    onClick={() => onOpenStatusModal(char)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                                                >
                                                    ➕ สถานะ
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onOpenHpAdjust({
                                                            characterId: char.id,
                                                            characterName: char.name,
                                                            currentHp: currentHp?.[char.id] ?? char.status.hp,
                                                        })
                                                    }
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                                                >
                                                    ⚙️ ปรับ HP
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onConfirmDelete({
                                                            characterId: char.id,
                                                            characterName: char.name,
                                                            team: teamName,
                                                        })
                                                    }
                                                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center mt-2 gap-2 [&_button]:w-20">
                                    <button
                                        title="Attack"
                                        onClick={() => onToggleAttacker(char)}
                                        className="border border-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-2 rounded font-semibold"
                                        disabled={
                                            (currentHp?.[char.id] ?? char.status.hp) === 0 ||
                                            (currentAp?.[char.id] ?? 0) === 0 ||
                                            isAttackDisabledByBuff(char.id)
                                        }
                                    >
                                        ⚔️
                                    </button>

                                    <button
                                        title="Defense"
                                        onClick={() => onToggleDefender(char)}
                                        className="border border-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold"
                                        disabled={(currentHp?.[char.id] ?? char.status.hp) === 0}
                                    >
                                        🛡️
                                    </button>

                                    <button
                                        title="Skip"
                                        onClick={() => onSkipTurn(char)}
                                        className="border border-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-semibold"
                                        disabled={
                                            (currentHp?.[char.id] ?? char.status.hp) === 0 ||
                                            (currentAp?.[char.id] ?? 0) === 0
                                        }
                                    >
                                        ⏭
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
