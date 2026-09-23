package kz.davdev.oqucat

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import java.util.UUID

class FcmMessagingService : FirebaseMessagingService() {
    override fun onRegistered(installationId: String) {
        FcmEventStore.setInstallationId(this, installationId)
        MainActivity.dispatchFcmEvent(
            "fcm-installation-id",
            JSONObject().put("installationId", installationId)
        )
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = JSONObject()

        for ((key, value) in message.data) {
            data.put(key, value)
        }

        val payload = JSONObject()
            .put("id", message.messageId ?: UUID.randomUUID().toString())
            .put("from", message.from)
            .put("sentTime", message.sentTime)
            .put("data", data)

        message.notification?.let { notification ->
            payload.put(
                "notification",
                JSONObject()
                    .put("title", notification.title)
                    .put("body", notification.body)
            )
        }

        FcmEventStore.enqueue(this, "fcm-message", payload)
        MainActivity.dispatchFcmEvent("fcm-message", payload)

        Log.d("FcmMessaging", "Message received")
    }
}
