package kz.davdev.oqucat

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object FcmEventStore {
    private const val PREFS_NAME = "fcm_events"
    private const val KEY_EVENTS = "events"
    private const val KEY_INSTALLATION_ID = "installation_id"
    private const val MAX_EVENTS = 20

    fun setInstallationId(context: Context, installationId: String) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_INSTALLATION_ID, installationId)
            .apply()
    }

    fun getInstallationId(context: Context): String? =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_INSTALLATION_ID, null)

    @Synchronized
    fun enqueue(context: Context, event: String, payload: JSONObject) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val events = JSONArray(prefs.getString(KEY_EVENTS, "[]"))
        val entry = JSONObject()
            .put("event", event)
            .put("payload", payload)

        events.put(entry)

        while (events.length() > MAX_EVENTS) {
            events.remove(0)
        }

        prefs.edit().putString(KEY_EVENTS, events.toString()).apply()
    }

    @Synchronized
    fun consume(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val events = prefs.getString(KEY_EVENTS, "[]") ?: "[]"

        prefs.edit().remove(KEY_EVENTS).apply()

        return events
    }
}
