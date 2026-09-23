package kz.davdev.oqucat

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebView

import androidx.activity.enableEdgeToEdge
import androidx.core.content.ContextCompat

import com.google.firebase.messaging.FirebaseMessaging
import org.json.JSONObject
import org.telegram.login.TelegramLogin

class MainActivity : TauriActivity() {

    companion object {
        private const val FCM_NOTIFICATION_CHANNEL_ID = "fcm_default"
        private const val FCM_NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
        private var instance: MainActivity? = null

        fun dispatchFcmEvent(event: String, payload: JSONObject) {
            instance?.sendFcmEvent(event, payload)
        }
    }

    private var webView: WebView? = null

    private val telegramClientId = BuildConfig.TELEGRAM_CLIENT_ID
    private val telegramRedirectUri = BuildConfig.TELEGRAM_REDIRECT_URI
    private val telegramHost = Uri.parse(telegramRedirectUri).host!!

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        instance = this

        createFcmNotificationChannel()

        TelegramLogin.init(
            clientId = telegramClientId,
            redirectUri = telegramRedirectUri,
            scopes = listOf(
                "openid",
                "profile",
                "phone",
                "telegram:bot_access"
            )
        )

        handleTelegramIntent(intent)
        handleFcmIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)

        handleTelegramIntent(intent)
        handleFcmIntent(intent)
    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)

        this.webView = webView

        CookieManager.getInstance()
            .setAcceptThirdPartyCookies(webView, true)

        webView.addJavascriptInterface(
            TelegramBridge(),
            "TelegramNative"
        )

        webView.addJavascriptInterface(
            FcmBridge(),
            "FcmNative"
        )
    }

    override fun onDestroy() {
        if (instance === this) {
            instance = null
        }

        super.onDestroy()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == FCM_NOTIFICATION_PERMISSION_REQUEST_CODE) {
            sendFcmEvent(
                "fcm-permission",
                JSONObject().put(
                    "permission",
                    if (
                        grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED
                    ) {
                        "granted"
                    } else {
                        "denied"
                    }
                )
            )
        }
    }

    private fun createFcmNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val channel = NotificationChannel(
            FCM_NOTIFICATION_CHANNEL_ID,
            getString(R.string.fcm_default_channel_name),
            NotificationManager.IMPORTANCE_DEFAULT
        )

        getSystemService(NotificationManager::class.java)
            .createNotificationChannel(channel)
    }

    private fun notificationPermission(): String =
        if (
            Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            "granted"
        } else {
            "denied"
        }

    private fun requestNotificationPermission() {
        if (notificationPermission() == "granted") {
            sendFcmEvent(
                "fcm-permission",
                JSONObject().put("permission", "granted")
            )
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(
                arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                FCM_NOTIFICATION_PERMISSION_REQUEST_CODE
            )
        }
    }

    private fun handleFcmIntent(intent: Intent) {
        val messageId = intent.getStringExtra("google.message_id") ?: return
        val extras = intent.extras ?: return
        val data = JSONObject()

        for (key in extras.keySet()) {
            if (!key.startsWith("google.") && key != "from") {
                data.put(key, extras.get(key))
            }
        }

        val payload = JSONObject()
            .put("id", messageId)
            .put("data", data)

        FcmEventStore.enqueue(this, "fcm-notification-opened", payload)
        sendFcmEvent("fcm-notification-opened", payload)
        intent.removeExtra("google.message_id")
    }

    private fun sendFcmEvent(event: String, payload: JSONObject) {
        val targetWebView = webView

        if (targetWebView == null) {
            Log.w("FcmBridge", "No WebView available for $event")
            return
        }

        val detail = JSONObject.quote(payload.toString())
        val javascript = """
            console.info('[FCM] native event received', { event: '$event' });
            window.dispatchEvent(
                new CustomEvent('$event', { detail: JSON.parse($detail) })
            );
        """.trimIndent()

        runOnUiThread {
            targetWebView.evaluateJavascript(javascript) {
                Log.d("FcmBridge", "Dispatched $event to WebView")
            }
        }
    }

    private fun handleTelegramIntent(intent: Intent) {
        val uri = intent.data ?: return

        if (uri.host != telegramHost) {
            return
        }

        TelegramLogin.handleLoginResponse(
            uri,
            onSuccess = { loginData ->
                Log.d("TelegramLogin", "Login successful")

                sendTelegramTokenToReact(loginData.idToken)
            },
            onError = { error ->
                Log.e(
                    "TelegramLogin",
                    "Login failed: ${error.message}"
                )
            }
        )
    }

    private fun sendTelegramTokenToReact(idToken: String) {
        val jsonToken = JSONObject.quote(idToken)

        val javascript = """
            window.dispatchEvent(
                new CustomEvent('telegram-login', {
                    detail: {
                        idToken: $jsonToken
                    }
                })
            );
        """.trimIndent()

        runOnUiThread {
            webView?.evaluateJavascript(javascript, null)
        }
    }

    inner class TelegramBridge {

        @JavascriptInterface
        fun login() {
            runOnUiThread {
                TelegramLogin.startLogin(this@MainActivity)
            }
        }
    }

    inner class FcmBridge {

        @JavascriptInterface
        fun checkNotificationPermission(): String = notificationPermission()

        @JavascriptInterface
        fun requestNotificationPermission() {
            runOnUiThread {
                this@MainActivity.requestNotificationPermission()
            }
        }

        @JavascriptInterface
        fun register() {
            FirebaseMessaging.getInstance().register()
        }

        @JavascriptInterface
        fun getInstallationId(): String? = FcmEventStore.getInstallationId(this@MainActivity)

        @JavascriptInterface
        fun consumeEvents(): String = FcmEventStore.consume(this@MainActivity)
    }

}
