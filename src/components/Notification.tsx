import { Notification as NotificationType } from '@/context/TeamContext'

const Notification = ({ notifications }: { notifications: NotificationType[] }) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 space-y-2 max-w-md z-40">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`p-4 rounded-lg text-white shadow-lg animate-fade-in-up ${notif.type === "success"
                            ? "bg-green-600"
                            : notif.type === "error"
                                ? "bg-red-600"
                                : "bg-blue-600"
                        }`}
                >
                    {notif.message}
                </div>
            ))}
        </div>
    )
}

export default Notification