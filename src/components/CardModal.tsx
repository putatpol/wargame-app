import Image from 'next/image'
import React from 'react'

const CardModal = ({ cardModal, setCardModal }: {
    cardModal: {
        cardImage: string
        characterName: string
    },
    setCardModal: (cardModal: { cardImage: string; characterName: string } | null) => void
}) => {
    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setCardModal(null)}
        >
            <div
                className="relative max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setCardModal(null)}
                    className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
                >
                    ✕
                </button>
                <Image
                    alt={cardModal.characterName}
                    src={cardModal.cardImage}
                    width={400}
                    height={600}
                    className="rounded-lg shadow-2xl"
                    priority
                />
                <p className="text-center text-white mt-4 font-semibold">
                    {cardModal.characterName}
                </p>
            </div>
        </div>
    )
}

export default CardModal